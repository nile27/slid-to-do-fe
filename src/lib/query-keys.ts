import {goalDataApi, goalDeleteApi, goalListApi, goalUpdateApi} from './goals/api'
import {noteListApi} from './notes/api'
import {todoDeleteApi, todoUpdateApi} from './todos/api'

// 목표
export const goals = {
    all: () => ({
        queryKey: ['goal'] as const,
    }),
    list: () => ({
        queryKey: ['goals'] as const,
        queryFn: async () => await goalListApi(),
    }),
    detail: (goalId: string) => ({
        queryKey: ['goal', goalId] as const,
        queryFn: async () => await goalDataApi(goalId),
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
    all: () => ({
        queryKey: ['todos'] as const,
    }),
    todosDone: () => ({
        queryKey: ['todos', true] as const,
    }),
    todosNotDone: () => ({
        queryKey: ['todos', false] as const,
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
    all: () => ({
        queryKey: ['notes'] as const,
    }),
    list: (goalId: string) => ({
        queryKey: ['notes', goalId] as const,
        queryFn: (cursor?: number) => noteListApi(goalId ?? undefined, cursor),
    }),
}
