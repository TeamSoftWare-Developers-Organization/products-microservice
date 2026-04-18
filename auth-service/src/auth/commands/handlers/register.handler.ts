import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from '../impl/register.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../users/user.entity';
import { UserRole } from '../../../users/user-role.enum';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async execute(command: RegisterCommand): Promise<{ message: string }> {
        const { email, password, role } = command.registerDto;

        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const salt = await bcrypt.genSalt();
        const password_hash = await bcrypt.hash(password, salt);

        const user = this.usersRepository.create({
            email,
            password_hash,
            role: role || UserRole.USER,
        });

        await this.usersRepository.save(user);

        return { message: 'User registered successfully' };
    }
}
