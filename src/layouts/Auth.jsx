
import { Outlet } from 'react-router-dom'
import AuthHero from '../components/Auth/AuthHero'
const Auth = () => {
    return (
        <div className='flex h-screen'>
            <Outlet />
            <AuthHero />
        </div>
    )
}

export default Auth