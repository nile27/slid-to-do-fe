'use client'

import Image from 'next/image'
import React, {useState} from 'react'

import LoadingSpinner from '@/components/common/loading-spinner'
import {useInfiniteScrollQuery} from '@/hooks/use-infinite-scroll'
import {get} from '@/lib/common-api'

import GoalListBody from './goal-list-body'
import GoalTitleHeader from './goal-title-header'

import type {GoalResponse} from '@/types/goals'
import ProgressBar from './todo-progress'
import {useCustomQuery} from '@/hooks/use-custom-query'

const GoalTodoContainer = () => {
    const [totalCount, setTotalCount] = useState(0)
    const getGoalsData = () => {
        return async (cursor: number | undefined) => {
            try {
                const urlParameter = cursor === undefined ? '' : `&cursor=${cursor}`
                const response = await get<{goals: GoalResponse[]; nextCursor: number | undefined; totalCount: number}>(
                    {
                        endpoint: `goals?size=3&sortOrder=newest${urlParameter}`,
                    },
                )
                setTotalCount(response.data.totalCount)
                return {
                    data: response.data.goals,
                    nextCursor: response.data.nextCursor,
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    throw error
                }
                throw new Error(String(error))
            }
        }
    }

    const getProgressData = async () => {
        try {
            const response = await get<{progress: number}>({
                endpoint: `todos/progress`,
            })
            console.log(response.data)
            return {
                progress: response.data.progress,
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw error
            }
            throw new Error(String(error))
        }
    }
    const {data} = useCustomQuery<{progress: number}>(['allProgress'], async () => getProgressData(), {})
    const {
        data: fetchGoals,
        ref: goalReference,
        isLoading: loadingGoals,
        hasMore: hasMoreGoals,
    } = useInfiniteScrollQuery<GoalResponse>({
        queryKey: ['myGoals'],
        fetchFn: getGoalsData(),
    })

    return (
        <section className="w-full flex flex-col h-full flex-1 min-h-[100px] min-w-[400px]  border border-[#1E40AF]  rounded-lg  pb-4  ">
            <header className="w-full h-[220px] bg-[#1E40AF] px-5 pb-5 rounded-t-sm">
                <div className=" flex justify-start items-center pl-4 pt-4 gap-2 mb-4">
                    <Image
                        src={'/dashboard/goals-todo.svg'}
                        alt="goal-todo"
                        width={40}
                        height={40}
                        className="text-white border border-white rounded-xl"
                    />

                    <h1 className=" text-title-base font-semibold text-white ">목표 별 할 일</h1>
                </div>

                <ProgressBar
                    progress={typeof data?.progress === 'number' ? data.progress : 0}
                    totalCount={totalCount}
                />
            </header>
            <div className="  w-full h-full  relative overflow-auto">
                {loadingGoals ? (
                    <div className="  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <>
                        {fetchGoals.length === 0 ? (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm  ">
                                등록된 목표가 없습니다.
                            </div>
                        ) : (
                            <div className=" p-4 w-full  flex-1 min-h-0 overflow-y-scroll">
                                {fetchGoals.map((myGoal: GoalResponse) => (
                                    <div key={myGoal.id} className="w-full h-auto flex flex-col rounded-lg p-2  mb-3">
                                        <GoalTitleHeader title={myGoal.title} goalId={myGoal.id} />
                                    </div>
                                ))}

                                {hasMoreGoals && <div ref={goalReference} />}

                                {!hasMoreGoals && (
                                    <div className="mt-4 w-full text-center text-gray-400 text-sm">
                                        모든 할일을 다 불러왔어요
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    )
}

export default GoalTodoContainer
