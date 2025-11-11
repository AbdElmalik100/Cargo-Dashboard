import { Boxes, Coins, Factory, Weight } from "lucide-react"
import { formatCurrency, formatWeight } from '../utils';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const Stats = () => {
    const location = useLocation();
    const inStats = useSelector(state => state.inShipments?.shipmentsStats);
    const outStats = useSelector(state => state.outShipments?.shipmentsStats);
    
    // Determine which page we're on based on the route
    const isOutShipmentsPage = location.pathname.includes('/out-shipments');
    const isInShipmentsPage = location.pathname.includes('/in-shipments') || location.pathname === '/';
    
    // Determine which stats to use based on the current route
    // If on OutShipments page, prioritize outStats, otherwise use inStats
    const shipmentsStats = isOutShipmentsPage ? (outStats || inStats) : (inStats || outStats);
    
    const totalShipments = shipmentsStats?.total_shipments || 0;
    const totalWeight = shipmentsStats?.total_weight || 0;
    const totalPaymentFees = shipmentsStats?.total_payment_fees || 0;
    const totalGroundFees = shipmentsStats?.total_ground_fees || 0;
    const lastUpdated = shipmentsStats?.last_updated || new Date().toISOString();
    
    // Page-specific labels
    const shipmentsLabel = isOutShipmentsPage 
        ? "إجمالي الشحنات غير المصدرة" 
        : "إجمالي عدد الشحنات";

    return (
        shipmentsStats &&
        <div className='flex gap-2 justify-between'>
            {/* 1 - إجمالي عدد الشحنات */}
            <div className='box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between'>
                <div className='flex flex-col gap-1 flex-1'>
                    <span className='text-neutral-600'>{shipmentsLabel}</span>
                    <h2 className='text-sky-700 font-bold text-3xl'>{totalShipments}</h2>
                    <span className='text-neutral-400 text-xs'>
                        {`آخر تحديث: ${new Date(lastUpdated).toLocaleDateString()}`}
                    </span>
                </div>
                <div className='w-12 h-12 rounded-full bg-sky-100 grid place-items-center'>
                    <Boxes className='text-sky-600' />
                </div>
            </div>

            {/* 2 - إجمالي الوزن */}
            <div className='box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between'>
                <div className='flex flex-col gap-1 flex-1'>
                    <span className='text-neutral-600'>إجمالي الوزن</span>
                    <h2 className='text-orange-700 font-bold text-3xl'>{formatWeight(totalWeight)}</h2>
                    <span className='text-neutral-400 text-xs'>
                        {totalShipments > 0 && `عدد الشحنات: ${totalShipments}`}
                    </span>
                </div>
                <div className='w-12 h-12 rounded-full bg-orange-100 grid place-items-center'>
                    <Weight className='text-orange-600' />
                </div>
            </div>

            {/* 3 - إجمالي رسوم الدفع */}
            <div className='box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between'>
                <div className='flex flex-col gap-1 flex-1'>
                    <span className='text-neutral-600'>إجمالي رسوم الدفع</span>
                    <h2 className='text-lime-700 font-bold text-3xl'>{formatCurrency(totalPaymentFees)}</h2>
                    <span className='text-neutral-400 text-xs'>
                        {totalShipments > 0 ? `لكل شحنة: ${formatCurrency(totalPaymentFees / totalShipments || 0)}` : ''}
                    </span>
                </div>
                <div className='w-12 h-12 rounded-full bg-lime-100 grid place-items-center'>
                    <Coins className='text-lime-600' />
                </div>
            </div>

            {/* 4 - إجمالي رسوم الأرضية */}
            <div className='box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between'>
                <div className='flex flex-col gap-1 flex-1'>
                    <span className='text-neutral-600'>إجمالي رسوم الأرضية</span>
                    <h2 className='text-purple-700 font-bold text-3xl'>{formatCurrency(totalGroundFees)}</h2>
                    <span className='text-neutral-400 text-xs'>
                        {totalShipments > 0 ? `لكل شحنة: ${formatCurrency(totalGroundFees / totalShipments || 0)}` : ''}
                    </span>
                </div>
                <div className='w-12 h-12 rounded-full bg-purple-100 grid place-items-center'>
                    <Factory className='text-purple-600' />
                </div>
            </div>
        </div>
    )
}

export default Stats
