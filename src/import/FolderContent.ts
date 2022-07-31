import FileContent from './FileContent'

import { pushToNullable, append } from '@/utils/collections'

export default class FolderContent {
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
