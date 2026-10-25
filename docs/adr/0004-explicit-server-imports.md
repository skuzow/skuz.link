# Server code uses explicit imports

Server code does not use Nitro's `server/utils/` auto-imports. There is no `server/utils/` folder: files import what they use, and imports across layers go through the `#layers/<name>/...` aliases. With auto-imports, every export was a global in every server file, which hid the dependencies between contexts. With explicit imports, the boundary lint rule from ADR-0001 can see those dependencies. This applies to project code only. Framework helpers from h3 and Nitro (`defineEventHandler`, `readBody`, `defineNitroPlugin`) stay auto-imported.
