'use client'

import Link from 'next/link'
import React from 'react'

import ProgressBar from '@/components/goals/prograss-motion'
import {useCustomQuery} from '@/hooks/use-custom-query'
import {get} from '@/lib/common-api'

import type {GoalProgress} from '@/types/goals'

const GoalTitleHeader = ({goalId, title, isDashboard}: {goalId: number; title: string; isDashboard: boolean}) => {
    const {data: progressData} = useCustomQuery<number>(['todos', goalId, 'dashProgress'], async () => {
        const response = await get<GoalProgress>({
            endpoint: `todos/progress?goalId=${goalId}`,
        })

        return response.data.progress
    })

    return (
        <div className="w-full h-auto p-4 border border-[#D4D5D5] rounded-lg  ">
            <div className="w-full h-auto p-2 flex justify-between items-center min-w-0">
                <Link
                    href={`/goals/${goalId}`}
                    className="flex-1 min-w-0 text-title-base font-semibold cursor-pointer truncate"
                >
                    {title}
                </Link>
            </div>
            <ProgressBar progress={progressData || 0} isDashboard={isDashboard} />
        </div>
    )
}

export default GoalTitleHeader
