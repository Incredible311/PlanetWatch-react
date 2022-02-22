import Axios, { AxiosResponse } from 'axios';
import { authorization } from './authorization';

export function AxiosRequestInterceptorProvider(config: any) {
  const token = authorization.accessToken;

  if (token != null) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}

export async function AxiosResponseInterceptorProvider(res: AxiosResponse) {
  if (res.status >= 200 && res.status < 400) {
    return res;
  }
  const originalRequest = res.config;
  if (res.status === 401 || res.status === 403) {
    const refresh = await authorization.refreshToken();
    if (refresh) {
      return Axios.request(originalRequest);
    }
  }
  return res;
}