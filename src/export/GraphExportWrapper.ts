import { SubsetConfig } from '@/subset/SubsetConfig'
import { RelationConfig } from '@/relation/RelationConfig'
import { alignProbabilities } from '@/random'

import NodePair from './NodePair'
import SubsetExportWrapper from './SubsetExportWrapper'
import TripleExportWrapper from './TripleExportWrapper'
import TripleStore from './TripleStore'


export default class GraphExportWrapper {
    graph

    subsets: SubsetConfig[]
    relations: RelationConfig[]
    nRepetitions: number
    store: TripleStore

    stringToNodePairMapping: Record<string, NodePair>
    stringToRelationMapping: Record<string, RelationConfig>
    stringToWrappedTripleMapping: Record<string, TripleExportWrapper>

    nNodePairInstances: Record<string, number>
    nRelationInstances: Record<string, number>
    tripleWeights: Record<string, number>

    seenTriples: Set<string>


    forbidSameTripleInMultipleSubsets: boolean

    constructor(graph, store: TripleStore, subsets: SubsetConfig[], relations: RelationConfig[], nRepetitions: number, forbidSameTripleInMultipleSubsets: boolean) {
        this.graph = graph
        this.nNodePairInstances = {}
        this.subsets = subsets
        this.relations = relations
        this.nRepetitions = nRepetitions
        this.store = store

        this.stringToNodePairMapping = {}
        this.stringToRelationMapping = {}
        this.stringToWrappedTripleMapping = {}

        const nRelationInstances = {};
        const nNodePairInstances = {};

        const seenTriples = new Set<string>()

        graph.nodes.forEach(lhs => {
            graph.nodes.forEach(rhs => {
                if (lhs !== rhs) {
                    nNodePairInstances[this.nodePairToString(new NodePair(lhs, rhs))] = 0
                }
            })
        })

        relations.forEach(relation => {
            nRelationInstances[this.relationToString(relation)] = 0
        })

        this.graph.triples.subsets.forEach(subset => {
            const wrappedSubset = new SubsetExportWrapper(subset.config)

            store.pushMany(wrappedSubset.getPath(this), subset.items.map(triple => {
                const wrappedTriple = new TripleExportWrapper(triple, wrappedSubset, this.graph, subsets, forbidSameTripleInMultipleSubsets)

                if (this.nRepetitions < 2) {
                    store.push(wrappedSubset.filename, wrappedTriple.copy())
                    wrappedTriple.descriptions.forEach(description => seenTriples.add(description))
                } else {
                    store.pushMany(wrappedSubset.filename, [...Array(nRepetitions).keys()].map(i => {
                        const wrappedTripleCopy = wrappedTriple.copy(i)
                        wrappedTripleCopy.descriptions.forEach(description => seenTriples.add(description))
                        return wrappedTripleCopy
                    }))
                }

                nRelationInstances[this.relationToString(triple.relation)] += 1
                nNodePairInstances[this.nodePairToString(new NodePair(triple.head, triple.tail))] += 1

                return wrappedTriple  // Repetitions are not written to files corresponding to separate graphs
            }))
        })

        this.nNodePairInstances = alignProbabilities(nNodePairInstances)
        this.nRelationInstances = alignProbabilities(nRelationInstances)
        this.seenTriples = seenTriples

        this.forbidSameTripleInMultipleSubsets = forbidSameTripleInMultipleSubsets
    }

    get folder() {
        return `${this.graph.name ? this.graph.name : this.graph.index}`
    }

    nodePairToString(pair: NodePair) {
        this.stringToNodePairMapping[pair.description] = pair  // TODO: Raise an exception when there is already such pair?
        return pair.description
    }

    relationToString(relation: RelationConfig) {
        this.stringToRelationMapping[relation.id] = relation
        return relation.id
    }

    wrappedTripleToString(triple: TripleExportWrapper) {
        this.stringToWrappedTripleMapping[triple.description] = triple
        return triple.description
    }

    stringToWrappedTriple(triple: string) {
        return this.stringToWrappedTripleMapping[triple]
    }
}
