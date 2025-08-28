/** 끝이 코드블록이면 아래 문단 자동 생성 + 빈영역 클릭 가능하게*/
import type {EditorView} from '@tiptap/pm/view'
import {TextSelection} from '@tiptap/pm/state'

export const ensureTrailingParagraph = (view: EditorView) => {
    const {state, dispatch} = view
    const last = state.doc.lastChild
    if (last?.type.name === 'paragraph') return

    const end = state.doc.content.size
    const p = state.schema.nodes.paragraph.create()
    const {from, to} = state.selection

    let tr = state.tr.insert(end, p)
    tr = tr.setSelection(TextSelection.create(tr.doc, from, to))
    dispatch(tr)
    return true
}
