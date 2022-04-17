import { RelationConfig } from '@/relation/RelationConfig'

class Triple {
    head
    relation!: RelationConfig
    tail

    constructor(head: Node, relation: RelationConfig, tail: Node) {
        this.head = head
        this.relation = relation
        this.tail = tail
    }

    get description() {
        return `${this.head.name}\t${this.relation.name}\t${this.tail.name}`
    }
}

export { Triple }
