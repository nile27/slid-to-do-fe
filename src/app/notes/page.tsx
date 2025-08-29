'use client'

import {useRouter, useSearchParams} from 'next/navigation'

import clsx from 'clsx'

import LoadingSpinner from '@/components/common/loading-spinner'
import {useCustomQuery} from '@/hooks/use-custom-query'
import {useInfiniteScrollQuery} from '@/hooks/use-infinite-scroll'
import {goals, notes as note} from '@/lib/query-keys'

import {NoteList} from '../../components/notes/list'

import type {ApiError} from '@/types/api'
import type {GoalsListResponse} from '@/types/goals'
import type {InfiniteScrollOptions} from '@/types/infinite-scroll'
import type {NoteCommon} from '@/types/notes'

const Page = () => {
    const parameters = useSearchParams()
    const goalId = parameters.get('goalId') as string

    const {
        data: notes,
        isLoading,
        ref,
        hasMore,
    } = useInfiniteScrollQuery({
        queryKey: note.list(goalId).queryKey,
        fetchFn: note.list(goalId).queryFn,
    } as InfiniteScrollOptions<NoteCommon>)

    const {data: goalData, isLoading: isGoalLoading} = useCustomQuery(
        goals.detail(goalId).queryKey,
        goals.detail(goalId).queryFn,
        {
            enabled: !!goalId && notes.length === 0,
            errorDisplayType: 'toast',
            mapErrorMessage: (error) => {
                const apiError = error as ApiError
                return apiError.message || '알 수 없는 오류가 발생했습니다.'
            },
        },
    )

    // goal_list
    const router = useRouter()
    const {data: goal_list} = useCustomQuery<GoalsListResponse>(goals.list().queryKey, goals.list().queryFn, {
        errorDisplayType: 'toast',
        mapErrorMessage: (error) => {
            const apiError = error as ApiError
            return apiError.message || '알 수 없는 오류가 발생했습니다.'
        },
    })

    if (isLoading || isGoalLoading) {
        return <LoadingSpinner />
    }

    hasMore && !isLoading && notes.length > 0 && <div ref={ref} />

    return (
        <div className="bg-slate-100 flex flex-col w-full min-h-screen h-full overflow-y-auto">
            <div className="desktop-layout min-h-screen flex flex-col">
                <header>
                    <h1 className="text-subTitle text-custom_slate-900 ">
                        {!goalId && <span>모든 </span>}노트 모아보기
                    </h1>
                </header>

                <div className={clsx('w-full  flex-1 flex flex-col', goalId ? 'mt-4' : 'mt-0')}>
                    {goalId && (
                        <select
                            value={goalId || ''}
                            onChange={(event) => {
                                ;<LoadingSpinner />
                                router.push(`notes?goalId=${event.target.value}`)
                            }}
                            className={
                                'appearance-none text-subTitle-sm truncate py-3.5 px-8 bg-white rounded-xl border border-custom_slate-100 bg-[url("/goals/flag-goal.svg")] bg-no-repeat bg-[length:28px_28px] bg-[left_1rem_center] pl-14'
                            }
                        >
                            <option value={goalId}>{goalData?.title}</option>
                            {goal_list?.goals?.map((goal) => (
                                <option key={goal.id} value={goal.id}>
                                    {goal.title}
                                </option>
                            ))}
                        </select>
                    )}

                    {notes.length > 0 ? (
                        <>
                            {hasMore && !isLoading && notes.length > 0 && <div ref={ref} />}

                            <NoteList notesData={notes} />
                            {!hasMore && notes.length > 0 && (
                                <div className="mt-4 text-gray-400 text-sm flex items-center justify-center">
                                    <p>모든 노트를 다 불러왔어요</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full  flex-1 flex items-center justify-center">
                            <p className="text-sm font-normal text-custom_slate-500">아직 등록된 노트가 없어요</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Page
