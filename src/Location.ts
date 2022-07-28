 class Location {
    x!: number
    y!: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    getExportable() {
        return {
            x: this.x,
            y: this.y
        }
    }
 }

 export { Location }
