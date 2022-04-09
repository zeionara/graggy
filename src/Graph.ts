import { Node } from '@/Node'
import { Triple } from '@/Triple'
import { Connector } from '@/Connector'
import { Relation } from '@/relation/Relation'
import { Location } from '@/Location'
import { UserDefinedPathRelation } from '@/relation/UserDefinedPathRelation'
import { drawGrid } from '@/drawing/grid'
import { NodeAnchorPoint } from '@/NodeAnchorPoint'
import { TripleSet } from '@/TripleSet'
import { RelationConfig } from '@/relation/RelationConfig'

class Graph {
    element: HTMLElement
    nEntities = 0
    nodes: Node[] = []
    triples = new TripleSet()
    connectors: Connector[] = []
    relations: Relation[] = []

    currentHeads: Node[] = []
    currentRelation: RelationConfig
    currentRelationLineThickness: number
    drawingRelation = false
    currentRelationSubset: string
    enableGrid = false
    gridStep: number

    constructor(element: HTMLElement, enableGrid, gridStep) {
        this.element = element
        this.enableGrid = enableGrid
        this.gridStep = gridStep
    }

    appendNode(node: Node) {
        node.id = `entity-${this.nEntities++}`
        // this.element.appendChild(node.element)
        this.element.insertBefore(node.element, this.element.firstChild)
        this.nodes.push(node)
    }

    get data_attribute_name() {
        let data_attribute_name: string
        this.element.getAttributeNames().forEach((attribute_name) => {
            if (attribute_name.startsWith('data-v-')) {
                data_attribute_name = attribute_name
            }
        })
        return data_attribute_name
    }

    get canvas() {
        return this.element.lastChild as HTMLCanvasElement
    }

    get width() {
        return this.element.getBoundingClientRect().width
    }

    get height() {
        return this.element.getBoundingClientRect().height
    }

    push_triples(tails: Node[]) {
        const triples: Triple[] = []

        tails.forEach((tail) => {
            this.currentHeads.forEach((head) => {
                triples.push(new Triple(head, this.currentRelation, tail))
            })
        })

        this.triples.push(triples, this.currentRelationSubset)
    }

    push_connector(connector: Connector) {
        this.connectors.push(connector)
    }

    push_relation(relation: Relation) {
        this.relations.push(relation)
    }

    push_relation_segment(segment: Location) {
        const last_relation = this.relations[this.relations.length - 1] as UserDefinedPathRelation
        last_relation.segments.push(segment)
    }

    draw() {
        const ctx = this.canvas.getContext('2d')
        this.connectors.forEach(connector => connector.draw(ctx))
        this.relations.forEach(relation => relation.draw(ctx))
    }

    redraw() {
        const ctx = this.canvas.getContext('2d')
        let targets: NodeAnchorPoint[]

        ctx.clearRect(0, 0, this.width, this.height)

        if (this.enableGrid) {
            targets = drawGrid(this, this.gridStep)
        }

        this.draw()

        return targets
    }

    changeCurrentRelationSubset(value: string) {
        this.currentRelationSubset = value
    }

    get currentLineDash() {
        if (this.currentRelationSubset == "train") {
            return []
        } else if (this.currentRelationSubset == "test") {
            return [10, 10]
        } else if (this.currentRelationSubset == "valid") {
            return [15, 3, 3, 3]
        }
    }
}

export { Graph }
