import { ConfigurationManager } from "@nivinjoseph/n-config";
import { Controller, httpGet, route } from "@nivinjoseph/n-web";


@route("/api/version")
@httpGet
export class VersionController extends Controller
{
    public async execute(): Promise<{
        version: string;
        name: string;
    }>
    {
        const version = ConfigurationManager.requireStringConfig("package.version");
        const name = ConfigurationManager.requireStringConfig("package.name");

        return {
            version,
            name
        };
    }
}
