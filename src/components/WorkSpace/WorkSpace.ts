import { NSwitch, NButton, NSpace, NSelect, NCode, NInput, NDivider, NColorPicker, NRadioGroup, NRadio, NIcon } from 'naive-ui'
import { AddOutline as PlusIcon } from '@vicons/ionicons5'
import { Options, Vue } from 'vue-class-component';
import { RelationConfig } from '@/relation/RelationConfig'
import { SubsetConfig } from '@/subset/SubsetConfig'
import App from '@/App.vue'

import RelationsPane from '@/components/RelationsPane.vue'
import SubsetsPane from '@/components/SubsetsPane.vue'
import Switch from '@/components/Switch.vue'
import Slider from '@/components/Slider.vue'
import Graph from '@/components/Graph/Graph.vue'

@Options({
  components: {
    NSwitch, NButton, NSpace, NSelect, NCode, NInput, NDivider, NColorPicker, NRadioGroup, NRadio, PlusIcon, NIcon, App,
    RelationsPane, SubsetsPane, Switch, Slider, Graph
  }
})
export default class WorkSpace extends Vue {

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
        document.getElementsByClassName('exported-graph')[0].innerHTML = 'content'
    }

    forEachGraph(callback: (graph) => undefined) {
        if (this.$refs.graphs) {
            (this.$refs.graphs as (typeof Graph[])).forEach(callback)
        }
    }
}
