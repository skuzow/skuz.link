# Each Click keeps a few details, never the Visitor's IP address

Statistics shows an Owner when, where from and how their Links are opened, so every Click keeps a row of its own in D1, beside the Link's Click count. The row holds the time; the country, region and city that Cloudflare's geolocation gives the request, and nothing finer; the browser, operating system and kind of device, read from the user agent, which is then dropped; whether the client is a Bot, and its name if so; and the Referrer's host. It never holds the IP address, whole, shortened or hashed. Rows go with their Link, and the daily Cron Trigger deletes them 12 months after the Click. The legal basis is legitimate interest: Owners need to know how their Links are used, and keeping the details coarse and short-lived limits what they say about any one Visitor. There is no consent banner: a Redirect has no page to show one on, and skuz.link stores nothing on the Visitor's device and reads nothing from it beyond the headers every request carries.

## Considered Options

- Workers Analytics Engine. Rejected: it samples once traffic grows, keeps data for only 3 months, and can't delete one Link's rows when the Link or its Owner is deleted.
- Keep the IP address, shortened or hashed, to count unique Visitors. Rejected: a shortened or hashed IP is still personal data, a plain hash of an IPv4 address can be reversed by trying every address, and Statistics doesn't need unique Visitors.
- Ask Visitors for consent. Rejected: a Redirect has no page to show a banner on, and adding one would stop every Visitor before the Redirect URL.
- Keep the raw user agent. Rejected: it adds detail that helps fingerprint a Visitor, and no figure uses it.
- Keep only daily totals per country and Referrer. Rejected: Statistics lists single Clicks.

## Consequences

- The Privacy policy, in both languages, says what each Click keeps, that the Link's Owner sees it, the legal basis and the 12 months. A row holds nothing that identifies a Visitor, so skuz.link can't find one person's Clicks to show or delete them (GDPR art. 11), and the policy says so.
- The Privacy policy names the Link's Owner as a recipient. Owners can live outside the EU, and for an Owner who uses skuz.link for a business, showing them Visitors' Clicks may count as a transfer of personal data under GDPR chapter V, which normally needs a safeguard. This risk is accepted, because a row holds no IP address or identifier, but the question is still open.
- A User's data export leaves out their Links' Clicks, because those describe Visitors, not the User. The data-request runbook says so.
- The Terms of use forbid an Owner to use Statistics to work out who a Visitor is.
- Recording a Click runs in the background and never delays or fails a Redirect. The Redirect never looks up who is signed in, so an Owner's own Clicks count like anyone's, and a Click is never tied to a User.
- Bots are told apart by their user agent, because Cloudflare's bot fields need an Enterprise plan. A Bot that poses as a browser counts as a person.
- The Click count still counts every Click since the Link was created, so it includes Clicks from before Clicks kept details and Clicks older than 12 months.
- Keeping any further detail, such as coordinates, the network (ASN) or the full user agent, needs this ADR and the Privacy policy changed first.
