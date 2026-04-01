import { IsString, IsOptional, MaxLength } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;
}
