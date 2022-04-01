import { Relation } from '@/relation/Relation'
import { Connector } from '@/Connector'
import { Location } from '@/Location'

class UserDefinedPathRelation implements Relation {
    src: Connector
    dst: Connector

    type: string
    thickness: number

    beginning: Location
    segments: Location[]

    constructor(beginning: Location, src: Connector, type: string, thickness: number) {
        this.beginning = beginning
        this.src = src
        this.segments = []
        this.type = type
        this.thickness = thickness
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();

        const previous_stroke_style = ctx.strokeStyle
        const previous_line_thickness = ctx.lineWidth

        ctx.strokeStyle = this.type
        ctx.lineWidth = this.thickness

        ctx.moveTo(this.beginning.x, this.beginning.y);

        this.segments.forEach(segment => {
            ctx.lineTo(segment.x, segment.y);
            ctx.stroke();
        })

        ctx.strokeStyle = previous_stroke_style
        ctx.lineWidth = previous_line_thickness
    }
}

export { UserDefinedPathRelation }
