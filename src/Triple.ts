import { RelationConfig } from '@/relation/RelationConfig'

class Triple {
    head
    relation!: RelationConfig
    tail

    constructor(head, relation: RelationConfig, tail) {
        this.head = head
        this.relation = relation
        this.tail = tail
    }

    get description() {
        return this.describe()
    }

    describe(graph: string | number = undefined, index: number = undefined, usingIds = false) {
        let head = usingIds ? this.head.id : this.head.name 
        let tail = usingIds ? this.tail.id : this.tail.name
        let relation = this.relation.name

        if (!(graph === undefined)) {
            head = `${graph}.${head}`
            tail = `${graph}.${tail}`
            relation = `${graph}.${relation}`
        }

        if (!(index === undefined)) {
            head = `${head}.${index}`
            tail = `${tail}.${index}`
        }

        return `${head}\t${relation}\t${tail}`
    }
}

class TripleWithGraph {
    triple
    graph
    index: number
    includeGraphIdInDescription: boolean

    constructor(triple, graph, index: number = undefined, includeGraphIdInDescription = true) {
        this.triple = triple
        this.graph = graph
        this.index = index
        this.includeGraphIdInDescription = includeGraphIdInDescription
    }

    setIndex(index: number) {
        this.index = index
    }

    get description() {
        return this.triple.describe(this.includeGraphIdInDescription ? (this.graph.name ? this.graph.name : this.graph.index) : undefined, this.index) 
    }
}

export { Triple, TripleWithGraph }
