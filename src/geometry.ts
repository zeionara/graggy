import { NodeAnchorPoint } from '@/NodeAnchorPoint'
// import Node from '@/components/Node/Node.vue'

function drawFilledSquare(ctx: CanvasRenderingContext2D, x: number, y: number, length: number, color: string) {
    const region = new Path2D();

    region.moveTo(x - length / 2, y - length / 2);
    region.lineTo(x - length / 2, y + length / 2);
    region.lineTo(x + length / 2, y + length / 2);
    region.lineTo(x + length / 2, y - length / 2);
    region.closePath();

    const previous_fill_style = ctx.fillStyle

    ctx.fillStyle = color
    ctx.fill(region)

    ctx.fillStyle = previous_fill_style
}

function getIntersectedEntities(nodes, x: number, y: number, length: number) {
    const intersected_entities: Node[] = []

    const rect_left_x = x - length / 2
    const rect_top_y = y - length / 2
    const rect_right_x = x + length / 2
    const rect_bot_y = y + length / 2
    
    // Array.prototype.forEach.call(document.getElementsByClassName('node'), (node, i) => {
    nodes.forEach((node) => {
       // const node_id = `entity-${i}` 
       // node.id = node_id

       const node_left_x = node.x // node.style.x
       const node_top_y = node.y // node.style.y
       const node_right_x = node.x + node.width // parseFloat(node_left_x) + node.getBoundingClientRect().width
       const node_bot_y = node.y + node.height // parseFloat(node_top_y) + node.getBoundingClientRect().height

       if (
            rect_left_x <= node_right_x && rect_left_x >= node_left_x && rect_top_y <= node_bot_y && rect_top_y >= node_top_y ||
            rect_left_x <= node_right_x && rect_left_x >= node_left_x && rect_bot_y <= node_bot_y && rect_bot_y >= node_top_y ||
            rect_right_x <= node_right_x && rect_right_x >= node_left_x && rect_top_y <= node_bot_y && rect_top_y >= node_top_y ||
            rect_right_x <= node_right_x && rect_right_x >= node_left_x && rect_bot_y <= node_bot_y && rect_bot_y >= node_top_y
       ) {
            node.lock(true)
            intersected_entities.push(node);
       }
    })

    return intersected_entities
}

function getClosestEntityAnchorPoint(nodes, x: number, y: number, n_anchor_points_per_entity_edge: number) {
    let anchor_points_with_distances: (number | NodeAnchorPoint)[][] = []

    // Array.prototype.forEach.call(document.getElementsByClassName('node'), (node) => {
    nodes.forEach((node) => {
        anchor_points_with_distances = anchor_points_with_distances.concat(
            node.get_anchor_points(n_anchor_points_per_entity_edge).map(point => [point, point.measureDistance(x, y)])
        )
    })

    anchor_points_with_distances.sort((lhs, rhs) => (lhs[1] as number) - (rhs[1] as number))

    return anchor_points_with_distances[0][0] as NodeAnchorPoint
}

export { drawFilledSquare, getIntersectedEntities, getClosestEntityAnchorPoint }
