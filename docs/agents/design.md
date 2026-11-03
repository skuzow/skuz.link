# Design system

The Design System artifact https://claude.ai/artifact/41vkt81LQQmdGhnoGHLGMd is the source of truth for how things look. When the app and the artifact disagree, the artifact is right.

## Read it

The artifact is private to the person who runs skuz.link and opens only with their login. They open the link while signed in, and an agent in their session reads it through its artifact tool. If you can't open it, stop and ask them: don't guess the design from the code.

1. Read `project/README.md` first. It holds the direction, the tokens' meaning, the type, the icons and how they map onto the code.
2. Read the guideline and preview of the component in hand: `project/components/<Component>/README.md` and `project/components/<Component>/preview.html`.
3. Take exact values from `project/tokens.json`.

## Change it

A visual change goes into the artifact first and then into code. So does anything that fails once built, such as a contrast that doesn't hold or a layout that breaks on a phone. Never let the code carry a look the artifact doesn't describe.
