'use client'

import Image from 'next/image'
import {useEffect} from 'react'

import {motion, useAnimation} from 'framer-motion'

import type {GoalProgress} from '@/types/goals'

export default function ProgressBar({progress, totalCount = 0}: GoalProgress) {
    const controls = useAnimation()

    useEffect(() => {
        controls.start({
            scaleX: progress * 0.01,
            transition: {
                duration: 0.8,
                ease: 'easeOut',
            },
        })
    }, [progress, controls])

    return (
        <div className=" w-full gap-4 items-center bg-white p-5 rounded-xl">
            <div className="flex justify-between items-center w-full mt-3 mb-3 bg-white px-3">
                <div className=" text-body-lg font-semibold text-[#1E40AF] ">{progress}% complete</div>
                <div className="flex-shrink font-semibold text-body  ">내 목표 개수: {totalCount}</div>
            </div>

            <div className="bg-custom_slate-50 overflow-hidden rounded-full h-3 w-full">
                <motion.div
                    initial={{scaleX: 0}}
                    animate={controls}
                    className="h-full bg-custom_blue-400 origin-left rounded-r-full "
                />
            </div>
            <p className="w-full px-3 mt-2 text-[334155] opacity-20 text-[12px]">
                전체 할 일 기준으로 보여지고 있습니다.
            </p>
        </div>
    )
}
