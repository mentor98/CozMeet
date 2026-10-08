import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

export const useAuth = () => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<any>(null)
  const cacheRef = useRef<Map<string, Profile>>(new Map())

  const createFallbackProfile = useCallback((userId: string, email?: string): Profile => ({
    id: userId,
    username: email?.split('@')[0] || 'user',
    display_name: email?.split('@')[0] || 'User',
    bio: null,
    avatar_url: null,
    cover_url: null,
    posts_count: 0,
    followers_count: 0,
    following_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }), [])

  const fetchProfile = useCallback(async (userId: string, email?: string): Promise<Profile> => {
    if (cacheRef.current.has(userId)) {
      return cacheRef.current.get(userId)!
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .limit(1)

      if (fetchError) {
        console.warn('Profile fetch error:', fetchError.message)
        const fallback = createFallbackProfile(userId, email)
        cacheRef.current.set(userId, fallback)
        return fallback
      }

      if (data && data.length > 0) {
        const fetched = data[0] as Profile
        cacheRef.current.set(userId, fetched)
        return fetched
      } else {
        const fallback = createFallbackProfile(userId, email)
        cacheRef.current.set(userId, fallback)
        return fallback
      }
    } catch (err) {
      console.warn('Error fetching profile:', err)
      const fallback = createFallbackProfile(userId, email)
      cacheRef.current.set(userId, fallback)
      return fallback
    }
  }, [createFallbackProfile])

  useEffect(() => {
    let isMounted = true

    // Emergency safety timeout: ensure loading becomes false quickly no matter what
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setLoading(false)
      }
    }, 400)

    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const currentSession = data?.session

        if (!isMounted) return

        if (currentSession?.user?.id) {
          setSession(currentSession)
          const fetchedProfile = await fetchProfile(currentSession.user.id, currentSession.user.email)
          if (isMounted) {
            setProfile(fetchedProfile)
            setLoading(false)
          }
        } else {
          if (isMounted) {
            setProfile(null)
            setLoading(false)
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize auth')
          setLoading(false)
        }
      }
    }

    initAuth()

    const { data: authData } = supabase.auth.onAuthStateChange(
      async (event: string, currentSession: any) => {
        if (!isMounted) return

        if (event === 'SIGNED_IN' && currentSession?.user?.id) {
          setSession(currentSession)
          const fetchedProfile = await fetchProfile(currentSession.user.id, currentSession.user.email)
          if (isMounted) {
            setProfile(fetchedProfile)
            setLoading(false)
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setSession(null)
            setProfile(null)
            setLoading(false)
            cacheRef.current.clear()
          }
        }
      }
    )

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      authData?.subscription?.unsubscribe?.()
    }
  }, [fetchProfile])

  return { profile, loading, error, session }
}
