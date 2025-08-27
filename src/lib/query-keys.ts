import {createQueryKeys} from '@lukemorales/query-key-factory'

/** // queries/users.ts
export const users = createQueryKeys('users', {
  all: null,
  detail: (userId: string) => ({
    queryKey: [userId],
    queryFn: () => api.getUser(userId),
  }),
}); */

// queries/todos.ts
export const todos = createQueryKeys('todos', {
    detail: (todoId: string) => [todoId],
    // list: (filters: TodoFilters) => ({
    //     queryKey: [{filters}],
    //     queryFn: (context) => api.getTodos({filters, page: context.pageParam}),
    //     contextQueries: {
    //         search: (query: string, limit = 15) => ({
    //             queryKey: [query, limit],
    //             queryFn: (context) =>
    //                 api.getSearchTodos({
    //                     page: context.pageParam,
    //                     filters,
    //                     limit,
    //                     query,
    //                 }),
    //         }),
    //     },
    // }),
})

// queries/index.ts
// export const queries = mergeQueryKeys(users, todos)
