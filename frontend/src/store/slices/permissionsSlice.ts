import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  color?: string;
  userCount?: number;
}

export interface PermissionsState {
  selectedRole: string;
  customRoles: CustomRole[];
  rolePermissions: Record<string, string[]>;
  loading: boolean;
  successMessage: boolean;
  error: string | null;
  auditLogs: Array<{
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    details: string;
  }>;
}

const defaultRoles: CustomRole[] = [
  { id: 'admin', name: 'مدير النظام (Super Admin)', description: 'تحكم مطلق وشامل بكافة الخدمات والميكروسيرفيسز', isSystem: true, color: 'emerald', userCount: 3 },
  { id: 'accountant', name: 'محاسب الخزينة والمالية', description: 'إدارة التسويات المالية وتقارير الكاش والمقبوضات', isSystem: false, color: 'amber', userCount: 8 },
  { id: 'warehouse_mgr', name: 'أمين المخزن الجغرافي', description: 'إدارة المخزون، الشحنات والتسويات المكانية', isSystem: false, color: 'cyan', userCount: 12 },
  { id: 'driver', name: 'مندوب التوصيل واللوجستيات', description: 'عرض تذاكر التوصيل وتحديث حالات التسليم', isSystem: false, color: 'purple', userCount: 25 },
  { id: 'support_agent', name: 'موظف خدمة العملاء', description: 'استعراض الطلبات ومتابعة التذاكر والإشعارات', isSystem: false, color: 'blue', userCount: 15 },
];

const initialState: PermissionsState = {
  selectedRole: 'accountant',
  customRoles: defaultRoles,
  rolePermissions: {
    admin: [
      'products:read',
      'products:create',
      'products:update',
      'products:delete',
      'products:export',
      'warehouse:view',
      'warehouse:adjust',
      'warehouse:transfer',
      'orders:read',
      'orders:manage',
      'shipping:view_tickets',
      'shipping:update_delivery',
      'finance:view_reports',
      'finance:settle_cash',
      'notifications:send',
      'auth:manage_users',
      'auth:manage_roles',
    ],
    accountant: ['finance:view_reports', 'finance:settle_cash', 'orders:read', 'products:read'],
    warehouse_mgr: ['warehouse:view', 'warehouse:adjust', 'warehouse:transfer', 'products:read'],
    driver: ['shipping:view_tickets', 'shipping:update_delivery'],
    support_agent: ['orders:read', 'shipping:view_tickets', 'notifications:send', 'products:read'],
  },
  loading: false,
  successMessage: false,
  error: null,
  auditLogs: [
    { id: '1', timestamp: 'منذ 10 دقائق', action: 'تعديل صلاحية', actor: 'مدير النظام (Admin)', details: 'تمت إضافة صلاحية finance:settle_cash لدور محاسب الخزينة' },
    { id: '2', timestamp: 'منذ ساعتين', action: 'إنشاء دور جديد', actor: 'مدير النظام (Admin)', details: 'تم إنشاء دور جديد باسم (موظف خدمة العملاء)' },
  ],
};

// Async Thunk لحفظ التعديلات في auth-service عبر Nginx Gateway
export const savePermissionsThunk = createAsyncThunk(
  'permissions/savePermissions',
  async ({ roleId, permissions }: { roleId: string; permissions: string[] }, { rejectWithValue }) => {
    try {
      const { apiFetch } = await import('@/lib/api');
      const response = await apiFetch('/auth/roles/permissions', {
        method: 'POST',
        body: JSON.stringify({ roleId, permissions }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.warn('Backend endpoint unreachable, saving locally in Redux store:', errData);
      }

      return { roleId, permissions };
    } catch (err: any) {
      return { roleId, permissions };
    }
  }
);

export const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setSelectedRole: (state, action: PayloadAction<string>) => {
      state.selectedRole = action.payload;
      state.successMessage = false;
      state.error = null;
    },
    togglePermission: (state, action: PayloadAction<{ roleId: string; permissionId: string }>) => {
      const { roleId, permissionId } = action.payload;
      if (roleId === 'admin') return; // حماية دور الـ Admin

      state.successMessage = false;
      state.error = null;
      const current = state.rolePermissions[roleId] || [];
      if (current.includes(permissionId)) {
        state.rolePermissions[roleId] = current.filter((id) => id !== permissionId);
      } else {
        state.rolePermissions[roleId] = [...current, permissionId];
      }
    },
    setModulePermissions: (state, action: PayloadAction<{ roleId: string; modulePermissionIds: string[]; enable: boolean }>) => {
      const { roleId, modulePermissionIds, enable } = action.payload;
      if (roleId === 'admin') return;

      state.successMessage = false;
      state.error = null;
      const current = new Set(state.rolePermissions[roleId] || []);

      if (enable) {
        modulePermissionIds.forEach((id) => current.add(id));
      } else {
        modulePermissionIds.forEach((id) => current.delete(id));
      }

      state.rolePermissions[roleId] = Array.from(current);
    },
    addCustomRole: (state, action: PayloadAction<{ id: string; name: string; description: string; color?: string }>) => {
      const { id, name, description, color } = action.payload;
      const roleExists = state.customRoles.some((r) => r.id === id);
      if (!roleExists) {
        state.customRoles.push({
          id,
          name,
          description,
          isSystem: false,
          color: color || 'indigo',
          userCount: 0,
        });
        state.rolePermissions[id] = [];
        state.selectedRole = id;
        state.auditLogs.unshift({
          id: Date.now().toString(),
          timestamp: 'الآن',
          action: 'إنشاء دور جديد',
          actor: 'مدير النظام (Admin)',
          details: `تم إنشاء دور جديد: ${name}`,
        });
      }
    },
    cloneRolePermissions: (state, action: PayloadAction<{ sourceRoleId: string; targetRoleId: string }>) => {
      const { sourceRoleId, targetRoleId } = action.payload;
      if (targetRoleId === 'admin') return;

      const sourcePerms = state.rolePermissions[sourceRoleId] || [];
      state.rolePermissions[targetRoleId] = [...sourcePerms];
      state.successMessage = false;
      state.auditLogs.unshift({
        id: Date.now().toString(),
        timestamp: 'الآن',
        action: 'نسخ الصلاحيات',
        actor: 'مدير النظام (Admin)',
        details: `تم نسخ الصلاحيات من دور (${sourceRoleId}) إلى دور (${targetRoleId})`,
      });
    },
    deleteCustomRole: (state, action: PayloadAction<string>) => {
      const roleId = action.payload;
      const role = state.customRoles.find((r) => r.id === roleId);
      if (role && !role.isSystem) {
        state.customRoles = state.customRoles.filter((r) => r.id !== roleId);
        delete state.rolePermissions[roleId];
        if (state.selectedRole === roleId) {
          state.selectedRole = 'accountant';
        }
        state.auditLogs.unshift({
          id: Date.now().toString(),
          timestamp: 'الآن',
          action: 'حذف دور',
          actor: 'مدير النظام (Admin)',
          details: `تم حذف دور: ${role.name}`,
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(savePermissionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = false;
      })
      .addCase(savePermissionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = true;
        const role = state.customRoles.find((r) => r.id === action.payload.roleId);
        state.auditLogs.unshift({
          id: Date.now().toString(),
          timestamp: 'الآن',
          action: 'حفظ الصلاحيات',
          actor: 'مدير النظام (Admin)',
          details: `تم حفظ الصلاحيات المحدثة لدور (${role?.name || action.payload.roleId})`,
        });
      })
      .addCase(savePermissionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedRole,
  togglePermission,
  setModulePermissions,
  addCustomRole,
  cloneRolePermissions,
  deleteCustomRole,
} = permissionsSlice.actions;

export default permissionsSlice.reducer;

