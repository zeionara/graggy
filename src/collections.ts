function mergeLists<T>(lhs: Array<T>, rhs: Array<T>) {
    rhs.forEach(item => lhs.push(item))
}

function mergeObjectsOfLists<T>(lhs: Record<string, Array<T>>, rhs: Record<string, Array<T>>) {
    for (const [key, value] of Object.entries(rhs)) {
        if (key in lhs) {
            mergeLists(lhs[key], value)
        } else {
            lhs[key] = [...value]
        }
    }
}

function mergeListOfObjectsOfLists<T>(items: Array<Record<string, Array<T>>>) {
    const mergedObject = {};

    items.forEach(item => mergeObjectsOfLists(mergedObject, item))

    return mergedObject
}


export { mergeListOfObjectsOfLists }
