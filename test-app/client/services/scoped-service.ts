export class ScopedService
{
    private _value = 0;


    public get value(): number { return this._value; }


    public constructor()
    {
        console.log("Scoped service being created.");
    }


    public configureValue(value: number): void
    {
        this._value = value;
    }
}