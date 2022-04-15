<template>
    <div class = "graph" :style="`background-color:${this.bgColor};`"
        @mousedown.ctrl="startDrawingRelationLine($event)"
        @mouseup.ctrl="stopDrawingRelationLine($event)"
        @mousedown.exact="addNode($event)"
        @mousemove="drawLineSegment($event)"
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

@Options({
    components: {
    },
    props: {
        nodeSize: Number, nAnchorPointsPerEdge: Number, enableGrid: Boolean, gridColor: String, currentSubset: SubsetConfig, currentRelation: RelationConfig,
        relationLineThickness: Number, enableConnectorAutoAlignment: Boolean, connectorSize: Number, enableStraightLines!: Boolean, enableNodeRenameMode: Boolean, bgColor: String,
        enableLiveRedraw: Boolean, index: Number
    }
})
export default class Graph extends Vue {
    nodeSize!: number
    nAnchorPointsPerEdge!: number

    enableGrid!: boolean
    gridColor!: string
    bgColor!: string

    currentSubset!: SubsetConfig
    currentRelation!: RelationConfig

    relationLineThickness!: number
    enableConnectorAutoAlignment!: boolean
    connectorSize!: number
    enableStraightLines!: boolean
    enableNodeRenameMode!: boolean
    enableLiveRedraw!: boolean
    index!: number

    element: Element
    drawingRelation = false
    nEntities = 0
    nodes: Node[] = []
    completedInitialization = false

    triples = new TripleSet()
    connectors: Connector[] = []
    relations: Relation[] = []

    currentHeadConnectorLocation!: Location
    currentHeads: Node[] = []

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

    // appendNode(node: Node) {
    //     // node.id = `entity-${this.nEntities++}`
    //     // this.element.appendChild(node.element)
    //     this.element.insertBefore(node.element, this.element.firstChild)
    //     this.nodes.push(node)
    // }

    startDrawingRelationLine(event: Event) {
        console.log('current subset in graph')
        console.log(this.currentSubset)
        const canvas = this.canvas
        const ctx = canvas.getContext('2d');

        if (this.enableConnectorAutoAlignment) {
            this.currentHeadConnectorLocation = drawAnchoredConnectorAndAdjacentLineSegment(
                this, ctx, event, this.connectorSize, this.nAnchorPointsPerEdge, this.enableStraightLines
            )
        } else {
            this.currentHeadConnectorLocation = drawConnector(this, ctx, event, this.connectorSize, this.enableStraightLines)
        }

        this.drawingRelation = true
        console.log(';;;')
        console.log(this.currentSubset)
    }
    
    drawLineSegment(event: Event) {
        drawLineSegment(this, event, this.enableStraightLines)
    }

    stopDrawingRelationLine(event: Event) {
        if (event.target == this.canvas) {
            const canvas = this.canvas
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = this.currentRelation.color

            if (this.enableConnectorAutoAlignment) {
                drawTerminalAnchoredConnectorAndAdjacentLineSegment(this, ctx, event, this.connectorSize, this.nAnchorPointsPerEdge, this.enableStraightLines)
            } else {
                drawTerminalConnector(this, ctx, event, this.connectorSize, this.enableStraightLines)
            }

            this.drawingRelation = false
        }
    }

    addNode(event) {
        if (!(event.target as HTMLElement).classList.contains('node') && !((event.target as HTMLElement).parentNode as HTMLElement).classList.contains('node')) {
            const node = new Node(this.data_attribute_name, event.offsetX, event.offsetY, this.nodeSize, this.enableNodeRenameMode, `entity-${this.nEntities++}`)
            this.element.insertBefore(node.element, this.element.firstChild)
            this.nodes.push(node)

            const nodeStyle = node.element.style as NodeElementCSSStyleDeclaration

            nodeStyle.x = (event.offsetX - node.element.getBoundingClientRect().width / 2).toString()
            nodeStyle.y = (event.offsetY - node.element.getBoundingClientRect().height / 2).toString()
            nodeStyle.transform = `translate(${nodeStyle.x}px, ${nodeStyle.y}px)`
        }
    }

    mounted() {
        this.element = document.getElementsByClassName('graph')[this.index]

        console.log(`Mounting ${this.index} graph`)

        if (this.enableGrid) {
            this.toggleGrid(this.enableGrid)
        }

        if (!this.enableGrid) {
            interact('.node.unlocked').draggable(
                {
                    inertia: true,
                    modifiers: [
                        interact.modifiers.restrictRect({
                            restriction: 'parent',
                            endOnly: true
                        }),
                    ],
                    listeners: {
                        move(event) {
                            if (!event.target.style.x) {
                                event.target.style.x = event.delta.x
                                event.target.style.y = event.delta.y
                            } else {
                                var nextX = parseFloat(event.target.style.x) + parseFloat(event.delta.x)
                                var nextY = parseFloat(event.target.style.y) + parseFloat(event.delta.y)
                                event.target.style.x = nextX
                                event.target.style.y = nextY
                            }

                            event.target.style.transform = `translate(${event.target.style.x}px, ${event.target.style.y}px)`
                        }
                    }
                }
            )
        }

        this.completedInitialization = true
    }

   @Watch('enableGrid')
   toggleGrid(value: boolean, redraw = true) {
       if (value) {
           // this.enableGrid = true
           const targets = this.redraw()

           interact('.node.unlocked').draggable(
               {
                   inertia: false,
                   modifiers: [
                         interact.modifiers.restrictRect(
                             {
                                 restriction: 'parent',
                                 endOnly: true
                             }
                         )
                   ],
                   listeners: {
                       move(event) {
                           let nextX: number
                           let nextY: number

                           if (!event.target.style.virtualX) {
                               if (event.target.style.x) {
                                   nextX = parseFloat(event.target.style.x)
                                   nextY = parseFloat(event.target.style.y)
                               } else {
                                   nextX = event.delta.x
                                   nextY = event.delta.y
                               }
                           } else {
                               nextX = parseFloat(event.target.style.virtualX) + parseFloat(event.delta.x)
                               nextY = parseFloat(event.target.style.virtualY) + parseFloat(event.delta.y)
                           }

                           event.target.style.virtualX = nextX
                           event.target.style.virtualY = nextY

                           const closestTarget = targets.map(
                               target => [target, target.measureDistance(nextX, nextY)]
                           ).sort(
                               (lhs, rhs) => (lhs[1] as number) - (rhs[1] as number)
                           )[0][0] as NodeAnchorPoint

                           event.target.style.x = closestTarget.x
                           event.target.style.y = closestTarget.y

                           event.target.style.transform = `translate(${closestTarget.x}px, ${closestTarget.y}px)`
                       }
                   }
               }
           )
       } else {
           this.redraw()

           interact('.node.unlocked').draggable(
               {
                   inertia: true,
                   modifiers: [
                       interact.modifiers.restrictRect(
                           {
                               restriction: 'parent',
                               endOnly: true
                           }
                       )
                   ],
                   listeners: {
                       move(event) {
                           if (event.target.style.virtualX) {
                               delete event.target.style.virtualX
                               delete event.target.style.virtualY
                           }

                           if (!event.target.style.x) {
                               event.target.style.x = event.delta.x
                               event.target.style.y = event.delta.y
                           } else {
                               var nextX = parseFloat(event.target.style.x) + parseFloat(event.delta.x)
                               var nextY = parseFloat(event.target.style.y) + parseFloat(event.delta.y)
                               event.target.style.x = nextX
                               event.target.style.y = nextY
                           }

                           event.target.style.transform = `translate(${event.target.style.x}px, ${event.target.style.y}px)`
                       }
                   }
               }
           )
       }
    }

    get width() {
        return this.element.getBoundingClientRect().width
    }

    get height() {
        return this.element.getBoundingClientRect().height
    }

    push_triples(tails: Node[]) {
        const triples: Triple[] = []

        tails.forEach((tail) => {
            this.currentHeads.forEach((head) => {
                triples.push(new Triple(head, this.currentRelation, tail))
            })
        })

        this.triples.push(triples, this.currentSubset)
    }

    push_connector(connector: Connector) {
        this.connectors.push(connector)
    }

    push_relation(relation: Relation) {
        this.relations.push(relation)
    }

    push_relation_segment(segment: Location) {
        const last_relation = this.relations[this.relations.length - 1] as UserDefinedPathRelation
        last_relation.segments.push(segment)
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

    redraw(drawingEnabled = true) {
        console.log('redrawing')

        const ctx = this.canvas.getContext('2d')
        let targets: NodeAnchorPoint[]

        if (drawingEnabled) {
            ctx.clearRect(0, 0, this.width, this.height)
        }

        if (this.enableGrid) {
            targets = drawGrid(this, this.gridStep, this.gridColor, 1, drawingEnabled)
        }

        if (drawingEnabled) {
            this.draw()
        }

        return targets
    }

    setConnectorSize(event) {
        this.connectors.forEach(connector => connector.size = event.value)
    }

    toggleNodeRenameMode(event) {
        this.nodes.forEach(node => node.toggleNameChangeability(event.value))
    }
}
</script> 

<style scoped lang="scss">
.graph {
    width: 1024px;
    height: 640px;
}
.node {
    background-color: red;
    position: absolute;
}
</style>
