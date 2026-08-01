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
| Build (`tsc -b` → `dist/`) | `yarn build` |
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
