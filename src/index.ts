import "@nivinjoseph/n-ext";
import { ClientApp, type AppErrorHandler } from "./core/client-app.js";
import { element, type ElementComponentViewModelDecorator } from "./core/element.js";
import { template, type TemplateDecoratorContext, type TemplateDecoratorTarget, type TemplateViewModelDecorator } from "./core/template.js";
import { title, type TitlePageViewModelDecorator } from "./core/title.js";
import { meta, type MetaDetail, type MetaPageViewModelDecorator } from "./core/meta.js";
import { route } from "./core/route.js";
import { bind, type BindComponentViewModelDecorator } from "./core/bind.js";
import { events, type EventsComponentViewModelDecorator } from "./core/events.js";
import { components, type ComponentsViewModelDecorator, type ComponentsViewModelDecoratorContext, type ComponentsViewModelDecoratorTarget } from "./core/components.js";
import { pages, type PagesPageViewModelDecorator } from "./core/pages.js";
import { ComponentViewModel, type ComponentViewModelClass } from "./core/component-view-model.js";
import { PageViewModel, type PageViewModelClass } from "./core/page-view-model.js";
import { Utils } from "./core/utils.js";
import { type StorageService } from "./services/storage-service/storage-service.js";
import { type EventAggregator, type EventSubscription } from "./services/event-aggregator/event-aggregator.js";
import { type NavigationService } from "./services/navigation-service/navigation-service.js";
import { type DialogService, type DialogServiceOptions, DialogLocation } from "./services/dialog-service/dialog-service.js";
import { type DisplayService } from "./services/display-service/display-service.js";
import { DisplayType } from "./services/display-service/display-type.js";
import { type ComponentService } from "./services/component-service/component-service.js";
import { type ComponentOptions } from "./services/component-service/component-options.js";
import { resolve, type Resolution, type Resolver, type ResolverClass, type ResolvePageViewModelDecorator } from "./core/resolve.js";
import { type NavRoute } from "./core/nav-route.js";
// import { FileInfo } from "./components/n-file-select/n-file-select-view-model.js";
import { persist, type PersistDecoratorContext, type PersistDecoratorTarget } from "./core/persist.js";
import { DefaultDialogService } from "./services/dialog-service/default-dialog-service.js";


export
{
    ClientApp,
    element,
    route,
    template,
    title,
    meta, bind,
    events,
    components,
    pages,
    persist,
    ComponentViewModel,
    PageViewModel,
    Utils, DialogLocation, DefaultDialogService, DisplayType, resolve
};

export type {
    MetaDetail, StorageService,
    EventAggregator, EventSubscription,
    NavigationService,
    DialogService, DialogServiceOptions, DisplayService, ComponentService, ComponentOptions, NavRoute, Resolution,
    BindComponentViewModelDecorator, ElementComponentViewModelDecorator,
    ComponentsViewModelDecorator, ComponentsViewModelDecoratorTarget, ComponentsViewModelDecoratorContext,
    EventsComponentViewModelDecorator, MetaPageViewModelDecorator, PagesPageViewModelDecorator,
    PersistDecoratorTarget, PersistDecoratorContext,
    Resolver, ResolverClass, ResolvePageViewModelDecorator,
    TemplateDecoratorTarget, TemplateDecoratorContext, TemplateViewModelDecorator,
    TitlePageViewModelDecorator,
    AppErrorHandler,
    ComponentViewModelClass,
    PageViewModelClass
    // FileInfo
};
