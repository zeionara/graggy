import { AbstractGraph } from '@/components/Graph/AbstractGraph'
import { Node } from '@/Node'
import { NodeElementCSSStyleDeclaration } from '@/NodeElementCSSStyleDeclaration'

class ShapedGraph extends AbstractGraph {

    // Values set by external sliders

    connectorSize!: number
    relationLineThickness!: number
    nAnchorPointsPerEdge!: number

    // Values set by external switches

    enableConnectorAutoAlignment!: boolean
    enableStraightLines!: boolean
    enableGrid!: boolean
    enableNodeRenameMode!: boolean
    enableLiveRedraw!: boolean

    // Static values read from config

    bgColor!: string
    gridColor!: string
    nodeSize!: number

    // Local values which are used for internal rendering and tracking current graph's state

    drawingRelation = false
    currentHeadConnectorLocation!: Location

    // Computed properties

    get element(): Element {
        return this.$refs.element as Element
    }

    get gridStep(): number {
        return this.nodeSize / (this.nAnchorPointsPerEdge + 1)
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

    get width() {
        return this.element.getBoundingClientRect().width
    }

    get height() {
        return this.element.getBoundingClientRect().height
    }

    // New node creation implementation

    addNode(event) {
        if (!(event.target as HTMLElement).classList.contains('node') && !((event.target as HTMLElement).parentNode as HTMLElement).classList.contains('node')) {
            const node = new Node(this.data_attribute_name, event.offsetX, event.offsetY, this.nodeSize, this.enableNodeRenameMode, `entity-${this.nodes.length}`)
            this.element.insertBefore(node.element, this.element.firstChild)
            this.nodes.push(node)

            const nodeStyle = node.element.style as NodeElementCSSStyleDeclaration

            nodeStyle.x = (event.offsetX - node.element.getBoundingClientRect().width / 2).toString()
            nodeStyle.y = (event.offsetY - node.element.getBoundingClientRect().height / 2).toString()
            nodeStyle.transform = `translate(${nodeStyle.x}px, ${nodeStyle.y}px)`
        }
    }

    // Methods for setting parameters of graph elements from parent component

    setConnectorSize(event) {
        this.connectors.forEach(connector => connector.size = event.value)
    }

    setLineThickness(event) {
        this.relations.forEach(relation => relation.thickness = event.value)
    }

    toggleNodeRenameMode(event) {
        this.nodes.forEach(node => node.toggleNameChangeability(event.value))
    }
}

export { ShapedGraph }
