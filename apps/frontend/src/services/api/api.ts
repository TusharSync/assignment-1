import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { envConf } from '../../envConfig';

const { apiBaseUrl } = envConf;

export const authApi: AxiosInstance = axios.create({
  baseURL: `${apiBaseUrl}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
  responseType: 'json',
});

export const api: AxiosInstance = axios.create({
  baseURL: `${apiBaseUrl}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
  responseType: 'json',
});

const applyRequestInterceptor = (axiosInstance: AxiosInstance): void => {
  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      config.headers = config.headers ?? {};
      config.params = config.params || {};
      const token = localStorage.getItem('token');
      const auth = token ? `Bearer ${token}` : '';
      config.headers.Authorization = auth;
      return config;
    },
    (error) => {
      localStorage.clear();
      return Promise.reject(error);
    }
  );
};

const applyResponseInterceptor = (axiosInstance: AxiosInstance): void => {
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response; // Pass the response as is for successful requests
    },
    (error) => {
      const status = error?.response?.status;

      // Check for 401, 403, or 404 status codes
      if (status === 401 || status === 403 || status === 404) {
        localStorage.clear(); // Clear localStorage
        window.location.href="/login"
      }

      return Promise.reject(error); // Reject the promise with the error
    }
  );
};

applyRequestInterceptor(api);
applyResponseInterceptor(api);
