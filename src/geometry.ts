const foo = 'bar'

function drawFilledSquare(ctx: any, x: number, y: number, length: number, color: string) {
    const region = new Path2D();

    region.moveTo(x - length / 2, y - length / 2);
    region.lineTo(x - length / 2, y + length / 2);
    region.lineTo(x + length / 2, y + length / 2);
    region.lineTo(x + length / 2, y - length / 2);
    region.closePath();

    ctx.fillStyle = color;
    ctx.fill(region)
}

function getIntersectedEntities(x: number, y: number, length: number) {
    const intersected_entities: string[] = []

    console.log(x, y, length)

    const rect_left_x = x - length / 2
    const rect_top_y = y - length / 2
    const rect_right_x = x + length / 2
    const rect_bot_y = y + length / 2
    
    console.log(rect_left_x, rect_right_x, rect_top_y, rect_bot_y)
    console.log('--')

    Array.prototype.forEach.call(document.getElementsByClassName('node'), (node, i) => {
       const node_id = `entity-${i}` 
       node.id = node_id

       const node_left_x = node.style.x
       const node_top_y = node.style.y
       const node_right_x = parseFloat(node_left_x) + node.getBoundingClientRect().width
       const node_bot_y = parseFloat(node_top_y) + node.getBoundingClientRect().height

       console.log(node_left_x, node_right_x, node_top_y, node_bot_y)

       console.log(rect_left_x <= node_right_x && rect_left_x >= node_left_x && rect_top_y <= node_top_y && rect_top_y >= node_bot_y)
       console.log(rect_left_x <= node_right_x && rect_left_x >= node_left_x, rect_top_y <= node_top_y && rect_top_y >= node_bot_y)
       console.log(rect_left_x <= node_right_x, rect_left_x >= node_left_x, rect_top_y <= node_top_y, rect_top_y >= node_bot_y)

       console.log(`${rect_top_y} <= ${node_top_y} = ${rect_top_y <= node_top_y}`)

       if (
            rect_left_x <= node_right_x && rect_left_x >= node_left_x && rect_top_y <= node_bot_y && rect_top_y >= node_top_y ||
            rect_left_x <= node_right_x && rect_left_x >= node_left_x && rect_bot_y <= node_bot_y && rect_bot_y >= node_top_y ||
            rect_right_x <= node_right_x && rect_right_x >= node_left_x && rect_top_y <= node_bot_y && rect_top_y >= node_top_y ||
            rect_right_x <= node_right_x && rect_right_x >= node_left_x && rect_bot_y <= node_bot_y && rect_bot_y >= node_top_y
       ) {
            node.classList.remove('unlocked')
            intersected_entities.push(node_id);
       }
    })

    return intersected_entities
}

function getClosestEntityAnchorPoint(x: number, y: number, n_anchor_points_per_entity_edge: number) {

    class AnchorPoint {
        x: number
        y: number

        constructor(x: number, y: number) {
            this.x = x
            this.y = y
        }
        
        measure_distance(x: number, y: number) {
            return Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2)
        }
    }

    class Node {
        element: HTMLElement

        constructor(node: HTMLElement) {
            this.element = node
        }

        get anchor_points() {
           // @ts-ignore
           const node_left_x = parseFloat(this.element.style.x)
           // @ts-ignore
           const node_top_y = parseFloat(this.element.style.y)
           const node_right_x = node_left_x + this.element.getBoundingClientRect().width
           const node_bot_y = node_top_y + this.element.getBoundingClientRect().height

           const x_increment = this.element.getBoundingClientRect().width / (n_anchor_points_per_entity_edge + 1)
           const y_increment = this.element.getBoundingClientRect().height / (n_anchor_points_per_entity_edge + 1)

           const anchor_points: AnchorPoint[] = []

           // 1. Loop through anchor points on the top edge
           
           anchor_points.push(new AnchorPoint(node_left_x, node_top_y))

           for (let i = 1; i <= n_anchor_points_per_entity_edge; i++) {
               anchor_points.push(new AnchorPoint(node_left_x + x_increment * i, node_top_y))
           }
           
           // 2. Loop through anchor points on the right edge

           anchor_points.push(new AnchorPoint(node_right_x, node_top_y))

           for (let i = 1; i <= n_anchor_points_per_entity_edge; i++) {
               anchor_points.push(new AnchorPoint(node_right_x, node_top_y + y_increment * i))
           }

           // 3. Loop through anchor points on the bottom edge

           anchor_points.push(new AnchorPoint(node_right_x, node_bot_y))

           for (let i = 1; i <= n_anchor_points_per_entity_edge; i++) {
               anchor_points.push(new AnchorPoint(node_right_x - x_increment * i, node_bot_y))
           }

           // 4. Loop through anchor points on the left edge

           anchor_points.push(new AnchorPoint(node_left_x, node_bot_y))

           for (let i = 1; i <= n_anchor_points_per_entity_edge; i++) {
               anchor_points.push(new AnchorPoint(node_left_x, node_bot_y - x_increment * i))
           }

           return anchor_points
        }
    }

    let anchor_points_with_distances: (number | AnchorPoint)[][] = []

    Array.prototype.forEach.call(document.getElementsByClassName('node'), (node, i) => {
        anchor_points_with_distances = anchor_points_with_distances.concat(
            (new Node(node)).anchor_points.map(point => [point, point.measure_distance(x, y)])
        )
    })

    console.log(x, y)
    console.log(anchor_points_with_distances)

    anchor_points_with_distances.sort((lhs, rhs) => (lhs[1] as number) - (rhs[1] as number))

    return anchor_points_with_distances[0][0] as AnchorPoint
}

export { foo, drawFilledSquare, getIntersectedEntities, getClosestEntityAnchorPoint }
