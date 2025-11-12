import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { getShipments, getInShipmentsStats } from "../store/slices/inShipmentsSlice"
import { getAllOutShipments, getOutShipmentsStats } from "../store/slices/outShipmentsSlice"
import { toast } from "sonner"

const resolveWsUrl = () => {
    const raw = import.meta.env.VITE_WEBSOCKET_URL || ''
    if (!raw) return ''
    if (raw.startsWith('ws://') || raw.startsWith('wss://')) return raw
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
        const url = new URL(raw)
        url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
        url.pathname = '/ws/shipments/stats/'
        return url.toString()
    }
    if (raw.startsWith('//') || raw.includes(':')) {
        return `ws:${raw.replace(/\/$/, '')}/ws/shipments/stats/`
    }
    return 'ws://127.0.0.1:8000/ws/shipments/stats/'
}

const modelNames = {
    in_shipment: 'الشحنة الواردة',
    out_shipment: 'الشحنة الصادرة',
    destination: 'الوجهة',
    company: 'الشركة',
}

const actionNames = {
    created: 'تم إنشاء',
    updated: 'تم تحديث',
    deleted: 'تم حذف',
}

const showUpdateToast = ({ model, action, message }) => {
    const modelName = modelNames[model] || model
    const actionName = actionNames[action] || action
    const title = `${actionName} ${modelName} بنجاح`
    const description = message || undefined

    switch (action) {
        case 'created':
            toast.success(title, { description, duration: 4000 })
            break
        case 'updated':
            toast.info(title, { description, duration: 4000 })
            break
        case 'deleted':
            toast.warning(title, { description, duration: 4000 })
            break
        default:
            toast.info(title, { duration: 3000 })
    }
}

const ShipmentsWebSocketProvider = ({ children }) => {
    const dispatch = useDispatch()

    useEffect(() => {
        const wsUrl = resolveWsUrl()
        if (!wsUrl) {
            console.error("VITE_WEBSOCKET_URL is not defined")
            return
        }

        const socket = new WebSocket(wsUrl)

        socket.onopen = () => console.log("Shipments WebSocket connected")
        socket.onerror = () => console.warn("Shipments WebSocket error")
        socket.onclose = (event) => console.log("Shipments WebSocket closed", event.code)

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                const { model, action } = data || {}

                if (!model || !action) return

                showUpdateToast(data)

                if (model === "in_shipment") {
                    dispatch(getShipments())
                    dispatch(getInShipmentsStats())
                    dispatch(getAllOutShipments())
                    dispatch(getOutShipmentsStats())
                } else if (model === "out_shipment") {
                    dispatch(getAllOutShipments())
                    dispatch(getOutShipmentsStats())
                    dispatch(getShipments())
                    dispatch(getInShipmentsStats())
                } else if (model === 'destination' || model === 'company') {
                    // No list refresh wired here; pages that use them should fetch as needed
                }
            } catch (error) {
                console.error("Failed to parse websocket message", error)
            }
        }

        return () => {
            try { socket.close() } catch { }
        }
    }, [dispatch])

    return children
}

export default ShipmentsWebSocketProvider
