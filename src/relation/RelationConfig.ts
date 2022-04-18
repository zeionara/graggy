class RelationConfig {
    color: string
    name: string
    disposable: boolean

    constructor(name: string, color: string = undefined, disposable = true) {
        if (!color) {
            color = name
        }
        this.name = name
        this.color = color
        this.disposable = disposable
    }

    makeUndisposable() {
        if (this.disposable) {
            this.disposable = false
        }
    }
}

export { RelationConfig }
