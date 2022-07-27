import { Vue } from 'vue-class-component';
import { Connector } from '@/Connector'
import { Relation } from '@/relation/Relation'
import { UserDefinedPathRelation } from '@/relation/UserDefinedPathRelation'
import { TripleSet } from '@/TripleSet'
import { Triple } from '@/Triple'
import { Location } from '@/Location'
import Node from '@/components/Node/Node.vue'
import { SubsetConfig } from '@/subset/SubsetConfig'
import { RelationConfig } from '@/relation/RelationConfig'

class AbstractGraph extends Vue {

    name: string = null

    nGraphs!: number

    get nodes() {
        return this.$refs.nodes
    }

    // Index of current graph which allows to differentiate it from other graphs

    index!: number

    // Vales set by external selectors

    currentRelation!: RelationConfig
    currentSubset!: SubsetConfig

    // Local values used for internal rendering and tracking state

    nNodes = 0
    nodeInitialLocations: Location[] = []

    connectors: Connector[] = []
    relations: Relation[] = []
    triples = new TripleSet()
    currentHeads: Node[] = []

    pushConnector(connector: Connector) {
        this.connectors.push(connector)
    }

    pushRelation(relation: Relation) {
        this.relations.push(relation)
    }

    pushRelationSegment(segment: Location) {
        const lastRelation = this.relations[this.relations.length - 1] as UserDefinedPathRelation
        lastRelation.segments.push(segment)
    }

    pushTriples(tails: Node[]) {
        const triples: Triple[] = []

        tails.forEach((tail) => {
            this.currentHeads.forEach((head) => {
                triples.push(new Triple(head, this.currentRelation, tail))
            })
        })

        this.triples.push(triples, this.currentSubset)
    }

    deleteGraph() {
        this.$emit("deleteGraph", this.index)
    }

    moveUp() {
        this.$emit("swapGraphs", {lhs: this.index - 1, rhs: this.index})
    }

    moveDown() {
        this.$emit("swapGraphs", {lhs: this.index, rhs: this.index + 1})
    }

    get_exportable() {
        return {
            name: this.name,
            nodes: (this.nodes as any).map(node => node.get_state().exportable)
        }
    }
}

export { AbstractGraph }
