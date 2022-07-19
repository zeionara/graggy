import Tar from 'memory-tar-create'
import { RelationConfig } from '@/relation/RelationConfig' 
import { SubsetConfig } from '@/subset/SubsetConfig'
import { Triple } from '@/Triple'


class NodePair {
    lhs
    rhs

    constructor(lhs, rhs) {
        this.lhs = lhs
        this.rhs = rhs
    }

    get description() {
        return `${this.lhs.id} ${this.rhs.id}`
    }
}


class SubsetExportWrapper {
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


class TripleExportWrapper {
    triple: Triple

    constructor(triple: Triple) {
        this.triple = triple
    }

    // Continue from here

}


class GraphExportWrapper {
    graph

    stringToNodePairMapping: Record<string, NodePair>

    nNodePairInstances: Record<string, number>

    constructor(graph) {
        this.graph = graph
        this.nNodePairInstances = {}

        graph.nodes.forEach(lhs => {
            graph.nodes.forEach(rhs => {
                if (lhs !== rhs) {
                    this.nNodePairInstances[this.nodePairToString(new NodePair(lhs, rhs))] = 0
                }
            })
        })
    }

    get folder() {
        return `${this.graph.name ? this.graph.name : this.graph.index}`
    }

    nodePairToString(pair: NodePair) {
        this.stringToNodePairMapping[pair.description] = pair
        return pair.description
    }

    push(seenTriples: Set<string>) {
        this.graph.triples.subsets.forEach(subset => {
                const wrappedSubset = SubsetExportWrapper(subset.config)

                const foo = {
                    [wrappedSubset.getPath(this)]: {
                        contents: subset.items.map(triple => {
                            seenTriples.add(tripleToString(triple.head.id, triple.relation.id, triple.tail.id, subset.config.name))
                            if (forbidSameTripleInMultipleSubsets) {
                                seenTriplesWithoutSubset.add(tripleToString(triple.head.id, triple.relation.id, triple.tail.id))
                                subsets.forEach(anotherSubset => {
                                        if (anotherSubset.name !== subset.config.name) {
                                            seenTriples.add(tripleToString(triple.head.id, triple.relation.id, triple.tail.id, anotherSubset.name))
                                        }
                                   }
                               )
                            }
                            if (filename in triples) {
                                if (nRepetitions < 2) {
                                    triples[filename].push(new TripleWithGraph(triple, graph))
                                } else {
                                    for (let i = 0; i < nRepetitions; i += 1) {
                                        triples[filename].push(new TripleWithGraph(triple, graph, i))
                                    }
                                }
                            } else {
                                if (nRepetitions < 2) {
                                    triples[filename] = [new TripleWithGraph(triple, graph)]
                                } else {
                                    const currentTriples: TripleWithGraph[] = []

                                    for (let i = 0; i < nRepetitions; i += 1) {
                                        currentTriples.push(new TripleWithGraph(triple, graph, i))
                                    }

                                    triples[filename] = currentTriples
                                }
                            }

                            nRelationInstances[triple.relation.id] += 1
                            nNodePairInstances[nodePairToString(triple.head.id, triple.tail.id)] += 1

                            return triple.description  // Repetitions are not written to files corresponding to separate graphs
                        }).join('\n')
                    }
                }
            }
        )
    }
}


class GraphExporter {
    nRelationInstances: Record<string, number>

    stringToRelationMapping: Record<string, RelationConfig>

    seenTriples: Set<string>

    files: Tar

    constructor(relations, nodes) {
        this.reset()
        this.files = new Tar()

        relations.forEach(relation => {
            this.nRelationInstances[this.relationToString(relation)] = 0
        })

    }

    relationToString(relation: RelationConfig) {
        this.stringToRelationMapping[relation.id] = relation
        return relation.id
    }

    reset() {
        this.nRelationInstances = {}

        this.seenTriples = new Set<string>()
    }

    push(graph) {
        const wrappedGraph = new GraphExportWrapper(graph)
    }
}

export { GraphExporter }
