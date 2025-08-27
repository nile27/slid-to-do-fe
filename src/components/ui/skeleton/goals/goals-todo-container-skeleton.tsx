import {Skeleton} from '@/components/ui/skeleton'
type Props = {
    /** 헤더 배경과 대비 맞추려면 header에서 padding만 주고, 여기선 내부 레이아웃만 담당 */
    className?: string;
  };
export const GoalsTodoContainerSkeleton = ({ className = "" }: Props) => {
    return (
        <div className={`p-5 bg-white rounded-xl ${className}`}>
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-28 rounded-md my-3" />
                <Skeleton className="h-5 w-24 rounded-md" />
            </div>

            <div className="relative">
                <Skeleton className="h-4 w-full rounded-full" />
                
            </div>

            <div className="mt-3">
                <Skeleton className="h-4 w-50 rounded-md" />
            </div>
        </div>
    )
}
