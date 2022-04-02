import { Graph } from '@/Graph'
import { Location } from '@/Location'
import { LinearRelation } from '@/relation/LinearRelation'


function drawLineSegment(graph: Graph, event, enable_straight_lines_drawing) {
    const canvas = graph.canvas

    if (graph.drawingRelation && event.target == graph.canvas) {
        const ctx = canvas.getContext('2d')

        if (enable_straight_lines_drawing) {
            graph.redraw()

            const beginning = (graph.relations[graph.relations.length - 1] as LinearRelation).beginning

            ctx.beginPath();
            ctx.moveTo(beginning.x, beginning.y);

            ctx.lineTo(event.offsetX, event.offsetY)
            ctx.stroke()
        } else {
            graph.push_relation_segment(new Location(event.offsetX, event.offsetY))

            ctx.lineTo(event.offsetX, event.offsetY)
            ctx.stroke()
        }
    }
}

export { drawLineSegment }
