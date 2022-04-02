import { Relation } from '@/relation/Relation'
import { Connector } from '@/Connector'
import { Location } from '@/Location'

class UserDefinedPathRelation implements Relation {
    src: Connector
    dst: Connector

    type: string
    thickness: number
    line_dash: number[]

    beginning: Location
    segments: Location[]

    constructor(beginning: Location, src: Connector, type: string, thickness: number, line_dash: number[]) {
        this.beginning = beginning
        this.src = src
        this.segments = []
        this.type = type
        this.thickness = thickness
        this.line_dash = line_dash
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();

        const previous_stroke_style = ctx.strokeStyle
        const previous_line_thickness = ctx.lineWidth
        const previous_line_dash = ctx.getLineDash()

        ctx.strokeStyle = this.type
        ctx.lineWidth = this.thickness
        ctx.setLineDash(this.line_dash)

        ctx.moveTo(this.beginning.x, this.beginning.y);

        this.segments.forEach(segment => {
            ctx.lineTo(segment.x, segment.y);
            ctx.stroke();
        })

        ctx.strokeStyle = previous_stroke_style
        ctx.lineWidth = previous_line_thickness
        ctx.setLineDash(previous_line_dash)
    }
}

export { UserDefinedPathRelation }
