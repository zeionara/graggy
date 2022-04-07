class RelationConfig {
    color: string
    name: string

    constructor(name: string, color: string = undefined) {
        if (!color) {
            color = name
        }
        this.name = name
        this.color = color
    }
}

export { RelationConfig }
