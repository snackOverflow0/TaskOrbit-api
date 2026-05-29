import {
  IsString
} from 'class-validator'

export class CreateWorkspaceDto {
  @IsString()
  name!: string

  // @IsString()
  // ownerId!: string
}
