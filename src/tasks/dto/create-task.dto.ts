import {
  IsOptional,
  IsString,
} from 'class-validator'

import { TaskStatus } from '@prisma/client'
import { TaskPriority } from '@prisma/client'

export class CreateTaskDto {
  @IsString()
  title!: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  status!: TaskStatus

  @IsString()
  priority!: TaskPriority

  @IsString()
  projectId!: string

  @IsString()
  @IsOptional()
  assignedToId?: string
}
