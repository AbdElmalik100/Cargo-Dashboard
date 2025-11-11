import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { useDispatch, useSelector } from "react-redux"
import { LoaderCircle } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import { Checkbox } from "@/components/ui/checkbox"
import { login } from "../../store/slices/userSlice"


const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { loading } = useSelector(state => state.user)
    
    const validationSchema = yup.object({
        username: yup.string().required("هذا الحقل لا يجب ان يكون فارغا"),
        password: yup.string().required("هذا الحقل لا يجب ان يكون فارغا")
    })

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            username: "",
            password: ""
        }
    })

    
    const onSubmit = handleSubmit(async (data) => {
        const response = await dispatch(login(data))
        if (login.fulfilled.match(response)) navigate("/")
    })
    return (
        <div className='login-page bg-white w-1/4 flex flex-col gap-4 p-8 px-12 justify-center'>
            <div className="mx-auto">
                <img src="/images/logo.png" className="w-46" alt="Logo Image" />
            </div>

            <form className="w-full flex flex-col gap-4 " onSubmit={onSubmit}>
                <div className="flex flex-col items-center gap-2 text-center mb-4">
                    <h1 className="font-bold text-2xl">تسجيل الدخول</h1>
                    <p>
                        منظومة ادارة الشحنات اللوجستية
                    </p>
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="username">اسم المستخدم</Label>
                    <input type="text" id="username" name="username" placeholder="ادخل اسم المستخدم" {...register('username')} />
                    {errors.username && <span className="text-sm text-rose-400 block">{errors.username.message}</span>}
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="password">كلمة السر</Label>
                    <input type="password" id="password" name="password" placeholder="ادخل كلمة السر" {...register('password')} />
                    {errors.password && <span className="text-sm text-rose-400 block">{errors.password.message}</span>}
                </div>
                <div className="flex items-center gap-2 justify-between">
                    <NavLink to={'/'} className='hover:underline'>نسيت كلمة المرور؟</NavLink>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="terms" />
                        <Label htmlFor="terms">تذكرني</Label>
                    </div>
                </div>
                <Button disabled={loading} type="submit" className="cursor-pointer mt-4" onClick={onSubmit}>
                    {
                        loading
                            ?
                            <>
                                <LoaderCircle className="animate-spin" />
                                <span>تحميل ...</span>
                            </>
                            :
                            <span>تسجيل دخول</span>
                    }
                </Button>
            </form>
        </div>
    )
}

export default Login