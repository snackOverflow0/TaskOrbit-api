import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() dto: CreateTaskDto, @Req() req) {
    return this.tasksService.create(
      req.user.sub,
      dto
    );
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?
  ) {
    return this.tasksService.findAll(
      req.user.sub,
      {
        status,
        priority,
        search,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10
      }
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.tasksService.findOne(
      req.user.sub,
      id
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Req() req) {
    return this.tasksService.update(
      req.user.sub,
      id,
      dto
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.tasksService.remove(
      req.user.sub,
      id
    );
  }
}
