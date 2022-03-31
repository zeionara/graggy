import { Node } from '@/Node'

class Graph {
    element: HTMLElement
    nEntities = 0
    nodes: Node[] = []

    currentHeads: string[] = []
    currentRelation: string
    drawingRelation = false

    constructor(element: HTMLElement) {
        this.element = element
    }

    appendNode(node: Node) {
        node.id = `entity-${this.nEntities++}`
        this.element.appendChild(node.element)
        this.nodes.push(node)
    }

    get data_attribute_name() {
        let data_attribute_name: string
        this.element.getAttributeNames().forEach((attribute_name) => {
            if (attribute_name.startsWith('data-v-')) {
                data_attribute_name = attribute_name
            }
        })
        return data_attribute_name
    }

    get canvas() {
        return this.element.firstChild
    }
}

export { Graph }
