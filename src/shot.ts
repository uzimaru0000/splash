import { Renderable } from "./canvas";
import Color, { toString } from "./color";
import Config from "./config";

export default class Shot implements Renderable {
    private rate: number = 0;
    private length: number;
    private speed: number;
    private dir: [number, number];

    constructor(
        private initPos: [number, number],
        private targetPos: [number, number],
        private color: Color,
        private callback: () => void
    ) {
        const [ix, iy] = this.initPos;
        const [tx, ty] = this.targetPos;

        this.length = Math.sqrt(Math.pow(ix - tx, 2) + Math.pow(iy - ty, 2));
        this.speed = this.length / Config.shotSpeed;
        this.dir = [(ix - tx) / this.length, (iy - ty) / this.length];
    }

    get currentPos() {
        const [ix, iy] = this.initPos;
        const [tx, ty] = this.targetPos;

        return [
            ix * (1 - this.rate) + tx * this.rate,
            iy * (1 - this.rate) + ty * this.rate
        ];
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();

        const [cx, cy] = this.currentPos;

        ctx.beginPath();
        ctx.fillStyle = this.createGrad(ctx);
        ctx.arc(cx, cy, Config.showSize * (1.5 - this.rate), 0, 2 * Math.PI);
        this.renderTriangle(ctx);

        ctx.fill();

        ctx.restore();
    }

    renderTriangle(ctx: CanvasRenderingContext2D) {
        const [dx, dy] = this.dir;
        const [cx, cy] = this.currentPos;
        const angle = Math.atan2(dy, dx);
        const r = Config.showSize * (1.5 - this.rate);

        const [head, ...tail] = [
            [r * Math.cos(angle - Math.PI / 2), r * Math.sin(angle - Math.PI / 2)],
            [4 * r * Math.cos(angle), 4 * r * Math.sin(angle)],
            [r * Math.cos(angle + Math.PI / 2), r * Math.sin(angle + Math.PI / 2)]
        ].map(([x, y]) => [x + cx, y + cy]);

        ctx.moveTo(head[0], head[1]);
        [...tail, head]
            .forEach(([x, y]) => ctx.lineTo(x, y));
    }

    private createGrad(ctx: CanvasRenderingContext2D) {
        const [dx, dy] = this.dir;
        const [cx, cy] = this.currentPos;
        const angle = Math.atan2(dy, dx);
        const r = Config.showSize * (1.5 - this.rate);

        const grad = ctx.createLinearGradient(
            r * Math.cos(angle - Math.PI) + cx,
            r * Math.sin(angle - Math.PI) + cy,
            4 * r * Math.cos(angle) + cx,
            4 * r * Math.sin(angle) + cy
        );
        grad.addColorStop(0, toString(this.color));
        grad.addColorStop(1, toString({ ...this.color, a: 0 }));

        return grad;
    }

    update(d: number) {
        this.rate += (this.rate + this.speed * d / 1000) / this.length;

        if (this.rate > 1) {
            this.callback();
            return false;
        }
        return true;
    }
}
