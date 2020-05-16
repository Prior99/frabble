export class Vec2 {
    public static isVec2(obj: any): obj is Vec2 { // eslint-disable-line
        return obj instanceof Vec2;
    }

    public static min(...vecs: Vec2[]): Vec2 {
        return new Vec2(Math.min(...vecs.map(vec => vec.x)), Math.min(...vecs.map(vec => vec.y)));
    }

    public static max(...vecs: Vec2[]): Vec2 {
        return new Vec2(Math.max(...vecs.map(vec => vec.x)), Math.max(...vecs.map(vec => vec.y)));
    }

    constructor(
        public x: number,
        public y: number,
    ) { }

    public get area(): number {
        return this.x * this.y;
    }

    public get swapped(): Vec2 {
        return new Vec2(this.y, this.x);
    }

    public get length(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    public get normalized(): Vec2 {
        return this.div(this.length);
    }

    public get minComponent(): number {
        return Math.min(this.x, this.y);
    }

    public get maxComponent(): number {
        return Math.max(this.x, this.y);
    }

    public min(other: Vec2): Vec2 {
        return new Vec2(Math.min(this.x, other.x), Math.min(this.y, other.y));
    }

    public max(other: Vec2): Vec2 {
        return new Vec2(Math.max(this.x, other.x), Math.max(this.y, other.y));
    }

    public add(other: number | Vec2): Vec2 {
        if (typeof other === "number") {
            return new Vec2(this.x + other, this.y + other);
        }
        return new Vec2(this.x + other.x, this.y + other.y);
    }

    public sub(other: number | Vec2): Vec2 {
        if (typeof other === "number") {
            return new Vec2(this.x - other, this.y - other);
        }
        return new Vec2(this.x - other.x, this.y - other.y);
    }

    public div(other: number | Vec2): Vec2 {
        if (typeof other === "number") {
            return new Vec2(this.x / other, this.y / other);
        }
        return new Vec2(this.x / other.x, this.y / other.y);
    }

    public mult(other: number | Vec2): Vec2 {
        if (typeof other === "number") {
            return new Vec2(this.x * other, this.y * other);
        }
        return new Vec2(this.x * other.x, this.y * other.y);
    }

    public equals(other: Vec2): boolean;
    public equals(x: number, y: number): boolean;
    public equals(arg1: Vec2 | number, arg2?: number): boolean {
        if (typeof arg1 === "number") {
            return this.x === arg1 && this.y === arg2;
        }
        return this.x === arg1.x && this.y === arg1.y;
    }

    public mod(other: number | Vec2): Vec2 {
        if (typeof other === "number") {
            return new Vec2(this.x % other, this.y % other);
        }
        return new Vec2(this.x % other.x, this.y % other.y);
    }

    public distance(other: Vec2): number {
        return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
    }

    public greaterThan(other: Vec2): boolean {
        return this.x > other.x && this.y > other.y;
    }

    public greaterThanOrEqual(other: Vec2): boolean {
        return this.x >= other.x && this.y >= other.y;
    }

    public lessThan(other: Vec2): boolean {
        return this.x < other.x && this.y < other.y;
    }

    public lessThanOrEqual(other: Vec2): boolean {
        return this.x <= other.x && this.y <= other.y;
    }

    public get abs(): Vec2 {
        return new Vec2(Math.abs(this.x), Math.abs(this.y));
    }
}

export function vec2(x: number, y: number): Vec2 {
    return new Vec2(x, y);
}
