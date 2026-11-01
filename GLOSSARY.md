# skuz.link

A URL shortener: Users sign in, create Links and share their Short URLs, and every Visitor who opens one is redirected.

## Language

### Links

Creating and managing Links, and redirecting Visitors.

**Link**:
A User's pairing of a Slug with a Redirect URL. It stays the same Link when its Slug changes.
_Avoid_: short link, URL

**Slug**:
The case-insensitive path after `skuz.link/` that picks out one Link.
_Avoid_: short path, alias, name, key

**Reserved slug**:
A Slug kept for skuz.link's own pages. No Link can use it, and it never redirects.
_Avoid_: blocked slug, forbidden slug

**Short URL**:
The address people share: `skuz.link/` followed by a Slug.
_Avoid_: short link

**Redirect URL**:
The http(s) address a Link sends Visitors to.
_Avoid_: destination, target, long URL

**Redirect**:
Sending a Visitor from a Short URL on to its Link's Redirect URL.

**Owner**:
The User who created a Link. Only the Owner can list or edit it, and only the Owner can delete it unless it breaks the Terms of use.
_Avoid_: creator, author

**Visitor**:
Anyone who opens a Short URL, signed in or not.

**Click**:
A Redirect served to a Visitor. Repeat visits and link-preview fetches count; checks that only ask whether a Short URL exists do not.
_Avoid_: visit, hit, view

### Auth

Users, how they sign in, their Sessions, and Bans.

**User**:
A person who signs in to skuz.link and can own Links.
_Avoid_: member, customer

**Provider**:
A service Users sign in with: Google or GitHub.

**Connected account**:
An account at a Provider that a User signs in with. A User can have several.
_Avoid_: linked account

**Session**:
One signed-in browser of a User, which the User can revoke.
_Avoid_: device, login

**Ban**:
Shutting out a User who broke the Terms of use seriously or repeatedly. A banned User can't sign in again, and all their Links are deleted.
_Avoid_: block, suspension

### Legal

The texts that say who runs skuz.link, how it handles personal data, and what Users agree to.

**Legal notice**:
The page that says who runs skuz.link and how to contact them.
_Avoid_: imprint, impressum

**Privacy policy**:
The page that explains which personal data skuz.link processes, why, for how long, and people's rights over it, cookies included.
_Avoid_: privacy notice, cookie policy

**Terms of use**:
The rules a User accepts by signing in: what Links may point to, and what happens to Links and Users that break them.
_Avoid_: terms of service, ToS, terms and conditions
