<template>
    <n-space justify="center">
        <n-space vertical>
            <Graph v-for = "i in 2" ref = "graphs" v-bind:key = "i"
                v-bind:nodeSize = "nodeSize" v-bind:nAnchorPointsPerEdge = "nAnchorPointsPerEdge" v-bind:enableGrid = "gridSwitch" v-bind:gridColor = "gridColor"
                v-bind:currentSubset = "currentSubset" v-bind:currentRelation = "currentRelation" v-bind:relationLineThickness = "relationLineThickness"
                v-bind:enableConnectorAutoAlignment = "connectorAutoAlignmentSwitch" v-bind:connectorSize = "connectorSize" v-bind:enableStraightLines = "straightLinesSwitch"
                v-bind:enableNodeRenameMode = "nodeRenameSwitch" v-bind:enableLiveRedraw = "liveRedrawSwitch" v-bind:bgColor = "bgColor" v-bind:index = "i - 1"
            />
        </n-space>
        <n-space vertical>
            <n-divider title-placement = "left">
                Graph properties
            </n-divider>
            <Switch purpose="relation connector automatic alignment" v-bind:defaultValue = "connectorAutoAlignmentSwitch" @update-value = "updateSwitchValue" />
            <Switch purpose="straight lines drawing" v-bind:defaultValue = "straightLinesSwitch" @update-value = "updateSwitchValue" />
            <Switch purpose="grid" v-bind:defaultValue = "gridSwitch" @update-value = "updateSwitchValue" />
            <Switch purpose="node rename mode" v-bind:defaultValue = "nodeRenameSwitch" @update-value = "updateSwitchValue($event); forEachGraph(graph => graph.toggleNodeRenameMode($event))" />
            <Switch purpose="live redraw" v-bind:defaultValue = "liveRedrawSwitch" @update-value = "updateSwitchValue" />
            <Slider
                purpose="connector size" v-bind:defaultValue = "connectorSize" @update-value = "updateSliderValue($event); forEachGraph(graph => {graph.setConnectorSize($event); graph.liveRedraw()})"
                v-bind:min = "connectorSizeMin" v-bind:max = "connectorSizeMax" v-bind:step = "connectorSizeStep"
            />
            <Slider
                purpose="line thickness" v-bind:defaultValue = "relationLineThickness" @update-value = "updateSliderValue($event); redrawGraph();"
                v-bind:min = "relationLineThicknessMin" v-bind:max = "relationLineThicknessMax" v-bind:step = "relationLineThicknessStep"
            />
            <Slider
                purpose="grid density" v-bind:defaultValue = "nAnchorPointsPerEdge" @update-value = "updateSliderValue($event); toggleGrid(gridSwitch);"
                v-bind:min = "nAnchorPointsPerEdgeMin" v-bind:max = "nAnchorPointsPerEdgeMax" v-bind:step = "nAnchorPointsPerEdgeStep"
            />
            <n-space>
                <n-button type="primary" @click="this.export()">export</n-button>
                <n-button type="info" @click="forEachGraph(graph => graph.redraw())" :disabled="liveRedrawSwitch">redraw</n-button>
                <n-button type="error" disabled>clear</n-button>
            </n-space>
            <n-divider title-placement = "left">
                Relation properties
            </n-divider>
            <RelationsPane @current-relation-change = "setCurrentRelation" @redraw-graph = "redrawGraph"/>
            <n-divider title-placement = "left">
                Subset properties
            </n-divider>
            <SubsetsPane @current-subset-change = "setCurrentSubset" @redraw-graph = "redrawGraph"/>
            <n-space>
                <p class = "exported-graph" style = "text-align: left">Draw graph and then click export button</p>
            </n-space>
        </n-space>
    </n-space>
</template>

<script lang="ts">
import { NSwitch, NButton, NSpace, NSelect, NCode, NInput, NDivider, NColorPicker, NRadioGroup, NRadio, NIcon } from 'naive-ui'
import { AddOutline as PlusIcon } from '@vicons/ionicons5'
import interact from 'interactjs';
import { Options, Vue } from 'vue-class-component';
import { Node } from '@/Node'
import { Graph as GraphC } from '@/Graph'
import { Location } from '@/Location'
import { NodeAnchorPoint } from '@/NodeAnchorPoint'
import { drawLineSegment } from '@/drawing/relationLine'
import { drawAnchoredConnectorAndAdjacentLineSegment, drawConnector, drawTerminalAnchoredConnectorAndAdjacentLineSegment, drawTerminalConnector } from '@/drawing/connectors'
import { Watch } from 'vue-property-decorator'
import { RelationConfig } from '@/relation/RelationConfig'
import { SubsetConfig } from '@/subset/SubsetConfig'
import App from '@/App.vue'

import RelationsPane from '@/components/RelationsPane.vue'
import SubsetsPane from '@/components/SubsetsPane.vue'
import Switch from '@/components/Switch.vue'
import Slider from '@/components/Slider.vue'
import Graph from '@/components/Graph.vue'

@Options({
  components: {
    NSwitch, NButton, NSpace, NSelect, NCode, NInput, NDivider, NColorPicker, NRadioGroup, NRadio, PlusIcon, NIcon, App,
    RelationsPane, SubsetsPane, Switch, Slider, Graph
  }
})
export default class HelloWorld extends Vue {
    connectorSize: number = App.config.connector.size
    connectorSizeStep: number = App.config.connector.step
    connectorSizeMin: number = App.config.connector.min
    connectorSizeMax: number = App.config.connector.max

   relationLineThickness: number = App.config.line.thickness
   relationLineThicknessStep: number = App.config.line.step
   relationLineThicknessMin: number = App.config.line.min
   relationLineThicknessMax: number = App.config.line.max

   nAnchorPointsPerEdge: number = App.config.grid['n-anchor-points-per-edge']
   nAnchorPointsPerEdgeStep: number = App.config.grid.step
   nAnchorPointsPerEdgeMin: number = App.config.grid.min
   nAnchorPointsPerEdgeMax: number = App.config.grid.max

    testSwitch: boolean = App.config.switch.test

   x!: number
   y!: number
   connectorAutoAlignmentSwitch: boolean = App.config.switch['connector-auto-alignment']
   straightLinesSwitch: boolean = App.config.switch['straight-lines']
   gridSwitch: boolean = App.config.switch.grid
   nodeRenameSwitch: boolean = App.config.switch['node-rename']
   liveRedrawSwitch: boolean = App.config.switch['live-redraw']
   currentRelation: RelationConfig = null
   currentSubset: SubsetConfig = null

   currentHeadConnectorLocation!: Location

   bgColor = App.config.graph["bg-color"]
   gridColor = App.config.graph["grid-color"]
   nodeSize = App.config.node.size

   graphs: GraphC[] = []

    updateSwitchValue(event) {
        switch (event.purpose) {
            case 'grid':
                this.gridSwitch = event.value
                break;
            case 'straight lines drawing':
                this.straightLinesSwitch = event.value
                break;
            case 'relation connector automatic alignment':
                this.connectorAutoAlignmentSwitch = event.value
                break;
            case 'node rename mod':
                this.nodeRenameSwitch = event.value
                break;
            case 'live redraw':
                this.liveRedrawSwitch = event.value
                break;
        }
    }

    updateSliderValue(event) {
        switch (event.purpose) {
            case 'connector size':
                this.connectorSize = event.value
                this.graphs.forEach(graph => graph.connectors.forEach(connector => connector.size = event.value))
                break;
            case 'line thickness':
                this.relationLineThickness = event.value
                this.graphs.forEach(graph => graph.relations.forEach(relation => relation.thickness = event.value))
                break;
            case 'grid density':
                this.nAnchorPointsPerEdge = event.value
                this.graphs.forEach(graph => graph.gridStep = this.nodeSize / (this.nAnchorPointsPerEdge + 1))
                break;
        }
    }

   setCurrentRelation(value: RelationConfig) {
        console.log(value)
        this.currentRelation = value
   }

   setCurrentSubset(value: SubsetConfig) {
        console.log(value)
        this.currentSubset = value
   }

   export() {
       const content = this.graphs[0].triples.subsets.map(subset =>
            ([subset.config.name, ''].concat(subset.items.map(triple => triple.description))).join('<br/>')
       ).join('<br/>')

       document.getElementsByClassName('exported-graph')[0].innerHTML = content
   }

   mounted() {
       // // Wrap all graphs on the page into typescript objects

       // const gridStep = this.nodeSize / (this.nAnchorPointsPerEdge + 1)

       // Array.prototype.forEach.call(document.getElementsByClassName('graph'), (graph) => {
       //     this.graphs.push(new GraphC(graph, this.gridSwitch, gridStep, this.gridColor))
       // })

       //  if (this.gridSwitch) {
       //      this.toggleGrid(this.gridSwitch)
       //  }

       // this.graphs.forEach((graph) => {
       //     graph.element.onmousedown = (event) => {
       //         if (event.ctrlKey) {
       //             const graph = this.findTargetGraph(event)

       //             graph.currentRelation = this.currentRelation
       //             graph.changeCurrentRelationSubset(this.currentSubset)
       //             graph.currentRelationLineThickness = this.relationLineThickness

       //             const canvas = graph.canvas
       //             const ctx = canvas.getContext('2d');

       //             // set line stroke and line width

       //             if (this.connectorAutoAlignmentSwitch) {
       //                 this.currentHeadConnectorLocation = drawAnchoredConnectorAndAdjacentLineSegment(
       //                     graph, ctx, event, this.connectorSize, this.nAnchorPointsPerEdge, this.straightLinesSwitch
       //                 )
       //             } else {
       //                 this.currentHeadConnectorLocation = drawConnector(graph, ctx, event, this.connectorSize, this.straightLinesSwitch)
       //             }

       //             graph.drawingRelation = true
       //         } else {
       //             if (!(event.target as HTMLElement).classList.contains('node') && !((event.target as HTMLElement).parentNode as HTMLElement).classList.contains('node')) {
       //                 new Node(this.findTargetGraph(event).data_attribute_name, event.offsetX, event.offsetY, this.nodeSize, this.nodeRenameSwitch, 'nothing')
       //             }
       //         }
       //     }

       //     graph.element.onmousemove = (event) => {
       //         drawLineSegment(graph, event, this.straightLinesSwitch)
       //     }

       //     graph.element.onmouseup = (event) => {
       //         if (event.target == graph.canvas) {
       //             const canvas = graph.canvas
       //             graph.drawingRelation = false
       //             const ctx = canvas.getContext('2d');
       //             ctx.fillStyle = this.currentRelation.color

       //             if (this.connectorAutoAlignmentSwitch) {
       //                 drawTerminalAnchoredConnectorAndAdjacentLineSegment(graph, ctx, event, this.connectorSize, this.nAnchorPointsPerEdge, this.straightLinesSwitch)
       //             } else {
       //                 drawTerminalConnector(graph, ctx, event, this.connectorSize, this.straightLinesSwitch)
       //             }
       //         }
       //     }
       // })
       //  
       //  if (!this.gridSwitch) {
       //     interact('.node.unlocked').draggable(
       //         {
       //             inertia: true,
       //             modifiers: [
       //                 interact.modifiers.restrictRect(
       //                     {
       //                         restriction: 'parent',
       //                         endOnly: true
       //                     }
       //                 )
       //             ],
       //             listeners: {
       //                 move(event) {
       //                     if (!event.target.style.x) {
       //                         event.target.style.x = event.delta.x
       //                         event.target.style.y = event.delta.y
       //                     } else {
       //                         var nextX = parseFloat(event.target.style.x) + parseFloat(event.delta.x)
       //                         var nextY = parseFloat(event.target.style.y) + parseFloat(event.delta.y)
       //                         event.target.style.x = nextX
       //                         event.target.style.y = nextY
       //                     }

       //                     event.target.style.transform = `translate(${event.target.style.x}px, ${event.target.style.y}px)`
       //                 }
       //             }
       //         }
       //     )
       //  }
   }

   findTargetGraph(event) {
       let targetGraph: GraphC

       this.graphs.forEach((graph) => {
           if (graph.canvas == event.target) {
               targetGraph = graph
           }
       })

       return targetGraph
   }

   toggleNodeRenameMode(value: boolean) {
       this.graphs.forEach((graph) => {
            graph.nodes.forEach((node) => {
                node.toggleNameChangeability(value)
            })
       })
   }

   @Watch('gridSwitch')
   toggleGrid(value: boolean, redraw = true) {
       if (value) {
           let targets: NodeAnchorPoint[]

           this.graphs.forEach((graph) => {
               graph.enableGrid = true
               const targets = graph.redraw(redraw)

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
                               if (event.target.parentElement == graph.element) {
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
                   }
               )
           })
       } else {
           this.graphs.forEach((graph) => {
               graph.enableGrid = false
               graph.redraw(redraw)
               // const ctx = graph.canvas.getContext('2d')
               // ctx.clearRect(0, 0, graph.width, graph.height)
               // graph.draw()
           })

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

   @Watch("liveRedrawSwitch")
   toggleLiveRedrawMode() {
     this.redrawGraph()
   }

   redrawGraph() {
        // console.log('wtd')
        // console.log(this.$refs.graph && this.$refs.graph.completedInitialization)
        // if (this.$refs.graph && this.$refs.graph.completedInitialization) { 
        //     const graph = this.$refs.graph
        //     console.log('redrawing graph from parent')
        //     const res = graph.redraw()
        //     console.log(res)
        // }
        // if (this.liveRedrawSwitch) {
        //     this.redrawAllGraphs()
        // }
        if (this.$refs.graphs) {
            (this.$refs.graphs as Graph[]).forEach(graph => graph.liveRedraw())
        }
   }

    redrawAllGraphs() {
        this.graphs.forEach((graph) => {
            graph.redraw()
        })
    }

    forEachGraph(callback: (graph: Graph) => undefined) {
        if (this.$refs.graphs) {
            (this.$refs.graphs as Graph[]).forEach(callback)
        }
    }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.graph {
    width: 1024px;
    height: 640px;
}
.node {
    background-color: red;
    position: absolute;
}
.graph-canvas {
    // position: absolute;
    // left: 7px;
    // left: 0;
}
html,body {
    margin: 0 !important;
    padding: 0 !important;
}
</style>
