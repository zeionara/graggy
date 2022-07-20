export default class NodePair {
    lhs
    rhs

    constructor(lhs, rhs) {
        this.lhs = lhs
        this.rhs = rhs
    }

    get description() {
        return `${this.lhs.id} ${this.rhs.id}`
    }
}
