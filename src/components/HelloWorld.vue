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
     relation_line_thickness: Number
   }
 })
 export default class HelloWorld extends Vue {
    msg!: string
    connector_size!: number
    relation_line_thickness!: number

    x!: number
    y!: number
    enable_relation_connector_automatic_alignment = false
    enable_straight_lines_drawing = false
    current_relation = "red"

    current_head_connector_location = new Location(0, 0)
    previous_tail_connector_location!: Location // = new Location(0, 0)

    // nodes: Node[] = []
    graphs: Graph[] = []

    export() {
        // @ts-ignore
        const triples = global.triples.map(triple => `${triple.head}\t${triple.relation}\t${triple.tail}`).join('<br/>')
        document.getElementsByClassName('exported-graph')[0].innerHTML = 'head\trelation\ttail<br/>' + triples // "Graph has been exported successfully"
    }

    mounted() {
        this.x = 0
        this.y = 0

        console.log('fffff')
        const self = this
        Array.prototype.forEach.call(document.getElementsByClassName('graph'), function(graph) {
            self.graphs.push(new Graph(graph))
        })

        // @ts-ignore
        global.nEntities = 0
        // @ts-ignore
        global.triples = []


        // document.getElementsByClassName('graph')[0].onmousemove =
        this.graphs.forEach((graph) => {
            graph.element.onmousemove = function(event) {
                const canvas = graph.canvas // document.getElementsByClassName('graph-canvas')[0];

                // @ts-ignore
                if (graph.drawing_relation && event.target == graph.canvas) {
                    // @ts-ignore
                    const ctx = canvas.getContext('2d');

                    if (self.enable_straight_lines_drawing) {
                        // if (self.previous_tail_connector_location) {
                        //     ctx.moveTo(self.current_head_connector_location.x, self.current_head_connector_location.y)
                        //     ctx.strokeStyle = 'blue';
                        //     ctx.lineTo(self.previous_tail_connector_location.x, self.previous_tail_connector_location.y);
                        //     ctx.stroke()
                        //     ctx.strokeStyle = 'red';
                        // }
                        // ctx.moveTo(self.current_head_connector_location.x, self.current_head_connector_location.y)
                        // self.previous_tail_connector_location = new Location(event.offsetX, event.offsetY)
                    } else {
                        console.log('wtd')
                        ctx.lineTo(event.offsetX, event.offsetY);
                        ctx.stroke();
                    }
                }
            }
        });

        // @ts-ignore
        // document.getElementsByClassName('graph')[0].onmouseup = function(event) {
        this.graphs.forEach((graph) => {
            graph.element.onmouseup = function(event) {
                if (event.target == graph.canvas) {
                    const canvas = graph.canvas // document.getElementsByClassName('graph-canvas')[0];
                    // @ts-ignore
                    // canvas.style.drawing_relation = false;
                    graph.drawing_relation = false

                    // @ts-ignore
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = self.current_relation;

                    if (self.enable_relation_connector_automatic_alignment) {
                        // console.log('----------------------------------------------------------------------')
                        // console.log(event.offsetX, event.offsetY)
                        const anchor_point = getClosestEntityAnchorPoint(graph.nodes, event.offsetX, event.offsetY, 2)

                        ctx.lineTo(anchor_point.x, anchor_point.y);
                        ctx.stroke();
                        drawFilledSquare(ctx, anchor_point.x, anchor_point.y, self.connector_size, self.current_relation)
                        
                        // @ts-ignore
                        getIntersectedEntities(graph.nodes, anchor_point.x, anchor_point.y, self.connector_size).forEach((tail) => {
                            // @ts-ignore
                            graph.currentHeads.forEach((head) => {
                                // @ts-ignore
                                global.triples.push({'head': head, 'relation': global.currentRelation, 'tail': tail})
                            })
                        })
                    } else {
                        // console.log('----------------------------------------------------------------------')
                        // console.log(ctx, event.offsetX, event.offsetY, self.connector_size, self.current_relation)
                        drawFilledSquare(ctx, event.offsetX, event.offsetY, self.connector_size, self.current_relation)

                        if (self.enable_straight_lines_drawing) {
                            // ctx.moveTo(self.current_head_connector_location.x, self.current_head_connector_location.y)
                            ctx.lineTo(event.offsetX, event.offsetY);
                            ctx.stroke();
                        }
                        
                        // @ts-ignore
                        getIntersectedEntities(graph.nodes, event.offsetX, event.offsetY, self.connector_size).forEach((tail) => {
                            // @ts-ignore
                            graph.currentHeads.forEach((head) => {
                                // @ts-ignore
                                global.triples.push({'head': head, 'relation': global.currentRelation, 'tail': tail})
                            })
                        })
                    }
                }
            }
        })

        // @ts-ignore
        this.graphs.forEach((graph) => {
            // document.getElementsByClassName('graph')[0].onmousedown
            graph.element.onmousedown = function(event) {
                // @ts-ignore
                if (event.ctrlKey) {
                    const graph = self.find_target_graph(event)
                    const canvas = graph.canvas // document.getElementsByClassName('graph-canvas')[0];
                    // @ts-ignore
                    const ctx = canvas.getContext('2d');

                    // set line stroke and line width
                    ctx.strokeStyle = self.current_relation;
                    ctx.fillStyle = self.current_relation;
                    ctx.lineWidth = self.relation_line_thickness;

                    if (self.enable_relation_connector_automatic_alignment) {
                        // console.log('----------------------------------------------------------------------')
                        // console.log(event.offsetX, event.offsetY)
                        const anchor_point = getClosestEntityAnchorPoint(graph.nodes, event.offsetX, event.offsetY, 2)

                        drawFilledSquare(ctx, anchor_point.x, anchor_point.y, self.connector_size, self.current_relation)

                        // draw a red line
                        ctx.beginPath();
                        ctx.moveTo(anchor_point.x, anchor_point.y);

                        if (self.enable_straight_lines_drawing) {
                            self.current_head_connector_location = new Location(event.offsetX, event.offsetY)
                        } else {
                            ctx.lineTo(event.offsetX, event.offsetY);
                            ctx.stroke();
                        }

                        graph.currentHeads = getIntersectedEntities(graph.nodes, anchor_point.x, anchor_point.y, self.connector_size)
                    } else {
                        drawFilledSquare(ctx, event.offsetX, event.offsetY, self.connector_size, self.current_relation)

                        // draw a red line
                        ctx.beginPath();
                        ctx.moveTo(event.offsetX, event.offsetY);

                        if (self.enable_straight_lines_drawing) {
                            self.current_head_connector_location = new Location(event.offsetX, event.offsetY)
                        }

                        graph.currentHeads = getIntersectedEntities(graph.nodes, event.offsetX, event.offsetY, self.connector_size)
                    }
                    graph.currentRelation = self.current_relation
                    graph.drawing_relation = true
                } else {
                    if (!event.target.classList.contains('node')) {
                        new Node(self.find_target_graph(event), event.offsetX, event.offsetY)
                        // self.graphs.forEach((graph) => {
                        //     if (graph.element.firstChild == event.target) {
                        //         console.log('create new node')
                        //         new Node(graph, event.offsetX, event.offsetY)
                        //     }
                        // })
                        // // console.log(event)
                        // var node = document.createElement('div')
                        // var graph = document.getElementsByClassName('graph')[0]
                        // var data_attribute = null
                        // graph.getAttributeNames().forEach((attribute_name) => {
                        //     if (attribute_name.startsWith('data-v-')) {
                        //         data_attribute = attribute_name
                        //     }
                        // })
                        // node.className = 'node unlocked'
                        // // @ts-ignore
                        // node.setAttribute(data_attribute, '')
                        // graph.appendChild(node)

                        // // @ts-ignore
                        // node.style.x = event.offsetX - node.getBoundingClientRect().width / 2
                        // // @ts-ignore
                        // node.style.y = event.offsetY - node.getBoundingClientRect().height / 2
                        // // @ts-ignore
                        // node.id = `entity-${global.nEntities++}`
                        // // @ts-ignore
                        // node.style.transform = `translate(${node.style.x}px, ${node.style.y}px)`

                        // // global.nEntities += 1

                        // // @ts-ignore
                        // console.log(`Currently there are ${global.nEntities} entities`)
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
                        start(event) {
                            // console.log(event.type, event.target)
                        },
                        move(event) {
                            // console.log(event)
                            // this.x += event.dx
                            // this.y += event.dy
                            if (!event.target.style.x) {
                                // console.log('no x')
                                event.target.style.x = event.delta.x
                                event.target.style.y = event.delta.y
                            } else {
                                // console.log('yes x')
                                var next_x = parseFloat(event.target.style.x) + parseFloat(event.delta.x)
                                var next_y = parseFloat(event.target.style.y) + parseFloat(event.delta.y)
                                event.target.style.x = next_x // event.delta.x
                                event.target.style.y = next_y // event.delta.x
                                // console.log(parseFloat(event.target.style.x) + parseFloat(event.delta.x))
                                // event.target.style.y += event.delta.y
                            }

                            // console.log(event.target.style.x, event.target.style.y)

                            // event.target.style.transform = `translate(${this.x}px, ${this.y}px)`
                            // event.target.style.transform = `translate(100px, 100px)`
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
