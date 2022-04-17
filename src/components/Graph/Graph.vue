<template>
    <div class = "graph" :style="`background-color:${this.bgColor};`" ref = "element"
        @mousedown.ctrl="startDrawingRelationLine" @mousemove="drawLineSegment" @mouseup.ctrl="stopDrawingRelationLine"
    >
        <!--<Node :size = "nodeSize" :initialX = "100" :initialY = "100" :enableRenameMode = "enableNodeRenameMode" id = "entity-foo" ref = "node" />!-->
        <!--<component :is = "tmpNode" />!-->
        <component v-for = "(node, i) in nodes" v-bind:key = "i" :is = "node" />
        <canvas class = "graph-canvas" width = "1024" height = "640" @mousedown.exact="addNode"></canvas>
    </div>
</template>

<script lang='ts'>
import { Options } from 'vue-class-component';

import { drawLineSegment } from '@/drawing/relationLine'
import { SubsetConfig } from '@/subset/SubsetConfig'
import { RelationConfig } from '@/relation/RelationConfig'
import { NodeAnchorPoint } from '@/NodeAnchorPoint'
import { drawGrid } from '@/drawing/grid'
import { startDrawingRelationLine, stopDrawingRelationLine } from '@/components/Graph/rendering'
import { makeUnlockedNodesDraggable, makeUnlockedNodesDraggableWithinGrid } from '@/components/Graph/nodeInteractions'
import { ShapedGraph } from '@/components/Graph/ShapedGraph'
import Node from '@/components/Node/Node.vue'

@Options({
    components: { 
        Node
    },
    props: {
        nodeSize: Number, nAnchorPointsPerEdge: Number, enableGrid: Boolean, gridColor: String, currentSubset: SubsetConfig, currentRelation: RelationConfig,
        relationLineThickness: Number, enableConnectorAutoAlignment: Boolean, connectorSize: Number, enableStraightLines!: Boolean, enableNodeRenameMode: Boolean, bgColor: String,
        enableLiveRedraw: Boolean, index: Number
    }
})
export default class Graph extends ShapedGraph {

    // Computed properties which are directly related to rendering

    get canvas() {
        return this.element.lastChild as HTMLCanvasElement
    }

    mounted() {
        if (this.enableGrid) {
            this.toggleGrid(this.enableGrid)
        } else {
            makeUnlockedNodesDraggable()
        }
    }

    // Methods for drawing parts of graph in response to user actions

    startDrawingRelationLine(event: Event) { startDrawingRelationLine(this, event) }
    
    drawLineSegment(event: Event) { drawLineSegment(this, event) }

    stopDrawingRelationLine(event: Event) { stopDrawingRelationLine(this, event) }

    // Methods which allow to draw graph from zero

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

    // Methods related to drawing grid

    toggleGrid(enabled: boolean) {
        const targets = this.redraw(enabled)
        if (enabled) {
            makeUnlockedNodesDraggableWithinGrid(targets)
        } else {
            makeUnlockedNodesDraggable()
        }
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
