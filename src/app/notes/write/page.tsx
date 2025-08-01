'use client'

import {useRouter, useSearchParams} from 'next/navigation'
import {useEffect} from 'react'

import {useQuery} from '@tanstack/react-query'

import NoteEditCompo from '@/components/notes/edit'
import NoteWriteCompo from '@/components/notes/write'
import useToast from '@/hooks/use-toast'
import {get} from '@/lib/api'

import type {Goal} from '@/types/goals'
import type {Todo} from '@/types/todos'

const NoteWritePage = () => {
    const searchParameters = useSearchParams()
    const goalId = searchParameters.get('goalId')
    const todoId = searchParameters.get('todoId')
    const noteId = searchParameters.get('noteId')

    const {showToast} = useToast()

    const isEdit = typeof noteId === 'string'
    const router = useRouter()

    useEffect(() => {
        if (
            (todoId === undefined || todoId === null || goalId === undefined || goalId === null) &&
            (noteId === undefined || noteId === null)
        ) {
            showToast('확인 할 데이터가 없습니다.')
            router.back()
        }
    }, [todoId, goalId, router, noteId])

    const {data: goalsData} = useQuery<Goal>({
        queryKey: ['goals', goalId],
        queryFn: async () => {
            const response = await get<Goal>({
                endpoint: `goals/${goalId}`,
                options: {
                    headers: {Authorization: `Bearer ${localStorage.getItem('refreshToken')}`},
                },
            })

            return response.data
        },
        enabled: !noteId && !!goalId,
    })

    const {data: todosData} = useQuery<Todo>({
        queryKey: ['todos', todoId],
        queryFn: async () => {
            const response = await get<Todo>({
                endpoint: `todos/${todoId}`,
                options: {
                    headers: {Authorization: `Bearer ${localStorage.getItem('refreshToken')}`},
                },
            })

            return response.data
        },
        enabled: !noteId && !!todoId,
    })

    return (
        <div className="flex flex-col w-full min-h-screen p-6 desktop:px-20">
            <div className="mt-6 w-full">
                {isEdit ? (
                    <NoteEditCompo noteId={noteId!} />
                ) : (
                    /**작성하기 */
                    <NoteWriteCompo
                        goalId={String(goalId)}
                        todoId={String(todoId)}
                        goalTitle={goalsData?.title}
                        todoTitle={todosData?.title}
                    />
                )}
            </div>
        </div>
    )
}

export default NoteWritePage
