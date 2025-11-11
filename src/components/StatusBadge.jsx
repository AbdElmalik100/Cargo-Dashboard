import { CheckCircle2, CircleX, Clock4, Cog } from "lucide-react"

const StatusBadge = ({ statusType, className }) => {
    const renderBadge = () => {
        switch (statusType) {
            case "منتهي":
                return (
                    <span className={`badge p-1 px-2.5 flex justify-center items-center ms-auto w-fit gap-1 rounded-full text-xs bg-green-100 text-green-500 font-semibold ${className}`}>
                        <span>{statusType}</span>
                        <CheckCircle2 size={18} />
                    </span>
                )
            case "ملغي":
                return (
                    <span className={`badge p-1 px-2.5 flex justify-center items-center ms-auto w-fit gap-1 rounded-full text-xs bg-rose-100 text-rose-500 font-semibold ${className}`}>
                        <span>{statusType}</span>
                        <CircleX size={18} />
                    </span>
                )
            case "معلق":
                return (
                    <span className={`badge p-1 px-2.5 flex justify-center items-center ms-auto w-fit gap-1 rounded-full text-xs bg-sky-100 text-sky-500 font-semibold ${className}`}>
                        <span>{statusType}</span>
                        <Clock4 size={18} />
                    </span>
                )
            default:
                return (
                    <span className={`badge p-1 px-2.5 flex justify-center items-center ms-auto w-fit gap-1 rounded-full text-xs bg-primary-100 text-primary-400 font-semibold ${className}`}>
                        <span>{statusType}</span>
                        <Cog className='animate-spin' size={18} />
                    </span>
                )
        }
    }
    return renderBadge()
}

export default StatusBadge