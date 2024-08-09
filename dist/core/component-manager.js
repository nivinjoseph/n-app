import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { Container } from "@nivinjoseph/n-ject";
import { ComponentRegistration } from "./component-registration.js";
import { ComponentFactory } from "./component-factory.js";
// import { ComponentFactory } from "./component-factory";
export class ComponentManager {
    _vueApp;
    _container;
    _registrations = new Array();
    constructor(vueApp, container) {
        given(vueApp, "vueApp").ensureHasValue().ensureIsObject();
        this._vueApp = vueApp;
        given(container, "container").ensureHasValue();
        this._container = container;
    }
    registerComponents(...componentViewModelClasses) {
        for (const item of componentViewModelClasses)
            this._registerComponent(item);
    }
    bootstrap() {
        this._registrations.forEach(registration => {
            const componentFactory = new ComponentFactory();
            this._vueApp.component(registration.element, componentFactory.create(registration));
        });
    }
    _registerComponent(componentViewModelClass) {
        const registration = new ComponentRegistration(componentViewModelClass);
        if (this._registrations.some(t => t.name === registration.name))
            throw new ApplicationException(`Duplicate Component registration with name '${registration.name}'.`);
        if (this._registrations.some(t => t.element === registration.element))
            throw new ApplicationException(`Duplicate Component registration with element '${registration.element}'`);
        this._registrations.push(registration);
        this._registerComponentViewModel(registration);
    }
    _registerComponentViewModel(registration) {
        if (registration.persist)
            this._container.registerSingleton(registration.name, registration.viewModel);
        else
            this._container.registerTransient(registration.name, registration.viewModel);
        // registering local components
        if (registration.localComponentRegistrations.isNotEmpty)
            registration.localComponentRegistrations
                .forEach(t => this._registerComponentViewModel(t));
    }
}
//# sourceMappingURL=component-manager.js.map