import { Boxes, ArrowDownToLine, ArrowUpFromLine, Package } from "lucide-react"

const Stats = ({ inCount, outCount, totalCount, notExportedCount }) => {
    const total = (Number(inCount) || 0) + (Number(outCount) || 0)
    return (
        <div className='flex gap-2 justify-between mb-6'>
                {/* 3 - إجمالي جميع الشحنات */}
                <div className='box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between'>
                <div className='flex flex-col gap-1 flex-1'>
                    <span className='text-neutral-600'>إجمالي جميع الشحنات</span>
                    <h2 className='text-lime-700 font-bold text-3xl'>{total}</h2>
                </div>
                <div className='w-12 h-12 rounded-full bg-lime-100 grid place-items-center'>
                    <Boxes className='text-lime-600' size={24} />
                </div>
            </div>
            {/* 1 - إجمالي الشحنات الواردة */}
            <div className='box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between'>
                <div className='flex flex-col gap-1 flex-1'>
                    <span className='text-neutral-600'>إجمالي الشحنات الواردة</span>
                    <h2 className='text-sky-700 font-bold text-3xl'>{inCount || 0}</h2>
                </div>
                <div className='w-12 h-12 rounded-full bg-sky-100 grid place-items-center'>
                    <ArrowDownToLine className='text-sky-600' size={24} />
                </div>
            </div>

            {/* 2 - إجمالي الشحنات الصادرة */}
            <div className='box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between'>
                <div className='flex flex-col gap-1 flex-1'>
                    <span className='text-neutral-600'>إجمالي الشحنات الصادرة</span>
                    <h2 className='text-orange-700 font-bold text-3xl'>{outCount || 0}</h2>
                </div>
                <div className='w-12 h-12 rounded-full bg-orange-100 grid place-items-center'>
                    <ArrowUpFromLine className='text-orange-600' size={24} />
                </div>
            </div>

        

            {/* 4 - الشحنات غير المصدرة */}
            <div className='box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between'>
                <div className='flex flex-col gap-1 flex-1'>
                    <span className='text-neutral-600'>الشحنات غير المصدرة</span>
                    <h2 className='text-purple-700 font-bold text-3xl'>{notExportedCount || 0}</h2>
                </div>
                <div className='w-12 h-12 rounded-full bg-purple-100 grid place-items-center'>
                    <Package className='text-purple-600' size={24} />
                </div>
            </div>
        </div>
    )
}

export default Stats

