-- Only re-open verification when payout address/network changes (not label-only edits)
create or replace function public.merchant_wallet_verification_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.verification_requested_at := coalesce(new.verification_requested_at, now());
    new.verified_at := null;
    new.verified_by := null;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if not public.is_cp_admin() then
      if new.status is distinct from old.status
        and new.status in ('verified', 'rejected') then
        new.status := old.status;
      end if;

      if new.wallet_address is distinct from old.wallet_address
        or new.wallet_network is distinct from old.wallet_network then
        new.status := 'pending';
        new.verification_requested_at := now();
        new.verified_at := null;
        new.verified_by := null;
        new.rejection_reason := null;
        new.merchant_status_emailed_at := null;
        new.merchant_status_emailed_for_request := null;
      end if;
    end if;

    return new;
  end if;

  return new;
end;
$$;
