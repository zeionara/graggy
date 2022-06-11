// function exportTriplesToFile(component) {
//     const jsonData = encodeURIComponent('{"is_valid": true}')
//     component.myUrl = `data:text/plain;charset=utf-8,${jsonData}`
//     component.myFilename = 'example.json'
// }
import Graph from '@/components/Graph/Graph.vue'

function graphsToString(graphs: typeof Graph[]) {
    const jsonData = encodeURIComponent('{"is_valid": true}')
    return `data:text/plain;charset=utf-8,${jsonData}`
}

function graphsToFilename(graphs: typeof Graph[]) {
    return 'example.json'
}

// export { exportTriplesToFile }

export { graphsToString, graphsToFilename }
