import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasValidSupabaseConfig = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    typeof supabaseUrl === 'string' &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('placeholder')
)

// Initial mock data from Backend/migrations/003_seed.sql
const DEFAULT_PROFILES = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    username: 'reinhard',
    display_name: 'Reinhard Van Zry',
    bio: 'Digital artist and designer. Creating beautiful experiences.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    posts_count: 45,
    followers_count: 2022,
    following_count: 590,
    created_at: new Date(Date.now() - 180 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    username: 'briansky',
    display_name: 'Briansky',
    bio: 'Photographer | Artist | Creative Director',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    posts_count: 128,
    followers_count: 4500,
    following_count: 1200,
    created_at: new Date(Date.now() - 365 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    username: 'najid',
    display_name: 'Najid',
    bio: 'UI/UX Designer | Innovator',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    posts_count: 67,
    followers_count: 3400,
    following_count: 890,
    created_at: new Date(Date.now() - 240 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    username: 'sheila_dara',
    display_name: 'Sheila Dara',
    bio: 'Creative storyteller | Content creator',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    posts_count: 92,
    followers_count: 5600,
    following_count: 1450,
    created_at: new Date(Date.now() - 300 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    username: 'divaourery',
    display_name: 'Divaourery',
    bio: 'Fashion & lifestyle | Beauty enthusiast',
    avatar_url: 'https://images.unsplash.com/photo-1502764613149-7f3242a3fb12?w=400&h=400&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    posts_count: 156,
    followers_count: 8900,
    following_count: 2100,
    created_at: new Date(Date.now() - 365 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    username: 'jhonson',
    display_name: 'Jhonson',
    bio: 'Tech enthusiast | Developer',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    posts_count: 78,
    followers_count: 2300,
    following_count: 456,
    created_at: new Date(Date.now() - 150 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    username: 'praha',
    display_name: 'Praha_',
    bio: 'Travel photographer | Adventure seeker',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    posts_count: 234,
    followers_count: 12500,
    following_count: 3200,
    created_at: new Date(Date.now() - 365 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    username: 'edlwp',
    display_name: 'Edlwp',
    bio: 'Artist | Designer | Creator',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    posts_count: 45,
    followers_count: 1200,
    following_count: 890,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    username: 'derog',
    display_name: 'Derog',
    bio: 'Marketer | Content strategist',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    posts_count: 89,
    followers_count: 3400,
    following_count: 1200,
    created_at: new Date(Date.now() - 210 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const DEFAULT_POSTS = [
  {
    id: '660e8400-e29b-41d4-a716-446655440000',
    user_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    caption: 'Just finished this beautiful art piece! 🎨 #art #aesthetics #wallstreet #wallpaper #photography',
    image_url: 'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=800&h=600&fit=crop',
    video_url: null,
    visibility: 'public',
    created_at: new Date(Date.now() - 12 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    user_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    caption: 'Loving the sunset today! Perfect evening vibes. 🌅 #nature #photography #sunset #travel',
    image_url: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=800&h=600&fit=crop',
    video_url: null,
    visibility: 'public',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440002',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    caption: 'Working on something amazing! Stay tuned for the reveal. 🚀 #design #creative #inspiration',
    image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
    video_url: null,
    visibility: 'public',
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440003',
    user_id: '550e8400-e29b-41d4-a716-446655440002',
    caption: 'UI/UX design is my passion. Creating intuitive interfaces that users love! 💻 #design #ui #ux',
    image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
    video_url: null,
    visibility: 'public',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440004',
    user_id: '550e8400-e29b-41d4-a716-446655440003',
    caption: 'Coffee and creativity fuel my day! ☕️ #creative #lifestyle #coffee',
    image_url: 'https://images.unsplash.com/photo-1495474472645-4c71bcdd2d18?w=800&h=600&fit=crop',
    video_url: null,
    visibility: 'public',
    created_at: new Date(Date.now() - 26 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 26 * 3600000).toISOString(),
  },
]

const DEFAULT_LIKES = [
  { id: '1', post_id: '660e8400-e29b-41d4-a716-446655440000', user_id: '550e8400-e29b-41d4-a716-446655440001', created_at: new Date(Date.now() - 10 * 60000).toISOString() },
  { id: '2', post_id: '660e8400-e29b-41d4-a716-446655440000', user_id: '550e8400-e29b-41d4-a716-446655440002', created_at: new Date(Date.now() - 9 * 60000).toISOString() },
  { id: '3', post_id: '660e8400-e29b-41d4-a716-446655440000', user_id: '550e8400-e29b-41d4-a716-446655440005', created_at: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: '4', post_id: '660e8400-e29b-41d4-a716-446655440001', user_id: '550e8400-e29b-41d4-a716-446655440001', created_at: new Date(Date.now() - 110 * 60000).toISOString() },
  { id: '5', post_id: '660e8400-e29b-41d4-a716-446655440002', user_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', created_at: new Date(Date.now() - 330 * 60000).toISOString() },
]

const DEFAULT_COMMENTS = [
  {
    id: 'c1',
    post_id: '660e8400-e29b-41d4-a716-446655440000',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    content: 'This is absolutely stunning! Love the composition.',
    parent_comment_id: null,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'c2',
    post_id: '660e8400-e29b-41d4-a716-446655440000',
    user_id: '550e8400-e29b-41d4-a716-446655440003',
    content: 'Amazing work! Would love to see more pieces like this.',
    parent_comment_id: null,
    created_at: new Date(Date.now() - 3 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  {
    id: 'c3',
    post_id: '660e8400-e29b-41d4-a716-446655440001',
    user_id: '550e8400-e29b-41d4-a716-446655440005',
    content: 'Gorgeous sunset! Where did you take this?',
    parent_comment_id: null,
    created_at: new Date(Date.now() - 80 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 80 * 60000).toISOString(),
  },
]

const DEFAULT_FOLLOWS = [
  { id: 'f1', follower_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', following_id: '550e8400-e29b-41d4-a716-446655440001', created_at: new Date().toISOString() },
  { id: 'f2', follower_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', following_id: '550e8400-e29b-41d4-a716-446655440005', created_at: new Date().toISOString() },
  { id: 'f3', follower_id: '550e8400-e29b-41d4-a716-446655440001', following_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', created_at: new Date().toISOString() },
  { id: 'f4', follower_id: '550e8400-e29b-41d4-a716-446655440002', following_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', created_at: new Date().toISOString() },
]

const DEFAULT_SHORTCUTS = [
  { id: 's1', user_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', name: 'Art and drawing', image_url: null, created_at: new Date().toISOString() },
  { id: 's2', user_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', name: 'Dribbble Pro', image_url: null, created_at: new Date().toISOString() },
  { id: 's3', user_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', name: 'Behance Creative', image_url: null, created_at: new Date().toISOString() },
  { id: 's4', user_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', name: 'One Piece Fan', image_url: null, created_at: new Date().toISOString() },
]

// In-memory + LocalStorage store for mock environment
class MockStore {
  data: Record<string, any[]>
  currentUser: any | null = null
  authListeners: Array<(event: string, session: any) => void> = []

  constructor() {
    this.data = {
      profiles: [...DEFAULT_PROFILES],
      posts: [...DEFAULT_POSTS],
      post_likes: [...DEFAULT_LIKES],
      comments: [...DEFAULT_COMMENTS],
      follows: [...DEFAULT_FOLLOWS],
      post_saves: [],
      post_shares: [],
      shortcuts: [...DEFAULT_SHORTCUTS],
      notifications: [],
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cozmeet_mock_db')
        if (stored) {
          const parsed = JSON.parse(stored)
          this.data = { ...this.data, ...parsed }
        }
        const storedUser = localStorage.getItem('cozmeet_current_user')
        if (storedUser) {
          this.currentUser = JSON.parse(storedUser)
        } else {
          // Default to demo user Reinhard
          const reinhard = this.data.profiles.find((p) => p.username === 'reinhard')
          if (reinhard) {
            this.currentUser = {
              id: reinhard.id,
              email: 'reinhard@example.com',
            }
            localStorage.setItem('cozmeet_current_user', JSON.stringify(this.currentUser))
          }
        }
      } catch (e) {
        console.warn('LocalStorage error in mock store:', e)
      }
    }
  }

  save() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cozmeet_mock_db', JSON.stringify(this.data))
        if (this.currentUser) {
          localStorage.setItem('cozmeet_current_user', JSON.stringify(this.currentUser))
        } else {
          localStorage.removeItem('cozmeet_current_user')
        }
      } catch (e) {
        console.warn('Error saving to localStorage:', e)
      }
    }
  }

  notifyAuth(event: string) {
    const session = this.currentUser
      ? { user: this.currentUser, access_token: 'mock-token' }
      : null
    this.authListeners.forEach((listener) => {
      try {
        listener(event, session)
      } catch (e) {
        console.error(e)
      }
    })
  }
}

const mockStore = new MockStore()

class MockQueryBuilder {
  table: string
  filters: Array<(item: any) => boolean> = []
  sortCol: string | null = null
  sortAsc = true
  limitCount: number | null = null
  isSingle = false
  selectFields = '*'
  countOption?: { count?: string; head?: boolean }
  isDelete = false
  isUpdate = false
  updateData: any = null
  isInsert = false
  insertData: any = null

  constructor(table: string) {
    this.table = table
  }

  select(fields = '*', options?: { count?: string; head?: boolean }) {
    this.selectFields = fields
    this.countOption = options
    return this
  }

  eq(col: string, val: any) {
    this.filters.push((item) => String(item[col]) === String(val))
    return this
  }

  neq(col: string, val: any) {
    this.filters.push((item) => String(item[col]) !== String(val))
    return this
  }

  in(col: string, vals: any[]) {
    const set = new Set(vals.map(String))
    this.filters.push((item) => set.has(String(item[col])))
    return this
  }

  order(col: string, { ascending = true }: { ascending?: boolean } = {}) {
    this.sortCol = col
    this.sortAsc = ascending
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  insert(data: any) {
    this.isInsert = true
    this.insertData = data
    return this
  }

  update(data: any) {
    this.isUpdate = true
    this.updateData = data
    return this
  }

  delete() {
    this.isDelete = true
    return this
  }

  async execute() {
    const tableData = mockStore.data[this.table] || []

    if (this.isInsert) {
      const items = Array.isArray(this.insertData) ? this.insertData : [this.insertData]
      const inserted: any[] = []
      items.forEach((item) => {
        const newItem = {
          id: item.id || `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...item,
        }
        tableData.unshift(newItem)
        inserted.push(newItem)
      })
      mockStore.data[this.table] = tableData
      mockStore.save()
      return { data: inserted, error: null }
    }

    if (this.isDelete) {
      const remaining = tableData.filter((item) => !this.filters.every((f) => f(item)))
      mockStore.data[this.table] = remaining
      mockStore.save()
      return { data: null, error: null }
    }

    if (this.isUpdate) {
      tableData.forEach((item) => {
        if (this.filters.every((f) => f(item))) {
          Object.assign(item, this.updateData, { updated_at: new Date().toISOString() })
        }
      })
      mockStore.data[this.table] = tableData
      mockStore.save()
      return { data: tableData, error: null }
    }

    // Read Query
    let result = tableData.filter((item) => this.filters.every((f) => f(item)))
    const count = result.length

    if (this.sortCol) {
      result.sort((a, b) => {
        const valA = a[this.sortCol!]
        const valB = b[this.sortCol!]
        if (valA < valB) return this.sortAsc ? -1 : 1
        if (valA > valB) return this.sortAsc ? 1 : -1
        return 0
      })
    }

    if (this.limitCount !== null) {
      result = result.slice(0, this.limitCount)
    }

    // Handle joins
    if (this.selectFields.includes('user:profiles(*)')) {
      const profiles = mockStore.data.profiles || []
      result = result.map((row) => ({
        ...row,
        user: profiles.find((p) => p.id === row.user_id) || null,
      }))
    }

    if (this.countOption?.head) {
      return { data: null, error: null, count }
    }

    if (this.isSingle) {
      return { data: result[0] || null, error: null, count }
    }

    return { data: result, error: null, count }
  }

  // Thenable interface so await query works
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected)
  }
}

const createMockSupabase = () => {
  return {
    auth: {
      getSession: async () => {
        const session = mockStore.currentUser
          ? { user: mockStore.currentUser, access_token: 'mock-token' }
          : null
        return { data: { session }, error: null }
      },
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        mockStore.authListeners.push(callback)
        // Immediate trigger
        const session = mockStore.currentUser
          ? { user: mockStore.currentUser, access_token: 'mock-token' }
          : null
        setTimeout(() => {
          callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session)
        }, 10)

        return {
          data: {
            subscription: {
              unsubscribe: () => {
                mockStore.authListeners = mockStore.authListeners.filter((l) => l !== callback)
              },
            },
          },
        }
      },
      signInWithPassword: async ({ email }: { email: string; password?: string }) => {
        const profile =
          mockStore.data.profiles.find(
            (p) => p.username === email || p.id === email || email.includes(p.username)
          ) || mockStore.data.profiles[0]

        mockStore.currentUser = {
          id: profile.id,
          email: `${profile.username}@example.com`,
        }
        mockStore.save()
        mockStore.notifyAuth('SIGNED_IN')
        return { data: { user: mockStore.currentUser, session: { user: mockStore.currentUser } }, error: null }
      },
      signUp: async ({ email }: { email: string; password?: string }) => {
        const userId = `user-${Date.now()}`
        mockStore.currentUser = { id: userId, email }
        mockStore.save()
        mockStore.notifyAuth('SIGNED_IN')
        return { data: { user: mockStore.currentUser, session: { user: mockStore.currentUser } }, error: null }
      },
      signOut: async () => {
        mockStore.currentUser = null
        mockStore.save()
        mockStore.notifyAuth('SIGNED_OUT')
        return { error: null }
      },
    },
    from: (table: string) => new MockQueryBuilder(table),
    storage: {
      from: (_bucket: string) => ({
        upload: async (path: string, file: File) => {
          const url = URL.createObjectURL(file)
          return { data: { path, url }, error: null }
        },
        getPublicUrl: (path: string) => {
          return { data: { publicUrl: path } }
        },
      }),
    },
  }
}

// Export either real Supabase or our mock adapter
export const supabase: any = hasValidSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabase()

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          bio: string | null
          avatar_url: string | null
          cover_url: string | null
          posts_count: number
          followers_count: number
          following_count: number
          created_at: string
          updated_at: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          caption: string | null
          image_url: string | null
          video_url: string | null
          visibility: string
          created_at: string
          updated_at: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          parent_comment_id: string | null
          created_at: string
          updated_at: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
      }
      post_saves: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
      }
      post_shares: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          actor_id: string
          type: string
          post_id: string | null
          comment_id: string | null
          is_read: boolean
          created_at: string
        }
      }
      shortcuts: {
        Row: {
          id: string
          user_id: string
          name: string
          image_url: string | null
          created_at: string
        }
      }
    }
  }
}
