import { WebApp } from "@nivinjoseph/n-web";
import { IndexController } from "./controllers/index-controller.js";
import { ConfigurationManager } from "@nivinjoseph/n-config";
import { VersionController } from "./controllers/version-controller.js";
import { Index2Controller } from "./controllers/index2-controller.js";


const app = new WebApp(ConfigurationManager.getConfig<number>("port"), null);

app
    .useViewResolutionRoot("test-app/client/dist")
    .registerStaticFilePath("test-app/client/dist")
    .registerControllers(IndexController, VersionController, Index2Controller);

app.bootstrap();
