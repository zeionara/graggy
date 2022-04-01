import { Graph } from '@/Graph'

function drawGrid(graph: Graph, distance: number) {
    const canvas = graph.canvas
    const ctx = canvas.getContext('2d');

    const width = graph.width
    const height = graph.height

    // const distance = 100 / (this.n_anchor_points_per_edge + 1)

    // Draw vertical lines

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
}

export { drawGrid }
