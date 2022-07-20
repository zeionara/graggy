import { SubsetConfig } from '@/subset/SubsetConfig'

import GraphExportWrapper from './GraphExportWrapper'


export default class SubsetExportWrapper {
    subset: SubsetConfig
    
    constructor(subset: SubsetConfig) {
        this.subset = subset
    }

    get filename() {
        return `${this.subset.name}.tsv`
    }

    getPath(graph: GraphExportWrapper) {
        return `${graph.folder}/${this.filename}`
    }
}
