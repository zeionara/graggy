import GraphExportWrapper from './GraphExportWrapper'
import TripleExportWrapper from './TripleExportWrapper'
import SubsetExportWrapper from './SubsetExportWrapper'
import NodePair from './NodePair'

import { sample } from '@/random'
import { Triple } from '@/Triple'


export default class IntraRepetitionSamplingStrategy {
    nSamples: number

    constructor(nSamples: number) {
        this.nSamples = nSamples
    }
    
    sample(wrappedGraph: GraphExportWrapper) {
        const tripleWeights = {};

        wrappedGraph.graph.nodes.forEach(lhs => {
            wrappedGraph.graph.nodes.forEach(rhs => {
                if (lhs !== rhs) {
                    wrappedGraph.relations.forEach(relation => {
                        wrappedGraph.subsets.forEach(subset => {
                            tripleWeights[
                                wrappedGraph.wrappedTripleToString(
                                    new TripleExportWrapper(
                                        new Triple(lhs, relation, rhs),
                                        new SubsetExportWrapper(subset),
                                        wrappedGraph.graph,
                                        wrappedGraph.subsets,
                                        wrappedGraph.forbidSameTripleInMultipleSubsets
                                    )
                                )
                            ] = wrappedGraph.nRelationInstances[wrappedGraph.relationToString(relation)] + wrappedGraph.nNodePairInstances[wrappedGraph.nodePairToString(new NodePair(lhs, rhs))]
                        })
                    })
                }
            })
        })

        const possibleTriples = Object.keys(tripleWeights)

        let i = 0
        let maximumNgenerableTriples = possibleTriples.length - wrappedGraph.seenTriples.size

        if (wrappedGraph.forbidSameTripleInMultipleSubsets) {
            maximumNgenerableTriples /= wrappedGraph.subsets.length
        }

        const nSamples = Math.min(maximumNgenerableTriples, this.nSamples)

        const seenTriples = new Set(wrappedGraph.seenTriples)

        while (i < nSamples) {
            let sampledTriple = sample(tripleWeights, triple => seenTriples.has(triple))  // Sampled triple must not be added manually

            if (sampledTriple === undefined) {  // If cannot sample a random triple N times in a row, then just pick the next one which has not yet been picked
                let j = 0
                while (seenTriples.has(possibleTriples[j])) {
                    j += 1
                }
                sampledTriple = possibleTriples[j]
            }

            const wrappedTriple = wrappedGraph.stringToWrappedTriple(sampledTriple)

            wrappedTriple.descriptions.forEach(description => seenTriples.add(description))

            if (wrappedGraph.nRepetitions < 2) {
                wrappedGraph.store.push(wrappedTriple.subset.filename, wrappedTriple)
            } else {
                wrappedGraph.store.pushMany(wrappedTriple.subset.filename, [...Array(wrappedGraph.nRepetitions).keys()].map(j => wrappedTriple.copy(j)))
            }

            i += 1
        }

        return wrappedGraph
    }
}
