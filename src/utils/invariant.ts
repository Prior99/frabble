export function invariant(arg: never): never {
    throw new Error(`Invariant exception: "${arg}" was not expected.`);
}
