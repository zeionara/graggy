import TripleExportWrapper from './TripleExportWrapper'

export default class TripleGenerationStrategy {
    label: string

    constructor(label: string = undefined) {
        this.label = label
    }

    generate(triples: TripleExportWrapper[]) {
        return triples
    }
}
