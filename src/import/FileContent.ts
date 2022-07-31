const FILENAME_REGEXP = /^.*\/([^/]+)\.([^.]+)$|^(.+)\.([^.]+)$/

export default class FileContent {
    fullname: string
    content: string

    constructor(name: string, content: string) {
        this.fullname = name

        if (this.extension === 'json') {
            this.content = JSON.parse(content)
        } else {
            this.content = content
        }
        // console.log(this.name, this.extension)
    }

    get path() {
        return this.fullname.split('/')
    }

    get extension() {
        const match = this.fullname.match(FILENAME_REGEXP)
        const extension = match[2]
        if (extension === undefined) {
            return match[4]
        }
        return extension
    }

    get name() {
        const match = this.fullname.match(FILENAME_REGEXP)
        const name = match[1]
        if (name === undefined) {
            return match[3]
        }
        return name
    }
}
