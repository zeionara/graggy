import Tar from 'memory-tar-create'

function exportAsArchive(graphs, filename = 'graph.tar.gz') {
    const files = new Tar()

    graphs.forEach(graph => 
        graph.triples.subsets.forEach(subset => {
                const filename = `${graph.name ? graph.name : graph.index}/${subset.config.name}.tsv`

                files.add(
                    {
                        [filename]: {
                            contents: subset.items.map(triple => triple.description).join('\n')
                        }
                    }
                )
            }
        )
    )

    files.gz().download(filename)
    return window.URL.createObjectURL(new Blob(['foo,bar', 'baz,qux'], {type: 'text/csv'}))
}

export { exportAsArchive }
