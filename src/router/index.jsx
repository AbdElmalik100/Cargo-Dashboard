import React from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Dashboard from '../layouts/Dashboard'
import Auth from '../layouts/Auth'
import Login from '../pages/Auth/Login'
import Cookies from 'js-cookie'
import OutShipments from '../pages/OutShipments'
import InShipments from '../pages/InShipments'
import ShipmentsReports from '../pages/ShipmentsReports'

const AuthGuard = () => {
    const isAuthenticated = Cookies.get("user_token")
    return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}

const RequireAuth = () => {
    const isAuthenticated = Cookies.get("user_token")
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

const AppRouter = () => {
    return (
        <Routes>
            <Route element={<AuthGuard />}>
                <Route element={<Auth />}>
                    <Route path="login" element={<Login />} />
                </Route>
            </Route>
            <Route element={<RequireAuth />}>
                <Route path="/" element={<Dashboard />}>
                    <Route index element={<Navigate to="in-shipments" replace />} />
                    <Route path="in-shipments" element={<InShipments />} />
                    <Route path="out-shipments" element={<OutShipments />} />
                    <Route path="shipments-reports" element={<ShipmentsReports />} />
                </Route>
            </Route>
        </Routes>
    )
}

export default AppRouter