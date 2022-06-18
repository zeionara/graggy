import Tar from 'memory-tar-create'
import { Triple, TripleWithGraph } from '@/Triple'

function generateAdditionalTriples(triples: TripleWithGraph[]) {
    return triples
}

function exportAsArchive(graphs, filename = 'graph.tar.gz', nRepetitions = 1) {
    const files = new Tar()
    const triples = {}

    console.log(nRepetitions)

    graphs.forEach(graph =>
        graph.triples.subsets.forEach(subset => {
                const filename = `${subset.config.name}.tsv`
                const filepath = `${graph.name ? graph.name : graph.index}/${filename}`

                files.add(
                    {
                        [filepath]: {
                            contents: subset.items.map(triple => {
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
                                return triple.description
                            }).join('\n')
                        }
                    }
                )
            }
        )
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
