import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(
    private prisma: PrismaService
  ) {}

  createWorkspace(
    ownerId: string,
    dto: CreateWorkspaceDto
  ) {
    return this.prisma.workspace.create({
      data: {
        ownerId,
        ...dto
      }
    })
  }

  findAll(ownerId: string) {
    return this.prisma.workspace.findMany({
      where: { ownerId }
    })
  }

  findOne(
    id: string,
    ownerId: string
  ) {
    return this.prisma.workspace.findFirst({
      where: { 
        id,
        ownerId
       }
    })
  }

  async update(
    workspaceId: string,
    userId: string,
    dto: UpdateWorkspaceDto
  ) {
    const result = await this.prisma.workspace.updateMany({
      where: { 
        id: workspaceId,
        ownerId: userId
       },

      data: dto
    })

    if (result.count === 0) throw new ForbiddenException('Workspace not found or unauthorized');
  }

  async remove(
    workspaceId: string,
    userId: string
  ) {
    const result = await this.prisma.workspace.deleteMany({
      where: { 
        id: workspaceId,
        ownerId: userId
       }
    })

    if (result.count === 0) throw new ForbiddenException('Workspace not found or unauthorized');
  }
}
