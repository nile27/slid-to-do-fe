'use client'

import {forwardRef, ButtonHTMLAttributes} from 'react'
import clsx from 'clsx'

type IconButtonProps = {
    active?: boolean
    size?: 'sm' | 'md' | 'lg'
    variant?: 'ghost' | 'primary'
    className?: string
    children: React.ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>

/** size를 안 넘기면 이 반응형 클래스가 적용됨 */
const sizeAuto =
    // 기본은 lg
    'w-9 h-9 text-[15px] ' +
    // 480px 이하 → md
    'max-[479px]:w-8 max-[479px]:h-8 max-[479px]:text-[14px] ' +

   
    // 344px 이하 → sm
    'max-[420px]:w-6 max-[420px]:h-6 max-[420px]:text-[13px]'

const variantMap: Record<NonNullable<IconButtonProps['variant']>, string> = {
    ghost: 'text-slate-700 border-slate-200 hover:bg-slate-50 disabled:opacity-50',
    primary: 'text-white hover:bg-custom_blue-500 disabled:opacity-50',
}
const activeClass = 'bg-custom_blue-500 text-white border-blue-500'

const base =
    'inline-flex items-center justify-center rounded-full transition ' +
    'flex-none shrink-0 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400'

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
    {active = false, size = 'md', variant = 'ghost', className = '', ...rest},
    ref,
) {
    return (
        <button
            ref={ref}
            type="button"
            className={clsx(
                base,
                sizeAuto,
                variantMap[variant],
                active && activeClass,
                className,
            )}
            {...rest}
        />
    )
})

export default IconButton
