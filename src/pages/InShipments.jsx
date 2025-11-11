import { useDispatch } from 'react-redux'
import InShipments from '../components/InShipments/InShipments'
import Stats from '../components/Stats'
import { useEffect } from 'react'
import { getShipments, getShipmentsStats } from '../store/slices/inShipmentsSlice'
import { me } from '../store/slices/userSlice'

const InShipmentsPage = () => {
    const dispatch = useDispatch()

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
        dispatch(getShipmentsStats())
        dispatch(me())
    }, [dispatch])

    return (
        <div className='content'>
            <Stats />
            <InShipments />
        </div>
    )
}

export default InShipmentsPage