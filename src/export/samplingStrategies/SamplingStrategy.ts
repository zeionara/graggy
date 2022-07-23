import GraphExportWrapper from '../GraphExportWrapper'


export default interface SamplingStrategy {
    sample(wrappedGraph: GraphExportWrapper);
}
