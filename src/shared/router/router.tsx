import { createBrowserRouter, Navigate, Outlet } from 'react-router'

import { LoginPage } from '@/app/auth/login/page'
import { HomePage } from '@/app/home/page'
import { Layout } from '@/app/layout'

import { GuestRoute } from './guest-route'
import { ProtectedRoute } from './protected-route'

function RootRoute() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function LoginRoute() {
  return (
    <GuestRoute>
      <LoginPage />
    </GuestRoute>
  )
}

function HomeRoute() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  )
}

function FallbackRoute() {
  return <Navigate replace to="/" />
}

export const router = createBrowserRouter([
  {
    Component: RootRoute,
    children: [
      {
        path: '/auth/login',
        Component: LoginRoute,
      },
      {
        path: '/',
        Component: HomeRoute,
      },
      {
        path: '*',
        Component: FallbackRoute,
      },
    ],
  },
])
