import {create} from 'zustand'
import {persist, createJSONStorage} from 'zustand/middleware'

interface TimerState {
    time: number
    isRunning: boolean
    start: () => void
    pause: () => void
    reset: (initial?: number) => void
    tick: () => void
    setTime: (seconds: number) => void
}

export const useTimerStore = create<TimerState>()(
    persist(
        (set, get) => ({
            time: 0,
            isRunning: false,
            setTime: (seconds: number) => set({time: seconds}),
            start: () => set({isRunning: true}),
            pause: () => set({isRunning: false}),
            reset: () => set({time: 0, isRunning: false}),
            tick: () => {
                if (get().isRunning && get().time > 0) {
                    set((state) => ({time: state.time - 1}))
                }
            },
        }),
        {
            name: 'timer-storage',
            storage: createJSONStorage(() => sessionStorage),
        },
    ),
)
