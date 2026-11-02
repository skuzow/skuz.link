# shadcn-vue components

`layers/base/app/components/ui/` holds source copied from the shadcn-vue registry, plus the hand edits listed below. The CLI overwrites those edits and changes `package.json`, and tests only catch part of the damage, so a reinstall is finished when every step below is done.

## Reinstall

1. From the repo root, overwrite the installed components. Use `add` for this: `init` adds a Google Fonts import to `tailwind.css`, which breaks ADR-0005, and it reinstalls nothing.

   ```sh
   pnpm dlx shadcn-vue@latest add $(ls layers/base/app/components/ui) --overwrite --yes
   ```

2. Fix `package.json`, then run `pnpm install`. The registry's `form` item pins `zod` to 3.25.76 and adds `@vee-validate/zod`, which only supports Zod 3. Put `zod` back on its previous version and remove `@vee-validate/zod`: forms use the local `toTypedSchema`. Keep any other new dependency. The CLI's install can also write a release under 24 hours old into `minimumReleaseAgeExclude`, so undo any change to `pnpm-workspace.yaml`.
3. Run `pnpm exec prettier --write layers/base/app/components/ui`.
4. Bring back every hand edit from `git diff`, keeping whatever else the registry changed in those files. If the registry changed nothing else, `git status` ends clean.
5. Run `pnpm typecheck`, `pnpm lint`, `pnpm format` and `pnpm test`.
6. Check each hand edit's effect in a browser, because no test sees styling.

## Hand edits

The app depends on each of these. When you add a hand edit, list it here so the next reinstall brings it back.

- **`avatar/`**: `index.ts` holds the `avatarVariant` size and shape variants and the `AvatarVariants` type, `Avatar.vue` takes `size` and `shape`, and `AvatarFallback.vue` leaves background and rounding to the root and adds `select-none`. `UserAvatar` passes both props. In the browser: the avatar in Settings is a 40px rounded square.
- **`alert-dialog/AlertDialogAction.vue`**: a `variant` prop passed to `buttonVariants`, which `AlertProvider` sets for dangerous alerts. In the browser: the desktop delete confirmation's button is red.
- **`input-group/InputGroup.vue`**: the `has-[input:focus-visible]` focus ring line. `UiFormControl` replaces the input's `data-slot`, so the registry's focus selector misses inputs inside a form. In the browser: the Slug field shows a focus ring.
