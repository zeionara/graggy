// import { Graph } from '@/Graph'
// import Graph from '@/components/Graph.vue'
import { NodeAnchorPoint } from '@/NodeAnchorPoint'

function drawGrid(graph, distance: number, color = "grey", line_thickness = 1, drawingEnabled = true) {
    const width = graph.width
    const height = graph.height

    if (drawingEnabled) {
        const canvas = graph.canvas
        const ctx = canvas.getContext('2d');


        // const distance = 100 / (this.n_anchor_points_per_edge + 1)

        // Draw vertical lines

        const previous_stroke_style = ctx.strokeStyle
        const previous_line_thickness = ctx.lineWidth
        const previous_line_dash = ctx.getLineDash()
        
        ctx.strokeStyle = color
        ctx.lineWidth = line_thickness
        ctx.setLineDash([])

        const top_y = 0
        const bot_y = height

        ctx.beginPath();

        for (let x = 0; x <= width; x = x + distance) {
            const top_bot_x = Math.floor(x)

            ctx.moveTo(top_bot_x, top_y)
            ctx.lineTo(top_bot_x, bot_y)
            ctx.stroke()
        }

        // Draw horizontal lines

        const left_x = 0
        const right_x = width

        for (let y = 0; y <= height; y = y + distance) {
            const left_right_y = Math.floor(y)

            ctx.moveTo(left_x, left_right_y)
            ctx.lineTo(right_x, left_right_y)
            ctx.stroke()
        }

        ctx.strokeStyle = previous_stroke_style
        ctx.lineWidth = previous_line_thickness
        ctx.setLineDash(previous_line_dash)
    }

    const targets: NodeAnchorPoint[] = []

    for (let x = 0; x <= width; x = x + distance) {
        for (let y = 0; y <= height; y = y + distance) {
            targets.push(new NodeAnchorPoint(Math.floor(x), Math.floor(y)))
        }
    }

    return targets
}

export { drawGrid }
