import { ClientApp } from "@nivinjoseph/n-app";
import "./styles.css";
import { SdkInstaller } from "@example/sdk";
import { ClientInstaller } from "./client-installer.js";
import { ErrorFallback } from "./components/error-fallback.js";
import { Routes } from "./routes.js";
import { seedScript } from "./seed-script.js";

// The eager import.meta.glob calls must live here in app source — Vite cannot
// expand globs inside a prebuilt dependency, which is why discoverPages /
// discoverComponents take the glob records as arguments.
await new ClientApp("#root")
    .registerInstaller(new ClientInstaller())
    .registerInstaller(new SdkInstaller())
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
        import.meta.glob(
            [
                "./pages/**/components/**/*-view-model.ts",
                "./components/**/*-view-model.ts",
            ],
            { eager: true },
        ),
    )
    .configureInitialRoute(Routes.todoList)
    .configureUnknownRoute(Routes.todoCreate)
    .configureRouteErrorFallbackComponent(<ErrorFallback />)
    .registerStartupScript(seedScript)
    .bootstrap();
