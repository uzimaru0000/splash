export default class Canvas implements Renderable {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    constructor(id: string, width: number = 320, height: number = 320, isBuffer: boolean = false) {
        if (!isBuffer) {
            this.canvas = document.getElementById(id) as HTMLCanvasElement;
            this.canvas.width = width;
            this.canvas.height = height;
        } else {
            this.canvas = document.createElement('canvas');
            this.canvas.width = width;
            this.canvas.height = height;
        }

        this.context = this.canvas.getContext('2d');
    }

    set width(value: number) {
        this.canvas.width = value;
        this.context = this.canvas.getContext('2d');
    }

    get width() {
        return this.canvas.width;
    }

    set height(value: number) {
        this.canvas.height = value;
        this.context = this.canvas.getContext('2d');
    }

    get height() {
        return this.canvas.height;
    }

    draw(...funcs: Array<((ctx: CanvasRenderingContext2D) => void) | Renderable>) {
        funcs.forEach(fn => {
            if (typeof fn === "object") {
                fn.render(this.context);
            } else {
                fn(this.context);
            }
        });
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.drawImage(this.canvas, 0, 0);
    }

    addEventListener<T extends Event>(event: string, fn: (e: T) => void) {
        this.canvas.addEventListener(event, fn);
    }

    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    }
}

export interface Renderable {
    render: (ctx: CanvasRenderingContext2D) => void;
}
