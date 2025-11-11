import UserProfile from './UserProfile'

const Header = () => {
    return (
        <header className='p-2 rounded-xl w-full bg-white flex items-center justify-between shadow-md'>
            <h1 className='font-bold text-xl ms-8'>البضائع و الشحنات اللوجيستية</h1>
            <UserProfile />
        </header>
    )
}

export default Header