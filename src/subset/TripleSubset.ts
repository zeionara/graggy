import { SubsetConfig } from '@/subset/SubsetConfig'
import { Triple } from '@/Triple'

class TripleSubset {
    config: SubsetConfig
    items: Triple[] = []

    constructor(config: SubsetConfig, triples: Triple[] = undefined) {
        this.config = config
        if (triples) {
            this.push(triples)
        }
    }

    push(triples: Triple[]) {
        this.items.push(...triples)
    }
}

export { TripleSubset }
