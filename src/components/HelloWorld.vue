<template>
    <n-space justify="center">
        <div class = "graph" :style="`background-color:${this.bgColor};`">
            <canvas class = "graph-canvas" width = "1024" height = "640"></canvas>
        </div>
        <n-space vertical>
            <n-divider title-placement = "left">
                Graph properties
            </n-divider>
            <Switch purpose="relation connector automatic alignment" v-bind:defaultValue = "connectorAutoAlignmentSwitch" @update-value = "updateSwitchValue" />
            <Switch purpose="straight lines drawing" v-bind:defaultValue = "straightLinesSwitch" @update-value = "updateSwitchValue" />
            <Switch purpose="grid" v-bind:defaultValue = "gridSwitch" @update-value = "updateSwitchValue" />
            <Switch purpose="node rename mode" v-bind:defaultValue = "nodeRenameSwitch" @update-value = "updateSwitchValue($event); toggleNodeRenameMode($event.value)" />
            <Switch purpose="live redraw" v-bind:defaultValue = "liveRedrawSwitch" @update-value = "updateSwitchValue" />
            <Slider
                purpose="connector size" v-bind:defaultValue = "connectorSize" @update-value = "updateSliderValue($event); redrawGraph();"
                v-bind:min = "connectorSizeMin" v-bind:max = "connectorSizeMax" v-bind:step = "connectorSizeStep"
            />
            <n-space>
                <n-button type="primary" @click="this.export()">export</n-button>
                <n-button type="info" @click="this.redrawAllGraphs()" :disabled="liveRedrawSwitch">redraw</n-button>
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
import { Graph } from '@/Graph'
import { Location } from '@/Location'
import { NodeAnchorPoint } from '@/NodeAnchorPoint'
import { drawLineSegment } from '@/drawing/relation_line'
import { drawAnchoredConnectorAndAdjacentLineSegment, drawConnector, drawTerminalAnchoredConnectorAndAdjacentLineSegment, drawTerminalConnector } from '@/drawing/connectors'
import { Watch } from 'vue-property-decorator'
import { RelationConfig } from '@/relation/RelationConfig'
import { SubsetConfig } from '@/subset/SubsetConfig'
import App from '@/App.vue'

import RelationsPane from '@/components/RelationsPane.vue'
import SubsetsPane from '@/components/SubsetsPane.vue'
import Switch from '@/components/Switch.vue'
import Slider from '@/components/Slider.vue'

@Options({
  props: {
    relation_line_thickness: Number,
    n_anchor_points_per_edge: Number
  },
  components: {
    NSwitch, NButton, NSpace, NSelect, NCode, NInput, NDivider, NColorPicker, NRadioGroup, NRadio, PlusIcon, NIcon, App,
    RelationsPane, SubsetsPane, Switch, Slider
  }
})
export default class HelloWorld extends Vue {
    connectorSize: number = App.config.connector.size
    connectorSizeStep: number = App.config.connector.step
    connectorSizeMin: number = App.config.connector.min
    connectorSizeMax: number = App.config.connector.max

    testSwitch: boolean = App.config.switch.test
   relation_line_thickness!: number
   n_anchor_points_per_edge!: number

   x!: number
   y!: number
   connectorAutoAlignmentSwitch: boolean = App.config.switch['connector-auto-alignment']
   straightLinesSwitch: boolean = App.config.switch['straight-lines']
   gridSwitch: boolean = App.config.switch.grid
   nodeRenameSwitch: boolean = App.config.switch['node-rename']
   liveRedrawSwitch: boolean = App.config.switch['live-redraw']
   currentRelation: RelationConfig
   currentSubset: SubsetConfig

   currentHeadConnectorLocation!: Location

   bgColor = App.config.graph["bg-color"]
   gridColor = App.config.graph["grid-color"]
   nodeSize = App.config.node.size

   graphs: Graph[] = []

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
        }
    }

   setCurrentRelation(value: RelationConfig) {
        this.currentRelation = value
   }

   setCurrentSubset(value: SubsetConfig) {
        this.currentSubset = value
   }

   export() {
       const content = this.graphs[0].triples.subsets.map(subset =>
            ([subset.config.name, ''].concat(subset.items.map(triple => triple.description))).join('<br/>')
       ).join('<br/>')

       document.getElementsByClassName('exported-graph')[0].innerHTML = content
   }

   mounted() {
       // Wrap all graphs on the page into typescript objects

       const grid_step = this.nodeSize / (this.n_anchor_points_per_edge + 1)

       Array.prototype.forEach.call(document.getElementsByClassName('graph'), (graph) => {
           this.graphs.push(new Graph(graph, this.gridSwitch, grid_step, this.gridColor))
       })

        if (this.gridSwitch) {
            this.toggleGrid(this.gridSwitch)
        }

       this.graphs.forEach((graph) => {
           graph.element.onmousedown = (event) => {
               if (event.ctrlKey) {
                   const graph = this.find_target_graph(event)

                   graph.currentRelation = this.currentRelation
                   graph.changeCurrentRelationSubset(this.currentSubset)
                   graph.currentRelationLineThickness = this.relation_line_thickness

                   const canvas = graph.canvas
                   const ctx = canvas.getContext('2d');

                   // set line stroke and line width

                   // ctx.strokeStyle = this.current_relation;
                   // ctx.fillStyle = this.current_relation;
                   // ctx.lineWidth = this.relation_line_thickness;

                   if (this.connectorAutoAlignmentSwitch) {
                       this.currentHeadConnectorLocation = drawAnchoredConnectorAndAdjacentLineSegment(
                           graph, ctx, event, this.connectorSize, this.n_anchor_points_per_edge, this.straightLinesSwitch
                       )
                   } else {
                       this.currentHeadConnectorLocation = drawConnector(graph, ctx, event, this.connectorSize, this.straightLinesSwitch)
                   }

                   graph.drawingRelation = true
               } else {
                   if (!(event.target as HTMLElement).classList.contains('node') && !((event.target as HTMLElement).parentNode as HTMLElement).classList.contains('node')) {
                       new Node(this.find_target_graph(event), event.offsetX, event.offsetY, this.nodeSize, this.nodeRenameSwitch)
                   }
               }
           }

           graph.element.onmousemove = (event) => {
               drawLineSegment(graph, event, this.straightLinesSwitch)
           }

           graph.element.onmouseup = (event) => {
               if (event.target == graph.canvas) {
                   const canvas = graph.canvas
                   graph.drawingRelation = false
                   const ctx = canvas.getContext('2d');
                   ctx.fillStyle = this.currentRelation.color

                   if (this.connectorAutoAlignmentSwitch) {
                       drawTerminalAnchoredConnectorAndAdjacentLineSegment(graph, ctx, event, this.connectorSize, this.n_anchor_points_per_edge, this.straightLinesSwitch)
                   } else {
                       drawTerminalConnector(graph, ctx, event, this.connectorSize, this.straightLinesSwitch)
                   }
               }
           }
       })
        
        if (!this.gridSwitch) {
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
                           if (!event.target.style.x) {
                               event.target.style.x = event.delta.x
                               event.target.style.y = event.delta.y
                           } else {
                               var next_x = parseFloat(event.target.style.x) + parseFloat(event.delta.x)
                               var next_y = parseFloat(event.target.style.y) + parseFloat(event.delta.y)
                               event.target.style.x = next_x
                               event.target.style.y = next_y
                           }

                           event.target.style.transform = `translate(${event.target.style.x}px, ${event.target.style.y}px)`
                       }
                   }
               }
           )
        }
   }

   find_target_graph(event) {
       let target_graph: Graph

       this.graphs.forEach((graph) => {
           if (graph.canvas == event.target) {
               target_graph = graph
           }
       })

       return target_graph
   }

   toggleNodeRenameMode(value: boolean) {
       this.graphs.forEach((graph) => {
            graph.nodes.forEach((node) => {
                node.toggleNameChangeability(value)
            })
       })
   }

   @Watch('gridSwitch')
   toggleGrid(value: boolean) {
       // console.log(`change grid visibility from ${old_value} to ${value}`)
       if (value) {
           // console.log(interact.snappers.grid({ x: grid_step, y: grid_step })())
           let targets: NodeAnchorPoint[]

           this.graphs.forEach((graph) => {
               // const ctx = graph.canvas.getContext('2d')
               // ctx.clearRect(0, 0, graph.width, graph.height)
               // targets = drawGrid(graph, grid_step)
               // graph.draw()
               graph.enableGrid = true
               const targets = graph.redraw()

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
                                   let next_x: number
                                   let next_y: number

                                   if (!event.target.style.virtual_x) {
                                       if (event.target.style.x) {
                                           next_x = parseFloat(event.target.style.x)
                                           next_y = parseFloat(event.target.style.y)
                                       } else {
                                           next_x = event.delta.x
                                           next_y = event.delta.y
                                       }
                                   } else {
                                       next_x = parseFloat(event.target.style.virtual_x) + parseFloat(event.delta.x)
                                       next_y = parseFloat(event.target.style.virtual_y) + parseFloat(event.delta.y)
                                   }

                                   event.target.style.virtual_x = next_x
                                   event.target.style.virtual_y = next_y

                                   const closest_target = targets.map(
                                       target => [target, target.measure_distance(next_x, next_y)]
                                   ).sort(
                                       (lhs, rhs) => (lhs[1] as number) - (rhs[1] as number)
                                   )[0][0] as NodeAnchorPoint

                                   event.target.style.x = closest_target.x
                                   event.target.style.y = closest_target.y

                                   event.target.style.transform = `translate(${closest_target.x}px, ${closest_target.y}px)`
                               }
                           }
                       }
                   }
               )
           })
       } else {
           this.graphs.forEach((graph) => {
               graph.enableGrid = false
               graph.redraw()
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
                           if (event.target.style.virtual_x) {
                               delete event.target.style.virtual_x
                               delete event.target.style.virtual_y
                           }

                           if (!event.target.style.x) {
                               event.target.style.x = event.delta.x
                               event.target.style.y = event.delta.y
                           } else {
                               var next_x = parseFloat(event.target.style.x) + parseFloat(event.delta.x)
                               var next_y = parseFloat(event.target.style.y) + parseFloat(event.delta.y)
                               event.target.style.x = next_x
                               event.target.style.y = next_y
                           }

                           event.target.style.transform = `translate(${event.target.style.x}px, ${event.target.style.y}px)`
                       }
                   }
               }
           )
       }
   }

   @Watch("enable_live_redraw")
   toggleLiveRedrawMode() {
     this.redrawGraph()
   }

   redrawGraph() { // value: RelationConfig[], previous_value: RelationConfig[]
        if (this.liveRedrawSwitch) {
            this.redrawAllGraphs()
        }
   }

    redrawAllGraphs() {
        this.graphs.forEach((graph) => {
            graph.redraw()
        })
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
