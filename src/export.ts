import Tar from 'memory-tar-create'
import { Triple, TripleWithGraph } from '@/Triple'

function generateAdditionalTriples(triples: TripleWithGraph[]) {
    return triples
}

function exportAsArchive(graphs, filename = 'graph.tar.gz') {
    const files = new Tar()
    const triples = {}

    graphs.forEach(graph =>
        graph.triples.subsets.forEach(subset => {
                const filename = `${subset.config.name}.tsv`
                const filepath = `${graph.name ? graph.name : graph.index}/${filename}`

                files.add(
                    {
                        [filepath]: {
                            contents: subset.items.map(triple => {
                                if (filename in triples) { 
                                    triples[filename].push(new TripleWithGraph(triple, graph))
                                } else {
                                    triples[filename] = [new TripleWithGraph(triple, graph)]
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
