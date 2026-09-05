# Component development

All UI components must follow [Atomic Design](https://atomicdesign.bradfrost.com/) methodology, organized under `src/components/`:

- `src/components/atoms/` — smallest indivisible UI elements (buttons, inputs, labels, icons)
- `src/components/molecules/` — simple groups of atoms functioning together (a labeled input, a search bar)
- `src/components/organisms/` — distinct, complex sections composed of molecules/atoms (a header, a nav bar, a card list)
- `src/components/templates/` — page-level layouts arranging organisms/molecules into a structure, without real content

Next.js routes (the "pages" layer in Atomic Design) live in `src/app/` as usual — they compose templates with real data and are not a separate component category.

Each component gets its own directory: `src/components/<layer>/<ComponentName>/ComponentName.tsx`, alongside a `ComponentName.stories.tsx`.

## Required steps whenever a component is created or changed

1. Place it in the correct atomic layer based on what it composes (see above), not by where it's used first.
2. Add or update a `.stories.tsx` file covering its key variants/states.
3. Add `play` function interaction tests (via `@storybook/test`'s `userEvent`/`expect`) in the stories to assert the component actually behaves correctly — clicks fire handlers, inputs update, conditional states render, etc.
4. Run those tests through the Storybook Vitest addon (`npx vitest run`, which executes the `storybook` project defined in `vitest.config.ts`) and confirm they pass before considering the component done.
5. Run `npm run lint` (Biome) on new/changed files.

Never report a component finished without stories + passing vitest-run story tests — this project starts with zero real components, so every one added from here on should establish this pattern correctly from the start.
