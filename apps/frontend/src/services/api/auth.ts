import { authApi } from './api';

interface SignupData {
  email: string;
  name: string;
  password: string;
  city: string;
  state: string;
  area: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export const signup = (userData: SignupData) =>
  authApi.post('/user/register', userData);
export const login = (credentials: LoginCredentials) =>
  authApi.post('/user/login', credentials);
