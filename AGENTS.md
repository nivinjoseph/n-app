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

## Release

`yarn publish-package` — the same one-liner every `@nivinjoseph/*` package uses.
It chains:

| Step | Command |
| --- | --- |
| 1. Gate | `yarn verify` (build → typecheck → lint → test) |
| 2. Sweep stray work | `git add .`, commit `preparing to publish new version` |
| 3. Bump | `yarn version patch` |
| 4. Commit bump | `git add .`, commit `new version` |
| 5. Push | `git push` |
| 6. Publish | `yarn npm publish --access public` |

n-app is the template for this; the other frameworks still use the older shape.
Three differences are deliberate, and each is load-bearing:

- **`files: ["dist"]` + `prepack`, with `dist/` gitignored.** The tarball is
  `dist/` + LICENSE + README + package.json. The siblings commit `dist/` and
  omit `files`, so they also ship `src/`, `test/`, `.vscode/`, and `.yarn/` —
  `n-strument@2.0.2` is 1.6 MB for ~14 KB of library. This is the part to port
  outward, not to undo here.
- **Step 2 is guarded:** `(git diff --cached --quiet || git commit -m '...')`.
  Committing `dist/` is what keeps the siblings' tree reliably dirty here; with
  `dist/` ignored, a bare `git commit` exits 1 on a clean tree and kills the
  chain before publishing. The parens are required — `&&` and `||` are
  equal-precedence and left-associative, so without them a *failed* `verify`
  falls through the `||` and commits anyway.
- **`yarn npm publish`, not `npm publish`** — uses Yarn's registry auth.

Step 4 needs no guard: `yarn version patch` always rewrites `package.json`. It
does not touch `yarn.lock`, which records workspaces as `0.0.0-use.local`.

Publishing happens *after* the push. If it fails on auth or network, re-run
`yarn npm publish --access public` on its own — re-running `publish-package`
would bump the version a second time. No git tags are created; that lineage
ended at `v4.0.37`.

Dry-run the packaging any time with `yarn npm publish --dry-run`.

### Porting this to the other @nivinjoseph packages

Not yet done anywhere else. Verified as still on the old shape (`dist/`
committed, no `files`, no `prepack`, `npm publish`): `n-config`, `n-defensive`,
`n-exception`, `n-ext`, `n-ject`, `n-log`, `n-sec`, `n-sock`, `n-strument`,
`n-svc`, `n-util`, `n-validate`, `n-web`.

Per repo:

1. Add `"files": ["dist"]` and `"prepack": "yarn build"` to `package.json`.
2. Add `dist` to `.gitignore`, then `git rm -r --cached dist` to untrack it.
3. Delete `dist/tsconfig.json`; fold its `rootDir` / `outDir` / `declaration`
   settings into the root `tsconfig.json` so one compile emits to `dist/`.
   `ts-build-dist` then collapses to a single build step.
4. `npm publish --access=public` → `yarn npm publish --access public`.
5. Add the empty-commit guard to `publish-package` (see above).

**Steps 2 and 5 must land in the same commit.** Committing `dist/` is the only
reason those trees are reliably dirty at the first `git commit`; untracking it
without adding the guard means the script starts dying on clean trees.

Expected effect, using `n-strument@2.0.2` as the measured case: 1.6 MB packed /
3.6 MB unpacked across 20 files → roughly 15 KB, because the old shape ships
`.yarn/releases/yarn-<version>.cjs` (~3 MB), `.yarn/install-state.gz` (~490 KB),
`src/`, `test/`, `.vscode/`, and the lint + tsconfig files. Confirm each with
`yarn npm publish --dry-run` before the first real release.
