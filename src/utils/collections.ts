function equals<T>(lhs: Array<T>, rhs: Array<T>) {
    return lhs.length === rhs.length && lhs.every((item, i) => item === rhs[i])
}

function append<T>(mapping: Map<string, T[]>, key: string, value: T) {
    if (mapping.has(key)) {
        mapping.get(key).push(value)
    } else {
        mapping.set(key, [value])
    }
}

function pushToNullable<T>(nullableArray: Array<T>, value: T) {
    if (nullableArray === null) {
        nullableArray = [value]
    } else {
        nullableArray.push(value)
    }
    return nullableArray
}

export { equals, append, pushToNullable }
