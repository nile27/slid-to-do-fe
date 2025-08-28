'use client'
import Image from 'next/image'
import {useCallback, useEffect, useRef, useState} from 'react'

import CharacterCount from '@tiptap/extension-character-count'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import {EditorContent, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import useModal from '@/hooks/use-modal'
import useToast from '@/hooks/use-toast'
import useLayout from '@/hooks/use-layout'
import {MaxLines} from '@/lib/notes/editor/max-lines'
import {PasteLimiter} from '@/lib/notes/editor/paste-limiter'

import LinkModal from '../common/modal/link-modal'

import {lowlight, LANG_OPTIONS, dynamicRegister, prewarmPopular} from '@/lib/notes/editor/code-highlight'
import {CustomCodeBlock} from '@/lib/notes/editor/custom-code-block'
import {ensureTrailingParagraph} from '@/lib/notes/editor/trailing-paragraph'
import IconButton from '../notes/button/icon-button'
import clsx from 'clsx'
import LanguageMenuPortal from '@/lib/notes/editor/language-menu-portal'

import {TextSelection} from '@tiptap/pm/state'

const Toolbar = ({
    editorInstance,
    linkButton,
    onSetLinkButton,
}: {
    editorInstance: ReturnType<typeof useEditor>
    linkButton?: string | undefined
    onSetLinkButton?: (link: string | undefined) => void
}) => {
    const langButtonRef = useRef<HTMLButtonElement>(null)
    const lastCodePosRef = useRef<number | null>(null)
    /** 링크 modal */
    const {openModal, closeModal} = useModal(
        () => (
            <LinkModal
                onSetButton={(url) => {
                    onSetLinkButton?.(url)
                    closeModal()
                }}
            />
        ),
        {
            modalAnimation: 'slideFromTop',
            backdropAnimation: 'fade',
        },
    )

    const isTablet = useLayout('tablet')
    const isDesktop = useLayout('desktop')

    /** 코드 하이라이트 */
    const [langMenuOpen, setLangMenuOpen] = useState(false)
    useEffect(() => {
        prewarmPopular()
    }, [])
    const isCodeBlock = !!editorInstance?.isActive('codeBlock')
    const currentLang = editorInstance?.getAttributes('codeBlock')?.language ?? ''

    /** 언어 메뉴 드롭다운 */

    const changeLanguage = useCallback(
        async (lang: string) => {
            const ed = editorInstance
            if (!ed) return

            // 0) 이미 같은 언어면 종료
            const current = ed.getAttributes('codeBlock')?.language
            if (current === lang) return

            // 1) 에디터 포커스 고정 (end 금지)
            ed.commands.focus()

            // 2) 하이라이트 모듈 로드
            await dynamicRegister(lang)

            // 3) 현재 codeBlock 위치
            let pos = getActiveCodeBlockPos(ed)
            if (pos == null) return

            // 4) selection을 codeBlock 내부로 한 번 확실히 고정
            ed.commands.setTextSelection(pos + 1)

            // 5) 한 트랜잭션으로 attrs 교체 + selection 유지
            ed.commands.command(({state, tr, dispatch}) => {
                const {codeBlock} = state.schema.nodes
                const node = tr.doc.nodeAt(pos!)
                if (!node || node.type !== codeBlock) return false

                const nextAttrs = {...node.attrs, language: lang}
                tr.setNodeMarkup(pos!, codeBlock, nextAttrs, node.marks)

                // 커서를 codeBlock 내부에 그대로 유지
                tr.setSelection(TextSelection.near(tr.doc.resolve(pos! + 1)))

                // 스크롤 강제 이동은 하지 않음 (포털 닫힘과 타이밍 충돌 방지)
                dispatch?.(tr)
                return true
            })

            // 여기서 추가 focus() / requestAnimationFrame focus() 호출은 제거
            lastCodePosRef.current = pos
        },
        [editorInstance, dynamicRegister],
    )

    const getActiveCodeBlockPos = (editor: any): number | null => {
        const {$from} = editor.state.selection
        for (let d = $from.depth; d >= 0; d--) {
            const node = $from.node(d)
            if (node.type.name === 'codeBlock') {
                // 이 depth의 노드 시작 위치(노드 선택 pos)
                return $from.before(d)
            }
        }
        return null
    }

    const Separator = () => (
        <span role="separator" aria-hidden="true" className="mx-[1px] h-5 w-px bg-slate-200/80 shrink-0" />
    )

    if (!editorInstance) return null

    return (
        <div
            className="scrollbar-custom absolute desktop:gap-4 tablet:gap-1 w-full flex items-center gap-1 px-2 py-1
             rounded-sm border border-slate-200 bg-slate-50 backdrop-blur
             shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]
             overflow-x-auto whitespace-nowrap"
        >
            <div className="desktop:gap-1 flex items-center shrink-0">
                <IconButton
                    title="Bold"
                    active={editorInstance?.isActive('bold')}
                    onClick={() => editorInstance?.chain().focus().toggleBold().run()}
                    variant="primary"
                >
                    <Image
                        src="/markdown-editor/ic-bold.svg"
                        alt="Bold"
                        width={isDesktop ? 24 : isTablet ? 22 : 20}
                        height={isDesktop ? 24 : isTablet ? 22 : 20}
                    />
                </IconButton>

                <IconButton
                    title="Italic"
                    active={editorInstance?.isActive('italic')}
                    onClick={() => editorInstance?.chain().focus().toggleItalic().run()}
                    variant="primary"
                >
                    <Image
                        src="/markdown-editor/ic-italic.svg"
                        alt="Italic"
                        width={isDesktop ? 24 : isTablet ? 22 : 20}
                        height={isDesktop ? 24 : isTablet ? 22 : 20}
                    />
                </IconButton>

                <IconButton
                    title="Underline"
                    active={editorInstance?.isActive('underline')}
                    onClick={() => editorInstance?.chain().focus().toggleUnderline().run()}
                >
                    <Image
                        src="/markdown-editor/ic-underline.svg"
                        alt="Underline"
                        width={isDesktop ? 24 : isTablet ? 22 : 20}
                        height={isDesktop ? 24 : isTablet ? 22 : 20}
                    />
                </IconButton>
            </div>
            <Separator />
            <div className="flex desktop:gap-1">
                <IconButton
                    title="left"
                    active={editorInstance?.isActive('left')}
                    onClick={() => editorInstance?.chain().focus().toggleTextAlign('left').run()}
                >
                    <Image
                        src="/markdown-editor/ic-align-left.svg"
                        alt="Left Align"
                        width={isDesktop ? 24 : isTablet ? 22 : 20}
                        height={isDesktop ? 24 : isTablet ? 22 : 20}
                    />
                </IconButton>

                <IconButton
                    title="center"
                    active={editorInstance?.isActive('center')}
                    onClick={() => editorInstance?.chain().focus().toggleTextAlign('center').run()}
                >
                    <Image
                        src="/markdown-editor/ic-align-center.svg"
                        alt="center Align"
                        width={isDesktop ? 24 : isTablet ? 22 : 20}
                        height={isDesktop ? 24 : isTablet ? 22 : 20}
                    />
                </IconButton>

                <IconButton
                    title="right"
                    active={editorInstance?.isActive('right')}
                    onClick={() => editorInstance?.chain().focus().toggleTextAlign('right').run()}
                >
                    <Image
                        src="/markdown-editor/ic-align-right.svg"
                        alt="right Align"
                        width={isDesktop ? 24 : isTablet ? 22 : 20}
                        height={isDesktop ? 24 : isTablet ? 22 : 20}
                    />
                </IconButton>
            </div>
            <Separator />
            <div className="flex desktop:gap-1">
                <IconButton
                    title="bulletList"
                    active={editorInstance?.isActive('bulletList')}
                    onClick={() => editorInstance?.chain().focus().toggleBulletList().run()}
                >
                    <Image
                        src="/markdown-editor/ic-bullet-list.svg"
                        alt="bullet List"
                        width={isDesktop ? 24 : isTablet ? 22 : 20}
                        height={isDesktop ? 24 : isTablet ? 22 : 20}
                    />
                </IconButton>

                <IconButton
                    title="orderedList"
                    active={editorInstance?.isActive('orderedList')}
                    onClick={() => editorInstance?.chain().focus().toggleOrderedList().run()}
                >
                    <Image
                        src="/markdown-editor/ic-ordered-list.svg"
                        alt="ordered List"
                        width={isDesktop ? 24 : isTablet ? 22 : 20}
                        height={isDesktop ? 24 : isTablet ? 22 : 20}
                    />
                </IconButton>
            </div>
            <Separator />
            <div className="w-full flex items-center justify-center">
                {' '}
                {!linkButton && (
                    <IconButton title="Link" onClick={openModal} className="mr-1">
                        <Image
                            src="/markdown-editor/ic-link.svg"
                            alt="Link Button"
                            width={isDesktop ? 24 : isTablet ? 22 : 20}
                            height={isDesktop ? 24 : isTablet ? 22 : 20}
                        />
                    </IconButton>
                )}
                <IconButton
                    title="Code block"
                    onMouseDown={(e: any) => e.preventDefault()}
                    onClick={() => {
                        const ed = editorInstance
                        if (!ed) return

                        ed.chain().focus().toggleCodeBlock({language: 'javascript'}).run()

                        const pos = getActiveCodeBlockPos(ed)
                        if (pos != null) lastCodePosRef.current = pos

                        ed.commands.setTextSelection((pos ?? 0) + 1)
                        ed.commands.focus()
                    }}
                >
                    <Image
                        src="/markdown-editor/ic-code.svg"
                        alt="Code block"
                        width={isDesktop ? 24 : isTablet ? 22 : 20}
                        height={isDesktop ? 24 : isTablet ? 22 : 20}
                    />
                </IconButton>
                <div className="relative flex items-center ml-2 w-full h-full ">
                    <button
                        type="button"
                        ref={langButtonRef}
                        onMouseDown={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                        }}
                        onClick={(event) => {
                            event.stopPropagation()
                            const ed = editorInstance
                            if (ed) {
                                const p = getActiveCodeBlockPos(ed)
                                if (p != null) lastCodePosRef.current = p
                            }
                            setLangMenuOpen((v) => !v)
                        }}
                        disabled={!isCodeBlock}
                        className="bg-slate-200 disabled:opacity-50 text-xs text-slate-700 w-16 h-6 shrink-0 rounded-sm"
                        title="Select language"
                    >
                        {currentLang || 'Language'}
                    </button>

                    <LanguageMenuPortal
                        anchorRef={langButtonRef}
                        isOpen={langMenuOpen}
                        currentLang={currentLang}
                        options={LANG_OPTIONS}
                        onSelect={async (lang) => {
                            await changeLanguage(lang)
                            setLangMenuOpen(false)
                        }}
                        onClose={() => setLangMenuOpen(false)}
                    />
                </div>
            </div>
        </div>
    )
}

const MarkdownEditor = ({
    value,
    onUpdate,
    className,
    linkButton,
    onSetLinkButton,
}: {
    value: string
    onUpdate: (content: string) => void
    className?: string
    linkButton?: string | undefined
    onSetLinkButton?: (link: string | undefined) => void
}) => {
    const [internalLink, setInternalLink] = useState(linkButton ?? '')
    const {showToast} = useToast()
    useEffect(() => {
        setInternalLink(linkButton ?? '')
    }, [linkButton])

    const editorInstance = useEditor({
        extensions: [
            StarterKit.configure({codeBlock: false}),
            CustomCodeBlock.configure({lowlight}),
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: false,
                linkOnPaste: false,
            }),
            TextAlign.configure({types: ['heading', 'paragraph']}),
            Placeholder.configure({
                placeholder: '이 곳을 클릭해 노트 작성을 시작해주세요',
            }),
            CharacterCount.configure({
                limit: 5000,
                textCounter: (text) => [...new Intl.Segmenter().segment(text)].length,
                wordCounter: (text) => text.split(/\s+/).filter((word) => word !== '').length,
            }),
            MaxLines.configure({limit: 10, allowSoftBreak: true}),
            PasteLimiter.configure({
                limit: 5000,
                onTruncate: () => {
                    showToast(`붙여넣기 최대 5000자 까지 허용됩니다`)
                },
            }),
        ],
        content: '',
        immediatelyRender: false,
        onCreate: ({editor}) => {
            ensureTrailingParagraph(editor.view) // ✅ 추가
        },
        onUpdate: ({editor}) => {
            onUpdate(editor.getHTML())
            ensureTrailingParagraph(editor.view)
        },
        editorProps: {
            attributes: {
                class: 'prose focus:outline-none',
            },

            handleDOMEvents: {
                compositionend: (view) => {
                    ensureTrailingParagraph(view)
                    return false
                },
            },
        },
    })

    useEffect(() => {
        if (editorInstance && value !== editorInstance.getHTML()) {
            editorInstance.commands.setContent(value)
        }
    }, [value, editorInstance])

    if (!editorInstance) {
        return <div>Loading editor...</div>
    }

    return (
        <div
            onClick={(event) => {
                const el = event.target as HTMLElement
                if (el.closest('.ProseMirror')) return
                if (el.closest('[data-editor-toolbar]')) return // 툴바 클릭은 무시
                if (el.closest('[data-lang-portal]')) return
                editorInstance?.commands.focus()
            }}
            className={`relative max-w-full min-w-64 min-h-64 cursor-pointer ${className}`}
        >
            <Toolbar editorInstance={editorInstance} linkButton={linkButton} onSetLinkButton={onSetLinkButton} />
            <div className="h-12">
                {internalLink && (
                    <div className="absolute top-12 w-full my-4 bg-custom_slate-200 p-1 rounded-full flex justify-between items-center">
                        <div className="flex items-end gap-2 flex-1 min-w-0 max-w-full p-1">
                            <Image src="/markdown-editor/ic-save-link.svg" alt="링크아이콘" width={24} height={24} />
                            <a
                                href={internalLink}
                                target="_blank"
                                rel="noreferrer"
                                className="block overflow-hidden text-ellipsis whitespace-nowrap max-w-full text-body text-custom_slate-800"
                            >
                                {internalLink}
                            </a>
                        </div>
                        <button
                            onClick={() => {
                                setInternalLink('')
                                onSetLinkButton?.(undefined)
                            }}
                            className="shrink-0  ml-2 cuesor-pointer"
                        >
                            <Image src="/todos/ic-delete.svg" alt="삭제" width={24} height={24} />
                        </button>
                    </div>
                )}
            </div>
            <div className={clsx(internalLink ? 'mt-16' : 'mt-5', 'w-full text-body text-custom_slate-700')}>
                <div className="max-h-56 overflow-y-auto rounded">
                    <EditorContent editor={editorInstance} className="max-w-full" />
                </div>
            </div>
        </div>
    )
}

export default MarkdownEditor
