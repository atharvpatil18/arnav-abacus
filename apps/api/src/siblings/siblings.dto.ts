import { IsInt } from 'class-validator';

export class CreateSiblingDto {
  @IsInt()
  student1Id!: number;

  @IsInt()
  student2Id!: number;
}
