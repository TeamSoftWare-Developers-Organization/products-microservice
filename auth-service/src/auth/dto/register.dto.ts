import { UserRole } from '../../users/user-role.enum';

export class RegisterDto {
    email!: string;
    password!: string;
    role?: UserRole;
}
