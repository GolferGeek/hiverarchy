-- Create interests table
create table interests (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description jsonb not null,
  image_path text not null,
  route_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tags table
create table tags (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  interest_id uuid references interests(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create post_tags junction table
create table post_tags (
  post_id uuid references posts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- Add RLS policies
alter table interests enable row level security;
alter table tags enable row level security;
alter table post_tags enable row level security;

-- Interests policies
create policy "Interests are viewable by everyone"
  on interests for select
  using (true);

create policy "Interests are insertable by authenticated users only"
  on interests for insert
  with check (auth.role() = 'authenticated');

create policy "Interests are updatable by authenticated users only"
  on interests for update
  using (auth.role() = 'authenticated');

-- Tags policies
create policy "Tags are viewable by everyone"
  on tags for select
  using (true);

create policy "Tags are insertable by authenticated users only"
  on tags for insert
  with check (auth.role() = 'authenticated');

-- Post tags policies
create policy "Post tags are viewable by everyone"
  on post_tags for select
  using (true);

create policy "Post tags are insertable by authenticated users only"
  on post_tags for insert
  with check (auth.role() = 'authenticated');

create policy "Post tags are deletable by post owners"
  on post_tags for delete
  using (
    auth.uid() in (
      select user_id from posts where id = post_id
    )
  );

-- Insert initial interests data
insert into interests (title, description, image_path, route_path) values
(
  'Coding Journey',
  '{"sections": [
    {"title": "Near the metal", "items": ["Assembler", "C++"]},
    {"title": "Business Developer", "items": ["Power Builder", "VB", "C#", ".NET", "SS(RAI)S", "Angular"]},
    {"title": "Semi-Retirement", "items": ["React", "AI", "Mentoring"]}
  ]}',
  '/gg-blog/images/coder.jpg',
  '/coder'
),
(
  'Golf Adventures',
  '{"text": "Sharing golf experiences, tips, and achievements"}',
  '/gg-blog/images/golfer.jpg',
  '/golfer'
),
(
  'Mentorship',
  '{"text": "Guiding and supporting others in their journey"}',
  '/gg-blog/images/mentor.jpg',
  '/mentor'
),
(
  'Life''s Journey',
  '{"text": "Insights and reflections on the aging process"}',
  '/gg-blog/images/aging.jpg',
  '/aging'
);
