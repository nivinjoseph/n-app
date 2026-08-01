/** biome-ignore-all lint/complexity/noStaticOnlyClass: deliberate */
export class Routes {
    public static readonly todos = "/todos";
    public static readonly todoList = `${this.todos}/list`;
    public static readonly todoCreate = `${this.todos}/create`;
    public static readonly todoEdit = `${this.todos}/edit/{id:string}`;

    public static readonly scratch =
        "/scratch?{q?:string}&{n?:number}&{flag?:boolean}";
}
