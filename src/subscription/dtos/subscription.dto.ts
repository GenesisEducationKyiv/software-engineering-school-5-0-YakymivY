import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { Frequency } from 'src/common/enums/frequency.enum';

export class SubscriptionDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsEnum(Frequency)
  @IsString()
  frequency: Frequency;
}
