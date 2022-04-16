import { drawAnchoredConnectorAndAdjacentLineSegment, drawConnector, drawTerminalAnchoredConnectorAndAdjacentLineSegment, drawTerminalConnector } from '@/drawing/connectors'
// import Graph from '@/components/Graph/Graph.vue'

function startDrawingRelationLine(graph, event: Event) {
    const canvas = graph.canvas
    const ctx = canvas.getContext('2d');

    if (graph.enableConnectorAutoAlignment) {
        graph.currentHeadConnectorLocation = drawAnchoredConnectorAndAdjacentLineSegment(
            graph, ctx, event, graph.connectorSize, graph.nAnchorPointsPerEdge, graph.enableStraightLines
        )
    } else {
        graph.currentHeadConnectorLocation = drawConnector(graph, ctx, event, graph.connectorSize, graph.enableStraightLines)
    }

    graph.drawingRelation = true
}

function stopDrawingRelationLine(graph, event: Event) {
    if (event.target == graph.canvas) {
        const canvas = graph.canvas
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = graph.currentRelation.color

        if (graph.enableConnectorAutoAlignment) {
            drawTerminalAnchoredConnectorAndAdjacentLineSegment(graph, ctx, event, graph.connectorSize, graph.nAnchorPointsPerEdge, graph.enableStraightLines)
        } else {
            drawTerminalConnector(graph, ctx, event, graph.connectorSize, graph.enableStraightLines)
        }

        graph.drawingRelation = false
    }
}

export { startDrawingRelationLine, stopDrawingRelationLine }
