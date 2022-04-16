import interact from 'interactjs';
import { NodeAnchorPoint } from '@/NodeAnchorPoint';

function makeUnlockedNodesDraggable() {
    interact('.node.unlocked').draggable(
        {
            inertia: true,
            modifiers: [
                interact.modifiers.restrictRect(
                    {
                        restriction: 'parent',
                        endOnly: true
                    }
                ),
            ],
            listeners: {
                move(event) {
                    if (event.target.style.virtualX) {
                        delete event.target.style.virtualX
                        delete event.target.style.virtualY
                    }

                    if (!event.target.style.x) {
                        event.target.style.x = event.delta.x
                        event.target.style.y = event.delta.y
                    } else {
                        const nextX = parseFloat(event.target.style.x) + parseFloat(event.delta.x)
                        const nextY = parseFloat(event.target.style.y) + parseFloat(event.delta.y)
                        event.target.style.x = nextX
                        event.target.style.y = nextY
                    }

                    event.target.style.transform = `translate(${event.target.style.x}px, ${event.target.style.y}px)`
                }
            }
        }
    )
}

function makeUnlockedNodesDraggableWithinGrid(targets: NodeAnchorPoint[]) {
   interact('.node.unlocked').draggable(
       {
           inertia: false,
           modifiers: [
                 interact.modifiers.restrictRect(
                     {
                         restriction: 'parent',
                         endOnly: true
                     }
                 )
           ],
           listeners: {
               move(event) {
                   let nextX: number
                   let nextY: number

                   if (!event.target.style.virtualX) {
                       if (event.target.style.x) {
                           nextX = parseFloat(event.target.style.x)
                           nextY = parseFloat(event.target.style.y)
                       } else {
                           nextX = event.delta.x
                           nextY = event.delta.y
                       }
                   } else {
                       nextX = parseFloat(event.target.style.virtualX) + parseFloat(event.delta.x)
                       nextY = parseFloat(event.target.style.virtualY) + parseFloat(event.delta.y)
                   }

                   event.target.style.virtualX = nextX
                   event.target.style.virtualY = nextY

                   const closestTarget = targets.map(
                       target => [target, target.measureDistance(nextX, nextY)]
                   ).sort(
                       (lhs, rhs) => (lhs[1] as number) - (rhs[1] as number)
                   )[0][0] as NodeAnchorPoint

                   event.target.style.x = closestTarget.x
                   event.target.style.y = closestTarget.y

                   event.target.style.transform = `translate(${closestTarget.x}px, ${closestTarget.y}px)`
               }
           }
       }
   )
}

export { makeUnlockedNodesDraggable, makeUnlockedNodesDraggableWithinGrid }
