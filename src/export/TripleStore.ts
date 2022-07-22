import TripleExportWrapper from './TripleExportWrapper'


export default class TripleStore {
    triples: Record<string, Array<TripleExportWrapper>>
    
    constructor() {
        this.triples = {}
    }

    push(path: string, triple: TripleExportWrapper) {
        if (path in this.triples) {
            this.triples[path].push(triple)
        } else {
            this.triples[path] = [triple]
        }
    }

    pushMany(path: string, triples: TripleExportWrapper[]) {
        if (path in this.triples) {
            this.triples[path].push(...triples)
        } else {
            this.triples[path] = triples
        }
    }
}
