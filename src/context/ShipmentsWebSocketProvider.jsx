import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { getShipments, getInShipmentsStats } from "../store/slices/inShipmentsSlice"
import { getAllOutShipments, getOutShipmentsStats } from "../store/slices/outShipmentsSlice"
import { toast } from "sonner"

const resolveWsUrl = () => {
    const raw = import.meta.env.VITE_WEBSOCKET_URL || ''
    if (!raw) return 'ws://127.0.0.1:8000/ws/shipments/'
    if (raw.startsWith('ws://') || raw.startsWith('wss://')) return raw
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
        const url = new URL(raw)
        url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
        url.pathname = '/ws/shipments/'
        return url.toString()
    }
    if (raw.startsWith('//') || raw.includes(':')) {
        return `ws:${raw.replace(/\/$/, '')}/ws/shipments/`
    }
    return 'ws://127.0.0.1:8000/ws/shipments/'
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

const showUpdateToast = ({ model, action }) => {
    const modelName = modelNames[model] || model
    const actionName = actionNames[action] || action
    const message = `${actionName} ${modelName} بنجاح`

    switch (action) {
        case 'created':
            toast.success(message, {
                description: `تم إضافة ${modelName} جديد إلى النظام`,
                duration: 4000,
            })
            break
        case 'updated':
            toast.info(message, {
                description: `تم تعديل بيانات ${modelName} بنجاح`,
                duration: 4000,
            })
            break
        case 'deleted':
            toast.warning(message, {
                description: `تم حذف ${modelName} من النظام`,
                duration: 4000,
            })
            break
        default:
            toast.info(message, { duration: 3000 })
    }
}

const WebSocketContext = createContext(null)

export const useShipmentsWebSocket = () => {
    const ctx = useContext(WebSocketContext)
    if (!ctx) throw new Error("useShipmentsWebSocket must be used within ShipmentsWebSocketProvider")
    return ctx
}

const ShipmentsWebSocketProvider = ({ children }) => {
    const dispatch = useDispatch()
    const wsRef = useRef(null)
    const retryTimerRef = useRef(null)
    const mountedRef = useRef(false)
    const [isConnected, setIsConnected] = useState(false)
    const [connectionState, setConnectionState] = useState("DISCONNECTED")

    useEffect(() => {
        const wsUrl = resolveWsUrl()
        if (!wsUrl) {
            console.error("VITE_WEBSOCKET_URL is not defined")
            return
        }

        const clearRetry = () => {
            if (retryTimerRef.current) {
                clearTimeout(retryTimerRef.current)
                retryTimerRef.current = null
            }
        }

        const connect = () => {
            clearRetry()
            try {
                wsRef.current = new WebSocket(wsUrl)
            } catch (e) {
                // Schedule retry if constructor fails
                retryTimerRef.current = setTimeout(connect, 200)
                return
            }

            const socket = wsRef.current

            socket.onopen = () => {
                if (!mountedRef.current) return
                setIsConnected(true)
                setConnectionState("CONNECTED")
                console.log("Shipments WebSocket connected")
            }
            socket.onerror = () => {
                if (!mountedRef.current) return
                setIsConnected(false)
                setConnectionState("ERROR")
                console.warn("Shipments WebSocket error")
            }
            socket.onclose = (event) => {
                if (!mountedRef.current) return
                setIsConnected(false)
                setConnectionState("DISCONNECTED")
                console.log("Shipments WebSocket closed", event.code)
                // attempt reconnect after 200ms
                clearRetry()
                retryTimerRef.current = setTimeout(connect, 200)
            }

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    const { model, action } = data || {}

                    if (!model || !action) return

                    // Broadcast for any listeners
                    try {
                        window.dispatchEvent(new CustomEvent('websocket-message', { detail: data }))
                    } catch {}

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
        }

        mountedRef.current = true
        setConnectionState("CONNECTING")
        connect()

        return () => {
            clearRetry()
            try { wsRef.current && wsRef.current.close() } catch { }
            wsRef.current = null
            mountedRef.current = false
        }
    }, [dispatch])

    const sendMessage = (payload) => {
        try {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify(payload))
            }
        } catch {}
    }

    const reconnect = () => {
        if (retryTimerRef.current) {
            clearTimeout(retryTimerRef.current)
            retryTimerRef.current = null
        }
        // immediate reconnect attempt
        if (wsRef.current) {
            try { wsRef.current.close() } catch {}
            wsRef.current = null
        }
        setConnectionState("CONNECTING")
        // trigger effect's connect by calling a local connect is tricky; rely on quick retry
        retryTimerRef.current = setTimeout(() => {
            // Create a transient connection attempt using current URL
            const url = resolveWsUrl()
            try {
                wsRef.current = new WebSocket(url)
            } catch {
                retryTimerRef.current = setTimeout(() => {
                    try { wsRef.current = new WebSocket(url) } catch {}
                }, 200)
                return
            }
        }, 0)
    }

    const value = { isConnected, connectionState, sendMessage, reconnect }

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    )
}

export default ShipmentsWebSocketProvider
