import { v4 as uuidv4 } from 'uuid'
// import * as fs from 'fs'

const FOLDER = 'assets/export'

function exportTriplesToFile() {
    const filename = `${uuidv4()}.tsv`
    const filepath = `${FOLDER}/${filename}`

    // try {
    //     console.log(fs.existsSync('assets'))
    // } catch(error) {
    //     console.log(error)
    // }
    // console.log(mkdirSync('assets-you'))

    console.log(filepath)
}

export { exportTriplesToFile }
