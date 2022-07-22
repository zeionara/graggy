import { SubsetConfig } from '@/subset/SubsetConfig'
import { RelationConfig } from '@/relation/RelationConfig'
import { alignProbabilities, sample } from '@/random'
import { Triple } from '@/Triple'


import NodePair from './NodePair'
import SubsetExportWrapper from './SubsetExportWrapper'
import TripleExportWrapper from './TripleExportWrapper'


export default class GraphExportWrapper {
    graph

    subsets: SubsetConfig[]
    relations: RelationConfig[]
    nRepetitions: number

    stringToNodePairMapping: Record<string, NodePair>
    stringToRelationMapping: Record<string, RelationConfig>
    stringToWrappedTripleMapping: Record<string, TripleExportWrapper>

    nNodePairInstances: Record<string, number>
    nRelationInstances: Record<string, number>
    tripleWeights: Record<string, number>

    seenTriples: Set<string>

    triples: Record<string, Array<TripleExportWrapper>>

    forbidSameTripleInMultipleSubsets: boolean

    constructor(graph, subsets: SubsetConfig[], relations: RelationConfig[], nRepetitions: number, forbidSameTripleInMultipleSubsets: boolean) {
        this.graph = graph
        this.nNodePairInstances = {}
        this.subsets = subsets
        this.relations = relations
        this.nRepetitions = nRepetitions

        this.stringToNodePairMapping = {}
        this.stringToRelationMapping = {}
        this.stringToWrappedTripleMapping = {}

        const triples = {}

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

            triples[wrappedSubset.getPath(this)] = subset.items.map(triple => {
                const wrappedTriple = new TripleExportWrapper(triple, wrappedSubset, this.graph, subsets, forbidSameTripleInMultipleSubsets)

                wrappedTriple.descriptions.forEach(description => seenTriples.add(description))
                
                // console.log(forbidSameTripleInMultipleSubsets)
                // console.log(wrappedTriple.descriptions)

                if (wrappedSubset.filename in triples) {
                    if (this.nRepetitions < 2) {
                        triples[wrappedSubset.filename].push(wrappedTriple)
                    } else {
                        for (let i = 0; i < this.nRepetitions; i += 1) {
                            triples[wrappedSubset.filename].push(wrappedTriple.copy(i))
                        }
                    }
                } else {
                    if (this.nRepetitions < 2) {
                        triples[wrappedSubset.filename] = [wrappedTriple]
                    } else {
                        triples[wrappedSubset.filename] = [...Array(this.nRepetitions).keys()].map(i => wrappedTriple.copy(i))
                    }
                }

                nRelationInstances[this.relationToString(triple.relation)] += 1
                nNodePairInstances[this.nodePairToString(new NodePair(triple.head, triple.tail))] += 1

                return wrappedTriple  // Repetitions are not written to files corresponding to separate graphs
            })
        })

        this.nNodePairInstances = alignProbabilities(nNodePairInstances)
        this.nRelationInstances = alignProbabilities(nRelationInstances)
        this.seenTriples = seenTriples
        this.triples = triples

        this.forbidSameTripleInMultipleSubsets = forbidSameTripleInMultipleSubsets
        // this.subsets = subsets
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
