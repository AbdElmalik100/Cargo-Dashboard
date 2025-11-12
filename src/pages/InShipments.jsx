import { useDispatch, useSelector } from 'react-redux'
import InShipments from '../components/InShipments/InShipments'
import Stats from '../components/Stats'
import { useEffect } from 'react'
import { getShipments, getInShipmentsStats } from '../store/slices/inShipmentsSlice'
import { me } from '../store/slices/userSlice'

const InShipmentsPage = () => {
    const dispatch = useDispatch()
    const { inShipmentsStats } = useSelector(state => state.inShipments)

    useEffect(() => {
        const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL)

        ws.onopen = () => console.log("WebSocket connection established")
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.message === "update stats") {
                dispatch(getShipmentsStats())
            }
        }
        ws.onerror = (err) => console.log("WebSocket error:", err);
        ws.onclose = (event) => console.log("Closed:", event);
        return () => ws.close()
    }, [dispatch])

    useEffect(() => {
        dispatch(getShipments())
        dispatch(getInShipmentsStats())
        dispatch(me())
    }, [dispatch])

    return (
        <div className='content'>
            <Stats shipmentsLabel={"اجمالي عدد الشحنات الواردة"} stats={inShipmentsStats} />
            <InShipments />
        </div>
    )
}

export default InShipmentsPage