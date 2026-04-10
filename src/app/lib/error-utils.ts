import { ApiError } from './http';

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

export const isUnauthorizedError = (error: unknown) =>
  isApiError(error) && error.status === 401;

export const isForbiddenError = (error: unknown) =>
  isApiError(error) && error.status === 403;

export const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (isForbiddenError(error)) {
    return 'Bu işlem için yetkiniz bulunmuyor.';
  }

  if (isUnauthorizedError(error)) {
    return 'Oturumunuz doğrulanamadı. Lütfen yeniden giriş yapın.';
  }

  return error instanceof Error ? error.message : fallbackMessage;
};
