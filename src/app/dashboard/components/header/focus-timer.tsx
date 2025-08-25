import React, {useState} from 'react'

import {useTimer} from '@/hooks/use-timer'
import {useTimerStore} from '@/store/store'

const FocusTimer = () => {
    const {time, setTime, start, pause, reset, isRunning} = useTimerStore()
    useTimer()

    const [isEditing, setIsEditing] = useState(false)
    const [minutes, setMinutes] = useState(Math.floor(time / 60))
    const [seconds, setSeconds] = useState(time % 60)

    const handleSave = () => {
        setTime(minutes * 60 + seconds)
        setIsEditing(false)
    }

    return (
        <div className="p-4 rounded-lg bg-slate-800 text-white w-[300px]">
            <h2 className="mb-2 font-bold">집중 타이머</h2>

            {/* 시간 표시 or 입력 */}
            {isEditing ? (
                <div className="flex gap-2 mb-3">
                    <input
                        type="number"
                        value={minutes}
                        onChange={(event_) => setMinutes(Number(event_.target.value))}
                        className="w-12 text-black rounded p-1"
                    />
                    :
                    <input
                        type="number"
                        value={seconds}
                        onChange={(event_) => setSeconds(Number(event_.target.value))}
                        className="w-12 text-black rounded p-1"
                    />
                    <button onClick={handleSave} className="ml-2 bg-green-500 text-white px-2 py-1 rounded">
                        저장
                    </button>
                </div>
            ) : (
                <div className=" flex gap-3 text-center items-center">
                    <p className="text-4xl mb-3 text-center">{String(Math.floor(time / 60)).padStart(2, '0')}</p>
                    <p className="text-center text-title-xl ">:</p>
                    <p className="text-4xl mb-3 text-center">{String(time % 60).padStart(2, '0')}</p>
                </div>
            )}

            {/* 컨트롤 버튼 */}
            <div className="flex gap-2">
                {isRunning ? (
                    <button onClick={pause} className="bg-yellow-500 px-3 py-1 rounded text-black">
                        일시정지
                    </button>
                ) : (
                    <button onClick={start} className="bg-green-500 px-3 py-1 rounded text-black">
                        시작하기
                    </button>
                )}
                <button onClick={() => reset()} className="bg-red-500 px-3 py-1 rounded text-white">
                    초기화
                </button>
                <button onClick={() => setIsEditing(true)} className="bg-gray-300 px-3 py-1 rounded text-black">
                    수정하기
                </button>
            </div>
        </div>
    )
}

export default FocusTimer
