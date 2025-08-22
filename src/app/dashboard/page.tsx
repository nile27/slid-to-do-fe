import React from 'react'

import GoalTodoContainer from './components/body/goal-todo-container'
import Headers from './components/header/header-container'

const DashBoardPage = () => {
    return (
        <section className=" w-full h-screen text-black pb-10 text-body-base overflow-x-hidden   bg-slate-100">
            <div className=" w-full h-full desktop-layout  flex-1 min-h-0  ">
                <h1 className="text-black text-title-base mb-4 ">대시보드</h1>
                <div className=" flex w-full h-full  flex-1 min-h-0   justify-center gap-4">
                    <Headers />
                    <GoalTodoContainer />
                </div>
            </div>
        </section>
    )
}

export default DashBoardPage
