# n-app

An opinionated client application framework built on **React 19**, **MobX 6**,
**React Router 7** and **[n-ject](https://github.com/nivinjoseph/n-ject)**.

It keeps the MVVM shape n-app has always had — a view paired with a view-model
class — but the view is now a React component and the view-model is a MobX
observable resolved from a DI container.

> **v5 is a complete rewrite.** v4 and earlier were built on Vue 2 with webpack
> and a set of custom loaders. v5 shares the concepts and the package name, and
> nothing else: React instead of Vue, ESM instead of CommonJS, stage-3 decorators
> instead of `experimentalDecorators`, Vite + SWC instead of webpack. There is no
> upgrade path from 4.x. The v4 documentation is at
> `git show 85bb88d:README.md`.

## Install

```bash
yarn add @nivinjoseph/n-app
```

That is the whole install. React, React DOM, React Router and MobX come with the
package — n-app depends on them directly, at pinned versions, so there is nothing
else to add.

> **One copy of each, please.** Those four libraries are identity-sensitive: the
> framework and your app must share the *same* instance of each. If your app also
> declares `react`, `react-dom`, `react-router` or `mobx`, match the versions
> n-app pins (see its `dependencies`) so your package manager resolves a single
> copy. Two Reacts break hooks; two MobX instances break observability *silently*
> — `observer()` simply stops re-rendering, with no error. If that ever happens,
> check `npm ls mobx` / `yarn why mobx` first.

## Concepts

A **page** is a route-addressable screen: a `<name>-view-model.ts` exporting a
`PageViewModel` subclass decorated with `@route`, plus a sibling `<name>.tsx`
exporting the view. A **component** is the same pairing without a route, built on
`ComponentViewModel`.

View-models are plain classes. Getters become MobX `computed`, methods become
`action.bound`, and fields become `observable` — applied by the hook, so a
view-model must never call `makeAutoObservable` itself.

```ts
// todo-list-view-model.ts
@route("/todos/list")
@inject("TodoService")
export class TodoListViewModel extends PageViewModel {
    private _todos: ReadonlyArray<Todo> = [];

    public get todos(): ReadonlyArray<Todo> {
        return this._todos;
    }

    public constructor(private readonly _todoService: TodoService) {
        super();
    }

    public override async init(): Promise<void> {
        const all = await this._todoService.getAll();
        this.runAfterAwait(() => {
            this._todos = all;
        });
    }
}
```

```tsx
// todo-list.tsx — the export name is the class name minus "ViewModel"
export const TodoList = observer(function TodoListPage(): JSX.Element {
    const { vm, ctx } = usePageViewModel(TodoListViewModel);

    return (
        <PageContext.Provider value={ctx}>
            <ul>
                {vm.todos.map((t) => (
                    <li key={t.id}>{t.title}</li>
                ))}
            </ul>
        </PageContext.Provider>
    );
});
```

State mutated after an `await` must go through `runAfterAwait` — MobX runs with
`enforceActions: "always"`.

### Routes

`@route(path, redirect?)` takes a path with optional typed params:

```ts
"/todos/edit/{id:string}"
"/scratch?{q?:string}&{n?:number}&{flag?:boolean}"
```

Path and query params are parsed and coerced, and reach the view-model through
`retrieveParams()`. When only the params change on the same route,
`onParamsChanged()` fires.

### Bootstrap

```tsx
await new ClientApp("#root")
    .registerInstaller(new ClientInstaller())
    .discoverPages(
        import.meta.glob(
            ["./pages/**/*-view-model.ts", "!./pages/**/components/**"],
            { eager: true },
        ),
        import.meta.glob(["./pages/**/*.tsx", "!./pages/**/components/**"], {
            eager: true,
        }),
    )
    .discoverComponents(
        import.meta.glob(["./pages/**/components/**/*-view-model.ts"], {
            eager: true,
        }),
    )
    .configureInitialRoute("/todos/list")
    .configureUnknownRoute("/todos/create")
    .configureRouteErrorFallbackComponent(<ErrorFallback />)
    .registerStartupScript(seedScript)
    .bootstrap();
```

Discovery pairs each `<name>-view-model.ts` with its sibling view **by export
name**, never by function shape (`observer()` returns a memo object). A
misconfiguration throws at bootstrap naming the offending module; prefix a class
with `_` to opt out deliberately. `registerPages` / `registerComponents` are the
explicit escape hatches.

The `import.meta.glob` calls must live in your application's own source — Vite
cannot expand globs inside a prebuilt dependency, which is why they are passed in
rather than done by the framework.

## API

| Export | What it is |
| --- | --- |
| `ClientApp` | Fluent bootstrap: installers, page/component registration, routing, startup script, `bootstrap()` |
| `PageViewModel<TParams>` | Base for pages: `init`, `dispose`, `retrieveParams`, `goTo`, `goBack`, `onParamsChanged` |
| `ComponentViewModel<TProps>` | Base for components: `retrieveProps`, `onPropsChanged` |
| `usePageViewModel` / `useComponentViewModel` | Resolve, observe and lifecycle-manage a view-model |
| `route` | The `@route(path, redirect?)` class decorator |
| `PageContext` | React context carrying the page's DI scope |
| `EventAggregator` / `DefaultEventAggregator` | Pub/sub between view-models |
| `StorageService` / `BrowserStorageService` | `localStorage` / `sessionStorage` wrapper |
| `makeValidatorObservable` | Makes an `n-validate` `Validator` MobX-observable |
| `ApplicationScript` | `(serviceLocator) => Promise<void>`, run at startup |
| `Utils` | `getTypeName`, `generateUrl` and friends |

`@nivinjoseph/n-app/vite` additionally exports `clientTestPlugins()` — the SWC
transform your `vitest.config.ts` needs — and `stubModulesInDev()`.

## Build requirements

Your bundler must preserve class names. Registration resolves view-models by
`class.name`, and `ComponentRegistration` enforces a `.endsWith("ViewModel")`
invariant, so a minifier that renames classes breaks the app at runtime.

```ts
// vite.config.ts
build: { rolldownOptions: { output: { keepNames: true } } }
```

Use SWC with stage-3 decorators and `keepClassNames: true` for the same reason.
Tests must use the *same* transform — import `clientTestPlugins()` from
`@nivinjoseph/n-app/vite` and set `oxc: false`.

## Working example

[working-example/](working-example/) is a complete, runnable app: nested pages,
page-level components, typed route params, DI, validation, an event aggregator,
an error boundary, and an n-web server for the production path. It needs no
backend — its todo service is in-memory and seeded by a startup script.

```bash
yarn install
cd working-example && yarn dev      # http://localhost:5173
```

## License

MIT
