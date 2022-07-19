function getFactorial(n: number) {
    if (n < 0) {
        return undefined
    } else if (n === 0) {
        return 1
    }
    return n * getFactorial(n - 1)
}

export { getFactorial }
