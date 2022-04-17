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
    modifiableName = false
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
