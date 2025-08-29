import {goalDataApi, goalDeleteApi, goalListApi, goalPrograssApi, goalUpdateApi} from './goals/api'
import {NewNoteListApi, noteDetailApi, noteListApi} from './notes/api'
import {NewTodoListApi, todoDataApi, todoDeleteApi, todoUpdateApi} from './todos/api'

import type {FilterValue} from '@/types/todos'

// 회원
export const users = {
    user: () => ['userData'] as const,
}

// 목표
export const goals = {
    all: () => ['goal'] as const,
    list: () => ({
        queryKey: ['goals'] as const,
        queryFn: async () => await goalListApi(),
    }),
    detail: (goalId: string) => ({
        queryKey: ['goal', goalId] as const,
        queryFn: async () => await goalDataApi(goalId),
    }),
    prograss: (goalId: number) => ({
        queryKey: ['goal', goalId, 'progress'] as const,
        queryFn: async () => await goalPrograssApi(Number(goalId)),
    }),
    allPrograss: () => ({
        queryKey: ['allProgress'] as const,
    }),
    update: (goalId: string, goalTitle: string) => ({
        queryFn: async () => await goalUpdateApi(goalId, goalTitle),
    }),
    delete: (goalId: string) => ({
        queryFn: async () => await goalDeleteApi(goalId),
    }),
}

// 할일
export const todos = {
    all: () => ['todos'] as const,
    list: (selectedFilter: FilterValue) => ({
        queryKey: ['todos', selectedFilter] as const,
    }),
    detail: (todoId: number) => ({
        queryKey: ['todos', todoId] as const,
        queryFn: async () => await todoDataApi(todoId),
    }),
    todosDone: () => ['todos', true] as const,
    todosNotDone: () => ['todos', false] as const,
    newTodo: () => ({
        queryKey: ['newTodo'] as const,
        queryFn: async () => NewTodoListApi(),
    }),
    update: () => ({
        queryFn: async ({todoId, newDone}: {todoId: number; newDone: boolean}) => todoUpdateApi(todoId, newDone),
    }),
    delete: () => ({
        queryFn: async (todoId: number) => todoDeleteApi(todoId),
    }),
}

// 노트
export const notes = {
    all: () => ['notes'] as const,
    list: (goalId: string) => ({
        queryKey: ['notes', goalId] as const,
        queryFn: (cursor?: number) => noteListApi(goalId ?? undefined, cursor),
    }),
    detail: (noteId: number) => ({
        queryKey: ['noteDetail', noteId] as const,
        queryFn: async () => noteDetailApi(noteId),
    }),
    newNotes: () => ({
        queryKey: ['newNotes'] as const,
        queryFn: async () => NewNoteListApi(),
    }),
}
