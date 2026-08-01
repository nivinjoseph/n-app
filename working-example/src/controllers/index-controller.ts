import { ConfigurationManager } from "@nivinjoseph/n-config";
import { given } from "@nivinjoseph/n-defensive";
import { inject } from "@nivinjoseph/n-ject";
import type { Logger } from "@nivinjoseph/n-log";
import { Controller, httpGet, route, view } from "@nivinjoseph/n-web";

@route("/*")
@httpGet
@view("~/dist/index.html")
@inject("Logger")
export class IndexController extends Controller {
    private readonly _logger: Logger;

    public constructor(logger: Logger) {
        super();

        given(logger, "logger").ensureHasValue().ensureIsObject();
        this._logger = logger;
    }

    public async execute(): Promise<object> {
        await this._logger.logDebug("TODO app request");

        const env = ConfigurationManager.getConfig<string>("env");

        await this._logger.logInfo(`Processing web app request '${env}'`);

        return {
            config: {
                env,
                version:
                    ConfigurationManager.requireStringConfig("package.version"),
                owner: ConfigurationManager.requireStringConfig("owner"),
            },
        };
    }
}
