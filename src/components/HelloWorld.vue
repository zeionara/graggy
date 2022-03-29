<template>
  <b>foo</b>
  <div class = "graph">
    <canvas class = "graph-canvas" width = "1024" height = "640"></canvas>
    <div class = "node"></div>
  </div>
  <button @click="this.export()">export</button>
  <p class = "exported-graph">Draw graph and then click export button</p>
  <!--<div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      For a guide and recipes on how to configure / customize this project,<br>
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
    </p>
    <h3>Installed CLI Plugins</h3>
    <ul>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel" target="_blank" rel="noopener">babel</a></li>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-router" target="_blank" rel="noopener">router</a></li>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-vuex" target="_blank" rel="noopener">vuex</a></li>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint" target="_blank" rel="noopener">eslint</a></li>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-mocha" target="_blank" rel="noopener">unit-mocha</a></li>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-typescript" target="_blank" rel="noopener">typescript</a></li>
    </ul>
    <h3>Essential Links</h3>
    <ul>
      <li><a href="https://vuejs.org" target="_blank" rel="noopener">Core Docs</a></li>
      <li><a href="https://forum.vuejs.org" target="_blank" rel="noopener">Forum</a></li>
      <li><a href="https://chat.vuejs.org" target="_blank" rel="noopener">Community Chat</a></li>
      <li><a href="https://twitter.com/vuejs" target="_blank" rel="noopener">Twitter</a></li>
      <li><a href="https://news.vuejs.org" target="_blank" rel="noopener">News</a></li>
    </ul>
    <h3>Ecosystem</h3>
    <ul>
      <li><a href="https://router.vuejs.org" target="_blank" rel="noopener">vue-router</a></li>
      <li><a href="https://vuex.vuejs.org" target="_blank" rel="noopener">vuex</a></li>
      <li><a href="https://github.com/vuejs/vue-devtools#vue-devtools" target="_blank" rel="noopener">vue-devtools</a></li>
      <li><a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener">vue-loader</a></li>
      <li><a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">awesome-vue</a></li>
    </ul>
  </div>!-->
</template>

<script lang="ts">
import interact from 'interactjs';

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
        Array.prototype.forEach.call(document.getElementsByClassName('node'), (node, i) => {
           let node_id = `entity-${i}` 
           node.id = node_id

           console.log(node)

           const canvas = document.getElementsByClassName('graph-canvas')[0];
           const ctx = canvas.getContext('2d');

           var p = ctx.getImageData(node.style.x, node.style.y, node.getBoundingClientRect().width, node.getBoundingClientRect().height).data; 
           console.log(p)
        })
        document.getElementsByClassName('exported-graph')[0].innerHTML = "Graph has been exported successfully"
    }

    mounted() {
        // console.log('foo')

        // console.log(this)

        this.x = 0
        this.y = 0

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
            const canvas = document.getElementsByClassName('graph-canvas')[0];
            canvas.style.drawing_relation = false;
        }

        document.getElementsByClassName('graph')[0].onmousedown = function(event) {
            if (event.ctrlKey) {
                const canvas = document.getElementsByClassName('graph-canvas')[0];
                const ctx = canvas.getContext('2d');

                // set line stroke and line width
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 5;

                // draw a red line
                ctx.beginPath();
                ctx.moveTo(event.offsetX, event.offsetY);

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
                    node.className = 'node'
                    node.setAttribute(data_attribute, '')
                    graph.appendChild(node)

                    node.style.x = event.offsetX - node.getBoundingClientRect().width / 2
                    node.style.y = event.offsetY - node.getBoundingClientRect().height / 2
                    node.style.transform = `translate(${node.style.x}px, ${node.style.y}px)`
                }
            }
        }

        interact('.node')
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
