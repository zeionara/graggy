import { h, createApp } from 'vue';

import { AbstractGraph } from '@/components/Graph/AbstractGraph'
import Node from '@/components/Node/Node.vue'
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

    tmpNode = h(
                Node,
                {
                    // propsData: {
                        size: this.nodeSize,
                        initialX: 100,
                        initialY: 100,
                        enableRenameMode: this.enableNodeRenameMode,
                        id: `entity-${this.nodes.length}`,
                    // }
                }
            )


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
        // const node = new Node(this.data_attribute_name, event.offsetX, event.offsetY, this.nodeSize, this.enableNodeRenameMode, `entity-${this.nodes.length}`)
        // this.nodes.push(
        console.log(this.$refs.node)
        const node = h(
                Node,
                {
                    // propsData: {
                        size: this.nodeSize,
                        initialX: event.offsetX - this.nodeSize / 2,
                        initialY: event.offsetY - this.nodeSize / 2,
                        enableRenameMode: this.enableNodeRenameMode,
                        id: `entity-${this.nodes.length}`,
                    // }
                }
            )

        // this.element.appendChild(node)
        this.nodes.push(node)
        console.log(node)
        // )
        // this.element.insertBefore(node.element, this.element.firstChild)
        // this.nodes.push(node)

        // const nodeStyle = node.element.style as NodeElementCSSStyleDeclaration

        // nodeStyle.x = (event.offsetX - node.element.getBoundingClientRect().width / 2).toString()
        // nodeStyle.y = (event.offsetY - node.element.getBoundingClientRect().height / 2).toString()
        // nodeStyle.transform = `translate(${nodeStyle.x}px, ${nodeStyle.y}px)`
    }

    // Methods for setting parameters of graph elements from parent component

    setConnectorSize(event) {
        this.connectors.forEach(connector => connector.size = event.value)
    }

    setLineThickness(event) {
        this.relations.forEach(relation => relation.thickness = event.value)
    }

    toggleNodeRenameMode(event) {
        console.log("toggling node rename mode...")
        // this.nodes.forEach(node => node.toggleNameChangeability(event.value))
    }
}

export { ShapedGraph }
