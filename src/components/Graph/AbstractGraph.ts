import { Vue } from 'vue-class-component';
import { Connector } from '@/Connector'
import { Relation } from '@/relation/Relation'
import { UserDefinedPathRelation } from '@/relation/UserDefinedPathRelation'
import { TripleSet } from '@/TripleSet'
import { Triple } from '@/Triple'
import { Location } from '@/Location'
import { Node } from '@/Node'
import { SubsetConfig } from '@/subset/SubsetConfig'
import { RelationConfig } from '@/relation/RelationConfig'

class AbstractGraph extends Vue {

    // Index of current graph which allows to differentiate it from other graphs

    index!: number

    // Vales set by external selectors

    currentRelation!: RelationConfig
    currentSubset!: SubsetConfig

    // Local values used for internal rendering and tracking state

    nodes: Node[] = []

    connectors: Connector[] = []
    relations: Relation[] = []
    triples = new TripleSet()
    currentHeads: Node[] = []

    push_connector(connector: Connector) {
        this.connectors.push(connector)
    }

    push_relation(relation: Relation) {
        this.relations.push(relation)
    }

    push_relation_segment(segment: Location) {
        const last_relation = this.relations[this.relations.length - 1] as UserDefinedPathRelation
        last_relation.segments.push(segment)
    }

    push_triples(tails: Node[]) {
        const triples: Triple[] = []

        tails.forEach((tail) => {
            this.currentHeads.forEach((head) => {
                triples.push(new Triple(head, this.currentRelation, tail))
            })
        })

        this.triples.push(triples, this.currentSubset)
    }
}

export { AbstractGraph }
