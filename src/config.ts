import Query from './query';
import { toColor, isColor } from './color';
import * as Random from './random';

export default class Config {
    static query = new Query();

    static get ratio() {
        return window.devicePixelRatio;
    }

    static get inkSize() {
        return 98 * Config.ratio;
    }

    static get inkSplashNum() {
        return 16;
    }

    static get inkRandomBase() {
        return 5 * Config.ratio;
    }

    static get inkSplashSize() {
        return 3 * Config.ratio;
    }

    static get inkStartColor() {
        return this.query.has('color') && isColor('#' + this.query.get('color'))
            ? toColor('#' + this.query.get('color'))
            : randomColor();
    }

    static get inkEndColor() {
        return this.query.has('color') && isColor('#' + this.query.get('color'))
            ? toColor('#' + this.query.get('color'))
            : randomColor();
    }

    static get inkCollectionRate() {
        return this.query.has('c') && !isNaN(parseInt(this.query.get('c')))
            ? parseInt(this.query.get('c'))
            : Config.inkSize;
    }

    static get windowWidth() {
        return window.innerWidth * Config.ratio;
    }

    static get windowHeight() {
        return window.innerHeight * Config.ratio;
    }

    static get shotRate() {
        return this.query.has('rate') && !isNaN(parseInt(this.query.get('rate')))
            ? parseInt(this.query.get('rate'))
            : 50;
    }

    static get shotSpeed() {
        return 0.25;
    }

    static get showSize() {
        return 64 * Config.ratio;
    }

    static get gridGap() {
        return 16 * Config.ratio;
    }

    static get gridColor() {
        return this.query.has('gc') && isColor('#' + this.query.get('gc'))
            ? toColor('#' + this.query.get('gc'))
            : toColor('#4488ff');
    }
}

const randomColor = () => ({
    r: Random.range(0, 255),
    g: Random.range(0, 255),
    b: Random.range(0, 255),
    a: 1
});
