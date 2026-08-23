import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export const useHasPermission = (requiredPermission: string): boolean => {
  const userPermissions = useSelector((state: RootState) => state.auth.user?.permissions || []);
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  // إذا كان المستخدم Admin يمتلك كافة الصلاحيات تلقائياً
  if (userRole === 'admin') return true;

  return userPermissions.includes(requiredPermission);
};
