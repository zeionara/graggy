import Tar from 'memory-tar-create'
import { RelationConfig } from '@/relation/RelationConfig' 
import { SubsetConfig } from '@/subset/SubsetConfig'
import { mergeListOfObjectsOfLists } from '@/collections'

import GraphExportWrapper from './GraphExportWrapper'
import TripleExportWrapper from './TripleExportWrapper'
import TripleGenerationStrategy from './TripleGenerationStrategy'
import TripleStore from './TripleStore'

export default class Exporter {
    nRelationInstances: Record<string, number>
    store: TripleStore

    subsets: SubsetConfig[]
    relations: RelationConfig[]

    nRepetitions: number
    forbidSameTripleInMultipleSubsets: boolean

    constructor(subsets: SubsetConfig[], relations: RelationConfig[], nRepetitions: number, forbidSameTripleInMultipleSubsets: boolean) {
        this.subsets = subsets
        this.relations = relations
        this.nRepetitions = nRepetitions
        this.forbidSameTripleInMultipleSubsets = forbidSameTripleInMultipleSubsets
        this.store = new TripleStore()
    }

    export(filename: string, graphs, tripleGenerationStrategy: TripleGenerationStrategy, strategies) {
        const files = new Tar()

        const wrappedGraphs = graphs.map(graph => {
            const wrappedGraph = new GraphExportWrapper(graph, this.store, this.subsets, this.relations, this.nRepetitions, this.forbidSameTripleInMultipleSubsets)
            strategies.forEach(strategy => strategy.sample(wrappedGraph))
            return wrappedGraph
        })

        // const mergedTripleLists = mergeListOfObjectsOfLists(wrappedGraphs.map(graph => graph.triples))

        for (const [subsetFilename, subsetTriples] of Object.entries(this.store.triples)) {
            files.add(
                {
                    [subsetFilename]: {
                        contents: tripleGenerationStrategy.generate(subsetTriples as TripleExportWrapper[]).map(triple => {
                            return triple.triple.description
                        }).join('\n')
                    }
                }
            )
        }

        files.gz().download(filename)
    }
}
