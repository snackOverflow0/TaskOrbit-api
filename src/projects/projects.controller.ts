import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(
    @Req() req,
    @Body() dto: CreateProjectDto
  ) {
    return this.projectsService.create(
      req.user.sub,
      dto  
    );
  }

  @Get()
  findAll(@Query('workspaceId') workspaceId: string,@Req() req) {
    return this.projectsService.findAll(
      workspaceId,
      req.user.sub
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req
  ) {
    return this.projectsService.findOne(
      id,
      req.user.sub
    );
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(
      id,
      req.user.sub,
      dto
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req
  ) {
    return this.projectsService.remove(
      id,
      req.user.sub
    );
  }
}
