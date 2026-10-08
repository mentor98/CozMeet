import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import { calculateProfileStats } from '@/services/stats'

export const useAuth = () => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<any>(null)
  const mountedRef = useRef(true)
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

  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    // Check cache first
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
        console.error('Profile fetch error:', fetchError.message)
        return createFallbackProfile(userId, email)
      }

      if (data && data.length > 0) {
        const profile = data[0] as Profile
        
        // Calculate real stats
        try {
          const stats = await calculateProfileStats(userId)
          const enrichedProfile = { ...profile, ...stats }
          cacheRef.current.set(userId, enrichedProfile)
          return enrichedProfile
        } catch (err) {
          console.error('Error calculating stats:', err)
          cacheRef.current.set(userId, profile)
          return profile
        }
      } else {
        console.log('No profile found, creating fallback')
        const fallback = createFallbackProfile(userId, email)
        cacheRef.current.set(userId, fallback)
        return fallback
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      return createFallbackProfile(userId, email)
    }
  }, [createFallbackProfile])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (!mountedRef.current) return

        if (currentSession?.user?.id) {
          setSession(currentSession)
          const fetchedProfile = await fetchProfile(currentSession.user.id, currentSession.user.email)
          
          if (mountedRef.current) {
            setProfile(fetchedProfile)
            setLoading(false)
          }
        } else {
          if (mountedRef.current) {
            setLoading(false)
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to initialize auth')
          setLoading(false)
        }
      }
    }

    // Set a timeout to ensure loading doesn't hang forever
    timeoutId = setTimeout(() => {
      if (mountedRef.current) setLoading(false)
    }, 3000)

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event)
        
        if (!mountedRef.current) return

        if (event === 'SIGNED_IN' && currentSession?.user?.id) {
          setSession(currentSession)
          setLoading(true)
          
          const fetchedProfile = await fetchProfile(currentSession.user.id, currentSession.user.email)
          
          if (mountedRef.current) {
            setProfile(fetchedProfile)
            setLoading(false)
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null)
          setProfile(null)
          setLoading(false)
          cacheRef.current.clear() // Clear cache on logout
        }
      }
    )

    return () => {
      mountedRef.current = false
      clearTimeout(timeoutId)
      subscription?.unsubscribe()
    }
  }, [fetchProfile])

  return { profile, loading, error, session }
}
