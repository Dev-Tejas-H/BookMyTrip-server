import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class SignUpDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail({}, { message: 'Invalid email'})
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'password much be atleast 8 characters long'})
    password: string;

}

export class SignInDto {

    @IsEmail({}, { message: 'invalid email'})
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

}