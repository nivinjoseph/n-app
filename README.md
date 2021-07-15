# **n-app**

## **Description**

**n-app** is a Vue.js application framework developed by Nivin Joseph.

## **Prerequisites**

<!-- TODO: n-app webpack.config loader -->
- Vue.js
- Node.js
- Typescript (Recommended)
- SCSS (Recommended)

## **Installation**

Via npm

```bash
npm i @nivin-joseph/n-app --save
```

## **Documentation**

### **Content**

- [What is n-app?](#what-is-n-app)
  - [Introduction](#introduction)
  - [Getting Started](#getting-started)
- [Convention & File Structure](#convention-and-file-structure)
- [Structure of Pages & Individual Page](#structure-of-pages-and-individual-page)
  - [Pages](#pages)
  - [Individual Page](#individual-page)
    - [Page's Lifecycle Methods](#page's-lifecycle-methods)
      - [onCreate](#onCreate)
      - [onMount](#onMount)
      - [onEnter](#onEnter)
      - [onLeave](#onLeave)
      - [onDestroy](#onDestroy)
    - [Interaction between View & View-Model](#interaction-between-view-and-view-model)
      - [Click Handler](#click-handler)
      - [Page v-bind](#page-v-bind)
      - [Page v-model](#page-v-model)
- [Structure of Components & Individual Component](#structure-of-components-and-individual-component)
  - [Components](#components)
    - [Top-level Components](#top-level-components)
    - [Page-level Components](#page-level-components)
  - [Individual Component](#individual-component)
    - [Component v-bind](#component-v-bind)
    - [Component v-model](#component-v-model)
    - [Events](#events)
- [Services](#services)
  - [Dialog Service](#dialog-service)
  - [Event Aggregator](#event-aggregator)
  - [Navigation Service](#navigation-service)
- [Examples](#examples)
  - [Simple Counter](#simple-counter)
  - [n-app-todo](#n-app-todo)

<a id="what-is-n-app"></a>

## **What is n-app?**

<a id="introduction"></a>

### **Introduction**

**n-app** is a **enterprise-level** Vue.js based application framework that enforces **good practices** to maintain **scalability.**

<a id="getting-started"></a>

### **Getting Started**

#### **Hello World**

Here's how to create a Hello World Page using **n-app**.

```html
<div class="hello-page">
    {{ message }}
</div>
```

```scss
.hello-page {  }
```

```typescript
import { PageViewModel, route, template } from "@nivinjoseph/n-app";
import { Routes } from "../routes";
import "./hello-page-view.scss";

@template(require("./hello-page-view.html"))
@route(Routes.helloPage)
export class Page1ViewModel extends PageViewModel 
{
    public get message(): string { return "Hello, World!" }
}
```

We've create our very first application that uses **Vue's** binding, with separation of concern between the **view** and **view-model** and while maintaining readability, and scalability.

This is just the very start of what **n-app** has to offer.

<a id="convention-and-file-structure"></a>

## **Convention & File Structure**

**n-app** follows a generalized structure and architecture for creating **enterprise-level** web applications. It enforces **strong type safety**, **good architecture**, **great integration with other libraries** and more...

The following is an example of how a web application using `n-app` should be structured.

```bash
n-test-app
    |-- client
        |-- components
            |-- component-1
                |-- # component-1 view and view-models
            |-- component-2
                |-- # component-2 view and view-models
            ...
            |-- index.ts
        |-- pages
            |-- page-1
                |-- components
                    |-- page-1-component
                        |-- # page-1-component view and view-models
                    ...
                |-- # page-1 view and view-models
            |-- page-2
                |-- # page-2 view and view-models
            ...
            |-- routes.ts
            |-- index.ts
```

**n-app** uses a MVVM architectural pattern. You can learn more about it [here](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel).

<a id="structure-of-pages-and-individual-page"></a>

## **Structure of Pages & Individual Page**

<a id="pages"></a>

### **Pages**

We highly recommend that the creation of pages should at least somewhat follow this generalized structure...

Within the `pages` folder, it should contain all the page's view and view-model separated into individual folder for each page.

```bash
pages
    |-- page-1
        |-- page-1-view-model.ts
        |-- page-1-view.html
        |-- page-1-view.scss
    |-- page-2
        |-- page-2-view-model.ts
        |-- page-2-view.html
        |-- page-2-view.scss
    ...
```

Within the `pages` folder, we need a place to register our **view-models**, this can be done inside an `index.ts` file.

We also need a place to setup our **routes** and **paths**, this can be done inside a `routes.ts` file.

```bash
pages
    |-- page-1
        |-- page-1-view-model.ts
        |-- page-1-view.html
        |-- page-1-view.scss
    |-- page-2
        |-- page-2-view-model.ts
        |-- page-2-view.html
        |-- page-2-view.scss
    |-- index.ts
    |-- routes.ts
```

Inside `index.ts`, we need to register the page's view-model in order for the pages to be rendered.

```typescript
import { Page1ViewModel } from "./page-1/page-1-view-model";
import { Page2ViewModel } from "./page-2/page-2-view-model";

export const pages: Array<Function> = [
    Page1ViewModel,
    Page2ViewModel
];
```

Now we need routes to navigate to our pages. We can create **paths** and **routes** to our pages in `routes.ts`.

```typescript
export class Routes
{
    public static readonly page1 = "/page1";
    public static readonly page2 = "/page2";
    
    public static readonly default = Routes.page1;
}
```

**Note:** we need a default path which is redirected to when the address has a path of `/`.

<a id="individual-page"></a>

### **Individual Page**

Now we have setup the routes for the pages, we now need to link it to the corresponding **view-models**.

Before we can do this, we need to understand how each individual pages is structured.

Inside the `page-1` folder, it consist of 3 main parts, the **HTML**, **SCSS** and **TypeScript** files. The HTML and the SCSS files are responsible for the **view** of the page while the TypeScript file handles the **view-model**.

Inside, the `page-1` folder, we have `page-1-view.html`, `page-1-view.scss` and `page-1-view-model.ts`.

The `page-1-view.html` and all **html** pages should follow this structure. It'll have a top level `div` element with the class name as the page.

```html
<div class="page-1">
    <!-- Page Content -->
</div>
```

The `page-1-view.scss` and all **SCSS** for pages should follow this structure. It'll have a top level class with the same name as the div from the **HTML** file.

```scss
.page-1
{
    // Styles
}
```

And finally, the `page-1-view-model.ts` should follow this structure. It should contain the **view-model's** class which inherits from the `PageViewModel` class given by the **n-app** framework. The **view-model** should also import the corresponding **SCSS** file and have multiple decorators to determine the **template** and the **route**; this is all provided by the **n-app** framework.

```typescript
import { PageViewModel, route, template } from "@nivinjoseph/n-app"; // Default Imports
import { Routes } from "../routes"; // Import all the possible Routes
import "./page-1-view.scss"; // Importing the Styles

@template(require("./page-1-view.html")) // Linking the Template to this View-Model
@route(Routes.page1) // Linking the Corresponding Routes to the correct one
export class Page1ViewModel extends PageViewModel // Inheriting the PageViewModel class
{
    // View-Model Logic
}
```

Now, we've successfully create and routed a page. This page is now **accessible** to the user.

Although, the creation of pages are a bit lengthy, **n-app** offers **separation of concern**, **ease of readability** and also **scalability**, if used correctly.

<a id="page's-lifecycle-methods"></a>

### **Page's Lifecycle Methods**

**Note:** The following methods are inherited from the `PageViewModel` class.

<a id="onCreate"></a>

#### **onCreate**

This method is executed when the **view-model** is created, but when the template is not yet mounted to the **DOM**.

```typescript
protected onCreate(): void
{
    super.onCreate();
    
    // Method Body
}
```

<a id="onMount"></a>

#### **onMount**

This method is executed when the page template is mounted on the **DOM**, you'll get the HTML element as a parameter here to manipulate it, like using JQuery for example.

```typescript
protected onMount(element: HTMLElement): void
{
    super.onCreate(element);
    
    // Method Body + Manipulation of the HTML element
}
```

<a id="onEnter"></a>

#### **onEnter**

This method is executed when the page has appeared and is usually used to fetch data to show on the page. The parameters for this function would be any **query/path params** of the url defined in the **route**.

```typescript
protected onEnter(): void
{
    super.onEnter();
    
    // Method Body
}
```

<a id="onLeave"></a>

#### **onLeave**

This method is executed when the user is about to **leave** the page.

```typescript
protected onLeave(): void
{
    super.onLeave();
    
    // Method Body
}
```

<a id="onDestroy"></a>

#### **onDestroy**

This method is executed when the page is **removed** from the **DOM**.

```typescript
protected onDestroy(): void
{
    super.onDestroy();
    
    // Method Body
}
```

<a id="interaction-between-view-and-view-model"></a>

### **Interaction between View and View-Model**

**n-app** allows for Vue operations with the DOM with **separation of concern**. Instead of writing the methods, data and template inside one file, you are able to separate it into a template file (**HTML**), and a **view-model** file (**TypeScript**).

<a id="click-handler"></a>

#### **Click Handler**

Inside your **HTML** file:

```html
<button @click="foo()">Click Me</button>
```

Inside your **TypeScript** view-model file and inside the class, you'll create a method:

```typescript
public foo(): void
{
    // Method Body
}
```

Now whenever you click the button, it'll call the method `doSomething`.

<a id="page-v-bind"></a>

#### **Page v-bind**

You can easily incorporate **Vue's** data binding like this:

Inside your **HTML** file:

```html
<div>{{ foo }}</div>
```

That's it! Now we've exposed `foo` data to the **view**.

Inside your **TypeScript view-model** file and inside the class, you'll create a getter for the property:

```typescript
public get foo(): string { return "bar"; }
```

<a id="page-v-model"></a>

#### **Page v-model**

You can easily incorporate **Vue's** two-way data binding like this:

Inside your **HTML** file:

```html
<input v-model="message" >
```

Now inside your **TypeScript view-model** file, you can create a setter and a getter to dynamically two-way bind the data.

```typescript
private _message: string;

public get message(): string { return this._message; }
public set message(value: string) { this._message = value; }
```

Now when the message in the input updates, it'll update the _message property inside the **view-model** class.

<a id="structure-of-components-and-individual-component"></a>

## **Structure of Components & Individual Component**

<a id="components"></a>

### **Components**

For components, we recommend using a similar file structure to pages.

There are two cases to incorporate components into your pages.

- **Top-level** Components (Components that are visible to all pages).
- **Page-level** Components (Components that are visible to a certain pages).

<a id="top-level-components"></a>

#### **Top-level Components**

To create a **top-level** component, you could create a `components` folder on the same level as pages.

```bash
client
    |-- components
        |-- component-1
            |-- component-1-view-model.ts
            |-- component-1-view.html
            |-- component-1-view.scss
    |-- pages
```

In order to register **top-level** components you have to create a `index.ts` file inside the `components` folder.

```bash
components
    |-- component-1
        |-- component-1-view-model.ts
        |-- component-1-view.html
        |-- component-1-view.scss
    |-- index.ts
```

Like the `index.ts` file in pages, you'll create `index.ts` file here, though the registering process is a bit different.

```typescript
import { Component1ViewModel } from "./component-1/component-1-view-model";

export const components: Array<Function> = [
    Component1ViewModel
];
```

Now, we've created and registered our **top-level** component.

<a id="page-level-components"></a>

#### **Page-level Components**

To create a **page-level** component, you could create a `components` folder on the individual page.

```bash
client
    |-- pages
        |-- page-1
            |-- components
                |-- component-1
                    |-- component-1-view-model.ts
                    |-- component-1-view.html
                    |-- component-1-view.scss
            |-- # page-1 view and view-model
```

To register our component we'll use `@components` decorator inside our page **view-model** and register the component's **view-model**.

```typescript
import { PageViewModel, route, template } from "@nivinjoseph/n-app"; 
import { Routes } from "../routes"; 
import "./page-1-view.scss"; 
import { Component1ViewModel } from "./components/component-1/component-1-view-model"; // Importing the Component's View Model

@template(require("./page-1-view.html")) 
@route(Routes.page1) 
@components(Component1ViewModel)
export class Page1ViewModel extends PageViewModel 
{
    // View-Model Logic
}
```

Now, our component has been registered.

<a id="individual-component"></a>

### **Individual Component**

Let's look into the structure of each individual components.

Just like the how the **pages** are structured, **components** uses a very similar structuring as pages minus the route.

Inside, the `components` folder we'll make a component and each of these component will contain a **view** and **view-model**.

```bash
components
    |-- component-1
        |-- component-1-view-model.ts
        |-- component-1-view.html
        |-- component-1-view.scss
```

The component-1's **views** follow the same format as pages. Though it's **view-model** is a little bit different.

Components inherits from the `ComponentViewModel` class and removes the concept of routes which is replaced by a decorator, `@element`, which contains the name of the component (the **element name** exposed to the DOM).

```typescript
import { ComponentViewModel, element, template } from "@nivinjoseph/n-app";
import "./component-1-view.scss";

@template(require("./component-1-view.html"))
@element("component-1")
export class Component1ViewModel extends ComponentViewModel
{
    
}
```

With creating the **view and view-model** and registering it, we've created a component and it's ready to be used.

If we've registered the component top-level then it's available to be used anywhere by using the name inside the component's `@element` decorator. Inside the page's **HTML**,

```html
<component-1></component-1>
```

The same process applies for **page-level** components.

<a id="component-v-bind"></a>

#### **Component v-bind**

Suppose we want to expose data from the page as a prop to our child component. First we'll create a getter for this object inside the page's **view-model**. Inside the **page's view-model**,

```typescript
public get data(): string { return "foo"; }
```

For our component to accept props, we'll use **n-app's** @bind decorator on top of the component's **view-model** class.

```typescript
@bind("propA")
```

Let's bind our `data` object to the `propA` prop inside the component. In our page **HTML** file which is using the component we'll bind it using `v-bind`.

```html
<component-1 v-bind:prop-a="data"></component-1>
```

**Note:** Since **HTML** uses **Kebab Case** the prop name inside the **HTML** must be **Kebab Case** but the `@bind` uses **Camel Case** so all the props inside the decorator must be in **Camel Case**; **n-app** handles the conversion.

Now, we can use the prop inside our component using a getter which returns using the `getBound` method. Inside our component's **view-model**,

```typescript
public get propA(): string { return this.getBound<string>("propA"); }
```

Now, we've retrieve data using **v-bind** from the parent and it can be used inside the child component.

<a id="component-v-model"></a>

#### **Component v-model**

Vue supports two-way binding using `v-model`. We can incorporate this using **n-app**.

Suppose, inside our **page** we're trying to use v-model for `messageA` which will be retrieved from our child component.

```html
<component-1 v-model="messageA"></component-1>
<h1>{{ messageA }}</h1>
```

Inside our component's **view-model**, we'll bind `value` keyword using the `@bind` decorator and retrieve it using a **getter** and **setter** with `getBoundModel` and `setBoundModel`, respectively.

```typescript
public set message(value: string) { this.setBoundModel(value); }
public get message(): string { return this.getBoundModel<string>(); }
```

**Note:** Usually components that has `v-model` only introduce 1 instance of two-way binding per component therefore, `v-model` only does two-way binding on 1 prop which is the `value` keyword on the `@bind` decorator.

Now, we can dynamically change the `message` and it'll be reflected on both the parent and child component using **Vue's** `v-model`.

<a id="events"></a>

#### **Events**

Similar to **Vue's** event listener using the `$emit`, we can also do implement a way to emit to the parent component that an event has been executed in the child component.

We can do this using the `@events` decorator inside our component **view-model**.

In our parent, we'll use a component which has an event.

```html
<component-1 @event-1="foo()"></component-1>
```

Now, once the event is emitted from the child component, it'll execute the `foo` method inside the parent component.

Inside our **view-model** for the component, we'll add `@events` decorator and `emit` method inside where we want to emit the event.

```typescript
@events("event1")
export class Component1ViewModel extends ComponentViewModel
{
    public click(): void
    {
        this.emit("event1");
    }
}
```

**Note:** the `emit` method also event arguments. i.e. `this.emit(event: string, ...eventArgs: any[])`.

Now, once the click method is invoked it'll emit the `event1` event to the parent which then executes the `foo` method inside the parent's **view-model**.

<a id="services"></a>

## **Services**

**n-app** offers many useful services. In the following examples, I am going to use another dependencies [**n-ject**](https://github.com/nivinjoseph/n-ject) which is a dependency inversion library.

<a id="dialog-service"></a>

### **Dialog Service**

Dialog service has many useful method that is capable of **Logical UI changes**.

Here's how to include it:

You'll add the `inject` decorator, and inside your constructor assign it the instance.

```typescript
@inject("DialogService")
export class ExamplePageViewModel extends PageViewModel
{
    private _dialogService: DialogService;
    
    public constructor(dialogService: DialogService)
    {
        this._dialogService = dialogService;
    }
}
```

`showLoadingScreen` is a method that shows a loading screen. It is useful while starting an asynchronous call where you don't want the user interacting with the DOM while the wait.

```typescript
showLoadingScreen(): void;
```

`hideLoadingScreen` is a method that hides the loading screen; it should be used sequentially after `showLoadingScreen`. This method is useful when called after an asynchronous call.

```typescript
hideLoadingScreen(): void;
```

`showMessage` is a method that is used to show **general** message.

```typescript
showMessage(message: string, title?: string): void;
```

`showSuccessMessage` is a method that is used to show a message. This method should be used to show a **success**.

```typescript
showSuccessMessage(message: string, title?: string): void;
```

`showWarningMessage` is a method that is used to show a message. This method should be used to show a **warning**.

```typescript
showWarningMessage(message: string, title?: string): void;
```

`showErrorMessage` is a method that is used to show a message. This method should be used to show an **error**.

```typescript
showErrorMessage(message: string, title?: string): void;
```

`clearMessages` is a method that is used to clear all messages in a message stack.

```typescript
clearMessages(): void;
```

<a id="event-aggregator"></a>

### **Event Aggregator**

The Event Aggregator allows you to **subscribe** to events and **publish** to an event.

Here's how to include it:

You'll add the `inject` decorator, and inside your constructor assign it the instance.

```typescript
@inject("EventAggregator")
export class ExamplePageViewModel extends PageViewModel
{
    private _eventAggregator: EventAggregator;
    
    public constructor(eventAggregator: EventAggregator)
    {
        this._eventAggregator = eventAggregator;
    }
}
```

`subscribe` is a method that returns an `EventSubscription` to an event given an `event` and `handler` is a callback which contains the `eventArgs` and it allows you to handle the event when it's been **published**.

**Note:** Creating an `EventSubscription` is usually done on the `onEnter` lifecycle.

```typescript
subscribe(event: string, handler: (...eventArgs: any[]) => void): EventSubscription;
```

**Note:** It is **extremely** important to `unsubscribe` from any `EventSubscription` once you've finished using it. This is usually called on the `onLeave` lifecycle method.

`publish` is a method that **publishes** an `event` with given `eventArgs`.

```typescript
publish(event: string, ...eventArgs: any[]): void;
```

<a id="navigation-service"></a>

### **Navigation Service**

Navigation service allows you to take advantage of **Vue's router-enabled application architecture**.

Here's how to include it:

You'll add the `inject` decorator, and inside your constructor assign it the instance.

```typescript
@inject("NavigationService")
export class ExamplePageViewModel extends PageViewModel
{
    private _navigationService: NavigationService;
    
    public constructor(navigationService: NavigationService)
    {
        this._navigationService = navigationService;
    }
}
```

`currentRoutePath` is a property that contains the **current route path**.

```typescript
currentRoutePath: string;
```

`currentHashPath` is a property that contains the **current hash path**.

```typescript
currentHashPath: string;
```

`navigate` is a method that given a `route` (which is obtained from the `routes.ts` file), **redirects** you to that specific page. Optionally, it can take in `params` and you can specify if it replaces the history using `replaceHistory`.

```typescript
navigate(route: string, params?: object | null, replaceHistory?: boolean): void;;
```

`navigateBack` is a method that **navigates back**.

```typescript
navigateBack(): void;
```

`navigateForward` is a method that **navigates forward**.

```typescript
navigateForward(): void;
```

`navigateSiteSameTab` is a method that given a `url`, it'll **navigate** to that site on the **same tab**. Optionally, you can specify if it replaces the history using `replaceHistory`.

```typescript
navigateSiteSameTab(url: string, replaceHistory?: boolean): void;
```

`navigateSiteSameTab` is a method that given a `url`, it'll **navigate** to that site on a **new tab**.

```typescript
navigateSiteNewTab(url: string): void;
```

`navigateSitePostSameTab` is a method that given a `url`, it'll **navigate** to that site on the **same tab**. It'll also take in an `value` and does a `POST` on that site.

```typescript
navigateSitePostSameTab(url: string, value: object): void;
```

`navigateSitePostNewTab` is a method that given a `url`, it'll **navigate** to that site on the **new tab**. It'll also take in an `value` and does a `POST` on that site.

```typescript
navigateSitePostNewTab(url: string, value: object): void;
```

`getSiteQueryParam` is a method that given a `key`, returns the **query parameter** for the site.

```typescript
getSiteQueryParam(key: string): string;
```

<a id="examples"></a>

## **Examples**

<a id="simple-counter"></a>

### **Simple Counter**

Here's an example of an simple counter.  

Let's create a UI for our Simple Counter. Start by creating a HTML **view** file by naming `counter-view.html` and adding a button which a click event that calls `incrementByOne` method and display it inside a `p` tag:

```html
<div class="counter">
    <button @click="incrementByOne">Add One</button>
    <p class="is-blue">{{ count }}</p>
</div>
```

Now let's make the `p` tag blue by creating a SCSS **view** file naming it `counter-view.scss`:

```scss
.counter
{
    .is-blue
    {
        color: blue;
    }
}
```

We need some functionality. Let's create a TypeScript **view-model** file naming it `counter-view-model.ts` and importing **n-app** into our application and making our view-model class a **subclass** of the `PageViewModel`. We'll also route our page and add a method called `incrementByOne` that increments a private number property called `_count` by 1 and we'll expose that property using a **getter** which will then be displayed to the **view**:

```typescript
import { PageViewModel, route, template } from "@nivinjoseph/n-app";
import { Routes } from "../routes";
import "./counter-view.scss";

@template(require("./counter-view.html")) 
@route(Routes.counter)
export class CounterViewModel extends PageViewModel 
{
    private _count = 0;

    public get count(): number { return this._count; }

    public incrementByOne(): void
    {
        this._count++;
    }
}
```

Now let's link our previous **route** by creating a `Routes` class which contains the `counter` route. Let's name this file `routes.ts`:

```typescript
export class Routes
{
    public static readonly counter = "/counter";

    public static readonly default = Routes.counter;
}
```

Now in our `index.ts`, we'll import our **View-Model**:

```typescript
import { CounterViewModel } from "./counter-view-model.ts";

export const pages = [
    CounterViewModel
];
```

Now we're done!

Running the page with the path `/counter` (without the path will work because we've set it as the `default` path) will bring up our simple counter application.

<a id="n-app-todo"></a>

### **n-app-todo**

Here's an example of a fully built **todo** application built with the **n-app** framework.

Link to the repo [here](https://github.com/shreymahendru/n-app-todo)