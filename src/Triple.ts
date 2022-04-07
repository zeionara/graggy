import { RelationConfig } from '@/relation/RelationConfig'

class Triple {
    head!: string
    relation!: RelationConfig
    tail!: string

    constructor(head: string, relation: RelationConfig, tail: string) {
        this.head = head
        this.relation = relation
        this.tail = tail
    }

    get description() {
        return `${this.head}\t${this.relation.name}\t${this.tail}`
    }
}

export { Triple }
