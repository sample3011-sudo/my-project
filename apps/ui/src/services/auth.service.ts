import apiClient, { setAccessToken } from './api.client';
import {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RefreshResponse,
  User,
} from '@repo/shared';

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const res = await apiClient.post<{ success: true; data: LoginResponse }>(
      '/auth/login',
      payload
    );
    setAccessToken(res.data.data.accessToken);
    return res.data.data;
  },

  async refresh(): Promise<RefreshResponse> {
    const res = await apiClient.post<{ success: true; data: RefreshResponse }>(
      '/auth/refresh',
      {}
    );
    setAccessToken(res.data.data.accessToken);
    return res.data.data;
  },

  async logout(): Promise<LogoutResponse> {
    const res = await apiClient.post<{ success: true; data: LogoutResponse }>(
      '/auth/logout'
    );
    setAccessToken(null);
    return res.data.data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await apiClient.get<{ success: true; data: { user: User } }>(
      '/auth/me'
    );
    return res.data.data;
  },
};
