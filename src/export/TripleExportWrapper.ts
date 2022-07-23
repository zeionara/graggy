import { Triple, TripleWithGraph } from '@/Triple'
import { SubsetConfig } from '@/subset/SubsetConfig'

import SubsetExportWrapper from './SubsetExportWrapper'


export default class TripleExportWrapper {
    triple: TripleWithGraph
    subset: SubsetExportWrapper
    subsets: SubsetConfig[]

    includeSubsetInDescription: boolean
    // includeGraphIdInTripleDescription: boolean

    constructor(
        triple: Triple, subset: SubsetExportWrapper, graph = undefined, subsets: SubsetConfig[] = undefined,
        includeSubsetInDescription = true, i: number = undefined, includeGraphIdInTripleDescription = false,
        headIndex: number = undefined, tailIndex: number = undefined
    ) {
        if (i !== undefined) {
            this.triple = new TripleWithGraph(triple, graph, i, includeGraphIdInTripleDescription)
        } else {
            this.triple = new TripleWithGraph(triple, graph, undefined, includeGraphIdInTripleDescription, headIndex, tailIndex)
        }
        this.subset = subset
        this.subsets = subsets
        this.includeSubsetInDescription = includeSubsetInDescription
        // this.includeGraphIdInTripleDescription = includeGraphIdInTripleDescription
    }

    makeDescription(subset: SubsetConfig = undefined) {
        if (subset === undefined) {
            return this.triple.describe(' ', true)
        }
        return `${this.triple.describe(' ', true)} ${subset.name}`
    }

    get description() {
        // if (this.includeSubsetInDescription) {
        //     return this.makeDescription(this.subset.subset)
        // }
        return this.makeDescription(this.subset.subset)
    }

    get descriptions() {
        if (this.includeSubsetInDescription) {
            return this.subsets.map(subset => this.makeDescription(subset))
        }
        return [this.makeDescription(this.subset.subset)]
    }

    copy(i: number = undefined, includeGraphIdInTripleDescription = true, headIndex: number = undefined, tailIndex: number = undefined) {
        return new TripleExportWrapper(
            this.triple.triple, this.subset, this.triple.graph, this.subsets, this.includeSubsetInDescription,
            i, includeGraphIdInTripleDescription, headIndex === undefined ? this.triple.headIndex : headIndex, tailIndex === undefined ? this.triple.tailIndex : tailIndex
        )
    }
}
