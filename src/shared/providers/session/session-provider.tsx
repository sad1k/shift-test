import type { PropsWithChildren } from 'react'

import type { User } from '@/shared/api/generated'
import { deleteCookie, getCookie, setCookie } from 'cookies-next'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  useGetApiUsersSessionQuery,

} from '@/shared/api/generated'

interface SessionContextValue {
  isAuth: boolean
  isLoading: boolean
  login: (token: string, nextUser: User) => void
  logout: () => void
  user: User | null
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuth, setIsAuth] = useState(false)
  const [hasToken, setHasToken] = useState(() => Boolean(getCookie('token')))

  const sessionQuery = useGetApiUsersSessionQuery({
    params: {
      enabled: hasToken,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  })

  useEffect(() => {
    if (!hasToken) {
      setUser(null)
      setIsAuth(false)
    }
  }, [hasToken])

  useEffect(() => {
    if (sessionQuery.data?.data.success) {
      setUser(sessionQuery.data.data.user)
      setIsAuth(true)
    }
  }, [sessionQuery.data])

  useEffect(() => {
    if (sessionQuery.isError) {
      setHasToken(false)
      setUser(null)
      setIsAuth(false)
    }
  }, [sessionQuery.isError])

  const value: SessionContextValue = {
    isAuth,
    isLoading: hasToken ? sessionQuery.isLoading : false,
    login: (token, nextUser) => {
      setCookie('token', token, { path: '/' })
      setUser(nextUser)
      setIsAuth(true)
      setHasToken(true)
    },
    logout: () => {
      deleteCookie('token', { path: '/' })
      setUser(null)
      setIsAuth(false)
      setHasToken(false)
    },
    user,
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)

  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }

  return context
}
