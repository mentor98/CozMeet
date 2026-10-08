# Storage Setup for CozMeet

The app currently has image uploads disabled because the storage buckets don't exist yet. Follow these steps to enable them:

## Step 1: Create Storage Buckets in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket** and create these 3 buckets:

| Bucket Name | Public | Purpose |
|-------------|--------|---------|
| `post-images` | ✅ Yes | User post images |
| `avatars` | ✅ Yes | Profile avatars |
| `covers` | ✅ Yes | Cover photos |

## Step 2: Set Bucket Policies (RLS)

For each bucket, set these policies:

### post-images Bucket
1. Click on `post-images` bucket
2. Go to **Policies** tab
3. Create these policies:
   - **SELECT** - Anyone can view: `true`
   - **INSERT** - Only authenticated users: `auth.role() = 'authenticated'`

### avatars Bucket
Same as post-images

### covers Bucket
Same as post-images

## Step 3: Re-enable Image Uploads

Once buckets are created, edit `Frontend/src/components/feed/CreatePost.tsx`:

Find this section:
```typescript
// Skip image upload for now - bucket doesn't exist
// TODO: Create storage bucket and implement image uploads
```

Replace with:
```typescript
// Upload image if selected
if (selectedImage) {
  const fileExt = selectedImage.name.split('.').pop()
  const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`
  const filePath = `posts/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('post-images')
    .upload(filePath, selectedImage)

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('post-images')
    .getPublicUrl(filePath)

  imageUrl = data.publicUrl
}
```

Then refresh the browser and image uploads will work!

## Troubleshooting

- **400 error when uploading**: Bucket doesn't exist or RLS policies are blocking
- **403 Forbidden**: User is not authenticated or lacks upload permission
- **Bucket not found**: Make sure bucket name matches exactly (case-sensitive)
