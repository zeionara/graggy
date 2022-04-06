<template>

<n-space justify="center">
  <div class = "graph">
    <canvas class = "graph-canvas" width = "1024" height = "640"></canvas>
  </div>

  <n-space vertical>
      <n-space>
          <n-switch id="enable-relation-connector-automatic-alignment" v-model:value="enable_relation_connector_automatic_alignment"/>
          <label for="enable-relation-connector-automatic-alignment">
            relation connector automatic alignment is
            <span v-if="enable_relation_connector_automatic_alignment">enabled</span>
            <span v-else>disabled</span>
          </label>
     </n-space>

     <n-space>
          <n-switch id="enable-straight-lines-drawing" v-model:value="enable_straight_lines_drawing" />
          <label for="enable-straight-lines-drawing">
            straight lines drawing is
            <span v-if="enable_straight_lines_drawing">enabled</span>
            <span v-else>disabled</span>
          </label>
    </n-space>

    <n-space>
      <n-switch id="enable-grid" v-model:value="enable_grid" />
      <label for="enable-grid">
        grid is
        <span v-if="enable_grid">enabled</span>
        <span v-else>disabled</span>
      </label>
    </n-space>
  <!--</n-space>!-->

  <!--<n-space vertical>!-->
      <n-space>
          Current relation:
          <n-select v-model:value="current_relation" :options="relations" />
      </n-space>
      <n-space>
          Current subset:
          <n-select v-model:value="current_relation_subset" :options="subsets" />
      </n-space>
      <n-space>
        <n-button type="primary" @click="this.export()">export</n-button>
        <n-button type="error" disabled>clear</n-button>
      </n-space>
      <n-space>
         <p class = "exported-graph" style = "text-align: left">Draw graph and then click export button</p>
      </n-space>
  </n-space>
</n-space>

</template>

<script lang="ts">
import { NSwitch, NButton, NSpace, NSelect, NCode } from 'naive-ui'
import interact from 'interactjs';
import { Options, Vue } from 'vue-class-component';
import { Node } from '@/Node'
import { Graph } from '@/Graph'
import { Location } from '@/Location'
import { NodeAnchorPoint } from '@/NodeAnchorPoint'
import { drawLineSegment } from '@/drawing/relation_line'
import { drawAnchoredConnectorAndAdjacentLineSegment, drawConnector, drawTerminalAnchoredConnectorAndAdjacentLineSegment, drawTerminalConnector } from '@/drawing/connectors'
import { Watch } from 'vue-property-decorator'
import { drawGrid } from '@/drawing/grid'

@Options({
  props: {
    connector_size: Number,
    relation_line_thickness: Number,
    n_anchor_points_per_edge: Number
  },
  components: {
    NSwitch, NButton, NSpace, NSelect, NCode
  }
})
export default class HelloWorld extends Vue {
   connector_size!: number
   relation_line_thickness!: number
   n_anchor_points_per_edge!: number

    relations = [
        {
            label: "red",
            value: "red"
        },
        {
            label: "green",
            value: "green"
        },
        {
            label: "black",
            value: "black"
        }
    ]
    subsets = [
        {
            label: "train",
            value: "train"
        },
        {
            label: "test",
            value: "test"
        },
        {
            label: "valid",
            value: "valid"
        }
    ]

   x!: number
   y!: number
   enable_relation_connector_automatic_alignment = false
   enable_straight_lines_drawing = false
   enable_grid = false
   current_relation = "red"
   current_relation_subset = "train"

   current_head_connector_location!: Location
   previous_tail_connector_location!: Location

   graphs: Graph[] = []

   export() {
       const train_triples = this.graphs[0].triples.train.map(triple => triple.description).join('<br/>') // TODO: Add support for multiple graphs
       const test_triples = this.graphs[0].triples.test.map(triple => triple.description).join('<br/>') // TODO: Add support for multiple graphs
       const valid_triples = this.graphs[0].triples.valid.map(triple => triple.description).join('<br/>') // TODO: Add support for multiple graphs

       document.getElementsByClassName('exported-graph')[0].innerHTML = `head\trelation\ttail<br/>${train_triples}<br/><br/>${test_triples}<br/><br/>${valid_triples}`
   }

   mounted() {
       // Wrap all graphs on the page into typescript objects

       const grid_step = 100 / (this.n_anchor_points_per_edge + 1)

       Array.prototype.forEach.call(document.getElementsByClassName('graph'), (graph) => {
           this.graphs.push(new Graph(graph, this.enable_grid, grid_step))
       })

       this.graphs.forEach((graph) => {
           graph.element.onmousedown = (event) => {
               if (event.ctrlKey) {
                   const graph = this.find_target_graph(event)

                   graph.currentRelation = this.current_relation
                   graph.changeCurrentRelationSubset(this.current_relation_subset)
                   graph.currentRelationLineThickness = this.relation_line_thickness

                   const canvas = graph.canvas
                   const ctx = canvas.getContext('2d');

                   // set line stroke and line width

                   // ctx.strokeStyle = this.current_relation;
                   // ctx.fillStyle = this.current_relation;
                   // ctx.lineWidth = this.relation_line_thickness;

                   if (this.enable_relation_connector_automatic_alignment) {
                       this.current_head_connector_location = drawAnchoredConnectorAndAdjacentLineSegment(
                           graph, ctx, event, this.connector_size, this.n_anchor_points_per_edge, this.enable_straight_lines_drawing
                       )
                   } else {
                       this.current_head_connector_location = drawConnector(graph, ctx, event, this.connector_size, this.enable_straight_lines_drawing)
                   }

                   graph.drawingRelation = true
               } else {
                   if (!(event.target as HTMLElement).classList.contains('node')) {
                       new Node(this.find_target_graph(event), event.offsetX, event.offsetY - 647)
                   }
               }
           }

           graph.element.onmousemove = (event) => {
               drawLineSegment(graph, event, this.enable_straight_lines_drawing)
           }

           graph.element.onmouseup = (event) => {
               if (event.target == graph.canvas) {
                   const canvas = graph.canvas
                   graph.drawingRelation = false
                   const ctx = canvas.getContext('2d');
                   ctx.fillStyle = this.current_relation;

                   if (this.enable_relation_connector_automatic_alignment) {
                       drawTerminalAnchoredConnectorAndAdjacentLineSegment(graph, ctx, event, this.connector_size, this.n_anchor_points_per_edge, this.enable_straight_lines_drawing)
                   } else {
                       drawTerminalConnector(graph, ctx, event, this.connector_size, this.enable_straight_lines_drawing)
                   }
               }
           }
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

   find_target_graph(event) {
       let target_graph: Graph

       this.graphs.forEach((graph) => {
           if (graph.canvas == event.target) {
               target_graph = graph
           }
       })

       return target_graph
   }

   @Watch('enable_grid')
   toggle_grid(value: boolean) {
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

   // @Watch('current_relation_subset')
   // change_current_relation_subset(value: string) {
   //     this.graphs.forEach((graph) => {
   //         graph.changeCurrentRelationSubset(value)
   //     })
   // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.graph {
    width: 1024px;
    height: 640px;
    background-color: blue;
}
.node {
    width: 100px;
    height: 100px;
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
