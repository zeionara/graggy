<template>
    <n-space vertical>
        <n-radio-group v-model:value="selectedRelationIndex" @input="updateCurrentRelation($event.target.value)" name="relationSelector" size="large" style="width: 100%">
            <n-space vertical v-for="(relation, i) in this.relations" :key="i" size="large">
                <n-space>
                    <n-input round type="text" size="small" v-model:value="relation.name" style="width: 300px"/>
                    <n-button tertiary circle style = "width: 25px; height: 25px" type="error" :disabled = "!relation.disposable || relations.length < 2" @click="deleteRelation(i)">
                        <n-icon><minus-icon /></n-icon>
                    </n-button>
                    <n-radio :key="i" :value="i" />
                </n-space>
                <n-color-picker :modes="['hex']" v-model:value="relation.color"/>
            </n-space>
        </n-radio-group>
        <n-button tertiary circle type="info" @click="createRelation()">
            <n-icon><plus-icon /></n-icon>
        </n-button>
    </n-space>
</template>

<script lang="ts">
import { NButton, NSpace, NInput, NColorPicker, NRadioGroup, NRadio, NIcon } from 'naive-ui'
import { AddOutline as PlusIcon, RemoveOutline as MinusIcon } from '@vicons/ionicons5'
import { Options, Vue } from 'vue-class-component';
import { Watch } from 'vue-property-decorator'
import App from '@/App.vue'

import { RelationConfig } from '@/relation/RelationConfig'

@Options({
  components: {
    NButton, NSpace, NInput, NColorPicker, NRadioGroup, NRadio, PlusIcon, MinusIcon, NIcon, App
  }
})
export default class RelationsPane extends Vue {
    relations = App.config.relation.items.map(relation => new RelationConfig(relation['name'], relation['color']))

    selectedRelationIndex = App.config.relation.default.index
    defaultRelationName = App.config.relation.default.name
    defaultRelationColor = App.config.relation.default.color

    created() {
        this.$emit('currentRelationChange', this.relations[this.selectedRelationIndex])
    }

    createRelation() {
        this.relations.push(new RelationConfig(this.defaultRelationName, this.defaultRelationColor))
    }

    deleteRelation(i: number) {
        console.log("deleting relation")
        this.relations.splice(i, 1)
        const newRelationIndex = Math.min(this.selectedRelationIndex, this.relations.length - 1)
        if (newRelationIndex != this.selectedRelationIndex) {
            this.selectedRelationIndex = newRelationIndex
            this.updateCurrentRelation(this.selectedRelationIndex)
        }
    }

    // @Watch('selectedRelationIndex')
    updateCurrentRelation(value: number) {
        this.$emit('currentRelationChange', this.relations[value])
    }

    @Watch('relations', { deep: true })
    redrawGraph() {
        this.$emit('redrawGraph')
    }
}
</script>
