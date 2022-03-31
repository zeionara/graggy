<template>
  <b>graggy</b>

  <input type="checkbox" id="enable-relation-connector-automatic-alignment" v-model="enable_relation_connector_automatic_alignment" />
  <label for="enable-relation-connector-automatic-alignment">
    relation connector automatic alignment is
    <span v-if="enable_relation_connector_automatic_alignment">enabled</span>
    <span v-else>disabled</span>
  </label>

  <input type="checkbox" id="enable-straight-lines-drawing" v-model="enable_straight_lines_drawing" />
  <label for="enable-straight-lines-drawing">
    straight lines drawing is
    <span v-if="enable_straight_lines_drawing">enabled</span>
    <span v-else>disabled</span>
  </label>

    <select v-model="current_relation">
      <option value = "red">red</option>
      <option value = "green">green</option>
      <option value = "black">black</option>
    </select>

  <div class = "graph">
    <canvas class = "graph-canvas" width = "1024" height = "640"></canvas>
  </div>
  <button @click="this.export()">export</button>
  <p class = "exported-graph">Draw graph and then click export button</p>
</template>

<script lang="ts">
import interact from 'interactjs';
import { drawFilledSquare, getIntersectedEntities, getClosestEntityAnchorPoint } from "@/geometry";
import { Options, Vue } from 'vue-class-component';
import { Node } from '@/Node'
import { Graph } from '@/Graph'

 class Location {
    x!: number
    y!: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
 }

 @Options({
   props: {
     msg: String,
     connector_size: Number,
     relation_line_thickness: Number,
     n_anchor_points_per_edge: Number
   }
 })
 export default class HelloWorld extends Vue {
    msg!: string
    connector_size!: number
    relation_line_thickness!: number
    n_anchor_points_per_edge!: number

    x!: number
    y!: number
    enable_relation_connector_automatic_alignment = false
    enable_straight_lines_drawing = false
    current_relation = "red"

    current_head_connector_location!: Location // = new Location(0, 0)
    previous_tail_connector_location!: Location

    graphs: Graph[] = []

    export() {
        const triples = this.graphs[0].triples.map(triple => triple.description).join('<br/>')
        document.getElementsByClassName('exported-graph')[0].innerHTML = 'head\trelation\ttail<br/>' + triples // "Graph has been exported successfully"
    }

    mounted() {
        // Wrap all graphs on the page into typescript objects

        Array.prototype.forEach.call(document.getElementsByClassName('graph'), (graph) => {
            this.graphs.push(new Graph(graph))
        })

        this.graphs.forEach((graph) => {
            graph.element.onmousemove = (event) => {
                const canvas = graph.canvas

                if (graph.drawingRelation && event.target == graph.canvas) {
                    const ctx = canvas.getContext('2d');

                    if (!this.enable_straight_lines_drawing) {
                        ctx.lineTo(event.offsetX, event.offsetY);
                        ctx.stroke();
                    }
                }
            }
        });

        this.graphs.forEach((graph) => {
            graph.element.onmouseup = (event) => {
                if (event.target == graph.canvas) {
                    const canvas = graph.canvas
                    graph.drawingRelation = false
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = this.current_relation;

                    if (this.enable_relation_connector_automatic_alignment) {
                        const anchor_point = getClosestEntityAnchorPoint(graph.nodes, event.offsetX, event.offsetY, this.n_anchor_points_per_edge)

                        ctx.lineTo(anchor_point.x, anchor_point.y);
                        ctx.stroke();
                        drawFilledSquare(ctx, anchor_point.x, anchor_point.y, this.connector_size, this.current_relation)
                        
                        graph.push_triples(getIntersectedEntities(graph.nodes, anchor_point.x, anchor_point.y, this.connector_size))
                    } else {
                        drawFilledSquare(ctx, event.offsetX, event.offsetY, this.connector_size, this.current_relation)

                        if (this.enable_straight_lines_drawing) {
                            ctx.lineTo(event.offsetX, event.offsetY);
                            ctx.stroke();
                        }
                        
                        graph.push_triples(getIntersectedEntities(graph.nodes, event.offsetX, event.offsetY, this.connector_size))
                    }
                }
            }
        })

        this.graphs.forEach((graph) => {
            graph.element.onmousedown = (event) => {
                if (event.ctrlKey) {
                    const graph = this.find_target_graph(event)
                    const canvas = graph.canvas
                    const ctx = canvas.getContext('2d');

                    // set line stroke and line width

                    ctx.strokeStyle = this.current_relation;
                    ctx.fillStyle = this.current_relation;
                    ctx.lineWidth = this.relation_line_thickness;

                    if (this.enable_relation_connector_automatic_alignment) {
                        const anchor_point = getClosestEntityAnchorPoint(graph.nodes, event.offsetX, event.offsetY, this.n_anchor_points_per_edge)

                        drawFilledSquare(ctx, anchor_point.x, anchor_point.y, this.connector_size, this.current_relation)

                        ctx.beginPath();
                        ctx.moveTo(anchor_point.x, anchor_point.y);

                        if (this.enable_straight_lines_drawing) {
                            this.current_head_connector_location = new Location(event.offsetX, event.offsetY)
                        } else {
                            ctx.lineTo(event.offsetX, event.offsetY);
                            ctx.stroke();
                        }

                        graph.currentHeads = getIntersectedEntities(graph.nodes, anchor_point.x, anchor_point.y, this.connector_size)
                    } else {
                        drawFilledSquare(ctx, event.offsetX, event.offsetY, this.connector_size, this.current_relation)

                        ctx.beginPath();
                        ctx.moveTo(event.offsetX, event.offsetY);

                        if (this.enable_straight_lines_drawing) {
                            this.current_head_connector_location = new Location(event.offsetX, event.offsetY)
                        }

                        graph.currentHeads = getIntersectedEntities(graph.nodes, event.offsetX, event.offsetY, this.connector_size)
                    }

                    graph.currentRelation = this.current_relation
                    graph.drawingRelation = true
                } else {
                    if (!(event.target as HTMLElement).classList.contains('node')) {
                        new Node(this.find_target_graph(event), event.offsetX, event.offsetY)
                    }
                }
            }
        })

        interact('.node.unlocked')
            .draggable(
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
    position: absolute;
    left: 7px;
}
</style>
