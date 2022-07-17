import { AbstractGraph } from '@/components/Graph/AbstractGraph'
import { Location } from '@/Location'

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
        // if (this.nNodes == 3) {
        //     this.$refs.nodes[1].rename("enee")
        // } else {
        this.nodeInitialLocations.push(new Location(event.offsetX - this.nodeSize / 2, event.offsetY - this.nodeSize / 2))
        this.nNodes += 1
        this.$emit("addNode", this.nNodes)
        // }
    }

    // Methods for setting parameters of graph elements from parent component

    setConnectorSize(event) {
        this.connectors.forEach(connector => connector.size = event.value)
    }

    setLineThickness(event) {
        this.relations.forEach(relation => relation.thickness = event.value)
    }
}

export { ShapedGraph }
