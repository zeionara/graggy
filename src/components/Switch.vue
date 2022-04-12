<template>
    <n-space>
        <n-switch id="switch" v-model:value="isEnabled" @change="toggle($event)"/>
        <label for="switch">
            {{ purpose }} is
            <span v-if="isEnabled">enabled</span>
            <span v-else>disabled</span>
        </label>
    </n-space>
</template>

<script lang="ts">
import { NSpace, NSwitch } from 'naive-ui'
import { Options, Vue } from 'vue-class-component';

@Options({
    components: {
        NSpace, NSwitch
    },
    props: {
        defaultValue: Boolean,
        purpose: String
    }
})
export default class Switch extends Vue {
    defaultValue!: boolean
    isEnabled = false
    purpose!: string

    created() {
        this.isEnabled = this.defaultValue
    }
    
    toggle(value) {
        this.$emit('updateValue', {purpose: this.purpose, value: value})
    }
}
</script>
