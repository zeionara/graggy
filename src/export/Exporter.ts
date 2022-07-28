import Tar from 'memory-tar-create'
import { RelationConfig } from '@/relation/RelationConfig' 
import { SubsetConfig } from '@/subset/SubsetConfig'

import GraphExportWrapper from './GraphExportWrapper'
import TripleStore from './TripleStore'
import SamplingStrategy from './samplingStrategies/SamplingStrategy'

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

    export(filename: string, graphs, strategies: SamplingStrategy[]) {
        const files = new Tar()

        graphs.map(graph => {
            const wrappedGraph = new GraphExportWrapper(graph, this.store, this.subsets, this.relations, this.nRepetitions, this.forbidSameTripleInMultipleSubsets)
            strategies.forEach(strategy => strategy.sample(wrappedGraph))

            files.add(
                {
                    [`${wrappedGraph.folder}/description.json`]: {
                        contents: JSON.stringify(graph.getExportable(), null, 2)
                    }
                }
            )

            return wrappedGraph
        })

        files.add(
            {
                [`description.json`]: {
                    contents: JSON.stringify({
                        relations: this.relations.map(relation => relation.getExportable())
                    }, null, 2)
                }
            }
        )

        for (const [subsetFilename, subsetTriples] of Object.entries(this.store.triples)) {
            files.add(
                {
                    [subsetFilename]: {
                        contents: subsetTriples.map(triple => triple.triple.description).join('\n')
                    }
                }
            )
        }


        files.gz().download(filename)
    }
}
