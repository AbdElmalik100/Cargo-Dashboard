import { useDispatch, useSelector } from 'react-redux'
import OutShipments from '../components/OutShipments/OutShipments'
import Stats from '../components/Stats'
import { useEffect } from 'react'
import { getAllOutShipments, getOutShipmentsStats } from '../store/slices/outShipmentsSlice'
import { me } from '../store/slices/userSlice'

const OutShipmentsPage = () => {
    const dispatch = useDispatch()
    const { shipmentsStats } = useSelector(state => state.outShipments)

    useEffect(() => {
        dispatch(getAllOutShipments())
        dispatch(getOutShipmentsStats())
        dispatch(me())
    }, [dispatch])

    return (
        <div className='content'>
            <Stats shipmentsLabel="إجمالي الشحنات الصادرة" stats={shipmentsStats} />
            <OutShipments />
        </div>
    )
}

export default OutShipmentsPage