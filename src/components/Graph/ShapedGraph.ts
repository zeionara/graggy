import { h, createApp } from 'vue';

import { AbstractGraph } from '@/components/Graph/AbstractGraph'
import { NodeModel } from '@/components/Node/NodeModel'
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
        // console.log(this.$refs.node)
        this.nodes.push(new NodeModel(this, event))
        // this.nodes.push (
        //     h(
        //         Node,
        //         {
        //             size: this.nodeSize,
        //             initialX: event.offsetX - this.nodeSize / 2,
        //             initialY: event.offsetY - this.nodeSize / 2,
        //             enableRenameMode: this.enableNodeRenameMode,
        //             id: `entity-${this.nodes.length}`,
        //         }
        //     )
        // )
    }

    // Methods for setting parameters of graph elements from parent component

    setConnectorSize(event) {
        this.connectors.forEach(connector => connector.size = event.value)
    }

    setLineThickness(event) {
        this.relations.forEach(relation => relation.thickness = event.value)
    }

    toggleNodeRenameMode(event) {
        console.log('toggle')
        // this.nodes.forEach(node => node.type.methods.toggleNameChangeability(event.value))
    }
}

export { ShapedGraph }
