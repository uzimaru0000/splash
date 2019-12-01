export default class App<T, U> {
    private model: T;

    constructor(
        init: (app: App<T, U>) => T,
        private update: (msg: Msg<U>, model: T) => T | [T, boolean],
        private view: (model: T) => void
    ) {
        this.model = init(this);
        this.view(this.model);
    }

    dispatch(msg: Msg<U>) {
        const newModel = this.update(msg, this.model);
        if (Array.isArray(newModel)) {
            let [model, isRender] = newModel;
            this.model = model;
            if (isRender) {
                this.view(this.model);
            }
        } else {
            this.model = newModel;
            this.view(this.model);
        }
    }
}


export type Msg<T> = {
    type: T
} & { [key in string]: any };
