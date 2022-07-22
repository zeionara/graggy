import Exporter from './Exporter'
import TripleGenerationStrategy from './TripleGenerationStrategy'

function exportAsArchive(graphs, relations, subsets, filename = 'graph.tar.gz', nRepetitions = 1, nSampledRelations = 0, forbidSameTripleInMultipleSubsets = false) {
    const exporter = new Exporter(subsets, relations, nRepetitions, forbidSameTripleInMultipleSubsets)
    exporter.export(filename, graphs, new TripleGenerationStrategy(), nSampledRelations)
}

export { exportAsArchive }
