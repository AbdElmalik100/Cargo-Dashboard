import { useDispatch } from 'react-redux'
import OutShipments from '../components/OutShipments/OutShipments'
import Stats from '../components/Stats'
import { useEffect } from 'react'
import { getAllOutShipments, getOutShipmentsStats } from '../store/slices/outShipmentsSlice'
import { me } from '../store/slices/userSlice'

const OutShipmentsPage = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL)

        ws.onopen = () => console.log("WebSocket connection established")
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.message === "update stats") {
                dispatch(getAllOutShipments())
                dispatch(getOutShipmentsStats())
            }
        }
        ws.onerror = (err) => console.log("WebSocket error:", err);
        ws.onclose = (event) => console.log("Closed:", event);
        return () => ws.close()
    }, [dispatch])

    useEffect(() => {
        dispatch(getAllOutShipments())
        dispatch(getOutShipmentsStats())
        dispatch(me())
    }, [dispatch])

    return (
        <div className='content'>
            <Stats />
            <OutShipments />
        </div>
    )
}

export default OutShipmentsPage