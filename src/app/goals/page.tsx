'use client'

const GoalsListPage = () => {
    return (
        <div className="flex flex-col w-full bg-slate-100 ">
            <div className="desktop-layout flex flex-col min-h-screen">
                <div className="flex items-center justify-between ">
                    <h1 className="text-lg font-semibold">모든 할 일</h1>
                </div>

                <div className="flex flex-col flex-1 p-6 mt-4 bg-white rounded-xl min-h-0">list</div>
            </div>
        </div>
    )
}

export default GoalsListPage
