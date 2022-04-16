import { getClosestEntityAnchorPoint, drawFilledSquare, getIntersectedEntities } from '@/geometry'
// import { Graph } from '@/Graph'
import Graph from '@/components/Graph.vue'
import { Location } from '@/Location'
import { Connector } from '@/Connector'
import { UserDefinedPathRelation } from '@/relation/UserDefinedPathRelation'
import { LinearRelation } from '@/relation/LinearRelation'

function drawAnchoredConnectorAndAdjacentLineSegment(graph, ctx: CanvasRenderingContext2D, event, connector_size, n_anchor_points_per_edge, enable_straight_lines_drawing: boolean) {
    const anchor_point = getClosestEntityAnchorPoint(graph.nodes, event.offsetX, event.offsetY, n_anchor_points_per_edge)
    const connector = new Connector(anchor_point.x, anchor_point.y, connector_size, graph.currentRelation)
    graph.push_connector(connector)

    // drawFilledSquare(ctx, anchor_point.x, anchor_point.y, connector_size, graph.currentRelation)
    connector.draw(ctx)

    ctx.beginPath();
    ctx.moveTo(anchor_point.x, anchor_point.y);

    ctx.strokeStyle = graph.currentRelation.color
    ctx.lineWidth = graph.relationLineThickness
    ctx.setLineDash(graph.currentSubset.lineDash)

    let current_head_connector_location: Location

    if (enable_straight_lines_drawing) {
        current_head_connector_location = new Location(event.offsetX, event.offsetY)
        graph.push_relation(
            new LinearRelation(
                new Location(anchor_point.x, anchor_point.y), connector, graph.currentRelation, graph.relationLineThickness, graph.currentSubset
            )
        )
    } else {
        graph.push_relation(
            new UserDefinedPathRelation(
                new Location(anchor_point.x, anchor_point.y), connector, graph.currentRelation, graph.relationLineThickness, graph.currentSubset
            )
        )
        graph.push_relation_segment(new Location(event.offsetX, event.offsetY))

        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
    }

    graph.currentHeads = getIntersectedEntities(graph.nodes, anchor_point.x, anchor_point.y, connector_size)

    return current_head_connector_location
}

function drawConnector(graph, ctx: CanvasRenderingContext2D, event, connector_size, enable_straight_lines_drawing: boolean) {
    const connector = new Connector(event.offsetX, event.offsetY, connector_size, graph.currentRelation)
    graph.push_connector(connector)

    // drawFilledSquare(ctx, event.offsetX, event.offsetY, connector_size, graph.currentRelation)
    connector.draw(ctx)

    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);

    ctx.strokeStyle = graph.currentRelation.color
    ctx.lineWidth = graph.relationLineThickness
    ctx.setLineDash(graph.currentSubset.lineDash)

    let current_head_connector_location: Location

    if (enable_straight_lines_drawing) {
        current_head_connector_location = new Location(event.offsetX, event.offsetY)
        graph.push_relation(
            new LinearRelation(
                current_head_connector_location, connector, graph.currentRelation, graph.relationLineThickness, graph.currentSubset
            )
        )
    } else {
        graph.push_relation(
            new UserDefinedPathRelation(
                new Location(event.offsetX, event.offsetY), connector, graph.currentRelation, graph.relationLineThickness, graph.currentSubset
            )
        )
    }

    graph.currentHeads = getIntersectedEntities(graph.nodes, event.offsetX, event.offsetY, connector_size)

    return current_head_connector_location
}

function drawTerminalAnchoredConnectorAndAdjacentLineSegment(graph, ctx: CanvasRenderingContext2D, event, connector_size, n_anchor_points_per_edge, enable_straight_lines_drawing: boolean) {
    if (graph.drawingRelation) {
        const anchor_point = getClosestEntityAnchorPoint(graph.nodes, event.offsetX, event.offsetY, n_anchor_points_per_edge)
        const connector = new Connector(anchor_point.x, anchor_point.y, connector_size, graph.currentRelation)
        graph.push_connector(connector)

        if (enable_straight_lines_drawing) {
            graph.redraw()
            const last_relation = graph.relations[graph.relations.length - 1] as LinearRelation

            const beginning = last_relation.beginning

            ctx.beginPath();
            ctx.moveTo(beginning.x, beginning.y);

            last_relation.dst = connector
            last_relation.ending = new Location(anchor_point.x, anchor_point.y)
        } else {
            graph.relations[graph.relations.length - 1].dst = connector
            graph.push_relation_segment(new Location(anchor_point.x, anchor_point.y))
        }

        ctx.lineTo(anchor_point.x, anchor_point.y);
        ctx.stroke();
        // drawFilledSquare(ctx, anchor_point.x, anchor_point.y, connector_size, graph.currentRelation)
        connector.draw(ctx)
        
        graph.push_triples(getIntersectedEntities(graph.nodes, anchor_point.x, anchor_point.y, connector_size))
    }
}

function drawTerminalConnector(graph, ctx: CanvasRenderingContext2D, event, connector_size: number, enable_straight_lines_drawing: boolean) {
    if (graph.drawingRelation) {
        const connector = new Connector(event.offsetX, event.offsetY, connector_size, graph.currentRelation)
        graph.push_connector(connector)

        // drawFilledSquare(ctx, event.offsetX, event.offsetY, connector_size, graph.currentRelation)
        connector.draw(ctx)

        if (enable_straight_lines_drawing) {
            graph.redraw()
            const last_relation = graph.relations[graph.relations.length - 1] as LinearRelation

            const beginning = last_relation.beginning

            ctx.beginPath();
            ctx.moveTo(beginning.x, beginning.y);

            last_relation.dst = connector
            last_relation.ending = new Location(event.offsetX, event.offsetY)

            ctx.lineTo(event.offsetX, event.offsetY);
            ctx.stroke();
        } else {
            graph.relations[graph.relations.length - 1].dst = connector
        }
        
        graph.push_triples(getIntersectedEntities(graph.nodes, event.offsetX, event.offsetY, connector_size))
    }
}

export { drawAnchoredConnectorAndAdjacentLineSegment, drawConnector, drawTerminalAnchoredConnectorAndAdjacentLineSegment, drawTerminalConnector }
