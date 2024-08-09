export class PluginHelpers {
    static isNappViewModel(id) {
        const isComponentFile = id.contains("n-app/dist/components/");
        if (!isComponentFile)
            return false;
        const isViewModel = id.contains("-view-model.js") || id.contains("-view-model.ts");
        return isViewModel;
    }
}
//# sourceMappingURL=plugin-helpers.js.map