import { Vec2, vec2 } from "./vec2";

export enum RectIteratorOrder {
    RIGHT_DOWN = "right down",
    LEFT_DOWN = "left down",
    RIGHT_UP = "right up",
    LEFT_UP = "left up",
}

export class Rect {
    // eslint-disable-next-line
    public static isRect(obj: any): obj is Rect {
        return obj instanceof Rect;
    }
    public topLeft: Vec2;
    public dimensions: Vec2;

    constructor(topLeft: Vec2, dimensions: Vec2);
    constructor(x: number, y: number, width: number, height: number);
    constructor(arg1: number | Vec2, arg2: number | Vec2, arg3?: number, arg4?: number) {
        if (Vec2.isVec2(arg1)) {
            this.topLeft = arg1;
            this.dimensions = arg2 as Vec2;
        } else {
            this.topLeft = vec2(arg1, arg2 as number);
            this.dimensions = vec2(arg3 as number, arg4 as number);
        }
    }

    public get topRight(): Vec2 {
        return this.topLeft.add(vec2(this.dimensions.x, 0));
    }

    public get bottomLeft(): Vec2 {
        return this.topLeft.add(vec2(0, this.dimensions.y));
    }

    public get bottomRight(): Vec2 {
        return this.topLeft.add(this.dimensions);
    }

    public clamp(vec2: Vec2): Vec2 {
        return new Vec2(
            Math.max(Math.min(vec2.x, this.bottomRight.x), this.topLeft.x),
            Math.max(Math.min(vec2.y, this.bottomRight.y), this.topLeft.y),
        );
    }

    public offset(offset: Vec2): Rect {
        return new Rect(this.topLeft.add(offset), this.dimensions);
    }

    public subRect(other: Rect): Rect {
        return this.intersect(other.offset(this.topLeft));
    }

    public intersect(other: Rect): Rect {
        const topLeft = this.clamp(other.topLeft);
        const bottomRight = this.clamp(other.bottomRight);
        const dimensions = bottomRight.sub(topLeft);
        return new Rect(topLeft, dimensions);
    }

    public intersects(other: Rect): boolean {
        return this.intersect(other).area === 0;
    }

    public extend(other: Rect): Rect {
        const topLeft = this.topLeft.min(other.topLeft);
        const bottomRight = this.bottomRight.max(other.bottomRight);
        const dimensions = bottomRight.sub(topLeft);
        return new Rect(topLeft, dimensions);
    }

    public resize(newSize: Vec2): Rect {
        return new Rect(this.topLeft, newSize);
    }

    public contains(point: Vec2): boolean {
        return point.greaterThanOrEqual(this.topLeft) && point.lessThan(this.bottomRight);
    }

    public get area(): number {
        return this.dimensions.x * this.dimensions.y;
    }

    public *positionIterator(iteratorOrder: RectIteratorOrder = RectIteratorOrder.RIGHT_DOWN): Generator<Vec2> {
        switch (iteratorOrder) {
            case RectIteratorOrder.LEFT_DOWN:
                for (let y = 0; y < this.dimensions.y; y++) {
                    for (let x = this.dimensions.x - 1; x >= 0; --x) {
                        yield vec2(x, y).add(this.topLeft);
                    }
                }
                break;
            case RectIteratorOrder.RIGHT_DOWN:
                for (let y = 0; y < this.dimensions.y; y++) {
                    for (let x = 0; x < this.dimensions.x; ++x) {
                        yield vec2(x, y).add(this.topLeft);
                    }
                }
                break;
            case RectIteratorOrder.LEFT_UP:
                for (let y = this.dimensions.y - 1; y >= 0; y--) {
                    for (let x = this.dimensions.x - 1; x >= 0; --x) {
                        yield vec2(x, y).add(this.topLeft);
                    }
                }
                break;
            case RectIteratorOrder.RIGHT_UP:
                for (let y = this.dimensions.y - 1; y >= 0; y--) {
                    for (let x = 0; x < this.dimensions.x; ++x) {
                        yield vec2(x, y).add(this.topLeft);
                    }
                }
                break;
        }
    }

    public fromIndex(index: number, iteratorOrder: RectIteratorOrder = RectIteratorOrder.RIGHT_DOWN): Vec2 {
        const basicX = index % this.dimensions.x;
        const basicY = Math.floor(index / this.dimensions.y);
        switch (iteratorOrder) {
            case RectIteratorOrder.LEFT_DOWN:
                return vec2(this.dimensions.x - basicX, basicY);
            case RectIteratorOrder.RIGHT_DOWN:
                return vec2(basicX, basicY);
            case RectIteratorOrder.LEFT_UP:
                return vec2(this.dimensions.x - basicX, this.dimensions.y - basicY);
            case RectIteratorOrder.RIGHT_UP:
                return vec2(basicX, this.dimensions.y - basicY);
        }
    }

    public toIndex(position: Vec2, iteratorOrder: RectIteratorOrder = RectIteratorOrder.RIGHT_DOWN): number {
        const relative = position.sub(this.topLeft);
        switch (iteratorOrder) {
            case RectIteratorOrder.LEFT_DOWN:
                return this.dimensions.x - relative.x + relative.y * this.dimensions.y;
            case RectIteratorOrder.RIGHT_DOWN:
                return relative.x + relative.y * this.dimensions.x;
            case RectIteratorOrder.LEFT_UP:
                return this.dimensions.x - relative.x + relative.y * this.dimensions.y;
            case RectIteratorOrder.RIGHT_UP:
                return relative.x + (this.dimensions.y - relative.y) * this.dimensions.x;
        }
    }
}

export function rect(topLeft: Vec2, dimensions: Vec2): Rect;
export function rect(x: number, y: number, width: number, height: number): Rect;
export function rect(arg1: number | Vec2, arg2: number | Vec2, arg3?: number, arg4?: number): Rect {
    return new Rect(arg1 as number, arg2 as number, arg3 as number, arg4 as number);
}
