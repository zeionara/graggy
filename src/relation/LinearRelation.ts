import { Relation } from '@/relation/Relation'
import { Connector } from '@/Connector'
import { Location } from '@/Location'
import { RelationConfig } from '@/relation/RelationConfig'

class LinearRelation implements Relation {
    src: Connector
    dst: Connector

    type: RelationConfig
    thickness: number
    line_dash: number[]

    beginning: Location
    ending: Location

    constructor(beginning: Location, src: Connector, type: RelationConfig, thickness: number, line_dash: number[]) {
        this.beginning = beginning
        this.src = src
        this.type = type
        this.thickness = thickness
        this.line_dash = line_dash
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.ending) {
            ctx.beginPath();

            const previous_stroke_style = ctx.strokeStyle
            const previous_line_thickness = ctx.lineWidth
            const previous_line_dash = ctx.getLineDash()

            ctx.strokeStyle = this.type.color
            ctx.lineWidth = this.thickness
            ctx.setLineDash(this.line_dash)

            ctx.moveTo(this.beginning.x, this.beginning.y);
            ctx.lineTo(this.ending.x, this.ending.y);
            ctx.stroke();

            ctx.strokeStyle = previous_stroke_style
            ctx.lineWidth = previous_line_thickness
            ctx.setLineDash(previous_line_dash)
        }
    }
}

export { LinearRelation }
