import { Location } from '@/Location'

class NodeAnchorPoint extends Location {
    measureDistance(x: number, y: number) {
        return Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2)
    }
}

export { NodeAnchorPoint }
