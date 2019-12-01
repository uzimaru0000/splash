import { Renderable } from './canvas'
import * as Random from './random';
import Color, { toString } from './color';
import Config from './config';

export default class Ink implements Renderable {
    constructor(
        private pos: [number, number],
        private size: number,
        private color: Color,
        private vertNum: number
    ) { }

    private gradient(context: CanvasRenderingContext2D) {
        const grad = context.createRadialGradient(
            this.pos[0],
            this.pos[1],
            this.size * 0.25,
            this.pos[0],
            this.pos[1],
            this.size
        );
        grad.addColorStop(0, toString(this.color));
        grad.addColorStop(1, toString({ ...this.color, a: 0 }));

        return grad;
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();

        ctx.fillStyle = this.gradient(ctx);

        const unitAngle = (2 * Math.PI) / this.vertNum;

        const vert = [...Array(this.vertNum)]
            .map((_, i) => i * unitAngle + Random.range(-Config.inkRandomBase, Config.inkRandomBase) * (Math.PI / 180))
            .map(r => [Math.cos(r) * this.size, Math.sin(r) * this.size])
            .map(([x, y]) => [x + this.pos[0], y + this.pos[1]]);

        const controlPos = [...Array(this.vertNum)]
            .map((_, i) => i * unitAngle + Random.range(-Config.inkRandomBase, Config.inkRandomBase) * (Math.PI / 180) + unitAngle / 2)
            .map(r => {
                const scale = Math.random() * this.size * 0.5;
                return [Math.cos(r) * scale, Math.sin(r) * scale];
            })
            .map(([x, y]) => [x + this.pos[0], y + this.pos[1]]);

        const [firstVert, ...tail] = vert;

        ctx.moveTo(firstVert[0], firstVert[1]);
        zip([...tail, firstVert])(controlPos)
            .forEach(([pos, cpos]) => ctx.quadraticCurveTo(cpos[0], cpos[1], pos[0], pos[1]));
        ctx.fill();

        ctx.fillStyle = toString(this.color);

        vert.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, Random.range(Config.inkSplashSize * 0.1, Config.inkSplashSize), 0, 2 * Math.PI);
            ctx.fill();
        });

        ctx.restore();
    }
}


const zip =
    <T, U>(arr1: Array<T>) => (arr2: Array<U>) =>
        arr1.length > arr2.length
            ? arr1.map((x, i) => [x, arr2[i]])
            : arr2.map((x, i) => [arr1[i], x]);
