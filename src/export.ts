import Tar from 'memory-tar-create'
import { Triple, TripleWithGraph } from '@/Triple'
import { sample, alignProbabilities } from '@/random'

function generateAdditionalTriples(triples: TripleWithGraph[]) {
    return triples
}

function tripleToString(head: string, relation: string, tail: string, subset: string) {
    return `${head} ${relation} ${tail} ${subset}`
}

function nodePairToString(head: string, tail: string) {
    return `${head} ${tail}`
}

function subsetNameToFilename(name: string) {
    return `${name}.tsv`
}

function exportAsArchive(graphs, relations, subsets, filename = 'graph.tar.gz', nRepetitions = 1, nSampledRelations = 0) {
    const files = new Tar()
    const triples = {}

    graphs.forEach(graph => {

            let nRelationInstances = {};
            let nNodePairInstances = {};

            const seenTriples = new Set()

            relations.forEach(relation => {
                nRelationInstances[relation.id] = 0
            })

            graph.nodes.forEach(lhs => {
                graph.nodes.forEach(rhs => {
                    if (lhs !== rhs) {
                        nNodePairInstances[nodePairToString(lhs.id, rhs.id)] = 0
                    }
                })
            })

            graph.triples.subsets.forEach(subset => {
                    const filename = subsetNameToFilename(subset.config.name)
                    const filepath = `${graph.name ? graph.name : graph.index}/${filename}`

                    files.add(
                        {
                            [filepath]: {
                                contents: subset.items.map(triple => {
                                    seenTriples.add(tripleToString(triple.head.id, triple.relation.id, triple.tail.id, subset.config.name))
                                    if (filename in triples) {
                                        if (nRepetitions < 2) {
                                            triples[filename].push(new TripleWithGraph(triple, graph))
                                        } else {
                                            for (let i = 0; i < nRepetitions; i += 1) {
                                                triples[filename].push(new TripleWithGraph(triple, graph, i))
                                            }
                                        }
                                    } else {
                                        if (nRepetitions < 2) {
                                            triples[filename] = [new TripleWithGraph(triple, graph)]
                                        } else {
                                            const currentTriples: TripleWithGraph[] = []

                                            for (let i = 0; i < nRepetitions; i += 1) {
                                                currentTriples.push(new TripleWithGraph(triple, graph, i))
                                            }

                                            triples[filename] = currentTriples
                                        }
                                    }

                                    nRelationInstances[triple.relation.id] += 1
                                    nNodePairInstances[nodePairToString(triple.head.id, triple.tail.id)] += 1

                                    return triple.description  // Repetitions are not written to files corresponding to separate graphs
                                }).join('\n')
                            }
                        }
                    )
                }
            )

            let tripleWeights = {};
            const tripleFromString = {};

            graph.nodes.forEach(lhs => {
                graph.nodes.forEach(rhs => {
                    if (lhs !== rhs) {
                        relations.forEach(relation => {
                            subsets.forEach(subset => {
                                const tripleAsString = tripleToString(lhs.id, relation.id, rhs.id, subset.name)
                                tripleWeights[tripleAsString] = nRelationInstances[relation.id] + nNodePairInstances[nodePairToString(lhs.id, rhs.id)]
                                tripleFromString[tripleAsString] = {
                                    triple: new TripleWithGraph(new Triple(lhs, relation, rhs), graph, nRepetitions < 2 ? undefined : 0),
                                    subset: subsetNameToFilename(subset.name)
                                }
                            })
                        })
                    }
                })
            })
            
            const possibleTriples = Object.keys(tripleWeights)

            let i = 0

            nSampledRelations = Math.min(Object.keys(tripleWeights).length - seenTriples.size, nSampledRelations)

            while (i < nSampledRelations) {
                let sampledTriple = sample(tripleWeights, triple => seenTriples.has(triple))
                if (sampledTriple === undefined) {
                    let j = 0
                    while (seenTriples.has(possibleTriples[j])) {
                        j += 1
                    }
                    sampledTriple = possibleTriples[j]
                    console.log(j)
                }
                seenTriples.add(sampledTriple)
                const restoredTriple = tripleFromString[sampledTriple]
                if (restoredTriple.subset in triples) {
                    triples[restoredTriple.subset].push(restoredTriple.triple)
                } else {
                    triples[restoredTriple.subset] = [restoredTriple.triple]
                }
                i += 1
            }

            console.log(triples)

            nRelationInstances = alignProbabilities(nRelationInstances)
            nNodePairInstances = alignProbabilities(nNodePairInstances)
            tripleWeights = alignProbabilities(tripleWeights)

            // const sampledRelation = sample(nRelationInstances)

            // console.log(nRelationInstances)
            // console.log(nNodePairInstances)
            // console.log(tripleWeights)
        }
    )

    for (const [subsetFilename, subsetTriples] of Object.entries(triples)) {
        files.add(
            {
                [subsetFilename]: {
                    contents: generateAdditionalTriples(subsetTriples as TripleWithGraph[]).map(triple => {
                        return triple.description
                    }).join('\n')
                }
            }
        )
    }

    files.gz().download(filename)
    return window.URL.createObjectURL(new Blob(['foo,bar', 'baz,qux'], {type: 'text/csv'}))
}

export { exportAsArchive }
