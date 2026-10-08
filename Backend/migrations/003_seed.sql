-- ============================================================================
-- Demo Data for CozMeet
-- ============================================================================
-- This file seeds the database with demo users and posts for testing
-- Replace with real data in production

-- ============================================================================
-- INSERT DEMO PROFILES
-- ============================================================================

-- Note: In production, users are created through auth.users table
-- This assumes profiles will be created through the application's signup flow

-- For demo purposes, we'll insert test data with specific UUIDs
-- In a real application, these would be created through Supabase Auth

INSERT INTO profiles (
  id, 
  username, 
  display_name, 
  bio, 
  avatar_url, 
  cover_url,
  posts_count,
  followers_count,
  following_count,
  created_at,
  updated_at
) VALUES
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
    'reinhard',
    'Reinhard Van Zry',
    'Digital artist and designer. Creating beautiful experiences.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    45,
    2022,
    590,
    NOW() - INTERVAL '6 months',
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'briansky',
    'Briansky',
    'Photographer | Artist | Creative Director',
    'https://images.unsplash.com/photo-1535713566e3d4d3f0aae0e4e3c3c3c3c3c3c3c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    128,
    4500,
    1200,
    NOW() - INTERVAL '1 year',
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'najid',
    'Najid',
    'UI/UX Designer | Innovator',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    67,
    3400,
    890,
    NOW() - INTERVAL '8 months',
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'sheila_dara',
    'Sheila Dara',
    'Creative storyteller | Content creator',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    92,
    5600,
    1450,
    NOW() - INTERVAL '10 months',
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003'::uuid,
    'divaourery',
    'Divaourery',
    'Fashion & lifestyle | Beauty enthusiast',
    'https://images.unsplash.com/photo-1502764613149-7f3242a3fb12?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    156,
    8900,
    2100,
    NOW() - INTERVAL '1 year',
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004'::uuid,
    'jhonson',
    'Jhonson',
    'Tech enthusiast | Developer',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    78,
    2300,
    456,
    NOW() - INTERVAL '5 months',
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440005'::uuid,
    'praha',
    'Praha_',
    'Travel photographer | Adventure seeker',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    234,
    12500,
    3200,
    NOW() - INTERVAL '1 year',
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440006'::uuid,
    'edlwp',
    'Edlwp',
    'Artist | Designer | Creator',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    45,
    1200,
    890,
    NOW() - INTERVAL '3 months',
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440007'::uuid,
    'derog',
    'Derog',
    'Marketer | Content strategist',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=1200&h=300&fit=crop',
    89,
    3400,
    1200,
    NOW() - INTERVAL '7 months',
    NOW()
  );

-- ============================================================================
-- INSERT DEMO POSTS
-- ============================================================================

INSERT INTO posts (
  id,
  user_id,
  caption,
  image_url,
  visibility,
  created_at,
  updated_at
) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440000'::uuid,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
    'Just finished this beautiful art piece! 🎨 #art #aesthetics #wallstreet #wallpaper #photography',
    'https://images.unsplash.com/photo-1579353977991-54a08513f80d?w=800&h=600&fit=crop',
    'public',
    NOW() - INTERVAL '12 minutes',
    NOW() - INTERVAL '12 minutes'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440001'::uuid,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
    'Loving the sunset today! Perfect evening vibes. 🌅 #nature #photography #sunset #travel',
    'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=800&h=600&fit=crop',
    'public',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'Working on something amazing! Stay tuned for the reveal. 🚀 #design #creative #inspiration',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
    'public',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'UI/UX design is my passion. Creating intuitive interfaces that users love! 💻 #design #ui #ux',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
    'public',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440004'::uuid,
    '550e8400-e29b-41d4-a716-446655440003'::uuid,
    'Coffee and creativity fuel my day! ☕️ #creative #lifestyle #coffee',
    'https://images.unsplash.com/photo-1495474472645-4c71bcdd2d18?w=800&h=600&fit=crop',
    'public',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  );

-- ============================================================================
-- INSERT DEMO LIKES
-- ============================================================================

INSERT INTO post_likes (
  post_id,
  user_id,
  created_at
) VALUES
  ('660e8400-e29b-41d4-a716-446655440000'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, NOW() - INTERVAL '10 minutes'),
  ('660e8400-e29b-41d4-a716-446655440000'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, NOW() - INTERVAL '9 minutes'),
  ('660e8400-e29b-41d4-a716-446655440000'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid, NOW() - INTERVAL '8 minutes'),
  ('660e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, NOW() - INTERVAL '1 hour 50 minutes'),
  ('660e8400-e29b-41d4-a716-446655440002'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, NOW() - INTERVAL '5 hours 30 minutes');

-- ============================================================================
-- INSERT DEMO COMMENTS
-- ============================================================================

INSERT INTO comments (
  post_id,
  user_id,
  content,
  created_at,
  updated_at
) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'This is absolutely stunning! Love the composition.',
    NOW() - INTERVAL '5 minutes',
    NOW() - INTERVAL '5 minutes'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440003'::uuid,
    'Amazing work! Would love to see more pieces like this.',
    NOW() - INTERVAL '3 minutes',
    NOW() - INTERVAL '3 minutes'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440005'::uuid,
    'Gorgeous sunset! Where did you take this?',
    NOW() - INTERVAL '1 hour 20 minutes',
    NOW() - INTERVAL '1 hour 20 minutes'
  );

-- ============================================================================
-- INSERT DEMO FOLLOWS
-- ============================================================================

INSERT INTO follows (
  follower_id,
  following_id,
  created_at
) VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, NOW() - INTERVAL '3 months'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid, NOW() - INTERVAL '2 months'),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, NOW() - INTERVAL '2 months'),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid, NOW() - INTERVAL '1 month'),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, NOW() - INTERVAL '6 months'),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, NOW() - INTERVAL '4 months'),
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, NOW() - INTERVAL '5 months'),
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, NOW() - INTERVAL '3 months');

-- ============================================================================
-- INSERT DEMO SHORTCUTS
-- ============================================================================

INSERT INTO shortcuts (
  user_id,
  name,
  created_at
) VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Art and drawing', NOW() - INTERVAL '5 months'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Dribbble Pro', NOW() - INTERVAL '4 months'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Behance Creative', NOW() - INTERVAL '3 months'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'One Piece Fan', NOW() - INTERVAL '2 months'),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'Photography', NOW() - INTERVAL '1 year'),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'Design Inspiration', NOW() - INTERVAL '10 months');

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Demo data seeded successfully!';
  RAISE NOTICE 'Users can now log in with demo accounts';
END
$$;
