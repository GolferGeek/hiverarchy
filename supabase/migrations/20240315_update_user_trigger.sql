-- Create a trigger function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  temp_username text;
  user_id uuid;
  user_email text;
begin
  -- Get the user data safely
  user_id := new.id;
  user_email := new.email::text;
  
  -- Create a temporary username from email (before the @ symbol)
  temp_username := split_part(user_email, '@', 1);
  
  -- Create a profile for the new user
  insert into public.profiles (id, email, username)
  values (
    user_id,
    user_email,
    temp_username
  );

  -- Create a default interest for the new user
  insert into public.interests (name, title, description, user_id, sequence, image_path)
  values (
    'general',
    'General',
    'General blog posts',
    user_id,
    1,
    '/images/interests/general.png'
  );

  return new;
exception
  when others then
    raise log 'Error in handle_new_user: %', SQLERRM;
    return null;
end;
$$;

-- Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
