// import Tar from 'memory-tar-create'
// import { Triple, TripleWithGraph } from '@/Triple'
// import { sample, alignProbabilities } from '@/random'

import { GraphExporter } from '@/export/GraphExporter'
import TripleGenerationStrategy from '@/export/TripleGenerationStrategy'

// function generateAdditionalTriples(triples: TripleWithGraph[]) {
//     return triples
// }
// 
// function tripleToString(head: string, relation: string, tail: string, subset: string = undefined) {
//     if (subset === undefined) {
//         return `${head} ${relation} ${tail}`
//     }
//     return `${head} ${relation} ${tail} ${subset}`
// }
// 
// function nodePairToString(head: string, tail: string) {
//     return `${head} ${tail}`
// }
// 
// function subsetNameToFilename(name: string) {
//     return `${name}.tsv`
// }

function exportAsArchive(graphs, relations, subsets, filename = 'graph.tar.gz', nRepetitions = 1, nSampledRelations = 0, forbidSameTripleInMultipleSubsets = false) {
    const exporter = new GraphExporter(subsets, relations, nRepetitions, forbidSameTripleInMultipleSubsets)
    exporter.export(filename, graphs, new TripleGenerationStrategy())

    // const files = new Tar()
    // const triples = {}

    // graphs.forEach(graph => {

    //         let nRelationInstances = {};
    //         let nNodePairInstances = {};

    //         const seenTriples = new Set()
    //         const seenTriplesWithoutSubset = new Set()

    //         relations.forEach(relation => {
    //             nRelationInstances[relation.id] = 0
    //         })

    //         graph.nodes.forEach(lhs => {
    //             graph.nodes.forEach(rhs => {
    //                 if (lhs !== rhs) {
    //                     nNodePairInstances[nodePairToString(lhs.id, rhs.id)] = 0
    //                 }
    //             })
    //         })

    //         graph.triples.subsets.forEach(subset => {
    //                 const filename = subsetNameToFilename(subset.config.name)
    //                 const filepath = `${graph.name ? graph.name : graph.index}/${filename}`

    //                 files.add(
    //                     {
    //                         [filepath]: {
    //                             contents: subset.items.map(triple => {
    //                                 seenTriples.add(tripleToString(triple.head.id, triple.relation.id, triple.tail.id, subset.config.name))
    //                                 if (forbidSameTripleInMultipleSubsets) {
    //                                     seenTriplesWithoutSubset.add(tripleToString(triple.head.id, triple.relation.id, triple.tail.id))
    //                                     subsets.forEach(anotherSubset => {
    //                                             if (anotherSubset.name !== subset.config.name) {
    //                                                 seenTriples.add(tripleToString(triple.head.id, triple.relation.id, triple.tail.id, anotherSubset.name))
    //                                             }
    //                                        }
    //                                    )
    //                                 }
    //                                 if (filename in triples) {
    //                                     if (nRepetitions < 2) {
    //                                         triples[filename].push(new TripleWithGraph(triple, graph))
    //                                     } else {
    //                                         for (let i = 0; i < nRepetitions; i += 1) {
    //                                             triples[filename].push(new TripleWithGraph(triple, graph, i))
    //                                         }
    //                                     }
    //                                 } else {
    //                                     if (nRepetitions < 2) {
    //                                         triples[filename] = [new TripleWithGraph(triple, graph)]
    //                                     } else {
    //                                         const currentTriples: TripleWithGraph[] = []

    //                                         for (let i = 0; i < nRepetitions; i += 1) {
    //                                             currentTriples.push(new TripleWithGraph(triple, graph, i))
    //                                         }

    //                                         triples[filename] = currentTriples
    //                                     }
    //                                 }

    //                                 nRelationInstances[triple.relation.id] += 1
    //                                 nNodePairInstances[nodePairToString(triple.head.id, triple.tail.id)] += 1

    //                                 return triple.description  // Repetitions are not written to files corresponding to separate graphs
    //                             }).join('\n')
    //                         }
    //                     }
    //                 )
    //             }
    //         )

    //         nRelationInstances = alignProbabilities(nRelationInstances)
    //         nNodePairInstances = alignProbabilities(nNodePairInstances)

    //         let tripleWeights = {};
    //         const tripleFromString = {};

    //         graph.nodes.forEach(lhs => {
    //             graph.nodes.forEach(rhs => {
    //                 if (lhs !== rhs) {
    //                     relations.forEach(relation => {
    //                         subsets.forEach(subset => {
    //                             const tripleAsString = tripleToString(lhs.id, relation.id, rhs.id, subset.name)
    //                             tripleWeights[tripleAsString] = nRelationInstances[relation.id] + nNodePairInstances[nodePairToString(lhs.id, rhs.id)]
    //                             tripleFromString[tripleAsString] = {
    //                                 head: lhs,
    //                                 relation: relation,
    //                                 tail: rhs,
    //                                 subsetObject: subset,
    //                                 makeTriple: (i) => new TripleWithGraph(new Triple(lhs, relation, rhs), graph, i),
    //                                 subset: subsetNameToFilename(subset.name)
    //                             }
    //                         })
    //                     })
    //                 }
    //             })
    //         })

    //         tripleWeights = alignProbabilities(tripleWeights)

    //         const possibleTriples = Object.keys(tripleWeights)

    //         let i = 0

    //         nSampledRelations = Math.min(
    //             (forbidSameTripleInMultipleSubsets ? Object.keys(tripleWeights).length / subsets.length : Object.keys(tripleWeights).length) - (
    //                 forbidSameTripleInMultipleSubsets ? seenTriplesWithoutSubset.size : seenTriples.size
    //             ),
    //             nSampledRelations
    //         )

    //         while (i < nSampledRelations) {
    //             let sampledTriple = sample(tripleWeights, triple => seenTriples.has(triple))
    //             if (sampledTriple === undefined) {
    //                 let j = 0
    //                 while (seenTriples.has(possibleTriples[j])) {
    //                     j += 1
    //                 }
    //                 sampledTriple = possibleTriples[j]
    //             }
    //             seenTriples.add(sampledTriple)

    //             const restoredTriple = tripleFromString[sampledTriple]

    //             if (forbidSameTripleInMultipleSubsets) {
    //                 seenTriplesWithoutSubset.add(tripleToString(restoredTriple.head.id, restoredTriple.relation.id, restoredTriple.tail.id))
    //                 const subset = restoredTriple.subsetObject
    //                 subsets.forEach(anotherSubset => {
    //                         if (anotherSubset.name !== subset.name) {
    //                             seenTriples.add(tripleToString(restoredTriple.head.id, restoredTriple.relation.id, restoredTriple.tail.id, anotherSubset.name))
    //                         }
    //                    }
    //                )
    //             }

    //             if (restoredTriple.subset in triples) {
    //                 if (nRepetitions < 2) {
    //                     triples[restoredTriple.subset].push(restoredTriple.makeTriple(undefined))
    //                 } else {
    //                     for (let j = 0; j < nRepetitions; j += 1) {
    //                          triples[restoredTriple.subset].push(restoredTriple.makeTriple(j))
    //                     }
    //                 }
    //             } else {
    //                 if (nRepetitions < 2) {
    //                     triples[restoredTriple.subset] = [restoredTriple.makeTriple(undefined)]
    //                 } else {
    //                     const currentTriples: TripleWithGraph[] = []

    //                     for (let j = 0; j < nRepetitions; j += 1) {
    //                         currentTriples.push(restoredTriple.makeTriple(j))
    //                     }

    //                     triples[restoredTriple.subset] = currentTriples
    //                 }
    //             }
    //             i += 1
    //         }

    //         // console.log(seenTriples)
    //     }
    // )

    // for (const [subsetFilename, subsetTriples] of Object.entries(triples)) {
    //     files.add(
    //         {
    //             [subsetFilename]: {
    //                 contents: generateAdditionalTriples(subsetTriples as TripleWithGraph[]).map(triple => {
    //                     return triple.description
    //                 }).join('\n')
    //             }
    //         }
    //     )
    // }

    // files.gz().download(filename)
    // return window.URL.createObjectURL(new Blob(['foo,bar', 'baz,qux'], {type: 'text/csv'}))
}

export { exportAsArchive }
