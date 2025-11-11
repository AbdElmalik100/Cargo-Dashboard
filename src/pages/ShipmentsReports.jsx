import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getShipments } from '../store/slices/inShipmentsSlice'
import { getAllOutShipments } from '../store/slices/outShipmentsSlice'
import Stats from '../components/ShipmentsReports/Stats'
import InShipmentsTable from '../components/ShipmentsReports/InShipmentsTable'
import OutShipmentsTable from '../components/ShipmentsReports/OutShipmentsTable'

const ShipmentsReports = () => {
    const dispatch = useDispatch()
    const { shipments: inShipments } = useSelector(state => state.inShipments || {})
    const { allShipments: outShipments } = useSelector(state => state.outShipments || {})

    useEffect(() => {
        dispatch(getShipments())
        dispatch(getAllOutShipments())
    }, [dispatch])

    // Filter non-exported in-shipments
    const notExportedInShipments = (inShipments || []).filter(s => !s.export)
    
    // Calculate stats
    const inCount = (inShipments || []).length
    const outCount = (outShipments || []).length
    // Total should be the same as in-shipments count since each out-shipment is linked to an in-shipment
    const totalCount = inCount
    const notExportedCount = notExportedInShipments.length

    return (
        <div className='content'>
            <Stats 
                inCount={inCount}
                outCount={outCount}
                totalCount={totalCount}
                notExportedCount={notExportedCount}
            />
            <InShipmentsTable shipments={notExportedInShipments} />
            <OutShipmentsTable shipments={outShipments || []} />
        </div>
    )
}

export default ShipmentsReports
