import { v4 as uuidv4 } from 'uuid'
// import { existsSync, createSync } from 'fs'

const FOLDER = 'assets/export'

function exportTriplesToFile() {
    const filename = `${uuidv4()}.tsv`
    const filepath = `${FOLDER}/${filename}`

    // console.log(existsSync(FOLDER))

    console.log(filepath)
}

export { exportTriplesToFile }
