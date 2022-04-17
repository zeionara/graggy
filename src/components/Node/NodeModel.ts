class NodeModel {
    size!: number
    x!: number
    y!: number
    id!: string
    name!: string
    graph

    get enableRenameMode() {
        return this.graph.enableNodeRenameMode
    }

    constructor(graph, event) {
        this.size = graph.nodeSize
        this.x = event.offsetX - graph.nodeSize / 2
        this.y = event.offsetY - graph.nodeSize / 2
        // this.enableRenameMode = enableRenameMode
        this.id = `entity-${graph.nodes.length}`
        this.name = this.id
        this.graph = graph
    }
}

export { NodeModel }
