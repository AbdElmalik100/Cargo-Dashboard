import { LogOut, LoaderCircle, Boxes, ArrowDownToLine, ArrowUpFromLine, ClipboardList } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import { navLinks } from "../constants"
import { Button } from "@/components/ui/button"
import { logout } from "../store/slices/userSlice"
import { useDispatch, useSelector } from "react-redux"

const SideBar = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { loading } = useSelector(state => state.user)
    
    // Icon mapping
    const iconMap = {
        Boxes: Boxes,
        ArrowDownToLine: ArrowDownToLine,
        ArrowUpFromLine: ArrowUpFromLine,
        ClipboardList: ClipboardList,
    }
    
    const handleLogout = async () => {
        const response = await dispatch(logout())
        if(logout.fulfilled.match(response)) navigate("/login")
    }
    
    const getIcon = (iconName) => {
        const IconComponent = iconMap[iconName]
        return IconComponent ? <IconComponent size={20} /> : null
    }
    
    return (
        <nav className="sidebar p-6 w-[350px] bg-neutral-800 text-white rounded-xl flex flex-col gap-6 overflow-auto thin-scrollbar">
            <NavLink to={'/'} className="logo-wrapper mx-auto">
                <img src="/images/logo.png" width={128} alt="Logo Image" />
            </NavLink>
            <ul className="flex flex-col gap-2">
                {
                    navLinks.map((link, index) => (
                        <li key={index}>
                            <NavLink 
                                to={link.to} 
                                className={({ isActive }) => `link ${isActive ? 'active' : ''}`}
                            >
                                {getIcon(link.iconName)}
                                <span>{link.name}</span>
                            </NavLink>
                        </li>
                    ))
                }
            </ul>
            <Button className="bg-transparent mt-auto border-rose-400 border text-rose-400 hover:bg-rose-400/10 cursor-pointer" onClick={handleLogout}>
                {
                    loading
                        ?
                        <>
                            <LoaderCircle className="animate-spin" />
                            <span>تحميل ...</span>
                        </>
                        :
                        <>
                            <LogOut />
                            <span>تسجيل خروج</span>
                        </>
                }
            </Button>
        </nav>
    )
}

export default SideBar