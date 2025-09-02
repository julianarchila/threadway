import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { authClient } from '@/lib/auth-client'

export const AUTH_QUERY_KEY = ['auth'] as const

/**
 * Hook to manage auth cache invalidation
 * Invalidates the auth cache when the session changes
 */
export function useAuthCacheInvalidation() {
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()

  useEffect(() => {
    // Invalidate auth cache when session changes
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
  }, [session?.user.id, queryClient])

  return {
    invalidateAuth: () => queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY }),
    removeAuthCache: () => queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY }),
  }
}

/**
 * Hook to get cached auth data
 */
export function useCachedAuth() {
  const queryClient = useQueryClient()
  
  return queryClient.getQueryData(AUTH_QUERY_KEY) as { userId?: string; token?: string } | undefined
}
