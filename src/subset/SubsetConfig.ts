class SubsetConfig {
    pattern: string
    name: string
    disposable: boolean

    constructor(name: string, pattern: string, disposable = true) {
        this.name = name
        this.pattern = pattern
        this.disposable = disposable
    }

    makeUndisposable() {
        if (this.disposable) {
            this.disposable = false
        }
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
