function alignProbabilities(probabilities: Record<string, number>, alignmentCoefficient = 10) {

    // Compute sum of all weights

    let totalWeight = 0
    let nLabels = 0

    for (const [, weight] of Object.entries(probabilities)) {
        totalWeight += weight
        nLabels += 1
    }

    // Increase values of all labels to avoid zero probabilities

    const totalProbabilityIncrease = totalWeight === 0 ? 1 : totalWeight / alignmentCoefficient  // If all weights are equal to 0, then labels will be sampled with an equal probability
    const probabilityIncreasePerLabel = totalProbabilityIncrease / nLabels

    for (const [value, weight] of Object.entries(probabilities)) {
        probabilities[value] += probabilityIncreasePerLabel
    }

    return probabilities
}

function sample(probabilities: Record<string, number>, shouldRetry: (string) => boolean = undefined, nRetries = 1000) {

    // Compute sum of all weights

    let totalWeight = 0

    for (const [, weight] of Object.entries(probabilities)) {
        totalWeight += weight
    }

    // Pick a random value

    let randomValue = Math.random() * totalWeight
    let i = 0

    while (i < nRetries) {
        i += 1
        for (const [value, weight] of Object.entries(probabilities)) {
            randomValue -= weight
            if (randomValue <= 0) {
                if (!(shouldRetry === undefined) && shouldRetry(value)) {
                    break
                }
                return value
            }
        }
    }
}

export { sample, alignProbabilities }
