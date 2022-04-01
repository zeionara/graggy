import { Connector } from '@/Connector'

interface Relation {
   src: Connector
   dst: Connector 

   draw(ctx: CanvasRenderingContext2D)
}

export { Relation }
