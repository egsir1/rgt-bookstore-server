import {
  IsNotEmpty,
  Length,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';

export class UserInput {
  @IsEmail()
  @Length(3, 50, { message: 'Email must be between 3 and 50 characters' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @Length(7, 100, { message: 'Password must be between 7 and 100 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class ActivationInput {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}
