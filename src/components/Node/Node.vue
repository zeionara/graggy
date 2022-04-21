<template>
    <div
        :style = "`width: ${size}px; height: ${size}px; x: ${initialX}; y: ${initialY}; transform: translate(${initialX}px, ${initialY}px)`"
        :class = "`node${!locked && !enableRenameMode ? ' unlocked' : ''}`" :id = "id" ref = "element"
    >
        <p :class = "enableRenameMode ? 'hidden' : ''" :style = "`margin-top: ${size * 0.4}px; color: white; font-weight: bold`" :disabled = "enableRenameMode">{{ name }}</p>
        <input :class = "enableRenameMode ? '' : 'hidden'" :style = "`margin-top: ${size * 0.4}px; width: ${size * 0.9}px`" :disabled = "!enableRenameMode" v-model = "name" />
    </div>
</template>

<script lang = "ts">
import { Options } from 'vue-class-component';
import { ShapedNode } from '@/components/Node/ShapedNode';
import { NodeElementCSSStyleDeclaration } from '@/NodeElementCSSStyleDeclaration'
import { NodeState } from '@/components/Node/NodeState'

@Options({
    components: {
    },
    props: {
        size: Number, initialX: Number, initialY: Number, enableRenameMode: Boolean, id: String
    }
})
export default class Node extends ShapedNode {
    size!: number
    initialX!: number
    initialY!: number
    enableRenameMode!: boolean
    id!: string

    locked = false
    // modifiableName = false
    name: string

    created() {
        this.name = this.id
    }

    lock() {
        if (!this.locked) {
            this.element.classList.remove('unlocked')
            this.locked = true
        }
    }

    unlock() {
        if (this.locked) {
            this.element.classList.add('unlocked')
            this.locked = false
        }
    }

    rename(value: string) {
        this.name = value
        this.$forceUpdate()
    }

    assume(node: NodeState) {
        if (node.locked && !this.locked) {
            this.lock()
        }
        if (!node.locked && this.locked) {
            this.unlock()
        }
        this.name = node.name

        const style = this.element.style as NodeElementCSSStyleDeclaration

        style.virtualX = node.virtualX
        style.virtualY = node.virtualY
        style.x = node.x
        style.y = node.y
        style.transform = node.transform
    }

    get_state() {
        const style = this.element.style as NodeElementCSSStyleDeclaration
        return new NodeState(this.locked, this.name, style.virtualX, style.virtualY, style.x, style.y, style.transform)
    }
}
</script>

<style lang="scss">
.node {
    background-color: red;
    position: absolute;
}
.hidden {
    display: none
}
</style>
