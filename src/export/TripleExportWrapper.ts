import { Triple, TripleWithGraph } from '@/Triple'
import { SubsetConfig } from '@/subset/SubsetConfig'

import SubsetExportWrapper from './SubsetExportWrapper'


export default class TripleExportWrapper {
    triple: TripleWithGraph
    subset: SubsetExportWrapper
    subsets: SubsetConfig[]

    includeSubsetInDescription: boolean

    constructor(triple: Triple, subset: SubsetExportWrapper, graph = undefined, subsets: SubsetConfig[] = undefined, includeSubsetInDescription = true, i: number = undefined) {
        this.triple = new TripleWithGraph(triple, graph, i)
        this.includeSubsetInDescription = includeSubsetInDescription
        this.subset = subset
        this.subsets = subsets
    }

    makeDescription(subset: SubsetConfig = undefined) {
        if (subset === undefined) {
            return `${this.triple.triple.head.id} ${this.triple.triple.relation.id} ${this.triple.triple.tail.id}`
        }
        return `${this.triple.triple.head.id} ${this.triple.triple.relation.id} ${this.triple.triple.tail.id} ${subset.name}`
    }

    get description() {
        if (this.includeSubsetInDescription) {
            return this.makeDescription()
        }
        return this.makeDescription(this.subset.subset)
    }

    get descriptions() {
        if (this.includeSubsetInDescription) {
            return this.subsets.map(subset => this.makeDescription(subset))
        }
        return [this.makeDescription()]
    }

    copy(i: number = undefined) {
        return new TripleExportWrapper(this.triple.triple, this.subset, this.triple.graph, this.subsets, this.includeSubsetInDescription, i)
    }
}
