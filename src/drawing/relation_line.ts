import { Graph } from '@/Graph'
import { Location } from '@/Location'


function drawLineSegment(graph: Graph, event, enable_straight_lines_drawing) {
    const canvas = graph.canvas

    if (graph.drawingRelation && event.target == graph.canvas) {
        const ctx = canvas.getContext('2d')

        if (!enable_straight_lines_drawing) {
            graph.push_relation_segment(new Location(event.offsetX, event.offsetY))

            ctx.lineTo(event.offsetX, event.offsetY)
            ctx.stroke()
        }
    }
}

export { drawLineSegment }
