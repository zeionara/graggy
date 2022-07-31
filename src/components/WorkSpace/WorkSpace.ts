import App from '@/App.vue'

import { NUpload, NSwitch, NButton, NSpace, NSelect, NCode, NInput, NDivider, NColorPicker, NRadioGroup, NRadio, NIcon, useDialog, useMessage } from 'naive-ui'
import { AddOutline as PlusIcon } from '@vicons/ionicons5'
import { Options, Vue } from 'vue-class-component';
import { RelationConfig } from '@/relation/RelationConfig'
import { SubsetConfig } from '@/subset/SubsetConfig'
import { exportAsArchive } from '@/export/main'

import RelationsPane from '@/components/RelationsPane.vue'
import SubsetsPane from '@/components/SubsetsPane.vue'
import Switch from '@/components/Switch.vue'
import Slider from '@/components/Slider.vue'
import Graph from '@/components/Graph/Graph.vue'
import WeightedRepetitionSamplingStrategy from '@/export/samplingStrategies/WeightedRepetitionSamplingStrategy'
import UniformRepetitionSamplingStrategy from '@/export/samplingStrategies/UniformRepetitionSamplingStrategy'
import SamplingStrategy from '@/export/samplingStrategies/SamplingStrategy'
import untar from '@/import/main'

const format = await import('../../vendor/dateFormat.min.js')

@Options({
  components: {
    NUpload, NSwitch, NButton, NSpace, NSelect, NCode, NInput, NDivider, NColorPicker, NRadioGroup, NRadio, PlusIcon, NIcon, useDialog, useMessage,
    App,
    RelationsPane, SubsetsPane, Switch, Slider, Graph
  }
})
export default class WorkSpace extends Vue {

    dialog = useDialog()
    message = useMessage()

    forbidSameTripleInMultipleSubsetsSwitch = App.config.switch['forbid-same-triple-in-multiple-subsets']
    allowLoopsSwitch = App.config.switch['allow-loops']

    // Global variables

    nGraphs: number = App.config.graph.count

    // Number of repetitions parameters

    nRepetitions: number = App.config.export.repetitions.number
    nRepetitionsStep: number = App.config.export.repetitions.step
    nRepetitionsMin: number = App.config.export.repetitions.min
    nRepetitionsMax: number = App.config.export.repetitions.max

    // Number of relations to sample

    nRelationsToSample: number = App.config.export['sampled-relations'].number
    nRelationsToSampleStep: number = App.config.export['sampled-relations'].step
    nRelationsToSampleMin: number = App.config.export['sampled-relations'].min
    nRelationsToSampleMax: number = App.config.export['sampled-relations'].max

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

    samplingStrategies = [
        new WeightedRepetitionSamplingStrategy(this.nRelationsToSample, this.allowLoopsSwitch),
        new UniformRepetitionSamplingStrategy(this.nRelationsToSample, this.allowLoopsSwitch)
    ]
    labelToSamplingStrategy = new Map(this.samplingStrategies.map(strategy => [strategy.label, strategy]))
    // samplingStrategyOptions = [{label: 'foo', value: 'foo'}, {label: 'bar', value: 'bar'}] // this.samplingStrategies.map(strategy => {return {label: strategy.label, value: strategy}})
    samplingStrategyOptions = this.samplingStrategies.map(strategy => {return {label: strategy.label, value: strategy.label}})
    samplingStrategy: SamplingStrategy = this.samplingStrategies[0]  // = this.samplingStrategyOptions[0].label
    // samplingStrategyOption = this.samplingStrategyOptions[0]
    samplingStrategyLabel = this.samplingStrategyOptions[0].label

    exportTriples() {
        // console.log(this.forbidSameTripleInMultipleSubsetsSwitch)
        this.samplingStrategy.nSamples = this.nRelationsToSample
        this.samplingStrategy.allowLoops = this.allowLoopsSwitch

        // console.log(this.mapGraphs(graph => graph.get_exportable()))

        exportAsArchive(
            this.$refs.graphs, (this.$refs.relations as RelationsPane).relations, (this.$refs.subsets as SubsetsPane).subsets,
            `graph-${format.dateFormat(new Date(), 'd-m-Y h:i:s')}.tar.gz`, this.nRepetitions,
            this.forbidSameTripleInMultipleSubsetsSwitch, [this.samplingStrategy]
        )
    }

    import(foo) {
        untar(foo.file.file).then(folder => {
            folder.folders.forEach(graph => {
                graph.files.forEach(file => {
                    if (file.name === 'description') {
                        console.log(file.content)
                        this.createGraph()
                    }
                })
            })
        })
    }

    forEachGraph(callback: (graph) => any) {
        if (this.$refs.graphs) {
            (this.$refs.graphs as (typeof Graph[])).forEach(callback)
        }
    }

    mapGraphs(callback: (graph) => any) {
        if (this.$refs.graphs) {
            return (this.$refs.graphs as (typeof Graph[])).map(callback)
        }
    }

    clear() {
        this.dialog.warning({
            title: `Heads up!`,
            content: `Are you sure to clear all the content of ${this.nGraphs} graphs?`,
            positiveText: 'Yes',
            negativeText: 'No',
            onPositiveClick: () => {
                this.forEachGraph(graph => graph.clear())
                this.message.success('All content on graphs was erased')
            },
            onNegativeClick: () => {
                this.message.info('Cleanup was cancelled')
            }
       })
    }

    createGraph() {
        this.nGraphs += 1
    }

    deleteGraph(index: number) {
        for (let i = index; i < this.nGraphs - 1; i++) {
            const sourceIndex = i + 1
            const destinationIndex = i

            this.$refs.graphs[destinationIndex].assume(this.$refs.graphs[sourceIndex])
        }
        this.nGraphs -= 1
    }

    updateSamplingStrategy(label: string) {
        this.samplingStrategy = this.labelToSamplingStrategy.get(label);
    }

    updateRelationsToSampleSlider(nNodes: number = undefined, nRelations: number = undefined, nSubsets: number = undefined, nGraphRelations: number = undefined, nRepetitions: number = undefined) {
        if (this.$refs.relations === undefined) {
            return
        }

        if (nRelations === undefined) {
            nRelations = (this.$refs.relations as RelationsPane).relations.length
        }

        if (nRepetitions === undefined) {
            nRepetitions = this.nRepetitions
        }

        if (this.forbidSameTripleInMultipleSubsetsSwitch) {
            nSubsets = 1
        } else {
            if (nSubsets === undefined) {
                nSubsets = (this.$refs.subsets as SubsetsPane).subsets.length
            }
        }

        let nRelationsToSampleMaxMax = undefined

        this.forEachGraph(graph => {
            const currentNnodes = graph.nNodes
            let currentNgraphRelations = 0  // graph.relations.length  // Relations can repeat, hence it's not possible to just count the number of relation objects to obtain number of "free slots"
            let nRelationsToSampleMax: number

            if (this.forbidSameTripleInMultipleSubsetsSwitch) {
                const tripleDescriptions = new Set()

                graph.triples.subsets.forEach(subset => {
                    subset.items.forEach(triple => tripleDescriptions.add(triple.describe(undefined, undefined, true)))
                })

                currentNgraphRelations = tripleDescriptions.size
            } else {
                graph.triples.subsets.forEach(subset => {
                    const tripleDescriptions = new Set(subset.items.map(triple => triple.describe(undefined, undefined, true)))
                    currentNgraphRelations += [...tripleDescriptions].length
                })
            }

            if (currentNnodes > 1) {
                // nRelationsToSampleMax = getFactorial(currentNnodes) / (2 * getFactorial(currentNnodes - 2)) * nRelations * nSubsets - currentNgraphRelations
                // nRelationsToSampleMax = currentNnodes * (currentNnodes - 1) * nRelations * nSubsets * nRepetitions * nRepetitions - currentNgraphRelations
                if (this.allowLoopsSwitch) {
                    nRelationsToSampleMax = currentNnodes * currentNnodes * nRelations * nSubsets * nRepetitions * nRepetitions - currentNgraphRelations
                } else {
                    // console.log(currentNnodes, nRepetitions, nRelations, nSubsets)
                    nRelationsToSampleMax = currentNnodes * nRepetitions * (currentNnodes * nRepetitions - 1) * nRelations * nSubsets - currentNgraphRelations
                }
                // console.log(nRelationsToSampleMax)
            } else {
                nRelationsToSampleMax = 0
            }

            if (nRelationsToSampleMaxMax === undefined || nRelationsToSampleMax > nRelationsToSampleMaxMax) {
                nRelationsToSampleMaxMax = nRelationsToSampleMax
            }
        })

        this.nRelationsToSampleMax = nRelationsToSampleMaxMax

        // console.log(maxNnodes, nRelations, nSubsets)
        // for (let i = 0; i < this.nGraphs - 1; i++) {
        //     const sourceIndex = i + 1
        //     const destinationIndex = i

        //     this.$refs.graphs[destinationIndex].assume(this.$refs.graphs[sourceIndex])
        // }
        // this.nGraphs -= 1
    }

    swapGraphs(indices) {
        this.nGraphs += 1

        this.$nextTick(() => {
            this.$refs.graphs[this.nGraphs - 1].assume(this.$refs.graphs[indices.lhs])

            this.$nextTick(() => {
                this.$refs.graphs[indices.lhs].assume(this.$refs.graphs[indices.rhs])

                this.$nextTick(() => {
                    this.$refs.graphs[indices.rhs].assume(this.$refs.graphs[this.nGraphs - 1])

                    this.$nextTick(() => this.nGraphs -= 1)
                })
            })
        })
    }
}
