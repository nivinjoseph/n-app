import { given } from "@nivinjoseph/n-defensive";
import { Page } from "./page.js";
import { PageRegistration } from "./page-registration.js";


export class PageTreeBuilder
{
    private readonly _root: Page;
    private readonly _registrations: ReadonlyArray<PageRegistration>;


    public constructor(root: Page, pageRegistrations: ReadonlyArray<PageRegistration>)
    {
        given(root, "root").ensureHasValue().ensureIsType(Page);
        given(pageRegistrations, "pageRegistrations").ensureHasValue().ensureIsArray().ensure(t => t.isNotEmpty);
        this._root = root;
        this._registrations = pageRegistrations;
    }


    public build(): ReadonlyArray<Page>
    {
        this._buildTree();
        return this._shakeTree();
    }

    
    private _buildTree(): void
    {
        for (const registration of this._registrations)
        {
            let currentNode = this._root;

            for (const segment of registration.route.pathSegments)
            {
                if (segment === currentNode.segment)
                    continue;

                let node = currentNode.children.find(t => t.segment === segment);
                if (!node)
                    node = new Page(segment, currentNode);

                currentNode = node;
            }

            currentNode.attachRegistration(registration);
        }
    }

    private _shakeTree(): ReadonlyArray<Page>
    {
        const nodesToProcess = new Array<Page>();
        // skip root
        nodesToProcess.push(...this._root.children);

        while (nodesToProcess.length > 0)
        {
            const currentNode = nodesToProcess.shift()!;
            const children = currentNode.children;
            if (!currentNode.registration)
            {
                for (const child of children)
                    child.changeParent(currentNode.parent);
            }

            nodesToProcess.push(...children);
        }
        
        if (this._root.registration)
            return [this._root];
        
        const children = this._root.children;
        for (const child of children)
            child.changeParent(null);

        return children;        
    }
}