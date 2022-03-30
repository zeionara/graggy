<template>
  <b>graggy</b>
  <input type="checkbox" id="enable-relation-connector-automatic-alignment" v-model="enable_relation_connector_automatic_alignment" />
  <label for="enable-relation-connector-automatic-alignment">
    relation connector automatic alignment is
    <span v-if="enable_relation_connector_automatic_alignment">enabled</span>
    <span v-else>disabled</span>
  </label>
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

 @Options({
   props: {
     msg: String
   }
 })
 export default class HelloWorld extends Vue {
    msg!: string
    x!: number
    y!: number
    enable_relation_connector_automatic_alignment = false

    export() {
        // @ts-ignore
        const triples = global.triples.map(triple => `${triple.head}\t${triple.relation}\t${triple.tail}`).join('<br/>')
        document.getElementsByClassName('exported-graph')[0].innerHTML = 'head\trelation\ttail<br/>' + triples // "Graph has been exported successfully"
    }

    mounted() {
        this.x = 0
        this.y = 0

        // @ts-ignore
        global.nEntities = 0
        // @ts-ignore
        global.triples = []

        const self = this

        // @ts-ignore
        document.getElementsByClassName('graph')[0].onmousemove = function(event) {
            const canvas = document.getElementsByClassName('graph-canvas')[0];

            // @ts-ignore
            if (canvas.style.drawing_relation && !event.target.classList.contains('node')) {
                // @ts-ignore
                const ctx = canvas.getContext('2d');

                ctx.lineTo(event.offsetX, event.offsetY);
                ctx.stroke();
            }
        }

        // @ts-ignore
        document.getElementsByClassName('graph')[0].onmouseup = function(event) {
            if (!event.target.classList.contains('node')) {
                const canvas = document.getElementsByClassName('graph-canvas')[0];
                // @ts-ignore
                canvas.style.drawing_relation = false;

                // @ts-ignore
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'red';

                if (self.enable_relation_connector_automatic_alignment) {
                    const anchor_point = getClosestEntityAnchorPoint(event.offsetX, event.offsetY, 2)

                    ctx.lineTo(anchor_point.x, anchor_point.y);
                    ctx.stroke();
                    drawFilledSquare(ctx, anchor_point.x, anchor_point.y, 30, 'red')
                    
                    console.log('############################')
                    console.log(anchor_point.x, anchor_point.y)
                    // @ts-ignore
                    getIntersectedEntities(anchor_point.x, anchor_point.y, 30).forEach((tail) => {
                        // @ts-ignore
                        global.currentHeads.forEach((head) => {
                            // @ts-ignore
                            global.triples.push({'head': head, 'relation': global.currentRelation, 'tail': tail})
                        })
                    })
                } else {
                    drawFilledSquare(ctx, event.offsetX, event.offsetY, 30, 'red')
                    
                    // @ts-ignore
                    getIntersectedEntities(event.offsetX, event.offsetY, 30).forEach((tail) => {
                        // @ts-ignore
                        global.currentHeads.forEach((head) => {
                            // @ts-ignore
                            global.triples.push({'head': head, 'relation': global.currentRelation, 'tail': tail})
                        })
                    })
                }
            }
        }

        // @ts-ignore
        document.getElementsByClassName('graph')[0].onmousedown = function(event) {
            // @ts-ignore
            if (event.ctrlKey) {
                const canvas = document.getElementsByClassName('graph-canvas')[0];
                // @ts-ignore
                const ctx = canvas.getContext('2d');

                // set line stroke and line width
                ctx.strokeStyle = 'red';
                ctx.fillStyle = 'red';
                ctx.lineWidth = 5;

                if (self.enable_relation_connector_automatic_alignment) {
                    const anchor_point = getClosestEntityAnchorPoint(event.offsetX, event.offsetY, 2)

                    drawFilledSquare(ctx, anchor_point.x, anchor_point.y, 30, 'red')

                    // draw a red line
                    ctx.beginPath();
                    ctx.moveTo(anchor_point.x, anchor_point.y);
                    ctx.lineTo(event.offsetX, event.offsetY);
                    ctx.stroke();

                    // @ts-ignore
                    global.currentHeads = getIntersectedEntities(anchor_point.x, anchor_point.y, 30)
                } else {
                    drawFilledSquare(ctx, event.offsetX, event.offsetY, 30, 'red')

                    // draw a red line
                    ctx.beginPath();
                    ctx.moveTo(event.offsetX, event.offsetY);

                    // @ts-ignore
                    global.currentHeads = getIntersectedEntities(event.offsetX, event.offsetY, 30)
                }
                // @ts-ignore
                global.currentRelation = 'red'

                // @ts-ignore
                canvas.style.drawing_relation = true;
            } else {
                if (!event.target.classList.contains('node')) {
                    // console.log(event)
                    var node = document.createElement('div')
                    var graph = document.getElementsByClassName('graph')[0]
                    var data_attribute = null
                    graph.getAttributeNames().forEach((attribute_name) => {
                        if (attribute_name.startsWith('data-v-')) {
                            data_attribute = attribute_name
                        }
                    })
                    node.className = 'node unlocked'
                    // @ts-ignore
                    node.setAttribute(data_attribute, '')
                    graph.appendChild(node)

                    // @ts-ignore
                    node.style.x = event.offsetX - node.getBoundingClientRect().width / 2
                    // @ts-ignore
                    node.style.y = event.offsetY - node.getBoundingClientRect().height / 2
                    // @ts-ignore
                    node.id = `entity-${global.nEntities++}`
                    // @ts-ignore
                    node.style.transform = `translate(${node.style.x}px, ${node.style.y}px)`

                    // global.nEntities += 1

                    // @ts-ignore
                    console.log(`Currently there are ${global.nEntities} entities`)
                }
            }
        }

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
