import Pako from 'pako'

import FileContent from './FileContent'
import FolderContent from './FolderContent'

import { decode, join } from '@/utils/uint'
import { equals } from '@/utils/collections'

const MAX_FRAGMENT_SIZE = 512

const FILENAME_FRAGMENT_MARK = [117, 115, 116, 97, 114, 32, 32]
const FILENAME_FRAGMENT_MARK_FIRST_INDEX = 257
const FILENAME_FRAGMENT_MARK_LAST_INDEX = FILENAME_FRAGMENT_MARK_FIRST_INDEX + FILENAME_FRAGMENT_MARK.length

function getFilename(bytes: Uint8Array) {
    let i = 0

    while (bytes[i] > 0) {
        i += 1
    }

    return decode(bytes.slice(0, i))
}

export default function untar(file: File) {
    return new Promise((resolve: (FolderContent, ) => void, ) =>
        file.arrayBuffer().then(result => {
            const uncompressed = Pako.ungzip(new Uint8Array(result))
            const files: FileContent[] = []

            const contentLength = uncompressed.length

            let offset = 0

            let currentFilename: string = undefined
            let currentContent: Uint8Array = undefined

            while (offset < contentLength) {
                const nextOffset = offset + Math.min(contentLength - offset, MAX_FRAGMENT_SIZE)
                const currentFragment = uncompressed.slice(offset, nextOffset)

                if (equals(Array.from(currentFragment.slice(FILENAME_FRAGMENT_MARK_FIRST_INDEX, FILENAME_FRAGMENT_MARK_LAST_INDEX)), FILENAME_FRAGMENT_MARK)) {
                    if (currentFilename !== undefined) {
                        files.push(new FileContent(currentFilename, decode(currentContent)))
                    }
                    currentFilename = getFilename(currentFragment)
                    currentContent = undefined
                } else {
                    if (currentContent === undefined) {
                        currentContent = currentFragment
                    } else {
                        currentContent = join(currentContent, currentFragment)
                    }
                }
                offset = nextOffset
            }

            if (currentFilename !== undefined) {
                files.push(new FileContent(currentFilename, decode(currentContent)))
            }

            const rootFolder = new FolderContent('root', files)

            resolve(rootFolder)
        })
    )
}
