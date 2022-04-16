<template>
    <div class = "graph" :style="`background-color:${this.bgColor};`" ref = "element"
        @mousedown.ctrl="startDrawingRelationLine" @mousedown.exact="addNode" @mousemove="drawLineSegment" @mouseup.ctrl="stopDrawingRelationLine"
    >
        <canvas class = "graph-canvas" width = "1024" height = "640"></canvas>
    </div>
</template>

<script lang='ts'>
import { Options, Vue } from 'vue-class-component';
import { Watch } from 'vue-property-decorator'

import interact from 'interactjs';

import { drawAnchoredConnectorAndAdjacentLineSegment, drawConnector, drawTerminalAnchoredConnectorAndAdjacentLineSegment, drawTerminalConnector } from '@/drawing/connectors'
import { drawLineSegment } from '@/drawing/relationLine'
import { Location } from '@/Location'
import { SubsetConfig } from '@/subset/SubsetConfig'
import { RelationConfig } from '@/relation/RelationConfig'
import { NodeAnchorPoint } from '@/NodeAnchorPoint'
import { Node } from '@/Node'
import { TripleSet } from '@/TripleSet'
import { Triple } from '@/Triple'
import { Connector } from '@/Connector'
import { Relation } from '@/relation/Relation'
import { UserDefinedPathRelation } from '@/relation/UserDefinedPathRelation'
import { drawGrid } from '@/drawing/grid'
import { NodeElementCSSStyleDeclaration } from '@/NodeElementCSSStyleDeclaration'
import { startDrawingRelationLine, stopDrawingRelationLine } from '@/components/Graph/rendering'
import { makeUnlockedNodesDraggable, makeUnlockedNodesDraggableWithinGrid } from '@/components/Graph/nodeInteractions'
import { AbstractGraph } from '@/components/Graph/AbstractGraph'

@Options({
    components: {
    },
    props: {
        nodeSize: Number, nAnchorPointsPerEdge: Number, enableGrid: Boolean, gridColor: String, currentSubset: SubsetConfig, currentRelation: RelationConfig,
        relationLineThickness: Number, enableConnectorAutoAlignment: Boolean, connectorSize: Number, enableStraightLines!: Boolean, enableNodeRenameMode: Boolean, bgColor: String,
        enableLiveRedraw: Boolean, index: Number
    }
})
export default class Graph extends AbstractGraph {

    // Index of current graph which allows to differentiate it from other graphs

    index!: number

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

    // element: Element
    drawingRelation = false
    // nEntities = 0
    nodes: Node[] = []
    // completedInitialization = false

    currentHeadConnectorLocation!: Location

    get element(): Element {
        return this.$refs.element as Element
    }

    get canvas() {
        return this.element.lastChild as HTMLCanvasElement
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

    startDrawingRelationLine(event: Event) { startDrawingRelationLine(this, event) }
    
    drawLineSegment(event: Event) { drawLineSegment(this, event) }

    stopDrawingRelationLine(event: Event) { stopDrawingRelationLine(this, event) }

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

    mounted() {
        if (this.enableGrid) {
            this.toggleGrid(this.enableGrid)
        } else {
            makeUnlockedNodesDraggable()
        }
    }

   // @Watch('enableGrid')
   toggleGrid(enabled: boolean) {
       const targets = this.redraw(enabled)
       if (enabled) {
           makeUnlockedNodesDraggableWithinGrid(targets)
       } else {
           makeUnlockedNodesDraggable()
       }
    }

    get width() {
        return this.element.getBoundingClientRect().width
    }

    get height() {
        return this.element.getBoundingClientRect().height
    }

    draw() {
        const ctx = this.canvas.getContext('2d')
        this.connectors.forEach(connector => connector.draw(ctx))
        this.relations.forEach(relation => relation.draw(ctx))
    }

    liveRedraw() {
        if (this.enableLiveRedraw) {
            this.redraw()
        }
    }

    redraw(enableGrid = this.enableGrid) {
        const ctx = this.canvas.getContext('2d')
        let targets: NodeAnchorPoint[]

        ctx.clearRect(0, 0, this.width, this.height)

        if (enableGrid) {
            targets = drawGrid(this, this.gridStep, this.gridColor, 1)
        }

        this.draw()

        return targets
    }

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
</script> 

<style lang="scss">
.graph {
    width: 1024px;
    height: 640px;
}
.node {
    background-color: red;
    position: absolute;
}
</style>
