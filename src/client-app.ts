const Vue = require("./../vendor/vue.js");
const VueRouter = require("./../vendor/vue-router.js");
Vue.use(VueRouter);

import { given } from "n-defensive";
import "n-ext";
import { Container, ComponentInstaller } from "n-ject";
import { ComponentManager } from "./component-manager";
import { PageManager } from "./page-manager";


// public
export class ClientApp
{
    private readonly _appElementId: string;
    private readonly _container: Container;
    private readonly _componentManager: ComponentManager;
    private readonly _router: PageManager;
    private _app: any;
    
    
    public constructor(appElementId: string)
    {
        given(appElementId, "appElementId").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace()).ensure(t => t.startsWith("#"));
        this._appElementId = appElementId;
        this._container = new Container();
        this._componentManager = new ComponentManager(Vue, this._container);
        this._router = new PageManager(VueRouter, this._container);
    }
    
    
    public useInstaller(installer: ComponentInstaller): this
    {
        given(installer, "installer").ensureHasValue();
        this._container.install(installer);
        return this;
    }
    
    public registerComponents(...componentViewModelClasses: Function[]): this
    {
        this._componentManager.registerComponents(...componentViewModelClasses);
        return this;
    }
    
    public registerPages(...pageViewModelClasses: Function[]): this
    {
        this._router.registerPages(...pageViewModelClasses);
        return this;
    }
    
    public bootstrap(): void
    {
        this.configureCoreServices();
        this.configureContainer();
        this.configureComponents();
        this.configurePages();
        this.configureRoot();
    }
    
    
    private configureCoreServices(): void
    {
        // TODO: implement this
    }
    
    private configureComponents(): void
    {
        this._componentManager.bootstrap();
    }
    
    private configurePages(): void
    {
        this._router.bootstrap();
    }
    
    private configureContainer(): void
    {
        this._container.bootstrap();
    }
    
    private configureRoot(): void
    {
        this._app = new Vue({
            el: this._appElementId,
            router: this._router.vueRouterInstance
        });
    }
}