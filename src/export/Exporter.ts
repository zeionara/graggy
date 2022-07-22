import Tar from 'memory-tar-create'
import { RelationConfig } from '@/relation/RelationConfig' 
import { SubsetConfig } from '@/subset/SubsetConfig'
import { mergeListOfObjectsOfLists } from '@/collections'

import GraphExportWrapper from './GraphExportWrapper'
import TripleExportWrapper from './TripleExportWrapper'
import TripleGenerationStrategy from './TripleGenerationStrategy'
import IntraRepetitionSamplingStrategy from './IntraRepetitionSamplingStrategy'

export default class Exporter {
    nRelationInstances: Record<string, number>

    subsets: SubsetConfig[]
    relations: RelationConfig[]

    nRepetitions: number
    forbidSameTripleInMultipleSubsets: boolean

    constructor(subsets: SubsetConfig[], relations: RelationConfig[], nRepetitions: number, forbidSameTripleInMultipleSubsets: boolean) {
        this.subsets = subsets
        this.relations = relations
        this.nRepetitions = nRepetitions
        this.forbidSameTripleInMultipleSubsets = forbidSameTripleInMultipleSubsets
    }

    export(filename: string, graphs, tripleGenerationStrategy: TripleGenerationStrategy, nSamples = 0) {
        const files = new Tar()

        const intraRepetitionSamplingStrategy = nSamples > 0 ? new IntraRepetitionSamplingStrategy() : undefined

        const wrappedGraphs = graphs.map(graph => {
            const wrappedGraph = new GraphExportWrapper(graph, this.subsets, this.relations, this.nRepetitions, this.forbidSameTripleInMultipleSubsets)
            
            if (nSamples > 0) {
                intraRepetitionSamplingStrategy.sample(wrappedGraph, nSamples)
            }
            return wrappedGraph
        })

        const mergedTripleLists = mergeListOfObjectsOfLists(wrappedGraphs.map(graph => graph.triples))

        for (const [subsetFilename, subsetTriples] of Object.entries(mergedTripleLists)) {
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
