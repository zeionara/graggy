class SubsetConfig {
    pattern: string
    name: string

    constructor(name: string, pattern: string) {
        this.name = name
        this.pattern = pattern
    }

    get lineDash() {
        if (this.pattern == "solid") {
            return []
        } else if (this.pattern == "dashed") {
            return [10, 10]
        } else if (this.pattern == "dotted") {
            return [3, 3]
        } else if (this.pattern == "dashed-dotted") {
            return [15, 3, 3, 3]
        }
    }
}

export { SubsetConfig }
