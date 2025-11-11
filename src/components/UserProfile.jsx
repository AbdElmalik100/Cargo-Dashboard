import { LogOut, Settings2, User, LoaderCircle } from "lucide-react"
import { NavLink, useNavigate } from 'react-router-dom'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/userSlice'



const UserProfile = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user, loading } = useSelector(state => state.user)

    const handleLogout = async () => {
        const response = await dispatch(logout())
        if (logout.fulfilled.match(response)) navigate("/login")
    }

    return (
        user &&
        <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className='rounded-lg !ring-0 transition-all ease-out flex items-center gap-2 cursor-pointer p-1.5 px-4 h-full data-[state=open]:bg-neutral-100'>
                    <Avatar className="size-8 grid place-items-center">
                        <AvatarImage src="/images/star.svg" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col items-start capitalize'>
                        <span className='text-sm text-neutral-950'>{user.username}</span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" >
                <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <NavLink to='/'>
                        <DropdownMenuItem>
                            <User />
                            <span>الملف الشخصي</span>
                        </DropdownMenuItem>
                    </NavLink>
                    <NavLink to='/'>
                        <DropdownMenuItem>
                            <Settings2 />
                            <span>إعدادات النظام</span>
                        </DropdownMenuItem>
                    </NavLink>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
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
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserProfile