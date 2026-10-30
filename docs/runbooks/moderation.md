# Moderation runbook

For the person who runs skuz.link: what to do when a Link breaks the Terms of use, from the report to the Ban. The Terms of use promise each step below, so follow them in order.

Run every query against production D1 from the repo root:

```sh
pnpm wrangler d1 execute db --remote --command "<query>"
```

Add `--preview` to run it against the preview database instead. Timestamps are milliseconds since the epoch.

## 1. Handle a report

Reports arrive at `abuse@skuz.link`, which forwards to the Proton inbox.

1. Check that the reported Short URL breaks section 5 of the Terms of use. Don't follow the Redirect URL in your normal browser: look it up in a URL scanner, or open it in a sandbox.
2. Find the Link and its Owner:

   ```sql
   SELECT l.id, l.slug, l.redirect_url, l.created_at, u.id AS user_id, u.email, u.banned
   FROM links l JOIN user u ON u.id = l.user_id
   WHERE l.slug = '<slug>';
   ```

3. Decide: delete the Link (step 3 of this runbook), and for serious or repeated abuse, ban the Owner (steps 2, 4 and 5). Phishing, malware and scams are serious. To see whether the Owner repeats, list their other Links:

   ```sql
   SELECT slug, redirect_url, created_at FROM links WHERE user_id = '<user-id>';
   ```

4. Move the report to the Proton folder `Abuse`, and delete it from there one year after it arrived. The Privacy policy promises this retention.

## 2. Before a Ban, look for Users sharing the abuser's IP addresses

A Ban revokes the abuser's Sessions, and their IP addresses go with them (ADR-0005). Look now, because nothing is kept afterwards:

```sql
SELECT DISTINCT u.id, u.email, u.banned, s.ip_address
FROM session s JOIN user u ON u.id = s.user_id
WHERE s.user_id != '<user-id>'
  AND s.impersonated_by IS NULL
  AND s.ip_address IN (
    SELECT ip_address FROM session
    WHERE user_id = '<user-id>'
      AND impersonated_by IS NULL
      AND ip_address IS NOT NULL
  );
```

- The `impersonated_by IS NULL` filter skips Sessions created by admin impersonation, which carry the admin's IP address, not the User's.
- IPv6 addresses are stored as their /64 network, so one row can stand for a whole household or office.
- A shared address is a lead, not proof. Mobile networks and carrier-grade NAT put many strangers behind one IPv4 address. Ban another User only when their own Links break the Terms of use too.

## 3. Delete a Link

```sql
DELETE FROM links WHERE slug = '<slug>';
```

The Redirect stays in the Workers cache of each Cloudflare data center for up to 60 seconds, so the Short URL can still redirect for a minute.

## 4. Ban a User

A banned User can't sign in again: better-auth's admin plugin refuses to create a Session for them. Leave `ban_expires` empty, so the Ban never ends. Use either way below.

### Through better-auth's admin endpoint

Your own User needs the admin role. Grant it once:

```sql
UPDATE user SET role = 'admin' WHERE email = '<your-email>';
```

Then, signed in to skuz.link, run this in the browser console:

```js
await fetch('/api/auth/admin/ban-user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: '<user-id>', banReason: '<reason>' })
}).then((response) => response.json());
```

The endpoint sets the ban fields and revokes all of the User's Sessions.

### With SQL

```sql
UPDATE user SET banned = 1, ban_reason = '<reason>', ban_expires = NULL WHERE id = '<user-id>';
DELETE FROM session WHERE user_id = '<user-id>';
```

Either way, the banned User's browser keeps a cached Session cookie for up to 5 minutes, so they may still act as signed in for that long.

## 5. After a Ban

1. Delete all of the User's Links:

   ```sql
   DELETE FROM links WHERE user_id = '<user-id>';
   ```

   Their Redirects stay cached for up to 60 seconds, as in step 3.

2. Email the User the reason from Proton, sent as `abuse@skuz.link`, to the address in `user.email`. Name the Links and the section of the Terms of use they broke, and say that the account is banned and its Links deleted. Write in Spanish or English, whichever the User is likely to read.

3. Check that the Ban held:

   ```sql
   SELECT banned, ban_reason,
     (SELECT count(*) FROM session WHERE user_id = '<user-id>') AS sessions,
     (SELECT count(*) FROM links WHERE user_id = '<user-id>') AS links
   FROM user WHERE id = '<user-id>';
   ```

   Expect `banned` 1, and no Sessions or Links.

## Never delete a banned User's record

The `user` row and its `account` rows are what stop the same Google or GitHub account from signing up again. Don't delete them, through SQL or through better-auth's user deletion, even when the User asks for erasure: the Privacy policy keeps the ban record (name, email, ban reason and the Connected accounts' Provider ids) for as long as skuz.link runs, under legitimate interest.
