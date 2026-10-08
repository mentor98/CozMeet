import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Post, Profile } from '@/types'

export const usePosts = (userId?: string, filter: 'recent' | 'popular' | 'following' = 'recent') => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('posts')
        .select(`
          *,
          user:profiles(*)
        `)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const orderBy = filter === 'recent' ? 'created_at' : 'updated_at'
      query = query.order(orderBy, { ascending: false })

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Fetch additional data for each post
      const enrichedPosts = await Promise.all(
        (data || []).map(async (post) => {
          const [likesRes, commentsRes, savesRes] = await Promise.all([
            supabase
              .from('post_likes')
              .select('id')
              .eq('post_id', post.id),
            supabase
              .from('comments')
              .select('id')
              .eq('post_id', post.id),
            supabase
              .from('post_saves')
              .select('id')
              .eq('post_id', post.id),
          ])

          return {
            ...post,
            likes_count: likesRes.data?.length || 0,
            comments_count: commentsRes.data?.length || 0,
            saves_count: savesRes.data?.length || 0,
          }
        })
      )

      setPosts(enrichedPosts as Post[])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [userId, filter])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return { posts, loading, error, refetch: fetchPosts }
}

export const usePostDetail = (postId: string) => {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('posts')
          .select(`
            *,
            user:profiles(*)
          `)
          .eq('id', postId)
          .single()

        if (fetchError) throw fetchError
        setPost(data as Post)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  return { post, loading, error }
}
