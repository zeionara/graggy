<template>
  <b>foo</b>
  <div class = "graph">
    <canvas class = "graph-canvas" width = "1024" height = "640"></canvas>
  </div>
  <button @click="this.export()">export</button>
  <p class = "exported-graph">Draw graph and then click export button</p>
</template>

<script lang="ts">
import interact from 'interactjs';
import { foo, drawFilledSquare, getIntersectedEntities } from "@/geometry.ts";

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

    export() {
        const triples = global.triples.map(triple => `${triple.head}\t${triple.relation}\t${triple.tail}`).join('<br/>')
        // Array.prototype.forEach.call(document.getElementsByClassName('node'), (node, i) => {
        //    let node_id = `entity-${i}` 
        //    node.id = node_id

        //    console.log(node)

        //    const canvas = document.getElementsByClassName('graph-canvas')[0];
        //    const ctx = canvas.getContext('2d');

        //    var p = ctx.getImageData(node.style.x, node.style.y, node.getBoundingClientRect().width, node.getBoundingClientRect().height).data; 
        //    console.log(p)
        // })
        document.getElementsByClassName('exported-graph')[0].innerHTML = 'head\trelation\ttail<br/>' + triples // "Graph has been exported successfully"
    }

    mounted() {
        // console.log('foo')

        // console.log(this)
        console.log(foo);

        this.x = 0
        this.y = 0

        global.nEntities = 0
        global.triples = []

        // const canvas = document.getElementsByClassName('graph-canvas')[0];

        // if (canvas.getContext) {
        //     const ctx = canvas.getContext('2d');

        //     // set line stroke and line width
        //     ctx.strokeStyle = 'red';
        //     ctx.lineWidth = 5;

        //     // draw a red line
        //     ctx.beginPath();
        //     ctx.moveTo(100, 100);
        //     ctx.lineTo(300, 100);
        //     ctx.stroke();
        // }

        // var shift_node = function(event) {
        //     this.x += event.dx
        //     this.y += event.dy

        //     event.target.style.transform = `translate(${this.x}px, ${this.y}px)`
        // }

        // console.log(this)

        document.getElementsByClassName('graph')[0].onmousemove = function(event) {
            const canvas = document.getElementsByClassName('graph-canvas')[0];

            if (canvas.style.drawing_relation && !event.target.classList.contains('node')) {
                const ctx = canvas.getContext('2d');

                ctx.lineTo(event.offsetX, event.offsetY);
                ctx.stroke();
            }
        }

        document.getElementsByClassName('graph')[0].onmouseup = function(event) {
            if (!event.target.classList.contains('node')) {
                const canvas = document.getElementsByClassName('graph-canvas')[0];
                canvas.style.drawing_relation = false;

                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'red';
                drawFilledSquare(ctx, event.offsetX, event.offsetY, 30, 'red')
                
                getIntersectedEntities(event.offsetX, event.offsetY, 30).forEach((tail) => {
                    global.currentHeads.forEach((head) => {
                        global.triples.push({'head': head, 'relation': global.currentRelation, 'tail': tail})
                    })
                })
            }
        }

        document.getElementsByClassName('graph')[0].onmousedown = function(event) {
            if (event.ctrlKey) {
                const canvas = document.getElementsByClassName('graph-canvas')[0];
                const ctx = canvas.getContext('2d');

                // set line stroke and line width
                ctx.strokeStyle = 'red';
                ctx.fillStyle = 'red';
                ctx.lineWidth = 5;

                drawFilledSquare(ctx, event.offsetX, event.offsetY, 30, 'red')

                // ctx.rect(event.offsetX - 10, event.offsetY - 10, 30, 30);
                // ctx.fillRect(event.offsetX - 10, event.offsetY - 10, 30, 30);

                // draw a red line
                ctx.beginPath();
                ctx.moveTo(event.offsetX, event.offsetY);

                global.currentHeads = getIntersectedEntities(event.offsetX, event.offsetY, 30)
                global.currentRelation = 'red'

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
                    node.setAttribute(data_attribute, '')
                    graph.appendChild(node)

                    node.style.x = event.offsetX - node.getBoundingClientRect().width / 2
                    node.style.y = event.offsetY - node.getBoundingClientRect().height / 2
                    node.id = `entity-${global.nEntities++}`
                    node.style.transform = `translate(${node.style.x}px, ${node.style.y}px)`

                    // global.nEntities += 1

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
// h3 {
//   margin: 40px 0 0;
// }
// ul {
//   list-style-type: none;
//   padding: 0;
// }
// li {
//   display: inline-block;
//   margin: 0 10px;
// }
// a {
//   color: #42b983;
// }
</style>
