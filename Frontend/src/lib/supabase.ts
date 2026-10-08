import { createClient } from '@supabase/supabase-js'

export const SUPABASE_CONFIG = {
  url: 'https://iksijgrqkxmmqipjldyj.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrc2lqZ3Jxa3htbXFpcGpsZHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NDg1NjMsImV4cCI6MjEwNzAyNDU2M30.OxoDP_fnd9K70aBKNpt-0T0PtAV0MBZRktqtxGcd6O4',
  serviceRoleKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrc2lqZ3Jxa3htbXFpcGpsZHlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTQ0ODU2MywiZXhwIjoyMTA3MDI0NTYzfQ.TY6OvfgCL_ycNHN_fuKGoXrwwuWkcEZmKBERDwvYUSk',
  jwksUrl:
    'https://iksijgrqkxmmqipjldyj.supabase.co/auth/v1/.well-known/jwks.json',
  bucketEndpoint:
    'https://iksijgrqkxmmqipjldyj.storage.supabase.co/storage/v1/s3',
  region: 'eu-west-1',
}

const envUrl = import.meta.env.VITE_SUPABASE_URL
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const activeSupabaseUrl =
  envUrl && envUrl.startsWith('http') && !envUrl.includes('placeholder')
    ? envUrl
    : SUPABASE_CONFIG.url

export const activeSupabaseKey =
  envKey && envKey.length > 20 && !envKey.includes('placeholder')
    ? envKey
    : SUPABASE_CONFIG.anonKey

// Create real client
export const supabase = createClient(activeSupabaseUrl, activeSupabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Helper to resolve a username to their auth email in Supabase
export const resolveEmailFromIdentifier = async (identifier: string): Promise<string> => {
  const clean = (identifier || '').trim()
  if (!clean) return ''
  if (clean.includes('@')) {
    return clean.toLowerCase()
  }

  const cleanUsername = clean.replace(/^@/, '').toLowerCase()

  // Fast shortcut for existing verified community profiles
  if (cleanUsername === 'emmitechfx') return 'emmitechfx@gmail.com'
  if (cleanUsername === 'enoch360') return 'mentor360@gmail.com'

  try {
    // 1. Look up user by username in profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', cleanUsername)
      .maybeSingle()

    if (profile?.id) {
      // 2. Query Supabase auth admin endpoint with service role to get email
      const res = await fetch(
        `${activeSupabaseUrl}/auth/v1/admin/users/${profile.id}`,
        {
          headers: {
            apikey: SUPABASE_CONFIG.serviceRoleKey,
            Authorization: `Bearer ${SUPABASE_CONFIG.serviceRoleKey}`,
          },
        }
      )
      if (res.ok) {
        const u = await res.json()
        if (u?.email) {
          return u.email.toLowerCase()
        }
      }
    }
  } catch (err) {
    console.warn('Could not resolve username to email:', err)
  }

  return clean
}

// Preserve original methods
const originalSignInWithPassword = supabase.auth.signInWithPassword.bind(supabase.auth)
const originalSignUp = supabase.auth.signUp.bind(supabase.auth)
const originalFrom = supabase.from.bind(supabase)

// Wrap signInWithPassword to support username resolution & auto-profile sync
supabase.auth.signInWithPassword = (async ({
  email,
  password,
}: {
  email: string
  password?: string
}) => {
  const rawInput = (email || '').trim()
  const cleanPassword = password || ''

  if (!rawInput) {
    return {
      data: { user: null, session: null },
      error: new Error('Please enter your email or username.'),
    } as any
  }
  if (!cleanPassword) {
    return {
      data: { user: null, session: null },
      error: new Error('Please enter your password.'),
    } as any
  }

  // Resolve username to actual email if needed
  const resolvedEmail = await resolveEmailFromIdentifier(rawInput)

  const result = await originalSignInWithPassword({
    email: resolvedEmail,
    password: cleanPassword,
  })

  if (result.error) {
    const msg = result.error.message || ''
    if (
      msg.toLowerCase().includes('invalid login credentials') ||
      msg.toLowerCase().includes('invalid email or password')
    ) {
      return {
        data: { user: null, session: null },
        error: new Error(
          'Invalid email or password. Please check your credentials and try again.'
        ),
      } as any
    }
    return result
  }

  // Ensure profile row exists for this user in profiles table
  if (result.data?.user?.id) {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', result.data.user.id)
        .maybeSingle()

      if (!existingProfile) {
        const fallbackUsername =
          result.data.user.user_metadata?.username ||
          result.data.user.email?.split('@')[0] ||
          'user'
        const fallbackDisplayName =
          result.data.user.user_metadata?.display_name || fallbackUsername

        await supabase.from('profiles').insert([
          {
            id: result.data.user.id,
            username: fallbackUsername.toLowerCase().replace(/[^a-z0-9_]/g, ''),
            display_name: fallbackDisplayName,
            bio: 'Welcome to my CozMeet profile!',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
              fallbackUsername
            )}`,
            posts_count: 0,
            followers_count: 0,
            following_count: 0,
          },
        ])
      }
    } catch (e) {
      console.warn('Profile sync notice:', e)
    }
  }

  return result
}) as any

// Wrap signUp to auto-create profile
supabase.auth.signUp = (async (options: {
  email: string
  password: string
  options?: { data?: Record<string, any> }
}) => {
  const cleanEmail = (options.email || '').trim().toLowerCase()
  const password = options.password
  const meta = options.options?.data || {}

  const res = await originalSignUp({
    email: cleanEmail,
    password,
    options: { data: meta },
  })

  if (res.error) return res

  // Automatically create the user profile in profiles table
  if (res.data?.user?.id) {
    const username =
      meta.username || cleanEmail.split('@')[0] || 'user'
    const displayName = meta.display_name || username

    try {
      await supabase.from('profiles').upsert([
        {
          id: res.data.user.id,
          username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
          display_name: displayName,
          bio: 'Hey there! I just joined CozMeet.',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
            username
          )}`,
          posts_count: 0,
          followers_count: 0,
          following_count: 0,
        },
      ])
    } catch (err) {
      console.warn('Profile creation note:', err)
    }
  }

  return res
}) as any

// Intercept follows to strictly enforce that users cannot follow themselves
supabase.from = ((table: string) => {
  const builder = originalFrom(table)
  if (table === 'follows') {
    const originalInsert = builder.insert.bind(builder)
    builder.insert = (values: any, options?: any) => {
      const rows = Array.isArray(values) ? values : [values]
      for (const row of rows) {
        if (
          row &&
          row.follower_id &&
          row.following_id &&
          row.follower_id === row.following_id
        ) {
          const selfErr = new Error('You cannot follow yourself.')
          return {
            data: null,
            error: selfErr,
            select: () => Promise.resolve({ data: null, error: selfErr }),
            then: (onfulfilled: any) =>
              Promise.resolve({ data: null, error: selfErr }).then(onfulfilled),
          } as any
        }
      }
      return originalInsert(values, options)
    }
  }
  return builder
}) as any

export default supabase
