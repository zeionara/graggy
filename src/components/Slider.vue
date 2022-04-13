<template>
  <n-space>
    <p>{{ purpose }}</p>
    <n-slider v-model:value="value" :step="step" :min="min" :max="max" style = "width: 300px; margin-top: 2px"/>
  </n-space>
</template>

<script lang="ts">
import { NSpace, NSlider } from 'naive-ui'
import { Options, Vue } from 'vue-class-component';
import { Watch } from 'vue-property-decorator'

@Options({
    components: {
        NSpace, NSlider
    },
    props: {
        defaultValue: Number,
        min: Number,
        max: Number,
        step: Number,
        purpose: String
    }
})
export default class Slider extends Vue {
    defaultValue!: number
    min!: number
    max!: number
    step!: number
    value = 0
    purpose!: string

    created() {
        this.value = this.defaultValue
    }
    
   @Watch("value")
    updateValue(value: number) {
        this.$emit('updateValue', {purpose: this.purpose, value: value})
    }
}
</script>

<style scoped lang="scss">
p {
    margin: 0px;
    text-align: left;
}
</style>
