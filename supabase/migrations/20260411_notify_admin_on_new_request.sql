-- Trigger to call the notify-admin-new-request Edge Function
-- when a new request is inserted.
--
-- NOTE: This uses Supabase's pg_net extension to make HTTP calls.
-- The webhook URL must be updated with your actual Supabase project ref.
-- Alternatively, configure the Database Webhook via the Supabase Dashboard:
--   Database > Webhooks > Create > Table: requests, Event: INSERT
--   URL: https://<project-ref>.supabase.co/functions/v1/notify-admin-new-request

create or replace function public.handle_new_request_notification()
returns trigger
language plpgsql
security definer
as $$
declare
  payload jsonb;
begin
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'requests',
    'record', jsonb_build_object(
      'id', NEW.id,
      'user_id', NEW.user_id,
      'title', NEW.title,
      'year', NEW.year,
      'poster_path', NEW.poster_path,
      'note', NEW.note,
      'created_at', NEW.created_at
    )
  );

  perform net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/notify-admin-new-request',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := payload
  );

  return NEW;
end;
$$;

create trigger on_new_request_notify_admin
  after insert on public.requests
  for each row
  execute function public.handle_new_request_notification();
