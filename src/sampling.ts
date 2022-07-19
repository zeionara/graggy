import { sample } from '@/random' 
import { Triple } from '@/Triple'


function sampleRelations(weights: Record<string, number>, seenTriples: Set<string>, stringToTriple: (string) => Triple, nSampledRelations: number, forbidSameTripleInMultipleSubsets = false) {
    let i = 0
    const possibleTriples = Object.keys(weights)

    while (i < nSampledRelations) {
        let sampledTriple = sample(weights, triple => seenTriples.has(triple))
        if (sampledTriple === undefined) {
            let j = 0
            while (seenTriples.has(possibleTriples[j])) {
                j += 1
            }
            sampledTriple = possibleTriples[j]
        }
        seenTriples.add(sampledTriple)

        const restoredTriple = stringToTriple(sampledTriple)

        if (forbidSameTripleInMultipleSubsets) {
            seenTriplesWithoutSubset.add(tripleToString(restoredTriple.head.id, restoredTriple.relation.id, restoredTriple.tail.id))
            const subset = restoredTriple.subsetObject
            subsets.forEach(anotherSubset => {
                    if (anotherSubset.name !== subset.name) {
                        seenTriples.add(tripleToString(restoredTriple.head.id, restoredTriple.relation.id, restoredTriple.tail.id, anotherSubset.name))
                    }
               }
           )
        }

        if (restoredTriple.subset in triples) {
            if (nRepetitions < 2) {
                triples[restoredTriple.subset].push(restoredTriple.makeTriple(undefined))
            } else {
                for (let j = 0; j < nRepetitions; j += 1) {
                     triples[restoredTriple.subset].push(restoredTriple.makeTriple(j))
                }
            }
        } else {
            if (nRepetitions < 2) {
                triples[restoredTriple.subset] = [restoredTriple.makeTriple(undefined)]
            } else {
                const currentTriples: TripleWithGraph[] = []

                for (let j = 0; j < nRepetitions; j += 1) {
                    currentTriples.push(restoredTriple.makeTriple(j))
                }

                triples[restoredTriple.subset] = currentTriples
            }
        }
        i += 1
    }
}
