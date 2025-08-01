'use client'
import Image from 'next/image'
import Link from 'next/link'
import {useParams, useRouter} from 'next/navigation'
import {useEffect, useState} from 'react'

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import AddTodoModal from '@/components/common/modal/add-todo-modal'
import TwoButtonModal from '@/components/common/modal/two-buttom-modal'
import GoalHeader from '@/components/goals/goal-header'
import InfiniteTodoList from '@/components/goals/todo-list'
import {useInfiniteScrollQuery} from '@/hooks/use-infinite-scroll'
import useModal from '@/hooks/use-modal'
import useToast from '@/hooks/use-toast'
import {del, get, patch} from '@/lib/api'
import {useModalStore} from '@/store/use-modal-store'

import type {Goal} from '@/types/goals'
import type {TodoResponse} from '@/types/todos'

const GoalsPage = () => {
    const router = useRouter()
    const [goal, setGoal] = useState<Goal>()
    const [moreButton, setMoreButton] = useState<boolean>(false)
    const [goalEdit, setGoalEdit] = useState<boolean>(false)
    const [goalTitle, setGoalTitle] = useState<string>('')
    const {showToast} = useToast()

    const queryClient = useQueryClient()

    const parameters = useParams()
    const goalId = parameters.goalId as string

    /**모달 닫기 */
    const {clearModal} = useModalStore()

    /** [ S ] 목표 */
    /** 목표 API */
    const {data: goalsData} = useQuery<Goal>({
        queryKey: ['goals', goalId],
        queryFn: async () => {
            const response = await get<Goal>({
                endpoint: `goals/${goalId}`,
                options: {
                    headers: {Authorization: `Bearer ${localStorage.getItem('refreshToken')}`},
                },
            })

            return response.data
        },
    })

    useEffect(() => {
        if (goalsData) {
            setGoal(goalsData)
            setGoalTitle(goalsData.title)
        }
    }, [goalsData])

    /** 목표 수정 */
    const updateGoals = useMutation({
        mutationFn: async () => {
            const response = await patch<TodoResponse>({
                endpoint: `goals/${goalId}`,
                data: {title: goalTitle},
                options: {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('refreshToken')}`,
                    },
                },
            })

            if (response.status === 200) {
                showToast('수정되었습니다.')
            } else {
                showToast(response.message)
            }

            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['goals']})
        },
    })
    /** 목표 삭제 */
    const deleteGoals = useMutation({
        mutationFn: async () => {
            const response = await del({
                endpoint: `goals/${goalId}`,
                options: {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('refreshToken')}`,
                    },
                },
            })
            if (response === undefined) {
                clearModal()
                showToast('삭제가 완료되었습니다.')
                router.push('/')
            }
        },
    })

    /** 목표 수정&삭제 분기 함수 */
    const handleGoalAction = async (mode: string) => {
        if (mode === 'edit') {
            if (goal?.title === '') {
                showToast('제목을 입력해주세요.')
                return
            }
            updateGoals.mutate()

            setGoalEdit(false)
        } else if (mode === 'delete') {
            deleteGoals.mutate()
        }
    }

    /**목표 수정 시 input값 변경 */
    const handleInputUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target

        setGoalTitle(value)
    }

    /** 목표 삭제 모달 */
    const {openModal: goalDeleteModal} = useModal(
        () => (
            <TwoButtonModal
                handleLeftBtn={clearModal}
                handleRightBtn={() => handleGoalAction('delete')}
                topText={'목표를 삭제하시겠어요?'}
                bottomText={'삭제된 목표는 복구할 수 없습니다.'}
                buttonText={'삭제'}
            />
        ),
        {
            modalAnimation: 'slideFromTop',
            backdropAnimation: 'fade',
        },
    )

    /** [ S ] 할일 */
    /** 할일 API 호출 */
    const GetTodoList = (done: boolean) => {
        return async (cursor: number | undefined) => {
            let endpoint = `todos?goalId=${goalId}&done=${done}&size=10`
            if (cursor !== undefined) {
                endpoint += `&cursor=${cursor}`
            }

            const result = await get<{
                todos: TodoResponse[]
                nextCursor: number | undefined
            }>({
                endpoint,
                options: {
                    headers: {Authorization: `Bearer ${localStorage.getItem('refreshToken')}`},
                },
            })
            return {
                data: result.data.todos,
                nextCursor: result.data.nextCursor,
            }
        }
    }

    // 해야 할 일
    const {
        data: todosDone,
        ref: doneReference,
        isLoading: loadingDone,
        hasMore: haseMoreDone,
        isError: doneIsError,
        error: doneError,
    } = useInfiniteScrollQuery<TodoResponse>({
        queryKey: ['todos', true],
        fetchFn: GetTodoList(true),
    })

    // 한 일
    const {
        data: todosNotDone,
        ref: notDoneReference,
        isLoading: loadingNotDone,
        hasMore: hasMoreNotDone,
        isError: notDoneIsError,
        error: notDoneError,
    } = useInfiniteScrollQuery<TodoResponse>({
        queryKey: ['todos', false],
        fetchFn: GetTodoList(false),
    })

    /**할일 추가 모달 */
    const {openModal: todoAddModal} = useModal(<AddTodoModal />)

    /**할일 checkbox update */
    const updateTodo = useMutation({
        mutationFn: async ({todoId, newDone}: {todoId: number; newDone: boolean}) => {
            const response = await patch<TodoResponse>({
                endpoint: `todos/${todoId}`,
                data: {done: newDone},
                options: {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('refreshToken')}`,
                    },
                },
            })

            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['todos']})
        },
    })
    /**할일 삭제 */
    const deleteTodo = useMutation({
        mutationFn: async (todoId: number) => {
            if (!confirm('정말로 이 할 일을 삭제하시겠습니까?')) return

            const response = await del({
                endpoint: `todos/${todoId}`,
                options: {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('refreshToken')}`,
                    },
                },
            })
            return response
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['todos']})
        },
    })

    /**할일 에러 발생 구현 화면 */
    let error
    if (doneIsError) {
        error = doneError
    } else if (notDoneIsError) {
        error = notDoneError
    }

    if (error) {
        return (
            <div className="flex items-center justify-center w-full h-full text-sm text-red-500">
                {error instanceof Error ? error.message : '할 일을 불러오는 중 오류가 발생했습니다.'}
            </div>
        )
    }

    return (
        <div className="w-full bg-custom_slate-100 overflow-y-auto">
            <div className={`p-6 desktop:px-20`}>
                <div className="text-subTitle">목표</div>
                <GoalHeader
                    goal={goal}
                    goalTitle={goalTitle}
                    goalEdit={goalEdit}
                    setGoalEdit={setGoalEdit}
                    moreButton={moreButton}
                    setMoreButton={setMoreButton}
                    goalDeleteModal={goalDeleteModal}
                    handleInputUpdate={handleInputUpdate}
                    handleGoalAction={handleGoalAction}
                />

                <Link
                    className="mt-6 py-4 px-6 bg-custom_blue-100 flex items-center justify-between rounded-xl cursor-pointer"
                    href={`/notes?goalId=${goalId}`}
                >
                    <div className="flex gap-2 items-center">
                        <Image src="/goals/note.svg" alt="노트" width={24} height={24} />
                        <div className="text-subTitle">노트 모아보기</div>
                    </div>
                    <Image src="/goals/ic-arrow-right.svg" alt="노트보기 페이지 이동" width={24} height={24} />
                </Link>

                <div className="mt-6 flex flex-col lg:flex-row gap-6 justify-between">
                    <InfiniteTodoList
                        title="To do"
                        todos={todosNotDone}
                        isLoading={loadingNotDone}
                        hasMore={hasMoreNotDone}
                        refCallback={notDoneReference}
                        onToggle={(todoId: number, newDone: boolean) => updateTodo.mutate({todoId, newDone})}
                        onDelete={(todoId: number) => deleteTodo.mutate(todoId)}
                        onAddClick={todoAddModal}
                    />

                    <InfiniteTodoList
                        title="Done"
                        todos={todosDone}
                        isLoading={loadingDone}
                        hasMore={haseMoreDone}
                        refCallback={doneReference}
                        onToggle={(todoId: number, newDone: boolean) => updateTodo.mutate({todoId, newDone})}
                        onDelete={(todoId: number) => deleteTodo.mutate(todoId)}
                    />
                </div>
            </div>
        </div>
    )
}
export default GoalsPage
