import Tar from 'memory-tar-create'
import { Triple, TripleWithGraph } from '@/Triple'

function generateAdditionalTriples(triples: TripleWithGraph) {
    return triples
}

function exportAsArchive(graphs, filename = 'graph.tar.gz') {
    const files = new Tar()
    const triples = new Array<TripleWithGraph>()

    graphs.forEach(graph =>
        graph.triples.subsets.forEach(subset => {
                const filename = `${graph.name ? graph.name : graph.index}/${subset.config.name}.tsv`

                files.add(
                    {
                        [filename]: {
                            contents: subset.items.map(triple => {
                                triples.push(new TripleWithGraph(triple, graph))
                                return triple.description
                            }).join('\n')
                        }
                    }
                )
            }
        )
    )

    files.add(
        {
            'dataset.tsv': {
                contents: triples.map(triple => {
                    return triple.description
                }).join('\n')
            }
        }
    )

    files.gz().download(filename)
    return window.URL.createObjectURL(new Blob(['foo,bar', 'baz,qux'], {type: 'text/csv'}))
}

export { exportAsArchive }
