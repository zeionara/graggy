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

    describe(graph: string | number = undefined, headIndex: number = undefined, tailIndex: number = undefined, usingIds = false, separator = '\t') {
        let head = usingIds ? this.head.id : this.head.name 
        let tail = usingIds ? this.tail.id : this.tail.name
        let relation = this.relation.name

        if (!(graph === undefined)) {
            head = `${graph}.${head}`
            tail = `${graph}.${tail}`
            relation = `${graph}.${relation}`
        }

        if (!(headIndex === undefined)) {
            head = `${head}.${headIndex}`
        }

        if (!(tailIndex === undefined)) {
            tail = `${tail}.${tailIndex}`
        }

        return `${head}${separator}${relation}${separator}${tail}`
    }
}

class TripleWithGraph {
    triple
    graph

    headIndex: number
    tailIndex: number

    includeGraphIdInDescription: boolean

    constructor(triple, graph, index: number = undefined, includeGraphIdInDescription = true, headIndex: number = undefined, tailIndex: number = undefined) {
        this.triple = triple
        this.graph = graph
        
        if (index !== undefined) {
            this.headIndex = index
            this.tailIndex = index
        } else {
            this.headIndex = headIndex
            this.tailIndex = tailIndex
        }
        this.includeGraphIdInDescription = includeGraphIdInDescription
    }

    setIndex(index: number) {
        this.headIndex = index
        this.tailIndex = index
    }

    describe(separator: string, usingIds = false) {
        return this.triple.describe(this.includeGraphIdInDescription ? (this.graph.name ? this.graph.name : this.graph.index) : undefined, this.headIndex, this.tailIndex, usingIds, separator) 
    }

    get description() {
        return this.describe('\t')
    }
}

export { Triple, TripleWithGraph }
