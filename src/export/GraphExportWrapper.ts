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

        const tripleWeights = {};

        graph.nodes.forEach(lhs => {
            graph.nodes.forEach(rhs => {
                if (lhs !== rhs) {
                    relations.forEach(relation => {
                        subsets.forEach(subset => {
                            tripleWeights[
                                this.wrappedTripleToString(new TripleExportWrapper(new Triple(lhs, relation, rhs), new SubsetExportWrapper(subset), graph, subsets, forbidSameTripleInMultipleSubsets))
                            ] = nRelationInstances[this.relationToString(relation)] + nNodePairInstances[this.nodePairToString(new NodePair(lhs, rhs))]
                        })
                    })
                }
            })
        })

        this.tripleWeights = alignProbabilities(tripleWeights)
        this.forbidSameTripleInMultipleSubsets = forbidSameTripleInMultipleSubsets
        this.subsets = subsets
    }

    sample(nSamples: number) {
        const possibleTriples = Object.keys(this.tripleWeights)

        let i = 0

        // console.log(`N samples (input) = ${nSamples}`)

        let maximumNgenerableTriples = possibleTriples.length - this.seenTriples.size

        // console.log(maximumNgenerableTriples)

        if (this.forbidSameTripleInMultipleSubsets) {
            maximumNgenerableTriples /= this.subsets.length
        }

        nSamples = Math.min(maximumNgenerableTriples, nSamples)

        // console.log(`N samples (output) = ${nSamples}`)

        const seenTriples = new Set(this.seenTriples)

        // console.log(seenTriples)
        // console.log(possibleTriples)

        while (i < nSamples) {
            let sampledTriple = sample(this.tripleWeights, triple => seenTriples.has(triple))  // Sampled triple must not be added manually

            if (sampledTriple === undefined) {  // If cannot sample a random triple N times in a row, then just pick the next one which has not yet been picked
                let j = 0
                while (seenTriples.has(possibleTriples[j])) {
                    j += 1
                }
                // console.log(i, nSamples)
                // console.log('found sampled triple manually')
                // console.log(j)
                // console.log(seenTriples)
                // console.log(possibleTriples)
                // console.log(possibleTriples[j])
                sampledTriple = possibleTriples[j]
            }

            const wrappedTriple = this.stringToWrappedTriple(sampledTriple)

            // console.log(`Sampled triple ${sampledTriple}`)
            // console.log(`Duplicated: ${seenTriples.has(sampledTriple)}`)
            // console.log(seenTriples)
            // console.log(sampledTriple)

            wrappedTriple.descriptions.forEach(description => seenTriples.add(description))

            if (wrappedTriple.subset.filename in this.triples) {
                if (this.nRepetitions < 2) {
                    this.triples[wrappedTriple.subset.filename].push(wrappedTriple)
                } else {
                    for (let j = 0; j < this.nRepetitions; j += 1) {
                         this.triples[wrappedTriple.subset.filename].push(wrappedTriple.copy(j))
                    }
                }
            } else {
                if (this.nRepetitions < 2) {
                    this.triples[wrappedTriple.subset.filename] = [wrappedTriple]
                } else {
                    this.triples[wrappedTriple.subset.filename] = [...Array(this.nRepetitions).keys()].map(j => wrappedTriple.copy(j))
                }
            }
            i += 1
        }

        return this
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
