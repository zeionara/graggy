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

export { foo, drawFilledSquare, getIntersectedEntities }
