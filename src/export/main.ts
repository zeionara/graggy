import Exporter from './Exporter'
// import IntraRepetitionSamplingStrategy from './samplingStrategies/IntraRepetitionSamplingStrategy'
import SamplingStrategy from './samplingStrategies/SamplingStrategy'

function exportAsArchive(graphs, relations, subsets, filename = 'graph.tar.gz', nRepetitions = 1, forbidSameTripleInMultipleSubsets = false, strategies: SamplingStrategy[]) {
    const exporter = new Exporter(subsets, relations, nRepetitions, forbidSameTripleInMultipleSubsets)
    // const strategies = nSampledRelations > 0 ? [new IntraRepetitionSamplingStrategy(nSampledRelations, allowLoops)] : []

    exporter.export(filename, graphs, strategies)
}

export { exportAsArchive }
