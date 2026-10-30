# The Privacy policy's promises bind the code

The Privacy policy tells people exactly what skuz.link stores and sends, so the code must not drift from it. Four of its promises depend on code:

- A Session's IP address comes only from Cloudflare's `CF-Connecting-IP` header (better-auth's `advanced.ipAddress.ipAddressHeaders`). IPv4 is kept in full and IPv6 is shortened to its /64 network. The IP is used only to investigate abuse and to keep accounts secure, and it goes with its Session: on sign-out, on revocation, or at the latest 30 days after the Session expires, when a daily Cron Trigger deletes it.
- A Click only adds one to its Link's counter and stores nothing about the Visitor.
- Pages load nothing from third-party hosts. The footer's GitHub avatars were removed for this.
- The browser holds only what the policy lists: better-auth's sign-in cookies, the `i18n_redirected` language cookie and the `nuxt-color-mode` localStorage entry.

We keep little and state exactly what we keep, because every piece of data needs a stated purpose, legal basis and retention period, in both languages.

## Considered Options

- Store no Session IP (better-auth's `disableIpTracking`). Rejected: investigating abuse and helping a User whose account was taken over both need to know where Sessions came from. Turning tracking off would also switch off better-auth's rate limiter.
- Keep Session IPs until the account is deleted. Rejected: an expired Session's IP would stay for years after it stopped serving any purpose.
- Read the IP from `x-forwarded-for`, better-auth's default. Rejected: a client can send its own header, Cloudflare then appends the real address, and better-auth stores nothing for a header with two values.

## Consequences

- Banning a User revokes their Sessions, so their IPs go with the ban. The moderation runbook has the person who runs skuz.link look for other Users sharing those IPs before banning; nothing extra is kept.
- Per-Click analytics, a font or image from a CDN, an embed, a new cookie or storage entry, or a new use of Session IPs needs the Privacy policy updated in both languages first. Anything that is not exempt from consent also needs a consent banner.
