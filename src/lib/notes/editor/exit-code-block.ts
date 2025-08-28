import type {Editor} from '@tiptap/core'
import {TextSelection} from '@tiptap/pm/state'

/** 코드블록 바로 아래에 새 문단을 만들고 커서를 이동 */
export const exitCodeBlock = (editor: Editor): boolean => {
    // if (!editor.isActive('codeBlock')) return false
    // const view = editor.view
    // const {state, dispatch} = view
    // const {$from} = state.selection

    // const afterPos = $from.after($from.depth)

    // const nextNode = state.doc.nodeAt(afterPos)
    // let tr = state.tr
    // if (!nextNode || nextNode.type.name !== 'paragraph') {
    //     const paragraph = state.schema.nodes.paragraph.create()
    //     tr = tr.insert(afterPos, paragraph)
    // }

    // tr = tr.setSelection(TextSelection.near(tr.doc.resolve(afterPos + 1)))
    // dispatch(tr.scrollIntoView())
    return true
}
