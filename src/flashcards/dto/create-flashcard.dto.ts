import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFlashcardDto {
  @ApiProperty({ description: 'The word or phrase on the front' })
  @IsString()
  @IsNotEmpty()
  front: string;

  @ApiProperty({ description: 'The translation or meaning on the back' })
  @IsString()
  @IsNotEmpty()
  back: string;

  @ApiProperty({ description: 'Mnemonic/association', required: false })
  @IsString()
  @IsOptional()
  mnemonic?: string;

  @ApiProperty({ description: 'Memory palace location', required: false })
  @IsString()
  @IsOptional()
  palaceLocation?: string;
}
