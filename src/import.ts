import Pako from 'pako'

// class UntarArgs {
//     file: File
//     callback: (string) => void
// }

function equals<T>(lhs: Array<T>, rhs: Array<T>) {
    return lhs.length === rhs.length && lhs.every((item, i) => item === rhs[i])
}

function decode(bytes: Uint8Array) {
    const nBytes = bytes.length
    let i = 0

    while (i < nBytes) {
        if (bytes[i] === 0) {
            break
        }
        i += 1
    }

    return new TextDecoder().decode(bytes.slice(0, i))
}

function join(lhs: Uint8Array, rhs: Uint8Array) {
    const joinedArray = new Uint8Array(lhs.length + rhs.length)

    joinedArray.set(lhs, 0)
    joinedArray.set(rhs, lhs.length)

    return joinedArray
}

function getFilename(bytes: Uint8Array) {
    let i = 0

    while (bytes[i] > 0) {
        i += 1
    }

    return decode(bytes.slice(0, i))
}

class FileContent {
    name: string
    content: string

    constructor(name: string, content: string) {
        this.name = name
        this.content = content
    }

    get path() {
        return this.name.split('/')
    }
}

function append<T>(mapping: Map<string, T[]>, key: string, value: T) {
    // console.log(value)
    // console.log(mapping)
    if (mapping.has(key)) {
        // console.log('There is key')
        mapping.get(key).push(value)
    } else {
        // console.log('There is no key')
        mapping.set(key, [value])
        // console.log(mapping[key][0])
    }
    // console.log(mapping)
    // return mapping
    // console.log(mapping.keys())
    // console.log(mapping['0'])
}

function pushToNullable<T>(nullableArray: Array<T>, value: T) {
    if (nullableArray === null) {
        nullableArray = [value]
    } else {
        nullableArray.push(value)
    }
    return nullableArray
}

class FolderContent {
    name: string

    files: FileContent[]
    folders: FolderContent[]

    constructor(name: string, files: FileContent[], offset = 0) {
        const folderToFile = new Map<string, FileContent[]>()

        let nestedFiles: FileContent[] = null
        let nestedFolders: FolderContent[] = null

        // console.log(files)

        files.forEach(file => {
            const pathRemainder = file.path.slice(offset) 

            if (pathRemainder.length <= 1) {
                nestedFiles = pushToNullable(nestedFiles, file)
            } else {
                // console.log(file)
                append(folderToFile, pathRemainder[0], file)
                // console.log(folderToFile.keys())
            }
        })

        // console.log(folderToFile)

        folderToFile.forEach((files, folder) => nestedFolders = pushToNullable(nestedFolders, new FolderContent(folder, files, offset + 1)))

        this.files = nestedFiles
        this.folders = nestedFolders

        this.name = name
    }
}

// export default function untar(args: UntarArgs) {
export default function untar(file: File) {
    return new Promise((resolve, ) =>
        file.arrayBuffer().then(result => {
            const uncompressed = Pako.ungzip(new Uint8Array(result))
            const string = new TextDecoder().decode(uncompressed.slice(0, 512))
            const files: FileContent[] = []

            const contentLength = uncompressed.length

            let offset = 0

            let currentFilename: string = undefined
            let currentContent: Uint8Array = undefined

            while (offset < contentLength) {
                const nextOffset = offset + Math.min(contentLength - offset, 512)
                const currentFragment = uncompressed.slice(offset, nextOffset)

                if (equals(Array.from(currentFragment.slice(257, 264)), [117, 115, 116, 97, 114, 32, 32])) {
                    if (currentFilename !== undefined) {
                        files.push(new FileContent(currentFilename, decode(currentContent)))
                    }
                    currentFilename = getFilename(currentFragment)
                    currentContent = undefined  // new Uint8Array()
                } else {
                    if (currentContent === undefined) {
                        currentContent = currentFragment
                    } else {
                        currentContent = join(currentContent, currentFragment)
                    }
                }
                // console.log(currentFragment)
                // const string = new TextDecoder().decode(currentFragment)
                // console.log(string)
                offset = nextOffset
            }

            if (currentFilename !== undefined) {
                files.push(new FileContent(currentFilename, decode(currentContent)))
            }

            // files.forEach(file => console.log(file.path))

            const rootFolder = new FolderContent('root', files)

            resolve(rootFolder)

            // console.log(rootFolder)

            // console.log(files)

            // console.log(uncompressed)
            // resolve('---')

            // string = new TextDecoder().decode(uncompressed.slice(512, 1024))
            // args.callback(string)
        })
    )
}
