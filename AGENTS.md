# n-app — AGENTS.md

**The client framework.** Wraps React Router + MobX + `n-ject` into a class-VM
application framework. Exports (from [src/index.ts](src/index.ts)): `ClientApp`,
`PageViewModel`, `ComponentViewModel`, the `@route` DSL, `usePageViewModel` /
`useComponentViewModel`, `DefaultEventAggregator` (+ `EventAggregator` type),
`BrowserStorageService`, `makeValidatorObservable`, `PageContext`, `Utils`.

A second entry point, **`@nivinjoseph/n-app/vite`** ([src/vite.ts](src/vite.ts)),
exports `clientTestPlugins()` — the shared SWC transform (unplugin-swc, stage-3
decorators + automatic JSX + `keepClassNames`) that a consuming client's
`vitest.config.ts` imports with `oxc: false` — and `stubModulesInDev()`.

## Layout

Two Yarn workspaces: the framework at the repo root (`src/`, `test/`) and
[working-example/](working-example/), a runnable demo app. The example vendors a
shadcn/Radix UI kit at `working-example/src/common` (`@example/common`) and an
in-memory todo SDK at `working-example/src/sdk` (`@example/sdk`); both are
`portal:` dependencies with their own `package.json`, so they resolve as real
packages rather than path aliases.

## Conventions

- VMs are observed via the framework's `autoMakeObservable`, **applied by the
  `usePageViewModel`/`useComponentViewModel` hook** — VMs must not call
  `makeAutoObservable` themselves.
- `class.name` preservation is non-negotiable: VM and component registration
  resolve by name (incl. the `.endsWith("ViewModel")` invariant in
  `ComponentRegistration`). This is why the example's Vite build sets
  `build.rolldownOptions.output.keepNames` and the SWC transform sets
  `keepClassNames` — without them the minifier renames classes and registration
  breaks at runtime.
- Page and component VMs are **discovered, not hand-registered**: the app passes
  eager `import.meta.glob` records to `ClientApp.discoverPages` /
  `discoverComponents`. The glob calls must live in app source — Vite does not
  expand globs inside a prebuilt dependency. Extraction + validation live in
  [src/page-discovery.ts](src/page-discovery.ts) /
  [src/component-discovery.ts](src/component-discovery.ts); pages additionally
  pair `<name>-view-model.ts` with the sibling `<name>.tsx`, looking the view up
  **by export name** (class name minus `ViewModel` — never by function shape;
  `observer()` returns a memo object). Misconfigurations throw at bootstrap with
  the module path(s); a `_`-prefixed class name is a deliberate opt-out
  (skipped, no error). `registerPages` / `registerComponents` remain the
  explicit escape hatches.
- Stage-3 decorators only (`ESNext.Decorators` + `Symbol.metadata`), never
  `experimentalDecorators`. `@route` stores metadata on `context.metadata`.

## Build & test

Yarn 4.16.0, TypeScript 7 (the native compiler — the `.yarnrc.yml` plugin exists
solely to make it installable under Yarn 4, see yarnpkg/berry#7191).

| Task | Command |
| --- | --- |
| Typecheck `src/` (no emit) | `yarn ts-compile` |
| Compile + lint | `yarn ts-build` |
| Emit `dist/` (`tsc -p ./dist`) | `yarn ts-build-dist`, aliased as `yarn build` |
| Typecheck incl. tests | `yarn typecheck` |
| Lint / format | `yarn lint`, `yarn lint:fix` |
| Type-aware lint | `yarn lint:types` (builds first) |
| Unit tests (Vitest, env `node`) | `yarn test` |
| Run the example | `yarn example:dev` |

The example resolves the framework through a Vite alias to `src/` rather than
`dist/`, so framework edits hot-reload without a rebuild. Its `vite.config.ts`
and `vitest.config.ts` import the SWC plugin factory by relative source path for
the same reason.

Playwright browsers need an explicit install because `.yarnrc.yml` sets
`enableScripts: false`: `cd working-example && yarn playwright install chromium`.

## Release

`yarn publish-package` — character-identical to the line every `@nivinjoseph/*`
package uses. It chains:

| Step | Command |
| --- | --- |
| 1. Build + lint + emit | `yarn ts-build-dist` |
| 2. Commit the rebuilt `dist/` | `git add .`, commit `preparing to publish new version` |
| 3. Bump | `yarn version patch` |
| 4. Commit bump | `git add .`, commit `new version` |
| 5. Push | `git push` |
| 6. Publish | `npm publish --access=public` |

### Why `dist/` is committed

`dist/` is tracked, and there is no `files` field and no `.npmignore`. npm
therefore resolves tarball contents through `.gitignore` — **re-adding `dist` to
`.gitignore` would publish a package with no code.** The root `dist` entry is
deliberately absent there; only `working-example/dist` is ignored.

Committing the output is also what makes step 2 meaningful: a rebuild that
changes `dist/` shows up in `git status`, so the commit is non-empty on any real
release, and a *missing* output file is visible before it ships.

This matters — `5.0.2` was published broken. It went out under the old scheme
(gitignored `dist/`, `files: ["dist"]`, `prepack`, `tsc -b`): the `index.*`
outputs were absent from `dist/`, `tsc -b` trusted a stale `tsconfig.tsbuildinfo`
and never re-emitted them, and the tarball shipped without an entry point.
`tsc -p ./dist` keeps no buildinfo and always emits the full set.

### Build layout

`tsconfig.json` typechecks `src/` with `noEmit` (inherited from
`tsconfig.base.json`); `dist/tsconfig.json` does the emit with
`rootDir: ../src`, `outDir: .`. This mirrors the sibling packages, with one
deliberate difference: theirs also emit `.js` beside sources via `tsc -p .`,
which n-app cannot do because `vitest.config.ts` imports `./src/vite.js`. That
specifier resolves to `src/vite.ts` today; a real `src/vite.js` on disk would
win resolution and the config would silently load stale compiled output. Hence
no in-place emit, and no `clean-src` / `clean-test`.

`exports` keeps its object form rather than the siblings' `"./dist/index.js"`
string, because n-app has two entry points (`.` and `./vite`).

### Notes

Step 2 has no empty-tree guard, matching the siblings: re-running with nothing
changed exits 1 there. That failure is early and harmless — no bump, no push, no
publish.

Publishing happens *after* the push. If it fails on auth or network, re-run
`npm publish --access=public` alone — re-running `publish-package` would bump the
version a second time. No git tags are created; that lineage ended at `v4.0.37`.

Dry-run the packaging any time with `npm pack --dry-run`.
