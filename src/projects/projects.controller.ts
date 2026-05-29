import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req) {
    return this.projectsService.findAll(
      req.user.sub
    );
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Req() req
  ) {
    return this.projectsService.remove(
      req.user.sub
    );
  }
}
