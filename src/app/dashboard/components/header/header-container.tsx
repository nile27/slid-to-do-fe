'use client'

import React from 'react'

import {useCustomQuery} from '@/hooks/use-custom-query'
import {get} from '@/lib/common-api'

import FocusTimer from './focus-timer'
import NewAddTodo from './new-addtodo'

import type {NoteCommon} from '@/types/notes'
import type {TodoResponse} from '@/types/todos'

interface TodoPage {
    data: TodoResponse[]
    nextCursor?: number
}

interface NotePage {
    data: NoteCommon[]
    nextCursor?: number
}

const getGoalsData = async () => {
    try {
        const response = await get<{todos: TodoResponse[]}>({
            endpoint: `todos`,
        })

        return {
            data: response.data.todos,
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error(String(error))
    }
}

const getNotesData = async () => {
    try {
        const response = await get<{notes: NoteCommon[]}>({
            endpoint: `notes`,
        })

        return {
            data: response.data.notes,
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error(String(error))
    }
}

const Header = () => {
    const {data: todoData} = useCustomQuery<TodoPage>(['newTodo'], async () => getGoalsData(), {
        select: (data: TodoPage): TodoPage => ({
            data: data.data
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .filter((item) => !item.done)
                .slice(0, 5),
        }),
    })

    const {data: noteData} = useCustomQuery<NotePage>(['newNotes'], async () => getNotesData(), {
        select: (data: NotePage): NotePage => ({
            data: data.data
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5),
        }),
    })

    return (
        <header className="w-full  h-auto min-w-[200px]   flex-col mb-4  flex justify-start items-start gap-4">
            <NewAddTodo data={todoData?.data} subject="todo" />
            <NewAddTodo data={noteData?.data} subject="note" />
            <FocusTimer />
        </header>
    )
}

export default Header
