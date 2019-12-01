import Canvas from './canvas'
import Ink from './ink';
import * as Random from './random';
import App, { Msg } from './app';
import Color, { toString, grad } from './color';
import Shot from './shot';
import Config from './config';

interface Model {
    inkCanvas: Canvas,
    gridCanvas: Canvas,
    animCanvas: Canvas,
    display: Canvas,
    isClick: boolean,
    pos: [number, number],
    color: [Color, Color],
    shots: Shot[]
}

type MsgType =
    | "CLICK_CANVAS"
    | "RELEASE_CLICK"
    | "MOVE_CANVAS"
    | "TICK"
    | "ANIMATION_TICK"
    | "RESET"

const view = ({ gridCanvas, inkCanvas, animCanvas, display, shots }: Model) => {
    animCanvas.clear();
    animCanvas.draw(...shots);
    display.clear();
    display.draw(gridCanvas, inkCanvas, animCanvas);
};

const update = (msg: Msg<MsgType>, model: Model): Model | [Model, boolean] => {
    switch (msg.type) {
        case "CLICK_CANVAS":
            return [{ ...model, isClick: true, pos: msg.payload }, false];
        case "RELEASE_CLICK":
            return [{ ...model, isClick: false }, false];
        case "TICK":
            if (model.isClick) {
                return {
                    ...model,
                    shots: [
                        ...model.shots,
                        ...[new Array(Math.floor(Random.range(1, 5)))]
                            .map(_ => {
                                const [gx, gy] = inkGap();
                                const [x, y] = model.pos;
                                const color = grad(
                                    model.color,
                                    [(x + gx) / Config.windowWidth, (y + gy) / Config.windowHeight],
                                    Math.PI / 4
                                );

                                return new Shot(
                                    [Config.windowWidth / 2, Config.windowHeight],
                                    [x + gx, y + gy],
                                    color,
                                    () => model.inkCanvas.draw(newInk([x + gx, y + gy], color))
                                )
                            }
                            )
                    ]
                };
            }
            break;
        case "ANIMATION_TICK":
            return { ...model, shots: model.shots.filter(x => x.update(msg.payload || 0)) };
        case "MOVE_CANVAS":
            return [{ ...model, pos: msg.payload }, false];
        case "RESET":
            model.inkCanvas.clear();
            return model;
    }
    return [model, false];
}

const init = (app: App<Model, MsgType>): Model => {
    const gridCanvas = new Canvas('', Config.windowWidth, Config.windowHeight, true);
    const inkCanvas = new Canvas('', Config.windowWidth, Config.windowHeight, true);
    const animCanvas = new Canvas('', Config.windowWidth, Config.windowHeight, true);
    const display = new Canvas('canvas', Config.windowWidth, Config.windowHeight);
    display.addEventListener<MouseEvent>('mousedown', ({ offsetX, offsetY }) => {
        app.dispatch({ type: "CLICK_CANVAS", payload: [offsetX * Config.ratio, offsetY * Config.ratio] });
    });
    display.addEventListener<MouseEvent>('mousemove', ({ offsetX, offsetY }) => {
        app.dispatch({ type: "MOVE_CANVAS", payload: [offsetX * Config.ratio, offsetY * Config.ratio] });
    });
    display.addEventListener<MouseEvent>('mouseup', () => {
        app.dispatch({ type: "RELEASE_CLICK" });
    });
    display.addEventListener('dblclick', () => app.dispatch({ type: "RESET" }));

    setInterval(() => app.dispatch({ type: "TICK" }), Config.shotRate);

    const animation = (app: App<Model, MsgType>, currentTime: number = 0) => requestAnimationFrame(e => {
        app.dispatch({ type: "ANIMATION_TICK", payload: e - currentTime });
        animation(app, e);
    });

    animation(app);

    gridCanvas.draw(ctx => {
        ctx.save();
        ctx.strokeStyle = toString(Config.gridColor);
        ctx.lineWidth = Config.ratio;

        [...Array(Math.floor(Config.windowWidth / Config.gridGap))]
            .map((_, i) => i)
            .forEach(x => {
                ctx.moveTo(x * Config.gridGap, 0);
                ctx.lineTo(x * Config.gridGap, Config.windowHeight)
            });

        [...Array(Math.floor(Config.windowHeight / Config.gridGap))]
            .map((_, i) => i)
            .forEach(y => {
                ctx.moveTo(0, y * Config.gridGap);
                ctx.lineTo(Config.windowWidth, y * Config.gridGap);
            });

        ctx.stroke();
        ctx.restore();
    });

    return {
        gridCanvas,
        inkCanvas,
        animCanvas,
        display,
        isClick: false,
        pos: [0, 0],
        color: [Config.inkStartColor, Config.inkEndColor],
        shots: []
    }
};

const inkGap = () => {
    const size = Random.range(0, Config.inkCollectionRate);
    const angle = Random.range(0, 2 * Math.PI);
    const dx = Math.cos(angle) * size;
    const dy = Math.sin(angle) * size;

    return [dx, dy];
}

const newInk = ([x, y]: [number, number], color: Color) => {
    return new Ink([x, y], Random.range(Config.inkSize * 0.5, Config.inkSize), color, Config.inkSplashNum);
}

(() => {
    new App(init, update, view);
})();
