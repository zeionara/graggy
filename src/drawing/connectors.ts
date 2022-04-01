import { getClosestEntityAnchorPoint, drawFilledSquare, getIntersectedEntities } from '@/geometry'
import { Graph } from '@/Graph'
import { Location } from '@/Location'

function drawAnchoredConnectorAndAdjacentLineSegment(graph: Graph, ctx: CanvasRenderingContext2D, event, connector_size, n_anchor_points_per_edge, enable_straight_lines_drawing: boolean) {
    const anchor_point = getClosestEntityAnchorPoint(graph.nodes, event.offsetX, event.offsetY, n_anchor_points_per_edge)

    drawFilledSquare(ctx, anchor_point.x, anchor_point.y, connector_size, graph.currentRelation)

    ctx.beginPath();
    ctx.moveTo(anchor_point.x, anchor_point.y);

    let current_head_connector_location: Location

    if (enable_straight_lines_drawing) {
        current_head_connector_location = new Location(event.offsetX, event.offsetY)
    } else {
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
    }

    graph.currentHeads = getIntersectedEntities(graph.nodes, anchor_point.x, anchor_point.y, connector_size)

    return current_head_connector_location
}

function drawConnector(graph: Graph, ctx: CanvasRenderingContext2D, event, connector_size, enable_straight_lines_drawing: boolean) {
    drawFilledSquare(ctx, event.offsetX, event.offsetY, connector_size, graph.currentRelation)

    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);

    let current_head_connector_location: Location

    if (enable_straight_lines_drawing) {
        current_head_connector_location = new Location(event.offsetX, event.offsetY)
    }

    graph.currentHeads = getIntersectedEntities(graph.nodes, event.offsetX, event.offsetY, connector_size)

    return current_head_connector_location
}

function drawTerminalAnchoredConnectorAndAdjacentLineSegment(graph: Graph, ctx: CanvasRenderingContext2D, event, connector_size, n_anchor_points_per_edge) {
    const anchor_point = getClosestEntityAnchorPoint(graph.nodes, event.offsetX, event.offsetY, n_anchor_points_per_edge)

    ctx.lineTo(anchor_point.x, anchor_point.y);
    ctx.stroke();
    drawFilledSquare(ctx, anchor_point.x, anchor_point.y, connector_size, graph.currentRelation)
    
    graph.push_triples(getIntersectedEntities(graph.nodes, anchor_point.x, anchor_point.y, connector_size))
}

function drawTerminalConnector(graph: Graph, ctx: CanvasRenderingContext2D, event, connector_size: number, enable_straight_lines_drawing: boolean) {
    drawFilledSquare(ctx, event.offsetX, event.offsetY, connector_size, graph.currentRelation)

    if (enable_straight_lines_drawing) {
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
    }
    
    graph.push_triples(getIntersectedEntities(graph.nodes, event.offsetX, event.offsetY, connector_size))
}

export { drawAnchoredConnectorAndAdjacentLineSegment, drawConnector, drawTerminalAnchoredConnectorAndAdjacentLineSegment, drawTerminalConnector }
