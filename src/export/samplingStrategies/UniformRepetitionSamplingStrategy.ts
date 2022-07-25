import GraphExportWrapper from '../GraphExportWrapper'
import TripleExportWrapper from '../TripleExportWrapper'
import SubsetExportWrapper from '../SubsetExportWrapper'

import SamplingStrategy from './SamplingStrategy'

import { pop } from '@/random'
import { Triple } from '@/Triple'


export default class UniformRepetitionSamplingStrategy implements SamplingStrategy {
    label = 'uniform'

    nSamples: number
    allowLoops: boolean

    constructor(nSamples: number, allowLoops: boolean) {
        this.nSamples = nSamples
        this.allowLoops = allowLoops
    }
    
    sample(wrappedGraph: GraphExportWrapper) {
        const possibleTriples = new Set<string>()

        wrappedGraph.graph.nodes.forEach(lhs => {
            wrappedGraph.graph.nodes.forEach(rhs => {
                wrappedGraph.relations.forEach(relation => {
                    wrappedGraph.subsets.forEach(subset => {
                        if (wrappedGraph.nRepetitions < 2) {
                            if (this.allowLoops || lhs !== rhs) {
                                possibleTriples.add(
                                    wrappedGraph.wrappedTripleToString(
                                        new TripleExportWrapper(
                                            new Triple(lhs, relation, rhs),
                                            new SubsetExportWrapper(subset),
                                            wrappedGraph.graph,
                                            wrappedGraph.subsets,
                                            wrappedGraph.forbidSameTripleInMultipleSubsets,
                                            undefined, // i
                                            false // includeGraphIdInTripleDescription
                                        )
                                    )
                                )
                            }
                        } else {
                            for (let i = 0; i < wrappedGraph.nRepetitions; i++) {
                                for (let j = 0; j < wrappedGraph.nRepetitions; j++) {
                                    if (this.allowLoops || !(lhs === rhs && i === j)) {
                                        possibleTriples.add(
                                            wrappedGraph.wrappedTripleToString(
                                                new TripleExportWrapper(
                                                    new Triple(lhs, relation, rhs),
                                                    new SubsetExportWrapper(subset),
                                                    wrappedGraph.graph,
                                                    wrappedGraph.subsets,
                                                    wrappedGraph.forbidSameTripleInMultipleSubsets,
                                                    undefined, // i
                                                    false, // includeGraphIdInTripleDescription
                                                    i, // headIndex
                                                    j  // tailIndex
                                                )
                                            )
                                        )
                                    }
                                }
                            }
                        }
                    })
                })
            })
        })

        const possibleTriplesAsArray = Array.from(possibleTriples)
        let i = 0
        let maximumNgenerableTriples = possibleTriples.size - wrappedGraph.seenTriples.size

        if (wrappedGraph.forbidSameTripleInMultipleSubsets) {
            maximumNgenerableTriples /= wrappedGraph.subsets.length
        }

        const nSamples = Math.min(maximumNgenerableTriples, this.nSamples)

        const seenTriples = new Set(wrappedGraph.seenTriples)
        // console.log(seenTriples)

        while (i < nSamples) {
            // console.log(possibleTriplesAsArray)
            let sampledTriple = undefined

            while(sampledTriple === undefined || seenTriples.has(sampledTriple)) {
                sampledTriple = pop(possibleTriplesAsArray)  // Sampled triple must not be added manually
            }

            if (sampledTriple === undefined) {  // If cannot sample a random triple N times in a row, then just pick the next one which has not yet been picked
                let j = 0
                while (seenTriples.has(possibleTriplesAsArray[j])) {
                    j += 1
                }
                sampledTriple = possibleTriplesAsArray[j]
            }

            console.log(sampledTriple)
            console.log(seenTriples)

            const wrappedTriple = wrappedGraph.stringToWrappedTriple(sampledTriple)

            wrappedTriple.descriptions.forEach(description => seenTriples.add(description))

            wrappedGraph.store.push(wrappedTriple.subset.filename, wrappedTriple.copy())

            // if (wrappedGraph.nRepetitions < 2) {
            //     wrappedGraph.store.push(wrappedTriple.subset.filename, wrappedTriple.copy())
            // } else {
            //     wrappedGraph.store.pushMany(wrappedTriple.subset.filename, [...Array(wrappedGraph.nRepetitions).keys()].map(j => wrappedTriple.copy(j)))
            // }

            i += 1
        }

        return wrappedGraph
    }
}
