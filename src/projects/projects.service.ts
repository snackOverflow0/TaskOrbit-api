import { Injectable, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  // 1. CREATE (Invalidates the List Cache)
  async create(userId: string, dto: CreateProjectDto) {
    const workspace = await this.prisma.workspace.findFirst({
      where: { id: dto.workspaceId, ownerId: userId }
    });

    if (!workspace) throw new ForbiddenException('Workspace not found or unauthorized');

    const newProject = await this.prisma.project.create({
      data: {
        name: dto.name,
        workspaceId: dto.workspaceId,
      },
    });

    // 🔥 WIPE LIST CACHE: Wipes the findAll list so the new project shows up
    const listCacheKey = `user:${userId}:workspace:${dto.workspaceId}:projects`;
    await this.cacheManager.del(listCacheKey);

    return newProject;
  }

  // 2. FIND ALL (Uses List Cache)
  async findAll(workspaceId: string, userId: string) {
    const listCacheKey = `user:${userId}:workspace:${workspaceId}:projects`;

    const cachedProjects = await this.cacheManager.get(listCacheKey);
    if (cachedProjects) {
      console.log('⚡ CACHE HIT (List): Returning projects from Redis RAM!');
      return cachedProjects;
    }

    console.log('🐢 CACHE MISS (List): Querying PostgreSQL hard drive...');
    const projects = await this.prisma.project.findMany({
      where: {
        workspaceId: workspaceId,
        workspace: { ownerId: userId }
      }
    });

    await this.cacheManager.set(listCacheKey, projects, 300000); // 5 mins TTL
    return projects;
  }

  // 3. FIND ONE (Uses Singular Record Cache)
  async findOne(projectId: string, userId: string) {
    const singleCacheKey = `user:${userId}:project:${projectId}`;

    // Check RAM for this individual project record
    const cachedProject = await this.cacheManager.get(singleCacheKey);
    if (cachedProject) {
      console.log('⚡ CACHE HIT (Single): Returning individual project from Redis RAM!');
      return cachedProject;
    }

    console.log('🐢 CACHE MISS (Single): Querying PostgreSQL for individual record...');
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        workspace: { ownerId: userId }
      }
    });

    if (!project) throw new NotFoundException('Project not found or unauthorized');

    // Store individual item copy in Redis
    await this.cacheManager.set(singleCacheKey, project, 300000);
    return project;
  }

  // 4. UPDATE (Invalidates BOTH List and Singular Cache)
  async update(projectId: string, userId: string, dto: UpdateProjectDto) {
    // We run a read check first to discover the workspaceId (needed to construct the list cache key)
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, workspace: { ownerId: userId } }
    });

    if (!project) throw new ForbiddenException('Project not found or unauthorized');

    // Perform the database update
    await this.prisma.project.update({
      where: { id: projectId },
      data: dto
    });

    // 🔥 CLEAR STALE DATA: Wipe single item cache AND parent list cache completely
    const singleCacheKey = `user:${userId}:project:${projectId}`;
    const listCacheKey = `user:${userId}:workspace:${project.workspaceId}:projects`;
    
    await this.cacheManager.del(singleCacheKey);
    await this.cacheManager.del(listCacheKey);

    return { message: 'Project updated and cache synchronized' };
  }

  // 5. REMOVE (Invalidates BOTH List and Singular Cache)
  async remove(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, workspace: { ownerId: userId } }
    });

    if (!project) throw new ForbiddenException('Project not found or unauthorized');

    await this.prisma.project.delete({ where: { id: projectId } });

    // 🔥 CLEAR EVERYTHING: Clean up remnants from Redis memory
    const singleCacheKey = `user:${userId}:project:${projectId}`;
    const listCacheKey = `user:${userId}:workspace:${project.workspaceId}:projects`;

    await this.cacheManager.del(singleCacheKey);
    await this.cacheManager.del(listCacheKey);

    return { message: 'Project removed and memory bank cleared' };
  }
}