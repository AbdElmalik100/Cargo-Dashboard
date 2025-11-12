import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import SideBar from '../components/SideBar'

const Dashboard = () => {
    return (
        <div className="flex gap-8 bg-bg-color h-screen p-4 max-lg:flex-col">
            <SideBar />
            <section className="w-[calc(100%-350px)]">
                <Header />
                <Outlet />
            </section>
        </div>
    )
}

export default Dashboard