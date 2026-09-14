import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UserRole } from './user-role.enum';

@Injectable()
export class AdminSeederService implements OnApplicationBootstrap {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async onApplicationBootstrap() {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME?.trim() || 'مدير النظام';
    if (!email || !password) return;

    const existing = await this.users.findOne({ where: { email } });
    if (existing) {
      let changed = false;
      if (existing.role !== UserRole.ADMIN) {
        existing.role = UserRole.ADMIN;
        changed = true;
      }
      if (!existing.name) {
        existing.name = name;
        changed = true;
      }
      if (changed) {
        await this.users.save(existing);
        console.log(`[Auth] Bootstrap admin updated: ${email}`);
      }
      return;
    }

    const password_hash = await bcrypt.hash(password, 12);
    await this.users.save(this.users.create({ email, name, password_hash, role: UserRole.ADMIN, is_active: true }));
    console.log(`[Auth] Bootstrap admin created: ${email}`);
  }
}
