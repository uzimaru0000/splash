export default interface Color {
    r: number
    g: number
    b: number
    a: number
}

export const isColor = (s: string) => {
    return /^#([\da-fA-F]{6}|[\da-fA-F]{3})$/.test(s);
}

export const toColor = (s: string) => {
    try {
        const [h, ...code] = s.split("");
        if (h === "#") {
            if (code.length === 3) {
                const [r, g, b] = code.map(x => parseInt(`${x}${x}`, 16));
                return { r, g, b, a: 1 }
            } else if (code.length === 6) {
                const [r, g, b] = code.reduce((acc, x) => {
                    if (acc.stack.length < 1) {
                        return {
                            ...acc,
                            stack: [...acc.stack, x]
                        }
                    } else {
                        return {
                            result: [...acc.result, [...acc.stack, x].join("")],
                            stack: []
                        }
                    }
                }, { stack: [], result: [] }).result.map(x => parseInt(x, 16));

                return { r, g, b, a: 1 };
            } else {
                throw "invalid";
            }
        } else {
            throw "invalid";
        }
    } catch (e) {
        console.error(e);
        return { r: 0, g: 0, b: 0, a: 0 };
    }
};

export const toString = (c: Color) =>
    `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;


export const grad = ([start, end]: [Color, Color], [x, y]: [number, number], angle: number = 0) => {
    const fn = (a: number, b: number, r: number) => a * (1 - r) + b * r;
    const r = (x - 0.5) * Math.cos(angle) - (y - 0.5) * Math.sin(angle) + 0.5;

    return {
        r: fn(start.r, end.r, r),
        g: fn(start.g, end.g, r),
        b: fn(start.b, end.b, r),
        a: fn(start.a, end.a, r)
    }
}
