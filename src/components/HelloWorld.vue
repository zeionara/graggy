<template>
    <n-space justify="center">
        <n-space vertical>
            <Graph v-for = "i in 2" ref = "graphs" v-bind:key = "i"
                v-bind:nodeSize = "nodeSize" v-bind:nAnchorPointsPerEdge = "nAnchorPointsPerEdge" v-bind:enableGrid = "gridSwitch" v-bind:gridColor = "gridColor"
                v-bind:currentSubset = "currentSubset" v-bind:currentRelation = "currentRelation" v-bind:relationLineThickness = "relationLineThickness"
                v-bind:enableConnectorAutoAlignment = "connectorAutoAlignmentSwitch" v-bind:connectorSize = "connectorSize" v-bind:enableStraightLines = "straightLinesSwitch"
                v-bind:enableNodeRenameMode = "nodeRenameSwitch" v-bind:enableLiveRedraw = "liveRedrawSwitch" v-bind:bgColor = "bgColor" v-bind:index = "i - 1"
            />
        </n-space>
        <n-space vertical>
            <n-divider title-placement = "left">
                Graph properties
            </n-divider>
            <Switch 
                purpose="relation connector automatic alignment" v-bind:defaultValue = "connectorAutoAlignmentSwitch" @update-value = "this.connectorAutoAlignmentSwitch = $event.value"
            />
            <Switch
                purpose="straight lines drawing" v-bind:defaultValue = "straightLinesSwitch" @update-value = "this.straightLinesSwitch = $event.value"
            />
            <Switch
                purpose="grid" v-bind:defaultValue = "gridSwitch" @update-value = "this.gridSwitch = $event.value"
            />
            <Switch
                purpose="node rename mode" v-bind:defaultValue = "nodeRenameSwitch" @update-value = "this.nodeRenameSwitch = $event.value; forEachGraph(graph => graph.toggleNodeRenameMode($event))"
            />
            <Switch
                purpose="live redraw" v-bind:defaultValue = "liveRedrawSwitch" @update-value = "this.liveRedrawSwitch = $event.value"
            />
            <Slider
                purpose="connector size" v-bind:defaultValue = "connectorSize"
                @update-value = "this.connectorSize = $event.value; forEachGraph(graph => {graph.setConnectorSize($event); graph.liveRedraw()})"
                v-bind:min = "connectorSizeMin" v-bind:max = "connectorSizeMax" v-bind:step = "connectorSizeStep"
            />
            <Slider
                purpose="line thickness" v-bind:defaultValue = "relationLineThickness"
                @update-value = "this.relationLineThickness = $event.value; forEachGraph(graph => {graph.setLineThickness($event); graph.liveRedraw()})"
                v-bind:min = "relationLineThicknessMin" v-bind:max = "relationLineThicknessMax" v-bind:step = "relationLineThicknessStep"
            />
            <Slider
                purpose="grid density" v-bind:defaultValue = "nAnchorPointsPerEdge"
                @update-value = "this.nAnchorPointsPerEdge = $event.value; forEachGraph(graph => graph.toggleGrid(gridSwitch))"
                v-bind:min = "nAnchorPointsPerEdgeMin" v-bind:max = "nAnchorPointsPerEdgeMax" v-bind:step = "nAnchorPointsPerEdgeStep"
            />
            <n-space>
                <n-button type="primary" @click="this.export()">export</n-button>
                <n-button type="info" @click="forEachGraph(graph => graph.redraw())" :disabled="liveRedrawSwitch">redraw</n-button>
                <n-button type="error" disabled>clear</n-button>
            </n-space>
            <n-divider title-placement = "left">
                Relation properties
            </n-divider>
            <RelationsPane @current-relation-change = "this.currentRelation = $event" @redraw-graph = "forEachGraph(graph => graph.liveRedraw())"/>
            <n-divider title-placement = "left">
                Subset properties
            </n-divider>
            <SubsetsPane @current-subset-change = "this.currentSubset = $event" @redraw-graph = "forEachGraph(graph => graph.liveRedraw())"/>
            <n-space>
                <p class = "exported-graph" style = "text-align: left">Draw graph and then click export button</p>
            </n-space>
        </n-space>
    </n-space>
</template>

<script lang="ts">
import { NSwitch, NButton, NSpace, NSelect, NCode, NInput, NDivider, NColorPicker, NRadioGroup, NRadio, NIcon } from 'naive-ui'
import { AddOutline as PlusIcon } from '@vicons/ionicons5'
// import interact from 'interactjs';
import { Options, Vue } from 'vue-class-component';
// import { Node } from '@/Node'
// import { Graph as GraphC } from '@/Graph'
// import { Location } from '@/Location'
// import { NodeAnchorPoint } from '@/NodeAnchorPoint'
// import { drawLineSegment } from '@/drawing/relationLine'
// import { drawAnchoredConnectorAndAdjacentLineSegment, drawConnector, drawTerminalAnchoredConnectorAndAdjacentLineSegment, drawTerminalConnector } from '@/drawing/connectors'
// import { Watch } from 'vue-property-decorator'
import { RelationConfig } from '@/relation/RelationConfig'
import { SubsetConfig } from '@/subset/SubsetConfig'
import App from '@/App.vue'

import RelationsPane from '@/components/RelationsPane.vue'
import SubsetsPane from '@/components/SubsetsPane.vue'
import Switch from '@/components/Switch.vue'
import Slider from '@/components/Slider.vue'
import Graph from '@/components/Graph.vue'

@Options({
  components: {
    NSwitch, NButton, NSpace, NSelect, NCode, NInput, NDivider, NColorPicker, NRadioGroup, NRadio, PlusIcon, NIcon, App,
    RelationsPane, SubsetsPane, Switch, Slider, Graph
  }
})
export default class HelloWorld extends Vue {

    // Connector size slider parameters

    connectorSize: number = App.config.connector.size
    connectorSizeStep: number = App.config.connector.step
    connectorSizeMin: number = App.config.connector.min
    connectorSizeMax: number = App.config.connector.max

    // Relation line thickness slider parameters

    relationLineThickness: number = App.config.line.thickness
    relationLineThicknessStep: number = App.config.line.step
    relationLineThicknessMin: number = App.config.line.min
    relationLineThicknessMax: number = App.config.line.max

    // Grid density slider parameters

    nAnchorPointsPerEdge: number = App.config.grid['n-anchor-points-per-edge']
    nAnchorPointsPerEdgeStep: number = App.config.grid.step
    nAnchorPointsPerEdgeMin: number = App.config.grid.min
    nAnchorPointsPerEdgeMax: number = App.config.grid.max

    // Switch parameters

    connectorAutoAlignmentSwitch: boolean = App.config.switch['connector-auto-alignment']
    straightLinesSwitch: boolean = App.config.switch['straight-lines']
    gridSwitch: boolean = App.config.switch.grid
    nodeRenameSwitch: boolean = App.config.switch['node-rename']
    liveRedrawSwitch: boolean = App.config.switch['live-redraw']

    // Selector parameters

    currentRelation: RelationConfig = null
    currentSubset: SubsetConfig = null

    // Static parameters which are read from the configuration file and cannot be changed

    bgColor = App.config.graph["bg-color"]
    gridColor = App.config.graph["grid-color"]
    nodeSize = App.config.node.size

    export() {
        // const content = this.graphs[0].triples.subsets.map(subset =>
        //      ([subset.config.name, ''].concat(subset.items.map(triple => triple.description))).join('<br/>')
        // ).join('<br/>')

        document.getElementsByClassName('exported-graph')[0].innerHTML = 'content'
    }

    forEachGraph(callback: (graph: Graph) => undefined) {
        if (this.$refs.graphs) {
            (this.$refs.graphs as Graph[]).forEach(callback)
        }
    }
}
</script>


<style scoped lang="scss">
html,body {
    margin: 0 !important;
    padding: 0 !important;
}
</style>
