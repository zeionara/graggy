import { Graph } from '@/Graph'


function drawLineSegment(graph: Graph, event, enable_straight_lines_drawing) {
    const canvas = graph.canvas

    if (graph.drawingRelation && event.target == graph.canvas) {
        const ctx = canvas.getContext('2d');

        if (!enable_straight_lines_drawing) {
            ctx.lineTo(event.offsetX, event.offsetY);
            ctx.stroke();
        }
    }
}

export { drawLineSegment }
