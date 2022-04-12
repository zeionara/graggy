<template>
    <n-space vertical>
        <n-radio-group v-model:value="selectedSubsetIndex" @input="updateCurrentSubset($event.target.value)" name="subsetSelector" size="large" style="width: 100%">
            <n-space vertical v-for="(subset, i) in this.subsets" :key="i" size="large" style="margin-top: 10px">
                <n-space>
                    <n-input round type="text" size="small" v-model:value="subset.name" style="width: 300px"/>
                    <n-radio :key="i" :value="i" />
                </n-space>
                <n-select v-model:value="subset.pattern" :options="patterns" :render-label="renderLabel"/>
            </n-space>
        </n-radio-group>
        <n-button tertiary circle type="info" @click="createSubset()">
            <n-icon><plus-icon /></n-icon>
        </n-button>
    </n-space>
</template>

<script lang="ts">
import { h, VNodeChild } from 'vue'
import { NButton, NSpace, NSelect, NInput, NRadioGroup, NRadio, NIcon, SelectOption } from 'naive-ui'
import { AddOutline as PlusIcon } from '@vicons/ionicons5'
import { Options, Vue } from 'vue-class-component';
import { Watch } from 'vue-property-decorator'
import App from '@/App.vue'

import { SubsetConfig } from '@/subset/SubsetConfig'

@Options({
  components: {
    NButton, NSpace, NSelect, NInput, NRadioGroup, NRadio, PlusIcon, NIcon, App
  }
})
export default class SubsetsPane extends Vue {
    subsets = App.config.subset.items.map(subset => new SubsetConfig(subset.name, subset.pattern))
    patterns = App.config.subset.patterns.map(pattern => {return {label: pattern, value: pattern}})

    selectedSubsetIndex = App.config.subset.default.index
    defaultSubsetName = App.config.subset.default.name
    defaultSubsetPattern = App.config.subset.default.pattern

    created() {
        this.$emit('currentSubsetChange', this.subsets[this.selectedSubsetIndex])
    }

    renderLabel(option: SelectOption): VNodeChild {
        return [
            h(
                'img',
                {
                    src: `patterns/${option.label}.png`,
                    style: {
                        float: 'left',
                        'margin-top': '24px'
                    }
                    // style: {
                    //     // 'background-image': `url("${option.path}")`
                    //     'background-image': 'url("solid.png")',
                    //     width: '100px',
                    //     height: '20px'
                    // }
                }
            ),
            h(
                'p',
                {
                    style: {
                        float: 'left',
                        'text-align': 'left'
                    }
                },
                option.label as string
            )
        ]
    }

    createSubset() {
        this.subsets.push(new SubsetConfig(this.defaultSubsetName, this.defaultSubsetPattern))
    }

    updateCurrentSubset(value: number) {
        this.$emit('currentSubsetChange', this.subsets[value])
    }

    @Watch('subsets', { deep: true })
    redrawGraph() {
        this.$emit('redrawGraph')
    }
}
</script>
