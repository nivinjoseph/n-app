import { Controller, httpGet, route, view } from "@nivinjoseph/n-web";


@route("/*")
@httpGet
@view("~/test-app/client/dist/indexview.html")
export class IndexController extends Controller
{
    public async execute(): Promise<any>
    {
        return {};
    }
}