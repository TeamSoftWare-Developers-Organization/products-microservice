import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UserRole } from './user-role.enum';
import { AdminGuard } from './admin.guard';

@Controller('api/users')
@UseGuards(AdminGuard)
export class UsersController {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  private view(u: User) { return { id:u.id, name:u.name, email:u.email, role:u.role, is_active:u.is_active, created_at:u.created_at, updated_at:u.updated_at }; }

  @Get()
  async all() {
    const rows = await this.users.find({ order: { created_at: 'DESC' } });
    return rows.map(u => this.view(u));
  }

  @Post()
  async create(@Body() body: any) {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!email || password.length < 8) throw new BadRequestException('Email and password (8+ chars) are required');
    if (await this.users.findOne({ where: { email } })) throw new BadRequestException('Email already exists');
    const role = String(body.role || 'user').toLowerCase() === 'admin' ? UserRole.ADMIN : UserRole.USER;
    const password_hash = await bcrypt.hash(password, 10);
    const user = await this.users.save(this.users.create({ email, name: String(body.name || '').trim() || email.split('@')[0], password_hash, role, is_active: body.is_active !== false }));
    return this.view(user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (body.name !== undefined) user.name = String(body.name || '').trim();
    if (body.role !== undefined) user.role = String(body.role).toLowerCase() === 'admin' ? UserRole.ADMIN : UserRole.USER;
    if (body.is_active !== undefined) user.is_active = Boolean(body.is_active);
    if (body.password) {
      if (String(body.password).length < 8) throw new BadRequestException('Password must be at least 8 characters');
      user.password_hash = await bcrypt.hash(String(body.password), 10);
    }
    return this.view(await this.users.save(user));
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    if (String(req.user?.sub) === id) throw new BadRequestException('You cannot delete your own account');
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.users.remove(user);
    return { success: true };
  }
}
