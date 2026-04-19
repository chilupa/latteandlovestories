-- Example seed data for local testing.
-- Replace USER_UUID with a real auth.users.id from Authentication → Users after you sign up once,
-- or comment this out and use the dashboard to create your profile instead.

/*
insert into public.profiles (
  user_id,
  username,
  display_name,
  bio,
  avatar_url,
  theme,
  instagram_url,
  youtube_url,
  tiktok_url,
  website_url,
  contact_email
) values (
  'USER_UUID'::uuid,
  'demo_creator',
  'Alex Rivers',
  'Stories, coffee dates, and slow Sundays.',
  null,
  jsonb_build_object(
    'backgroundType', 'gradient',
    'background', 'linear-gradient(165deg, #fdf2f8 0%, #fff7ed 45%, #faf5ff 100%)',
    'accent', '#be185d',
    'buttonStyle', 'pill'
  ),
  'https://instagram.com/',
  null,
  null,
  'https://example.com',
  'hello@example.com'
);

insert into public.links (profile_id, title, url, icon, position, is_active, is_highlighted)
select
  p.id,
  v.title,
  v.url,
  v.icon,
  v.position,
  true,
  v.is_highlighted
from public.profiles p
cross join (values
  ('Latest collection', 'https://example.com/shop', 'sparkles', 0, true),
  ('Read the blog', 'https://example.com/blog', 'pen-line', 1, false),
  ('Newsletter', 'https://example.com/subscribe', 'mail', 2, false)
) as v(title, url, icon, position, is_highlighted)
where p.username = 'demo_creator';
*/

-- Empty seed file by default — uncomment and edit USER_UUID to load demo rows.
