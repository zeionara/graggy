<template>
    <n-space>
        <n-input type="text" size = "large" v-model:value="name" style = "width: 500px; text-align: left;" placeholder = "Graph name" />
        <n-button tertiary circle type="error" @click="deleteGraph()">
            <n-icon><minus-icon /></n-icon>
        </n-button>
        <n-button tertiary circle type="info" @click="moveUp()">
            <n-icon><arrow-up-icon /></n-icon>
        </n-button>
        <n-button tertiary circle type="info" @click="moveDown()">
            <n-icon><arrow-down-icon /></n-icon>
        </n-button>
    </n-space>
    <div class = "graph" :style="`background-color:${this.bgColor};`" ref = "element"
        @mousedown.ctrl="startDrawingRelationLine" @mousemove="drawLineSegment" @mouseup.ctrl="stopDrawingRelationLine"
    >
        <Node 
            v-for = "i in nNodes" v-bind:key = "i - 1" ref = "nodes"
            :size = "nodeSize" :enableRenameMode = "enableNodeRenameMode" :id = "`entity-${i - 1}`" 
            :initialX = "nodeInitialLocations[i - 1].x" :initialY = "nodeInitialLocations[i - 1].y"
        />
        <canvas class = "graph-canvas" width = "1024" height = "640" @mousedown.exact="addNode"></canvas>
    </div>
</template>

<script lang='ts'>
import { Options } from 'vue-class-component';
import { NInput, NIcon, NButton, NSpace } from 'naive-ui'
import { RemoveOutline as MinusIcon, ArrowDownOutline as ArrowDownIcon, ArrowUpOutline as ArrowUpIcon } from '@vicons/ionicons5'

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
        NInput, NIcon, NButton, NSpace, Node, MinusIcon, ArrowDownIcon, ArrowUpIcon
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
</style>
