import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService
  ) {}

  create(
    workspaceId: string,
    dto: CreateProjectDto
  ) {
    return this.prisma.project.create({
      data: {
        workspaceId,
        ...dto
      }
    })
  }

  findAll(workspaceId: string) {
    return this.prisma.project.findMany({
      where: { workspaceId }
    })
  }

  findOne(
    id: string,
    workspaceId: string
  ) {
    return this.prisma.project.findFirst({
      where: {
        id,
        workspaceId
      }
    })
  }

  update(
    workspaceId: string,
    userId: string,
    dto: UpdateProjectDto
  ) {
    return this.prisma.project.updateMany({
      where: {
        id: workspaceId,
      },

      data: dto
    })
  }

  remove(
    workspaceId: string,
  ) {
    return this.prisma.project.deleteMany({
      where: {
        id: workspaceId,
      }
    })
  }
}
