import { Triple } from '@/Triple'
import { SubsetConfig } from '@/subset/SubsetConfig'
import { TripleSubset } from '@/subset/TripleSubset'

class TripleSet {
    subsets: TripleSubset[] = []

    push(triples: Triple[], subset: SubsetConfig) {
        let foundMatchingSubset = false

        for (let i = 0; i < this.subsets.length; i++) {
            const currentSubset = this.subsets[i] 
            if (currentSubset.config == subset) {
                currentSubset.push(triples)
                foundMatchingSubset = true
                break
            }
        }

        if (!foundMatchingSubset) {
           this.subsets.push(new TripleSubset(subset, triples)) 
        }
    }
}

export { TripleSet }
