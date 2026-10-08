import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import { calculateProfileStats } from '@/services/stats'

export const useAuth = () => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    let timeoutId: ReturnType<typeof setTimeout>

    const createFallbackProfile = (userId: string, email?: string): Profile => ({
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
    })

    const fetchProfile = async (userId: string, email?: string) => {
      try {
        // Use limit(1) instead of .single() to avoid coercion errors
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
            return { ...profile, ...stats }
          } catch (err) {
            console.error('Error calculating stats:', err)
            return profile
          }
        } else {
          console.log('No profile found, creating fallback')
          return createFallbackProfile(userId, email)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        return createFallbackProfile(userId, email)
      }
    }

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (currentSession?.user?.id) {
          setSession(currentSession)
          const fetchedProfile = await fetchProfile(currentSession.user.id, currentSession.user.email)
          
          if (mounted) {
            setProfile(fetchedProfile)
            setLoading(false)
          }
        } else {
          if (mounted) {
            setLoading(false)
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize auth')
          setLoading(false)
        }
      }
    }

    // Set a timeout to ensure loading doesn't hang forever
    timeoutId = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 3000)

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event)
        
        if (!mounted) return

        if (event === 'SIGNED_IN' && currentSession?.user?.id) {
          setSession(currentSession)
          setLoading(true)
          
          const fetchedProfile = await fetchProfile(currentSession.user.id, currentSession.user.email)
          
          if (mounted) {
            setProfile(fetchedProfile)
            setLoading(false)
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription?.unsubscribe()
    }
  }, [])

  return { profile, loading, error, session }
}
