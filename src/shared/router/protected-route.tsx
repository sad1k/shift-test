import type { PropsWithChildren } from 'react'

import { Navigate } from 'react-router'

import { useSession } from '@/shared/providers/session/session-provider'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuth, isLoading } = useSession()

  if (isLoading) {
    return null
  }

  if (!isAuth) {
    return <Navigate replace to="/auth/login" />
  }

  return children
}
