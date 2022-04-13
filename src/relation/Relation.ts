import { Connector } from '@/Connector'

interface Relation {
   src: Connector
   dst: Connector 
   thickness: number

   draw(ctx: CanvasRenderingContext2D)
}

export { Relation }
