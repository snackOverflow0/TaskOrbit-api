import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService
  ) {}

  async create(
    userId: string,
    dto: CreateProjectDto
  ) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: dto.workspaceId,
        ownerId: userId
      }
    })

    if (!workspace) {
      throw new ForbiddenException('Workspace not found or unauthorized')
    }

    return this.prisma.project.create({
      data: {
        name: dto.name,
        workspaceId: dto.workspaceId
      }
    })
  }

  findAll(
    workspaceId: string,
    userId: string
  ) {
    return this.prisma.project.findMany({
      where: {
        workspaceId: workspaceId,
        workspace: {
          ownerId: userId
        }
      }
    })
  }

  async findOne(
    projectId: string,
    userId: string
  ) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        workspace: {
          ownerId: userId
        }
      }
    })

    if (!project) throw new ForbiddenException('Project not found ot unauthorized')

    return project
  }

  async update(
    projectId: string,
    userId: string,
    dto: UpdateProjectDto
  ) {
    const result =  await this.prisma.project.updateMany({
      where: {
        id: projectId,
        workspace: {
          ownerId: userId
        }
      },
      data: dto
    })

    if (result.count === 0) throw new ForbiddenException('Unauthorized')
  }

  async remove(
    projectId: string,
    userId: string
  ) {
    const result = await this.prisma.project.deleteMany({
      where: {
        id: projectId,
        workspace: {
          ownerId: userId
        }
      }
    })

    if (result.count === 0) throw new ForbiddenException('Unauthorized')
  }
}
