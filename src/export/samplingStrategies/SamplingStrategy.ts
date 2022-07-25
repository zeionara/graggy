import GraphExportWrapper from '../GraphExportWrapper'


export default interface SamplingStrategy {
    label: string

    nSamples: number
    allowLoops: boolean

    sample(wrappedGraph: GraphExportWrapper)
}
