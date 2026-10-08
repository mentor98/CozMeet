import { supabase, SUPABASE_CONFIG, activeSupabaseUrl } from '@/lib/supabase'

export const STORAGE_CONFIG = {
  s3Endpoint:
    SUPABASE_CONFIG.bucketEndpoint ||
    'https://iksijgrqkxmmqipjldyj.storage.supabase.co/storage/v1/s3',
  region: SUPABASE_CONFIG.region || 'eu-west-1',
  buckets: {
    POST_IMAGES: 'post-images',
    AVATARS: 'avatars',
    COVERS: 'covers',
  },
}

/**
 * Ensures the specified bucket exists and is public in Supabase Storage.
 */
export const ensureBucketExists = async (
  bucketName: string
): Promise<boolean> => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (!error && buckets?.some((b) => b.id === bucketName || b.name === bucketName)) {
      return true
    }

    // Attempt creation via service role if not found
    const res = await fetch(`${activeSupabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_CONFIG.serviceRoleKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: bucketName,
        name: bucketName,
        public: true,
      }),
    })

    return res.ok || res.status === 409
  } catch (err) {
    console.warn(`Could not verify or create bucket ${bucketName}:`, err)
    return false
  }
}

/**
 * Uploads a post image to the 'post-images' bucket and returns its public URL.
 */
export const uploadPostImage = async (
  file: File,
  userId: string
): Promise<string> => {
  if (!file) {
    throw new Error('No image file provided')
  }

  // 15MB size limit check
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Image size exceeds 15MB limit')
  }

  const cleanExt = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${cleanExt}`
  const filePath = `posts/${fileName}`
  const bucket = STORAGE_CONFIG.buckets.POST_IMAGES

  // Method 1: Try standard client upload
  try {
    const { error: clientError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      })

    if (!clientError) {
      const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(filePath)
      if (pubData?.publicUrl) {
        return pubData.publicUrl
      }
    } else {
      console.warn('Standard client upload returned notice:', clientError.message)
    }
  } catch (err) {
    console.warn('Standard client upload error, attempting fallback:', err)
  }

  // Method 2: Resilient direct storage endpoint with serviceRole authentication
  try {
    const uploadUrl = `${activeSupabaseUrl}/storage/v1/object/${bucket}/${filePath}`
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_CONFIG.serviceRoleKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.serviceRoleKey}`,
        'Content-Type': file.type || 'image/jpeg',
        'x-upsert': 'true',
      },
      body: file,
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Upload failed (${response.status}): ${errText}`)
    }

    return `${activeSupabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`
  } catch (fallbackErr: any) {
    console.error('All image upload methods failed:', fallbackErr)
    throw new Error(fallbackErr?.message || 'Failed to upload image')
  }
}

/**
 * Uploads an avatar image to the 'avatars' bucket and returns its public URL.
 */
export const uploadAvatarImage = async (
  file: File,
  userId: string
): Promise<string> => {
  if (!file) throw new Error('No avatar file provided')

  const cleanExt = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const fileName = `${userId}-${Date.now()}.${cleanExt}`
  const bucket = STORAGE_CONFIG.buckets.AVATARS

  try {
    const { error: clientError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      })

    if (!clientError) {
      const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(fileName)
      if (pubData?.publicUrl) return pubData.publicUrl
    }
  } catch (err) {
    console.warn('Avatar standard upload error, using fallback:', err)
  }

  const uploadUrl = `${activeSupabaseUrl}/storage/v1/object/${bucket}/${fileName}`
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_CONFIG.serviceRoleKey,
      Authorization: `Bearer ${SUPABASE_CONFIG.serviceRoleKey}`,
      'Content-Type': file.type || 'image/jpeg',
      'x-upsert': 'true',
    },
    body: file,
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Avatar upload failed (${response.status}): ${errText}`)
  }

  return `${activeSupabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`
}
