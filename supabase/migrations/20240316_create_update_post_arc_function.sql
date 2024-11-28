-- Drop existing function(s) with the same name
drop function if exists update_post_arc(uuid, uuid, uuid);
drop function if exists update_post_arc(integer, integer, integer);

-- Create a function to update post arc_ids
create or replace function update_post_arc(
  post_id integer,
  parent_post_id integer,
  arc_identifier integer
)
returns void
language plpgsql
security definer
as $$
begin
  -- Update the child post's arc_id
  update posts
  set arc_id = arc_identifier
  where id = post_id;

  -- Update the parent's arc_id if it's not already set
  update posts
  set arc_id = arc_identifier
  where id = parent_post_id
  and arc_id is null;
end;
$$; 