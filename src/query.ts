export default class Query {
    private _query: { [key in string]: string };

    constructor() {
        this._query = window.location.search
            .slice(1)
            .split("&")
            .map(xs => xs.split("="))
            .reduce((acc, xs) => {
                const [key, value] = xs;
                acc[key] = value;
                return acc;
            }, {});
    }

    has(key: string) {
        return this._query[key] !== undefined;
    }

    get(key: string) {
        return this._query[key];
    }
}