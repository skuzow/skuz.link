# shadcn-vue components

`layers/base/app/components/ui/` is our own code (ADR-0006). We restyle these files in place to match the design system in `docs/agents/design.md`. reka-ui provides their behaviour and updates through pnpm. A fix in the registry has to be ported by hand.

Never run `shadcn-vue add --overwrite` on an installed component: it erases the component's look. Never run `shadcn-vue init` either: it adds a Google Fonts import to `tailwind.css`, which breaks ADR-0005.

## Add a new component

Use `add` only for a component we don't have yet. The CLI changes more than the component, and tests only catch part of the damage, so an addition is finished when every step below is done.

1. From the repo root, add the component. If the CLI asks to overwrite a file that is already installed, say no. If `git status` still shows an installed component changed, restore that file.

   ```sh
   pnpm dlx shadcn-vue@latest add <component>
   ```

2. Fix what the CLI changed outside `ui/`, then run `pnpm install`:
   - **`tailwind.css`**: if the CLI changed it, undo any import from a third-party host and any token the design system doesn't describe.
   - **`package.json`**: the registry's `form` item pins `zod` to 3.25.76 and adds `@vee-validate/zod`, which only supports Zod 3. Put `zod` back on its previous version and remove `@vee-validate/zod`: forms use the local `toTypedSchema`. Remove `@lucide/vue` if the CLI added it. Keep any other new dependency.
   - **`pnpm-workspace.yaml`**: the CLI's install can write a release under 24 hours old into `minimumReleaseAgeExclude`, so undo any change here.
3. Swap the component's `@lucide/vue` icons for the ones the design system names, and restyle it to match.
4. Run `pnpm exec prettier --write layers/base/app/components/ui`.
5. Run `pnpm typecheck`, `pnpm lint`, `pnpm format` and `pnpm test`.
6. Check the component in a browser, because no test sees styling.

## Behaviours to keep

A restyle of `alert-dialog/` or `input-group/` can lose these two without a test failing, so check both.

- **The dangerous alert's destructive confirm**: `AlertDialogAction.vue` takes a `variant` prop passed to `buttonVariants`, which `AlertProvider` sets for dangerous alerts. In the browser: the desktop delete confirmation's button is red.
- **The focus ring around inputs in a group inside a form**: `InputGroup.vue` draws the ring from `has-[input:focus-visible]`. `UiFormControl` replaces the input's `data-slot`, so a selector on that attribute misses inputs inside a form. In the browser: the Slug field shows a focus ring.
