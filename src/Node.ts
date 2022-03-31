import { NodeElementCSSStyleDeclaration } from '@/NodeElementCSSStyleDeclaration'
import { NodeAnchorPoint } from '@/NodeAnchorPoint'
import { Graph } from '@/Graph'

class Node {
    element: HTMLElement
    locked = false

    // constructor(node: HTMLElement) {
    constructor(graph: Graph, x: number, y: number) {
        const node = document.createElement('div')

        node.className = 'node unlocked'
        node.setAttribute(graph.data_attribute_name, '')
        this.element = node
        graph.appendNode(this)

        const nodeStyle = node.style as NodeElementCSSStyleDeclaration

        nodeStyle.x = (x - node.getBoundingClientRect().width / 2).toString()
        nodeStyle.y = (y - node.getBoundingClientRect().height / 2).toString()
        nodeStyle.transform = `translate(${nodeStyle.x}px, ${nodeStyle.y}px)`

    }

    get x(): number {
        return parseFloat((this.element.style as NodeElementCSSStyleDeclaration).x)
    }

    get y(): number {
        return parseFloat((this.element.style as NodeElementCSSStyleDeclaration).y)
    }
    
    get id(): string {
        return this.element.id
    }

    set id(value: string) {
        this.element.id = value
    }

    get width(): number {
        return this.element.getBoundingClientRect().width
    }

    get height(): number {
        return this.element.getBoundingClientRect().width
    }

    get_anchor_points(n_anchor_points_per_entity_edge: number) {
       const node_left_x = this.x
       const node_top_y = this.y

       const node_right_x = node_left_x + this.element.getBoundingClientRect().width
       const node_bot_y = node_top_y + this.element.getBoundingClientRect().height

       const x_increment = this.element.getBoundingClientRect().width / (n_anchor_points_per_entity_edge + 1)
       const y_increment = this.element.getBoundingClientRect().height / (n_anchor_points_per_entity_edge + 1)

       const anchor_points: NodeAnchorPoint[] = []

       // 1. Loop through anchor points on the top edge
       
       anchor_points.push(new NodeAnchorPoint(node_left_x, node_top_y))

       for (let i = 1; i <= n_anchor_points_per_entity_edge; i++) {
           anchor_points.push(new NodeAnchorPoint(node_left_x + x_increment * i, node_top_y))
       }
       
       // 2. Loop through anchor points on the right edge

       anchor_points.push(new NodeAnchorPoint(node_right_x, node_top_y))

       for (let i = 1; i <= n_anchor_points_per_entity_edge; i++) {
           anchor_points.push(new NodeAnchorPoint(node_right_x, node_top_y + y_increment * i))
       }

       // 3. Loop through anchor points on the bottom edge

       anchor_points.push(new NodeAnchorPoint(node_right_x, node_bot_y))

       for (let i = 1; i <= n_anchor_points_per_entity_edge; i++) {
           anchor_points.push(new NodeAnchorPoint(node_right_x - x_increment * i, node_bot_y))
       }

       // 4. Loop through anchor points on the left edge

       anchor_points.push(new NodeAnchorPoint(node_left_x, node_bot_y))

       for (let i = 1; i <= n_anchor_points_per_entity_edge; i++) {
           anchor_points.push(new NodeAnchorPoint(node_left_x, node_bot_y - x_increment * i))
       }

       return anchor_points
    }

    lock() {
        if (!this.locked) {
            this.element.classList.remove('unlocked')
            this.locked = true
        }
    }

    unlock() {
        if (this.locked) {
            this.element.classList.add('unlocked')
            this.locked = false
        }
    }
}

export { Node }
