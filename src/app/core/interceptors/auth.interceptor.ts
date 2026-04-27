import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) return throwError(() => error);

      const refreshToken = auth.getRefreshToken();
      if (!refreshToken) {
        auth.logout();
        return throwError(() => error);
      }

      if (isRefreshing) {
        return refreshSubject.pipe(
          filter((newToken) => newToken !== null),
          take(1),
          switchMap((newToken) => {
            const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
            return next(retryReq);
          }),
        );
      }

      isRefreshing = true;
      refreshSubject.next(null);

      return auth.refreshTokens().pipe(
        switchMap((newToken) => {
          isRefreshing = false;
          refreshSubject.next(newToken);
          const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
          return next(retryReq);
        }),
        catchError((err) => {
          isRefreshing = false;
          auth.logout();
          return throwError(() => err);
        }),
      );
    }),
  );
};
