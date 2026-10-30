# Data-request runbook

For the person who runs skuz.link: how to answer someone who exercises their data rights. The Privacy policy promises each answer below, so follow them as written.

Run every query against production D1 from the repo root:

```sh
pnpm wrangler d1 execute db --remote --command "<query>"
```

Add `--preview` to run it against the preview database instead. Timestamps are milliseconds since the epoch.

## 1. Check who is asking

Requests arrive at `contact@skuz.link`, which forwards to the Proton inbox. Note the day each one arrives: the deadline counts from it (step 8).

1. Find the User by the address the request came from:

   ```sql
   SELECT id, name, email, banned, created_at FROM user WHERE email = '<email>';
   ```

2. Answer only when the request comes from the account's email address, which is `user.email`. Otherwise, verify the person another way before you act or send any data. For example, send them a one-time code, ask them to sign in to skuz.link and set their name in Settings to that code, and check `user.name` with the query above.
3. If no User has that address, tell the person that skuz.link holds no account for it. Their own email is the only other data you hold about them.

The answer is free, and goes to the account's email address.

## 2. Access and portability

Both get the same JSON export: the User's record, Connected accounts, Sessions and Links.

1. Save this query as `export.sql` outside the repo, with the User's id in all four places:

   ```sql
   SELECT json_object(
     'user', (
       SELECT json_object(
         'id', id,
         'name', name,
         'email', email,
         'email_verified', json(iif(email_verified, 'true', 'false')),
         'image', image,
         'banned', json(iif(banned, 'true', 'false')),
         'ban_reason', ban_reason,
         'created_at', datetime(created_at / 1000, 'unixepoch'),
         'updated_at', datetime(updated_at / 1000, 'unixepoch')
       )
       FROM user WHERE id = '<user-id>'
     ),
     'connected_accounts', (
       SELECT json_group_array(json_object(
         'provider', provider_id,
         'account_id', account_id,
         'scope', scope,
         'created_at', datetime(created_at / 1000, 'unixepoch')
       ))
       FROM account WHERE user_id = '<user-id>'
     ),
     'sessions', (
       SELECT json_group_array(json_object(
         'ip_address', ip_address,
         'user_agent', user_agent,
         'created_at', datetime(created_at / 1000, 'unixepoch'),
         'expires_at', datetime(expires_at / 1000, 'unixepoch')
       ))
       FROM session WHERE user_id = '<user-id>' AND impersonated_by IS NULL
     ),
     'links', (
       SELECT json_group_array(json_object(
         'short_url', 'https://skuz.link/' || slug,
         'redirect_url', redirect_url,
         'clicks', clicks,
         'created_at', datetime(created_at / 1000, 'unixepoch'),
         'updated_at', datetime(updated_at / 1000, 'unixepoch')
       ))
       FROM links WHERE user_id = '<user-id>'
     )
   ) AS export;
   ```

2. Run it and write the JSON to a file:

   ```sh
   pnpm wrangler d1 execute db --remote --json --file export.sql \
     | jq -r '.[0].results[0].export' | jq . > skuz-link-export.json
   ```

3. Read the file before you send it. Times are UTC.
4. Email it to the User as an attachment, then delete `export.sql` and the export from your machine.

What the export leaves out, and why:

- **Provider tokens.** They are credentials that Google or GitHub issued to skuz.link, not data the User gave. The User can see and revoke skuz.link's access in their Google or GitHub account settings.
- **Session tokens.** Each one would let anyone who reads it sign in as the User.
- **Sessions created by admin impersonation.** They carry your IP address, not the User's.
- **Cloudflare's request logs and traces.** They aren't tied to a User and are gone within 7 days.

## 3. Rectification

- **Name:** the User edits it in Settings. Point them there.
- **Email:** skuz.link keeps the address the Provider sent at the first sign-in and doesn't update it afterwards. If the User changed it at the Provider, verify both addresses as in step 1, then update it:

  ```sql
  UPDATE user SET email = '<new-email>' WHERE id = '<user-id>';
  ```

- **Anything else**, like the avatar: it comes from the Provider, so the User changes it there.

## 4. Erasure

Point the User to **Delete account** in Settings. It deletes the User, their Connected accounts, Sessions and Links, and purges the Links' cached Redirects.

If they can't do it themselves, delete the account on their behalf through better-auth's deletion. Don't delete the rows with SQL or with the admin plugin's `remove-user` endpoint: neither runs the `auth:user:deleting` hook, so the Links' cached Redirects would keep serving for up to 60 seconds. Your own User needs the admin role (see the moderation runbook). Signed in to skuz.link, run this in the browser console:

```js
// sign in as the User: the impersonation Session replaces yours in this browser
await fetch('/api/auth/admin/impersonate-user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: '<user-id>' })
}).then((response) => response.json());

// delete the User, as Delete account in Settings does
await fetch('/api/auth/delete-user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
}).then((response) => response.json());
```

Expect `{ "success": true, "message": "User deleted" }`. Your browser is then signed out, so sign in again. Check that nothing is left:

```sql
SELECT
  (SELECT count(*) FROM user WHERE id = '<user-id>') AS users,
  (SELECT count(*) FROM account WHERE user_id = '<user-id>') AS accounts,
  (SELECT count(*) FROM session WHERE user_id = '<user-id>') AS sessions,
  (SELECT count(*) FROM links WHERE user_id = '<user-id>') AS links;
```

Expect four zeros. Tell the User that the data stays up to 30 days in D1's Time Travel backups, then is gone.

## 5. Erasure for a banned User

Never delete a banned User's record (see the moderation runbook): it stops the same Google or GitHub account from signing up again. Erase everything except the ban record, which is the name, email, ban reason and the Connected accounts' Provider ids, kept under legitimate interest:

```sql
UPDATE user SET image = NULL WHERE id = '<user-id>' AND banned = 1;
UPDATE account SET access_token = NULL, refresh_token = NULL, id_token = NULL,
  access_token_expires_at = NULL, refresh_token_expires_at = NULL, scope = NULL
WHERE user_id = '<user-id>' AND user_id IN (SELECT id FROM user WHERE banned = 1);
DELETE FROM session WHERE user_id = '<user-id>';
DELETE FROM links WHERE user_id = '<user-id>';
```

The Ban already deleted the Sessions and Links, so the last two lines usually change nothing. Tell the User what was kept and why, as the Privacy policy says.

## 6. Restriction and objection

Handle these case by case, and answer in writing either way.

- **Restriction** (GDPR art. 18): while you check a disputed fact, such as a wrong email, don't change or delete the data in question unless the User agrees. Note the restriction in the reply, and lift it when the check is done.
- **Objection** (GDPR art. 21) applies to processing under legitimate interest: request logs, Session IP addresses, abuse handling and Bans. Stop unless you have a compelling reason that outweighs the User's interests, such as an open abuse investigation or a Ban. For Session IP addresses, the User can also revoke their Sessions in Settings, which deletes the addresses at once.

## 7. Other requests

- An account that belongs to someone younger than 14: verify as in step 1, then delete it as in step 4.
- A request about data that Google, GitHub or Cloudflare hold as controllers: point the person to that company.

## 8. Deadline

Answer within one month of receiving the request (GDPR art. 12.3). If a request is complex, or one person sends many, you may take two more months, but tell them so within the first month, with the reason.

Once the request is handled, delete the email thread from Proton: the Privacy policy keeps emails to `contact@` only until they are handled.
