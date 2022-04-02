import { Triple } from '@/Triple'

class TripleSet {
   train: Triple[] = []
   test: Triple[] = []
   valid: Triple[] = []

   push(triples: Triple[], subset: string) {
        if (subset == "train") {
            this.train.push(...triples)
        } else if (subset == "test") {
            this.test.push(...triples)
        } else if (subset == "valid") {
            this.valid.push(...triples)
        }
   }
}

export { TripleSet }
