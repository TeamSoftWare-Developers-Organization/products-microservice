import { UserRole } from '../../users/user-role.enum';

export class RegisterDto {
    name?: string;
    email!: string;
    password!: string;
    role?: UserRole;
}
