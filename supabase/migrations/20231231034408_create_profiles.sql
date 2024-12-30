-- Create a table for user profiles if it doesn't exist
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  updated_at timestamp with time zone,
  
  constraint proper_updated_at check(updated_at <= now())
);

-- Create a secure RLS policy
alter table profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;

-- Create new policies with proper authentication checks
do $$ 
begin
  if not exists (
    select from pg_policies 
    where schemaname = 'public' 
    and tablename = 'profiles' 
    and policyname = 'Enable read access for authenticated users'
  ) then
    create policy "Enable read access for authenticated users"
      on profiles for select
      to authenticated
      using ( auth.uid() = id );
  end if;

  if not exists (
    select from pg_policies 
    where schemaname = 'public' 
    and tablename = 'profiles' 
    and policyname = 'Enable update access for users based on id'
  ) then
    create policy "Enable update access for users based on id"
      on profiles for update
      to authenticated
      using ( auth.uid() = id )
      with check ( auth.uid() = id );
  end if;

  if not exists (
    select from pg_policies 
    where schemaname = 'public' 
    and tablename = 'profiles' 
    and policyname = 'Enable insert access for authenticated users'
  ) then
    create policy "Enable insert access for authenticated users"
      on profiles for insert
      to authenticated
      with check ( auth.uid() = id );
  end if;
end $$;

-- Create a function to handle new user profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, updated_at)
  values (new.id, new.raw_user_meta_data->>'full_name', now())
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to automatically create profiles for new users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
