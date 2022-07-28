import { Location } from '@/Location'
import { drawFilledSquare } from '@/geometry'
import { RelationConfig } from '@/relation/RelationConfig'

class Connector extends Location {
    size: number
    relation: RelationConfig

    constructor(x: number, y: number, size: number, relation: RelationConfig) {
        super(x, y)
        this.size = size
        this.relation = relation
    }

    draw(ctx: CanvasRenderingContext2D) {
        drawFilledSquare(ctx, this.x, this.y, this.size, this.relation.color)
    }

    getExportable() {
        const exportable = super.getExportable()

        exportable['size'] = this.size
        exportable['relation'] = this.relation.name

        return exportable
    }
}

export { Connector }
