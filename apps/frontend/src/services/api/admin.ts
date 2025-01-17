import { authApi, api } from './api';

interface Credentials {
  email: string;
  password: string;
}

export const adminLogin = (credentials: Credentials) =>
  authApi.post('/user/login', credentials);
