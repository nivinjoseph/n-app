/** biome-ignore-all lint/correctness/useHookAtTopLevel: to overcome jsx use keyword */
import { shutdownTracing } from "@nivinjoseph/n-strument";
import "@nivinjoseph/n-ext";
import { ConfigurationManager } from "@nivinjoseph/n-config";
import type { ComponentInstaller, Registry } from "@nivinjoseph/n-ject";
import {
    ConsoleLogger,
    LogDateTimeZone,
    type Logger,
} from "@nivinjoseph/n-log";
import { WebApp } from "@nivinjoseph/n-web";
import { IndexController } from "./controllers/index-controller.js";
import { VersionController } from "./controllers/version-controller.js";

// const isDev = ConfigurationManager.getConfig<string>("env") === "dev";

const logger: Logger = new ConsoleLogger({
    logDateTimeZone: LogDateTimeZone.local,
});

class CustomInstaller implements ComponentInstaller {
    public async install(registry: Registry): Promise<void> {
        registry.registerInstance("Logger", logger);
    }
}

const server = new WebApp(
    ConfigurationManager.requireNumberConfig("PORT"),
    null,
    null,
    logger,
)
    .enableCors()
    .useInstaller(new CustomInstaller())
    .registerStaticFilePath("dist", true)
    .registerControllers(IndexController, VersionController)
    .registerDisposeAction(() => shutdownTracing());

await server.bootstrap();
