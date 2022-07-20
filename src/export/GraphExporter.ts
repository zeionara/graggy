import Tar from 'memory-tar-create'
import { RelationConfig } from '@/relation/RelationConfig' 
import { SubsetConfig } from '@/subset/SubsetConfig'

import GraphExportWrapper from './GraphExportWrapper'

class GraphExporter {
    nRelationInstances: Record<string, number>

    subsets: SubsetConfig[]
    relations: RelationConfig[]

    nRepetitions: number
    forbidSameTripleInMultipleSubsets: boolean

    files: Tar

    graphs: GraphExportWrapper[]

    constructor(graphs, subsets: SubsetConfig[], relations: RelationConfig[], nRepetitions: number, forbidSameTripleInMultipleSubsets: boolean) {
        this.files = new Tar()

        this.subsets = subsets
        this.relations = relations
        this.nRepetitions = nRepetitions
        this.forbidSameTripleInMultipleSubsets

        this.graphs = graphs.map(graph => new GraphExportWrapper(graph, this.subsets, this.relations, this.nRepetitions, this.forbidSameTripleInMultipleSubsets))
    }
}

export { GraphExporter }
