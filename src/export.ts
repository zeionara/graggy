// function exportTriplesToFile(component) {
//     const jsonData = encodeURIComponent('{"is_valid": true}')
//     component.myUrl = `data:text/plain;charset=utf-8,${jsonData}`
//     component.myFilename = 'example.json'
// }
// import AdmZip from 'adm-zip'
import Tar from 'memory-tar-create'

function graphsToString(graphs) {
    // const zip = new AdmZip()
    // const files = new Tar({
    //     'foo.txt': {contents: 'foo'},
    //     'bar.txt': {contents: 'bar'}
    // }).gz();

    const files = new Tar()

    // const content = 'foo,bar'
    // console.log('foo')
    // zip.addFile('baz.txt', Buffer.alloc(content.length, content), 'the first file')
    // console.log('bar')

    // const willSendThis = zip.toBuffer()

    graphs.forEach(graph => 
        graph.triples.subsets.forEach(subset => {
                // console.log(subset.config.name)

                const filename = `${graph.name ? graph.name : graph.index}/${subset.config.name}.tsv`

                files.add(
                    {
                        [filename]: {
                            contents: subset.items.map(triple => triple.description).join('\n')
                        }
                    }
                )
                
                // subset.items.forEach(triple => console.log(triple.description))
            }
        )
    )
    // const jsonData = encodeURIComponent('{"is_valid": true}')
    // return `data:text/plain;charset=utf-8,${jsonData}`
    files.gz().download('graph.tar.gz')
    return window.URL.createObjectURL(new Blob(['foo,bar', 'baz,qux'], {type: 'text/csv'}))
    // return window.URL.createObjectURL(new Blob([files.base64()], {type: 'text/csv'}))
    // return window.URL.createObjectURL(new Blob([willSendThis.toString('utf8')], {type: 'text/csv'}))
}

function graphsToFilename(graphs) {
    // return 'example.json'
    return 'foo-bar.tar.gz'
}

// export { exportTriplesToFile }

export { graphsToString, graphsToFilename }
