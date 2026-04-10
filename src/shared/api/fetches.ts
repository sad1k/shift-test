import fetches from '@siberiacancode/fetches'
import { deleteCookie, getCookie } from 'cookies-next'

import { env } from '@/shared/config/env'

export const instance = fetches.create({
  baseURL: env.VITE_API_URL,
  headers: {
    'Accept': '*/*',
    'Content-Type': 'application/json',
  },
})

instance.interceptors.request.use(async (config) => {
  const token = getCookie('token')

  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  if (
    config.body
    && typeof config.body === 'object'
    && !(config.body instanceof FormData)
    && config.headers?.['Content-Type'] === 'application/json'
  ) {
    config.body = JSON.stringify(config.body)
  }

  return config
})

instance.interceptors.response.use(
  response => response,
  (error) => {
    if (error.response?.status === 401) {
      deleteCookie('token', { path: '/' })
      if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login'
      }
    }

    return Promise.reject(error)
  },
)
