<template>
    <div
        :style = "`width: ${size}px; height: ${size}px; x: ${x}; y: ${y}; transform: translate(${this.x}px, ${this.y}px)`"
        :class = "`node${!locked && !permanentlyLocked ? ' unlocked' : ''}`" :id = "id" ref = "element"
    >
        <p :style = "`margin-top: ${size * 0.4}px; color: white; font-weight: bold`" :disabled = "enableRenameMode">{{ name }}</p>
        <input :style = "`margin-top: ${size * 0.4}px; width: ${size * 0.8}px`" :disabled = "!enableRenameMode" v-model = "name" />
    </div>
</template>

<script lang = "ts">
import { Vue, Options } from 'vue-class-component';

import { NodeElementCSSStyleDeclaration } from '@/NodeElementCSSStyleDeclaration'
import { NodeAnchorPoint } from '@/NodeAnchorPoint'

@Options({
    components: {
    },
    props: {
        size: Number, initialX: Number, initialY: Number, enableRenameMode: Boolean, id: String, name: String
    }
})
export default class Node extends Vue {
    size!: number
    initialX!: number
    initialY!: number
    enableRenameMode!: boolean
    id!: string

    // element: HTMLElement
    locked = false
    modifiableName = false
    permanentlyLocked = false
    name: string
    x: number
    y: number

    get element(): HTMLElement {
        return this.$refs.element as HTMLElement
    }

    // constructor(node: HTMLElement) {
    created() {
        // console.log('mounting')
        // console.log(this.enableRenameMode)
        // const node = document.createElement('div')
        // node.id = id
        // node.style['width'] = `${size}px`
        // node.style['height'] = `${size}px`
        // const nodeName = document.createElement('p')

        // node.className = 'node unlocked'
        // node.setAttribute(dataAttributeName, '')
        // node.innerHTML = `<input placeholder = "{node.id}" style = "width: 80px; margin-top: 40px"/>`
        // node.appendChild(nodeName)
        
        // this.element = node
        // nodeName.innerHTML = node.id
        // this.name = this.id

        this.x = this.initialX
        this.y = this.initialY

        // nodeStyle.x = (this.initialX - node.element.getBoundingClientRect().width / 2).toString()
        // nodeStyle.y = (event.offsetY - node.element.getBoundingClientRect().height / 2).toString()

        // nodeName.style['margin-top'] = `${size * 0.4}px`
        // nodeName.style['color'] = 'white'
        // nodeName.style['font-weight'] = 'bold'
        // node.appendChild(nodeName)
        // this.toggleNameChangeability(enableRenameMode)
    }

    // mounted() {
    //     const nodeStyle = this.element.style as NodeElementCSSStyleDeclaration
    //     nodeStyle.transform = `translate(${this.x}px, ${this.y}px)`
    // }

    // get x(): number {
    //     return parseFloat((this.element.style as NodeElementCSSStyleDeclaration).x)
    // }

    // get y(): number {
    //     return parseFloat((this.element.style as NodeElementCSSStyleDeclaration).y)
    // }
    
    // get id(): string {
    //     return this.element.id
    // }

    // set id(value: string) {
    //     this.element.id = value
    // }

    get width(): number {
        return this.element.getBoundingClientRect().width
    }

    get height(): number {
        return this.element.getBoundingClientRect().width
    }

    // get name(): string {
    //     return this.element.id
    // }

    toggleNameChangeability(value: boolean) {
        this.enableRenameMode = value
    }
    // toggleNameChangeability(value: boolean) {
    //     if (this.modifiableName && !value) {
    //         const nodeName = document.createElement('p')
    //         const new_id = (this.element.firstChild as HTMLInputElement).value
    //         this.element.innerHTML = ''
    //         if (new_id) {
    //             this.element.id = new_id
    //         }
    //         nodeName.innerHTML = this.element.id
    //         nodeName.style['margin-top'] = '40px'
    //         nodeName.style['color'] = 'white'
    //         nodeName.style['font-weight'] = 'bold'
    //         this.element.appendChild(nodeName)
    //         if (!this.permanentlyLocked) {
    //             this.unlock()
    //         }
    //         this.modifiableName = !this.modifiableName
    //     } else if (!this.modifiableName && value) {
    //         this.element.innerHTML = ''
    //         const nodeName = document.createElement('input')
    //         nodeName.placeholder = this.element.id
    //         nodeName.style['margin-top'] = '40px'
    //         nodeName.style['width'] = '80px'
    //         this.element.appendChild(nodeName)
    //         this.lock()
    //         this.modifiableName = !this.modifiableName
    //     }
    // }

    get_anchor_points(n_anchor_points_per_entity_edge: number) {
       const node_left_x = this.x
       const node_top_y = this.y

       const node_right_x = node_left_x + this.element.getBoundingClientRect().width
       const node_bot_y = node_top_y + this.element.getBoundingClientRect().height

       const x_increment = this.element.getBoundingClientRect().width / (n_anchor_points_per_entity_edge + 1)
       const y_increment = this.element.getBoundingClientRect().height / (n_anchor_points_per_entity_edge + 1)

       const anchor_points: NodeAnchorPoint[] = []

       // 1. Loop through anchor points on the top edge
       
       anchor_points.push(new NodeAnchorPoint(node_left_x, node_top_y))

       for (let i = 1; i <= n_anchor_points_per_entity_edge; i++) {
           anchor_points.push(new NodeAnchorPoint(node_left_x + x_increment * i, node_top_y))
       }
       
       // 2. Loop through anchor points on the right edge

       anchor_points.push(new NodeAnchorPoint(node_right_x, node_top_y))

       for (let i = 1; i <= n_anchor_points_per_entity_edge; i++) {
           anchor_points.push(new NodeAnchorPoint(node_right_x, node_top_y + y_increment * i))
       }

       // 3. Loop through anchor points on the bottom edge

       anchor_points.push(new NodeAnchorPoint(node_right_x, node_bot_y))

       for (let i = 1; i <= n_anchor_points_per_entity_edge; i++) {
           anchor_points.push(new NodeAnchorPoint(node_right_x - x_increment * i, node_bot_y))
       }

       // 4. Loop through anchor points on the left edge

       anchor_points.push(new NodeAnchorPoint(node_left_x, node_bot_y))

       for (let i = 1; i <= n_anchor_points_per_entity_edge; i++) {
           anchor_points.push(new NodeAnchorPoint(node_left_x, node_bot_y - x_increment * i))
       }

       return anchor_points
    }

    lock(permanently = false) {
        if (!this.locked) {
            this.element.classList.remove('unlocked')
            this.locked = true
        }
        if (permanently && !this.permanentlyLocked) {
            this.permanentlyLocked = true
        }
    }

    unlock() {
        if (this.locked) {
            this.element.classList.add('unlocked')
            this.locked = false
        }
    }
}
</script>

<style lang="scss">
.node {
    background-color: red;
    position: absolute;
}
</style>
