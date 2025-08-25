import {useEffect} from 'react'

import {useTimerStore} from '@/store/store'

export const useTimer = () => {
    const {tick, isRunning} = useTimerStore()

    useEffect(() => {
        /**let interval: ReturnType<typeof setInterval> | undefined = undefined
        if (isRunning) {
            interval = setInterval(() => {
                tick()
            }, 1000)
        }
        return () => {
            if (interval) clearInterval(interval)
        } */
    }, [isRunning, tick])
}
