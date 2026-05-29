import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TaskStatus, TaskPriority } from '@prisma/client';
@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService
  ) {}

  async create(
    userId: string,
    dto: CreateTaskDto
  ) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: dto.projectId,
        workspace: {
          ownerId: userId
        }
      }
    }) 

    if (!project) {
      throw new ForbiddenException('Target project not found or unauthorized')
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        projectId: dto.projectId,
        assignedToId: dto.assignedToId
      }
    })
  }

  async findAll(
    userId: string,
     filters: {
      status?: string;
      priority?: string;
      search?: string;
      page: number;
      limit: number }
    ) {
    // 1. BASE SECURITY PREREQUISITE: The user must only look at tasks inside workspaces they own
    const whereClause: any = {
      project: {
        workspace: { ownerId: userId }
      }
    };

    // 2. DYNAMIC FILTER: Add status condition if present in query parameters
    if (filters.status) {
      whereClause.status = filters.status as TaskStatus;
    }

    // 3. DYNAMIC FILTER: Add priority condition if present in query parameters
    if (filters.priority) {
      whereClause.priority = filters.priority as TaskPriority;
    }

    // 4. DYNAMIC SEARCH: Match keywords against titles OR descriptions (case-insensitive)
    if (filters.search) {
      whereClause.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    // 5. CALCULATE PAGINATION OFFSETS
    const skip = (filters.page - 1) * filters.limit;
    const take = filters.limit;

    // 6. EXECUTE ADVANCED PRISMA QUERY
    const [tasks, totalCount] = await Promise.all([
      this.prisma.task.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { createdAt: 'desc' } // Clean production sorted order
      }),
      this.prisma.task.count({ where: whereClause })
    ]);

    // Return meta-wrapped response format standard for frontends
    return {
      data: tasks,
      meta: {
        totalItems: totalCount,
        currentPage: filters.page,
        totalPages: Math.ceil(totalCount / take),
        limit: take
      }
    };
  }

  async findOne(taskId: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          workspace: {
            ownerId: userId
          }
        }
      }
    })

    if (!task) {
      throw new NotFoundException('Task not found or unauthorized')
    }

    return task
  }

  async update(taskId: string, userId: string, dto: UpdateTaskDto) {
    const result = await this.prisma.task.updateMany({
      where: {
        id: taskId,
        project: {
          workspace: {
            ownerId: userId
          }
        }
      },
      data: dto
    })

    if (result.count === 0) {
      throw new ForbiddenException('Task not found or unauthorized to make modifications')
    }

    return {
      message: 'Task updated successfully'
    }
  }

  async remove(taskId: string, userId: string) {
    const result = await this.prisma.task.deleteMany({
      where: {
        id: taskId,
        project: {
          workspace: {
            ownerId: userId
          }
        }
      }
    })

    if (result.count === 0) {
      throw new ForbiddenException('Task not found or unauthorized')
    }

    return {
      message: 'Task removed successfully'
    }
  }
}
