<template>
  <b>foo</b>
  <div class = "graph">
    <div class = "node"></div>
  </div>
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

    mounted() {
        console.log('foo')

        console.log(this)

        this.x = 0
        this.y = 0

        // var shift_node = function(event) {
        //     this.x += event.dx
        //     this.y += event.dy

        //     event.target.style.transform = `translate(${this.x}px, ${this.y}px)`
        // }

        // console.log(this)

        document.getElementsByClassName('graph')[0].onclick = function(event) {
            if (!event.target.classList.contains('node')) {
                console.log(event)
                var node = document.createElement('div')
                var graph = document.getElementsByClassName('graph')[0]
                var data_attribute = null
                graph.getAttributeNames().forEach((attribute_name) => {
                    if (attribute_name.startsWith('data-v-')) {
                        data_attribute = attribute_name
                    }
                })
                node.style.x = event.offsetX
                node.style.y = event.offsetY
                node.style.transform = `translate(${node.style.x}px, ${node.style.y}px)`
                node.className = 'node'
                node.setAttribute(data_attribute, '')
                graph.appendChild(node)
            }
        }

        interact('.node')
            .draggable(
                {
                    intertia: true,
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
                            console.log(event.type, event.target)
                        },
                        move(event) {
                            console.log(event)
                            // this.x += event.dx
                            // this.y += event.dy
                            if (!event.target.style.x) {
                                console.log('no x')
                                event.target.style.x = event.delta.x
                                event.target.style.y = event.delta.y
                            } else {
                                console.log('yes x')
                                var next_x = parseFloat(event.target.style.x) + parseFloat(event.delta.x)
                                var next_y = parseFloat(event.target.style.y) + parseFloat(event.delta.y)
                                event.target.style.x = next_x // event.delta.x
                                event.target.style.y = next_y // event.delta.x
                                // console.log(parseFloat(event.target.style.x) + parseFloat(event.delta.x))
                                // event.target.style.y += event.delta.y
                            }

                            console.log(event.target.style.x, event.target.style.y)

                            // event.target.style.transform = `translate(${this.x}px, ${this.y}px)`
                            // event.target.style.transform = `translate(100px, 100px)`
                            event.target.style.transform = `translate(${event.target.style.x}px, ${event.target.style.y}px)`
                        }
                    }
                }
            )
    }

    create_node(event) {
        var node = document.getElementsByClassName('graph')[0].createElement('div')
        console.log(event)
        console.log('create new node!')
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
