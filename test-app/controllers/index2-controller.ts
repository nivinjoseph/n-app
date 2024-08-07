import { ConfigurationManager } from "@nivinjoseph/n-config";
import { Controller, httpPost, route, view } from "@nivinjoseph/n-web";


const env = ConfigurationManager.getConfig("env");
console.log("evn", env);
const isDev = env === "dev";

@route("/index2")
@httpPost
@view(isDev ? "~/test-app/client/index.html" : "~/test-app/client/dist/index.html")
export class Index2Controller extends Controller
{
    public async execute(model: Object): Promise<any>
    {
        return {
            config: {
                "testConfig": "value",
                "isAbc": true,
                "postData": model
            }
        };
    }
}