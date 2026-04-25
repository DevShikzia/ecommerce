import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionsGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermission = route.data['permission'] as string | undefined;
  const requiredRole = route.data['role'] as string | undefined;

  if (requiredRole && !authService.hasRole(requiredRole)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  if (requiredPermission && !authService.hasPermission(requiredPermission)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['role'] as string;
  if (requiredRole && !authService.hasRole(requiredRole)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};