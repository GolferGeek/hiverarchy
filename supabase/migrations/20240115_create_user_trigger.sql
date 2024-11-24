-- Create a trigger function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Create a profile for the new user
  insert into public.profiles (id, username, email)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.email
  );

  -- Create a default interest for the new user
  insert into public.interests (name, title, description, user_id, sequence)
  values (
    'general',
    'General',
    'General blog posts',
    new.id,
    1
  );

  return new;
end;
$$;

-- Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
