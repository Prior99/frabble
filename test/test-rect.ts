import { rect, vec2, Rect } from "../src";

describe("Rect", () => {
    let testRect: Rect;

    describe.each([
        {
            topLeft: vec2(0, 0),
            dimensions: vec2(10, 10),
            bottomRight: vec2(10, 10),
            bottomLeft: vec2(0, 10),
            topRight: vec2(10, 0),
        },
        {
            topLeft: vec2(-10, -10),
            dimensions: vec2(20, 20),
            bottomRight: vec2(10, 10),
            bottomLeft: vec2(-10, 10),
            topRight: vec2(10, -10),
        },
        {
            topLeft: vec2(5, 5),
            dimensions: vec2(0, 0),
            bottomRight: vec2(5, 5),
            bottomLeft: vec2(5, 5),
            topRight: vec2(5, 5),
        },
    ])("test %#", ({ topLeft, dimensions, bottomRight, bottomLeft, topRight }) => {
        describe("with vec2 as constructor arguments", () => {
            beforeEach(() => (testRect = rect(topLeft, dimensions)));

            it("has correct topLeft", () => expect(testRect.topLeft).toEqual(topLeft));

            it("has correct bottomRight", () => expect(testRect.bottomRight).toEqual(bottomRight));

            it("has correct bottomLeft", () => expect(testRect.bottomLeft).toEqual(bottomLeft));

            it("has correct topRight", () => expect(testRect.topRight).toEqual(topRight));

            it("has correct dimensions", () => expect(testRect.dimensions).toEqual(dimensions));
        });

        describe("with number as constructor arguments", () => {
            beforeEach(() => (testRect = rect(topLeft.x, topLeft.y, dimensions.x, dimensions.y)));

            it("has correct topLeft", () => expect(testRect.topLeft).toEqual(topLeft));

            it("has correct bottomRight", () => expect(testRect.bottomRight).toEqual(bottomRight));

            it("has correct bottomLeft", () => expect(testRect.bottomLeft).toEqual(bottomLeft));

            it("has correct topRight", () => expect(testRect.topRight).toEqual(topRight));

            it("has correct dimensions", () => expect(testRect.dimensions).toEqual(dimensions));
        });

        describe("offset", () => {
            beforeEach(() => (testRect = rect(10, 10, 40, 40)));

            it("positive", () => expect(testRect.offset(vec2(20, 5))).toEqual(rect(30, 15, 40, 40)));

            it("zero", () => expect(testRect.offset(vec2(0, 0))).toEqual(rect(10, 10, 40, 40)));

            it("negative", () => expect(testRect.offset(vec2(-10, -20))).toEqual(rect(0, -10, 40, 40)));
        });

        describe("clamp", () => {
            beforeEach(() => (testRect = rect(10, 10, 40, 40)));

            it("inside", () => expect(testRect.clamp(vec2(20, 20))).toEqual(vec2(20, 20)));

            it("above", () => expect(testRect.clamp(vec2(20, 5))).toEqual(vec2(20, 10)));

            it("left of", () => expect(testRect.clamp(vec2(5, 20))).toEqual(vec2(10, 20)));

            it("right of", () => expect(testRect.clamp(vec2(60, 20))).toEqual(vec2(50, 20)));

            it("below", () => expect(testRect.clamp(vec2(20, 60))).toEqual(vec2(20, 50)));

            it("below and right of", () => expect(testRect.clamp(vec2(60, 60))).toEqual(vec2(50, 50)));

            it("top and left of", () => expect(testRect.clamp(vec2(0, 0))).toEqual(vec2(10, 10)));
        });
    });

    describe("subRect", () => {
        beforeEach(() => (testRect = rect(10, 20, 40, 30)));

        it("inside", () => expect(testRect.subRect(rect(10, 10, 5, 5))).toEqual(rect(20, 30, 5, 5)));

        it("overlapping above and left of", () =>
            expect(testRect.subRect(rect(-5, -15, 10, 20))).toEqual(rect(10, 20, 5, 5)));

        it("overlapping below and right of", () =>
            expect(testRect.subRect(rect(35, 25, 10, 10))).toEqual(rect(45, 45, 5, 5)));

        it("outside", () => expect(testRect.subRect(rect(10, 35, 5, 5))).toEqual(rect(20, 50, 5, 0)));

        it("outside corner", () => expect(testRect.intersect(rect(100, 100, 5, 5))).toEqual(rect(50, 50, 0, 0)));
    });

    describe("extend", () => {
        beforeEach(() => (testRect = rect(10, 20, 40, 30)));

        it("inside", () => expect(testRect.extend(rect(20, 30, 5, 5))).toEqual(rect(10, 20, 40, 30)));

        it("overlapping above and left of", () =>
            expect(testRect.extend(rect(5, 5, 20, 20))).toEqual(rect(5, 5, 45, 45)));

        it("overlapping below and right of", () =>
            expect(testRect.extend(rect(45, 45, 10, 10))).toEqual(rect(10, 20, 35, 25)));

        it("outside", () => expect(testRect.extend(rect(10, 55, 5, 5))).toEqual(rect(10, 20, 40, 40)));

        it("outside corner", () => expect(testRect.extend(rect(100, 100, 5, 5))).toEqual(rect(10, 20, 95, 85)));

        it("outside zero", () => expect(testRect.extend(rect(100, 100, 0, 0))).toEqual(rect(10, 20, 90, 80)));
    });

    describe("intersect", () => {
        beforeEach(() => (testRect = rect(10, 20, 40, 30)));

        it("inside", () => expect(testRect.intersect(rect(20, 30, 5, 5))).toEqual(rect(20, 30, 5, 5)));

        it("overlapping above and left of", () =>
            expect(testRect.intersect(rect(5, 5, 20, 20))).toEqual(rect(10, 20, 15, 5)));

        it("overlapping below and right of", () =>
            expect(testRect.intersect(rect(45, 45, 10, 10))).toEqual(rect(45, 45, 5, 5)));

        it("outside", () => expect(testRect.intersect(rect(10, 55, 5, 5))).toEqual(rect(10, 50, 5, 0)));

        it("outside corner", () => expect(testRect.intersect(rect(100, 100, 5, 5))).toEqual(rect(50, 50, 0, 0)));
    });

    it("resizing", () => expect(rect(10, 8, 11, 12).resize(vec2(5, 7))).toEqual(rect(10, 8, 5, 7)));

    describe("contains", () => {
        it("inside", () => expect(rect(5, 6, 10, 4).contains(vec2(7, 7))).toBe(true));

        it("outside x", () => expect(rect(5, 6, 10, 4).contains(vec2(18, 7))).toBe(false));

        it("outside y", () => expect(rect(5, 6, 10, 4).contains(vec2(7, -2))).toBe(false));
    });

    describe("area", () => {
        it("area", () => expect(rect(1, 2, 8, 10).area).toBe(80));
    });

    it.each([{ topLeft: vec2(0, 0), dimensions: vec2(10, 10) }])("#j is not a rect", v =>
        expect(Rect.isRect(v)).toBe(false),
    );

    it.each([rect(0, 0, 1, 1), new Rect(0, 0, 10, 10)])("#j is a rect", v => expect(Rect.isRect(v)).toBe(true));
});
