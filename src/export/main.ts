import Exporter from './Exporter'
import IntraRepetitionSamplingStrategy from './samplingStrategies/IntraRepetitionSamplingStrategy'

function exportAsArchive(graphs, relations, subsets, filename = 'graph.tar.gz', nRepetitions = 1, nSampledRelations = 0, forbidSameTripleInMultipleSubsets = false, allowLoops = false) {
    const exporter = new Exporter(subsets, relations, nRepetitions, forbidSameTripleInMultipleSubsets)
    const strategies = nSampledRelations > 0 ? [new IntraRepetitionSamplingStrategy(nSampledRelations, allowLoops)] : []

    exporter.export(filename, graphs, strategies)
}

export { exportAsArchive }
