function decode(bytes: Uint8Array) {
    const nBytes = bytes.length
    let i = 0

    while (i < nBytes) {
        if (bytes[i] === 0) {
            break
        }
        i += 1
    }

    return new TextDecoder().decode(bytes.slice(0, i))
}

function join(lhs: Uint8Array, rhs: Uint8Array) {
    const joinedArray = new Uint8Array(lhs.length + rhs.length)

    joinedArray.set(lhs, 0)
    joinedArray.set(rhs, lhs.length)

    return joinedArray
}

export { decode, join }
