import { Controller, Post, Body } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginCommand } from './commands/impl/login.command';
import { RegisterCommand } from './commands/impl/register.command';

@Controller('auth')
export class AuthController {
    constructor(private readonly commandBus: CommandBus) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.commandBus.execute(new RegisterCommand(registerDto));
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.commandBus.execute(new LoginCommand(loginDto));
    }
}
