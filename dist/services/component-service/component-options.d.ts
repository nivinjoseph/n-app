import type { ComponentViewModel } from "../../core/component-view-model.js";
/**
 * Representation of vue's component options used with options API
 * https://vuejs.org/api/options-state.html
 */
export interface ComponentOptions {
    beforeCreate?(): void;
    created?(): void;
    beforeMount?(): void;
    mounted?(): void;
    beforeUpdate?(): void;
    updated?(): void;
    beforeUnmount?(): void;
    unmounted?(): void;
    data?(vm: any): {
        vm: ComponentViewModel;
    };
    activated?(): void;
    deactivated?(): void;
}
//# sourceMappingURL=component-options.d.ts.map