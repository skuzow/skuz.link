## 1. Who I am

I am Alejandro Porras. I run skuz.link from Spain, and I am the controller of the personal data this policy describes. You can write to me at [contact@skuz.link](mailto:contact@skuz.link).

The [Legal notice](/legal-notice) says more about who I am, and the [Terms of use](/terms) set the rules for using skuz.link.

## 2. What I process and why

### Anyone who opens skuz.link

Cloudflare handles every request that reaches skuz.link. To serve it, it receives your IP address, your browser, the address you request and the time. It keeps request logs and traces for up to 7 days, and I use them to keep the site secure and to fix errors.

### Anyone who opens a short URL

Opening a short URL also adds one to its link's click count. I store nothing about you with the link.

The site a short URL redirects to has its own privacy rules.

### Users

When you sign in with Google or GitHub, I store:

- your name, your email address and the address of your avatar, which I receive from Google or GitHub. Your browser loads the avatar from their servers;
- your connected accounts: your account id at Google or GitHub, and the tokens they issue when you sign in;
- your sessions: the browser (user agent), the IP address, and when they were created and when they expire;
- your links: the slug, the address they redirect to and their click count.

I take each session's IP address from the `CF-Connecting-IP` header, where Cloudflare puts your real address. I keep IPv4 addresses in full and shorten IPv6 addresses to their /64 network. I use it only to investigate abuse and to keep accounts secure, for example to find out where your account was used from if someone broke into it. It is deleted with its session: when you sign out, when you revoke the session or, at the latest, 30 days after the session expires.

### Banned users

If I ban a user for breaking the Terms of use, I keep their name, their email address, the reason for the ban and the ids of their connected accounts, so that the same Google or GitHub account can't sign up again.

### Anyone who emails me

If you write to [contact@skuz.link](mailto:contact@skuz.link) or [abuse@skuz.link](mailto:abuse@skuz.link), I keep your email address and your message.

## 3. Legal bases

| Processing                                   | Legal basis                                                                                                          |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Serving requests, request logs and traces    | Legitimate interest: delivering the site, keeping it secure and fixing errors (GDPR art. 6.1.f)                      |
| Account, connected accounts, sessions, links | Contract: providing you the service under the Terms of use (GDPR art. 6.1.b)                                         |
| Session IP addresses                         | Legitimate interest: investigating abuse and keeping accounts secure (GDPR art. 6.1.f)                               |
| Handling abuse, bans                         | Legitimate interest: keeping skuz.link free of abuse (GDPR art. 6.1.f)                                               |
| Emails                                       | Legitimate interest in answering you (GDPR art. 6.1.f); for data-rights requests, legal obligation (GDPR art. 6.1.c) |

## 4. Cookies and browser storage

skuz.link keeps only these entries in your browser. The first four are cookies, and `nuxt-color-mode` is a localStorage entry.

| Name                                 | What for                                          | Set when                                 | How long                 |
| ------------------------------------ | ------------------------------------------------- | ---------------------------------------- | ------------------------ |
| `__Secure-better-auth.session_token` | Keeps you signed in                               | When you sign in                         | 7 days, renewed with use |
| `__Secure-better-auth.session_data`  | Caches your session to spare database reads       | When you sign in                         | 5 minutes                |
| `__Secure-better-auth.state`         | Protects the round trip to Google or GitHub       | Only while you sign in                   | 5 minutes                |
| `i18n_redirected`                    | Remembers your language (`en` or `es`)            | On your first visit, and when you switch | 1 year                   |
| `nuxt-color-mode`                    | Remembers the theme (`light`, `dark` or `system`) | On your first visit, and when you switch | Until you delete it      |

None of them tracks you, shows you ads or feeds analytics. That is why there is no cookie banner: the first three are needed to sign in, and the other two only remember how you want to see the site.

You can delete them at any time in your browser's settings. If you delete the session ones, you will have to sign in again.

## 5. Who else receives data

| Recipient                   | What it does                                                                                | Where       | Transfer safeguard           |
| --------------------------- | ------------------------------------------------------------------------------------------- | ----------- | ---------------------------- |
| Cloudflare, Inc.            | Processor: hosting, database, request logs and traces, and email forwarding                 | USA, global | EU–US Data Privacy Framework |
| Google LLC and GitHub, Inc. | Separate controllers for sign-in and for serving your avatar, only if you sign in with them | USA         | EU–US Data Privacy Framework |
| Proton AG                   | Processor: the inbox for `contact@skuz.link` and `abuse@skuz.link`                          | Switzerland | EU adequacy decision         |

I never sell your data, use it for ads or run analytics on it.

## 6. How long I keep it

| Data                                                         | Kept for                                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Request logs and traces at Cloudflare                        | Up to 7 days                                                                   |
| Account data (user, connected accounts, links)               | Until you delete your account, then up to 30 days in database backups          |
| Sessions, including their IP address                         | Until you sign out or revoke them, and at the latest 30 days after they expire |
| Ban record (name, email address, reason, connected accounts) | As long as skuz.link runs                                                      |
| Emails to `contact@skuz.link`                                | Until handled                                                                  |
| Abuse reports to `abuse@skuz.link`                           | 1 year                                                                         |

Whatever I delete from the database stays up to 30 more days in its backups, and is then gone.

## 7. Your rights

You have the right to access your data, rectify it, erase it, restrict its processing, object to it and take it to another service (portability).

You can exercise some of them yourself in Settings:

- edit your name;
- revoke your sessions;
- disconnect a connected account;
- delete your account, which also deletes your links and your sessions.

For anything else, write to [contact@skuz.link](mailto:contact@skuz.link) from your account's email address. If you can't, I will ask you to prove in another way that the account is yours. I will answer within one month.

Your email address is the one of your Google or GitHub account. If you need it corrected, write to me.

If I have banned you and you ask me to erase your data, I erase everything except the ban record, which I need so that you can't sign up again.

If you think I haven't handled your request properly, you can complain to the Spanish Data Protection Agency (AEPD) at [aepd.es](https://www.aepd.es).

## 8. Minimum age

You must be at least 14 years old to use skuz.link. If I find out that an account belongs to someone younger, I delete it.

## 9. Changes

When this policy changes, the last-updated date above changes.
