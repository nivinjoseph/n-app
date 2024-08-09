import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
import { InvalidArgumentException, ApplicationException, InvalidOperationException } from "@nivinjoseph/n-exception";
import { HttpException } from "./http-exception.js";
export class RouteParam {
    _param;
    _paramKey;
    _paramType;
    _isQuery;
    _isOptional;
    _order = 0;
    get param() { return this._param; }
    get paramKey() { return this._paramKey; }
    get paramType() { return this._paramType; }
    get isQuery() { return this._isQuery; }
    get isOptional() { return this._isOptional; }
    get order() { return this._order; }
    constructor(routeParam) {
        given(routeParam, "routeParam").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        let param = routeParam.trim();
        let paramKey;
        let paramType;
        let isQuery = false;
        let isOptional = false;
        if (param.endsWith("[Q]")) {
            isQuery = true;
            param = param.replace("[Q]", "");
        }
        if (param.contains(":")) {
            const splitted = param.split(":");
            if (splitted.length > 2 || splitted[0].isEmptyOrWhiteSpace() || splitted[1].isEmptyOrWhiteSpace())
                throw new InvalidArgumentException("routeParam");
            paramKey = splitted[0].trim();
            paramType = splitted[1].trim().toLowerCase();
            if (paramType !== ParamTypes.boolean && paramType !== ParamTypes.number && paramType !== ParamTypes.string)
                paramType = ParamTypes.any;
        }
        else {
            paramKey = param;
            paramType = ParamTypes.any;
        }
        if (paramKey.endsWith("?")) {
            if (!isQuery)
                throw new ApplicationException("Path parameters cannot be optional.");
            // TODO: we can tell vue router that this param is optional don't need to remove '?'
            paramKey = paramKey.substr(0, paramKey.length - 1);
            isOptional = true;
        }
        this._param = param;
        this._paramKey = paramKey;
        this._paramType = paramType;
        this._isQuery = isQuery;
        this._isOptional = isOptional;
    }
    setOrder(order) {
        given(order, "order").ensureHasValue();
        if (this._order > 0)
            throw new InvalidOperationException("setOrder");
        this._order = order;
    }
    parseParam(value) {
        if (value == null || value.isEmptyOrWhiteSpace() || value.trim().toLowerCase() === "null") {
            if (this._isOptional)
                return null;
            throw new HttpException(404);
        }
        value = value.trim();
        if (this._paramType === ParamTypes.string || this._paramType === ParamTypes.any)
            return value;
        try {
            return this._paramType === ParamTypes.number ? this._parseNumber(value) : this._parseBoolean(value);
        }
        catch (error) {
            if (this._isOptional)
                return null;
            throw error;
        }
    }
    _parseNumber(value) {
        try {
            const num = value.contains(".") ? Number.parseFloat(value) : Number.parseInt(value);
            if (!Number.isNaN(num) && Number.isFinite(num))
                return num;
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw "PARSE ERROR";
        }
        catch (error) {
            throw new HttpException(404);
        }
    }
    _parseBoolean(value) {
        value = value.toLowerCase();
        if (value === "true")
            return true;
        if (value === "false")
            return false;
        throw new HttpException(404);
    }
}
class ParamTypes {
    static _boolean = "boolean";
    static _number = "number";
    static _string = "string";
    static _any = "any";
    static get boolean() { return this._boolean; }
    static get number() { return this._number; }
    static get string() { return this._string; }
    static get any() { return this._any; }
}
//# sourceMappingURL=route-param.js.map