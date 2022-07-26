class NodeState {
    locked!: boolean
    name!: string

    virtualX: string
    virtualY: string
    x!: string
    y!: string
    transform!: string

    constructor(locked: boolean, name: string, virtualX: string, virtualY: string, x: string, y: string, transform: string) {
        this.locked = locked
        this.name = name

        this.virtualX = virtualX
        this.virtualY = virtualY
        this.x = x
        this.y = y
        this.transform = transform
    }

    get exportable() {
        return {
            name: this.name,
            locked: this.locked,
            virtualX: this.virtualX,
            virtualY: this.virtualY,
            x: this.x,
            y: this.y,
            transform: this.transform
        }
    }
}

export { NodeState }
