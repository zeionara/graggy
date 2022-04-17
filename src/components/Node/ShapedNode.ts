import { Vue } from 'vue-class-component';

import { NodeElementCSSStyleDeclaration } from '@/NodeElementCSSStyleDeclaration'
import { NodeAnchorPoint } from '@/NodeAnchorPoint'

class ShapedNode extends Vue {

    get element(): HTMLElement {
        return this.$refs.element as HTMLElement
    }

    get x(): number {
        return parseFloat((this.element.style as NodeElementCSSStyleDeclaration).x)
    }

    get y(): number {
        return parseFloat((this.element.style as NodeElementCSSStyleDeclaration).y)
    }

    get width(): number {
        return this.element.getBoundingClientRect().width  // TODO: Return size
    }

    get height(): number {
        return this.element.getBoundingClientRect().width  // TODO: Return size
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
}

export { ShapedNode }
