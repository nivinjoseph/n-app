import { ConfigurationManager } from "@nivinjoseph/n-config";
import { Controller, httpGet, route, view } from "@nivinjoseph/n-web";


const env = ConfigurationManager.getConfig("env");
console.log("evn", env);
const isDev = env === "dev";

@route("/*")
@httpGet
@view(isDev ? "~/test-app/client/index.html" : "~/test-app/client/dist/index.html")
export class IndexController extends Controller
{
    public async execute(): Promise<any>
    {
        return {
            config: {
                "testConfig": "value"
            }
        };
    }
}