import { Container } from "@nivinjoseph/n-ject";
import type { ComponentViewModelClass } from "./component-view-model.js";
import type { App } from "vue";
export declare class ComponentManager {
    private readonly _vueApp;
    private readonly _container;
    private readonly _registrations;
    constructor(vueApp: App, container: Container);
    registerComponents(...componentViewModelClasses: Array<ComponentViewModelClass<any>>): void;
    bootstrap(): void;
    private _registerComponent;
    private _registerComponentViewModel;
}
//# sourceMappingURL=component-manager.d.ts.map