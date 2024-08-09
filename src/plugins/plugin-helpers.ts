export class PluginHelpers
{
    public static isNappViewModel(id: string): boolean
    {
        const isComponentFile = id.contains("n-app/dist/components/");

        if (!isComponentFile)
            return false;

        const isViewModel = id.contains("-view-model.js") || id.contains("-view-model.ts");

        return isViewModel;
    }
}