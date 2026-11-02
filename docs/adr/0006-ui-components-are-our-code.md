# The `ui/` components are our code

`layers/base/app/components/ui/` started as source copied from the shadcn-vue registry, restored after every reinstall. The design system rewrites the classes of 17 of its 19 component folders, so a reinstall would erase the app's look, and restoring it would mean applying the design again by hand. These files are therefore our own code: we restyle them in place, reka-ui still provides their behaviour and updates through pnpm, and the registry is only a starting point for a component we don't have yet.

## Considered Options

- Keep the reinstall routine and list all 17 folders as hand edits. Rejected: the list would describe nearly every file, so a reinstall would rarely be worth doing.
- Leave the registry's files as they ship and put the look in a stylesheet that targets their `data-slot` attributes. Rejected: that stylesheet has to beat the registry's own Tailwind classes, so it would lean on `!important`, and classes passed at call sites would lose to it.

## Consequences

- Never run `shadcn-vue add --overwrite` on an installed component. Use `add` only for a new component, then swap its icons and restyle it to the design system.
- Fixes in the registry no longer arrive through a reinstall, so they have to be ported by hand. Fixes in reka-ui still arrive through pnpm.
