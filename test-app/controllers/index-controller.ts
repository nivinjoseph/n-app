import { Controller, httpGet, route, view } from "@nivinjoseph/n-web";


@route("/*")
@httpGet
@view("~/test-app/client/dist/index.html")
export class IndexController extends Controller
{
    public async execute(): Promise<any>
    {
        return {
            "testConfig": "value"
        };
    }
}