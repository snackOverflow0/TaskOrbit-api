import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

import * as bcrypt from 'bcrypt'
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async generateTokens (
    userId: string,
    email: string
  ) {
    const payload = {
      sub: userId,
      email
    }

    const accessToken = 
      await this.jwtService.signAsync(payload, {
        expiresIn: '15m'
      })

    const refreshToken = 
      await this.jwtService.signAsync(payload, {
        expiresIn: '7d'
      })

    return {
      accessToken,
      refreshToken
    }
  }

  async register(
    dto: RegisterDto
  ) {
    const existingUser = 
      await this.usersService.findByEmail(dto.email)

    if (existingUser) {
      throw new ConflictException(
        'Email already registered'
      )
    }

    const hashedPassword = 
      await bcrypt.hash(
        dto.password,
        10
      )

    const user = 
      await this.usersService.create({
        email: dto.email,
        password: hashedPassword
      })

    return {
      message: 'Registered successfully',
      user
    }
  }

  async login(
    dto: LoginDto
  ) {
    const user = 
      await this.usersService.findByEmail(dto.email)

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials'
      )
    }

    const passwordMatched = 
      await bcrypt.compare(
        dto.password,
        user.password
      )

    if (!passwordMatched) {
      throw new UnauthorizedException(
        'Invalid credentials'
      )
    }

    const tokens = 
      await this.generateTokens(
        user.id,
        user.email
      )

    const hashedRefreshToken = 
      await bcrypt.hash(
        tokens.refreshToken,
        10
      )

    await this.prisma.user.update({
      where: { id: user.id },

      data: {
        refreshToken: hashedRefreshToken
      }
    })

    return {
      tokens
    }

  }

  async refresh(
    refreshToken: string
  ) {

    const payload = 
      await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: process.env.JWT_SECRET
        }
      )

    const user = 
      await this.prisma.user.findUnique({
        where: { 
          id: payload.sub
        }
      })

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException()
    }

    const refreshMatched = 
      await bcrypt.compare(
        refreshToken,
        user.refreshToken
      )

    if (!refreshMatched) {
      throw new UnauthorizedException()
    }

    const tokens = 
      await this.generateTokens(
        user.id,
        user.email
      )

    const newHashedRefreshToken = 
      await bcrypt.hash(
        tokens.refreshToken,
        10
      )

    await this.prisma.user.update({
      where: { 
        id: user.id
      },

      data: {
        refreshToken: 
          newHashedRefreshToken
      }
    })

    return tokens
  }

  async logout(
    userId: string
  ) {
    await this.prisma.user.update({
      where: {
        id: userId
      },

      data: {
        refreshToken: null
      }
    })

    return {
      message: 'Logged out successfully'
    }
  }
}
