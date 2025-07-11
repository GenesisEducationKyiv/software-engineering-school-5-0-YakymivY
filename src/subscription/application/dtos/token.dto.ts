import { IsUUID } from 'class-validator';

export class TokenDto {
  @IsUUID('4', { message: 'Token must be a valid UUID v4 string' })
  token: string;
}
