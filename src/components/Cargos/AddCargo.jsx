import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { LoaderCircle, Plus, X, Check, AlertCircle, MapPin } from "lucide-react"
import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createShipment } from "../../store/slices/inShipmentsSlice"
import { useDispatch, useSelector } from "react-redux"
import { getDestinations, createDestination, deleteDestination } from "../../store/slices/destinationsSlice"
import { contractOptions, yearsOptions } from "../../constants"
import axiosRequest from "../../plugins/axios"

const AddCargo = () => {
    const dispatch = useDispatch()
    const [open, setOpen] = useState(false);
    const { loading } = useSelector(state => state.inShipments)
    const { destinations: destinationsList, loading: destinationsLoading } = useSelector(state => state.destinations)
    
    // Destination state
    const [selectedDestination, setSelectedDestination] = useState("")
    const [showAddDestination, setShowAddDestination] = useState(false)
    const [newDestination, setNewDestination] = useState("")
    const [destinationSearchTerm, setDestinationSearchTerm] = useState("")
    const [deleteItem, setDeleteItem] = useState(null)

    // Load destinations on mount
    useEffect(() => {
        dispatch(getDestinations())
    }, [dispatch])

    const validationSchema = yup.object({
        bill_number: yup.string()
            .required("هذا الحقل لا يمكن أن يكون فارغًا")
            .test('unique', 'رقم البوليصة موجود بالفعل', async function(value) {
                if (!value) return true;
                try {
                    const response = await axiosRequest.get(`api/in-shipments/?bill_number=${value}`);
                    return !response.data || response.data.length === 0;
                } catch (error) {
                    return true; // If error, let backend handle it
                }
            }),
        arrival_date: yup.string().required("هذا الحقل لا يمكن أن يكون فارغًا"),
        sub_bill_number: yup.string().required("هذا الحقل لا يمكن أن يكون فارغًا"),
        company_name: yup.string().required("هذا الحقل لا يمكن أن يكون فارغًا"),
        package_count: yup.number().required("هذا الحقل لا يمكن أن يكون فارغًا").min(1, "يجب أن يكون العدد أكبر من صفر"),
        weight: yup.number().required("هذا الحقل لا يمكن أن يكون فارغًا").min(0, "يجب أن يكون الوزن أكبر من أو يساوي صفر"),
        destination: yup.string().required("هذا الحقل لا يمكن أن يكون فارغًا"),
        payment_fees: yup.number().required("هذا الحقل لا يمكن أن يكون فارغًا").min(0, "يجب أن تكون الرسوم أكبر من أو تساوي صفر"),
        customs_certificate: yup.string().required("هذا الحقل لا يمكن أن يكون فارغًا"),
        contract_status: yup.object({
            contract: yup.string().required("حقل العقد مطلوب"),
            ratification: yup.string().required("حقل التصديق مطلوب"),
            status: yup.string().required("حالة العقد مطلوبة"),
        }),
        disbursement_date: yup.string().nullable(),
        receiver_name: yup.string().required("هذا الحقل لا يمكن أن يكون فارغًا"),
        ground_fees: yup.number().required("هذا الحقل لا يمكن أن يكون فارغًا").min(0, "يجب أن تكون الرسوم أكبر من أو يساوي صفر"),
    })

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            bill_number: "",
            arrival_date: "",
            sub_bill_number: "",
            company_name: "",
            package_count: "",
            weight: "",
            destination: "",
            payment_fees: "",
            customs_certificate: "",
            contract_status: {
                contract: "",
                ratification: "نهائي",
                status: new Date().getFullYear().toString(),
            },
            disbursement_date: "",
            receiver_name: "",
            ground_fees: "",
        },
    })

    const handleDestinationChange = (value) => {
        setSelectedDestination(value)
        if (value === "add_new") {
            setShowAddDestination(true)
        } else {
            setValue('destination', value, { shouldValidate: true })
        }
    }

    const handleAddNewDestination = async () => {
        const name = newDestination.trim()
        if (!name) {
            toast.error("يرجى إدخال اسم الوجهة")
            return
        }
        try {
            const result = await dispatch(createDestination(name)).unwrap()
            setSelectedDestination(result.name)
            setValue('destination', result.name, { shouldValidate: true })
            setNewDestination("")
            setShowAddDestination(false)
            setDestinationSearchTerm("")
        } catch (e) {
            // Error is already handled in the slice
        }
    }

    const handleDeleteDestination = (destination) => {
        const destinationObj = destinationsList.find(d => d.name === destination || d.id === destination)
        if (!destinationObj) return
        
        setDeleteItem({
            type: 'destination',
            name: destinationObj.name,
            onDelete: async () => {
                try {
                    await dispatch(deleteDestination(destinationObj.id)).unwrap()
                    
                    if (selectedDestination === destinationObj.name) {
                        setSelectedDestination("")
                        setValue('destination', "")
                    }
                    setDeleteItem(null)
                } catch (error) {
                    // Error is already handled in the slice
                    setDeleteItem(null)
                }
            }
        })
    }

    // Filter destinations based on search - destinations are objects with id and name
    const filteredDestinations = destinationsList.filter(destination =>
        destination.name.toLowerCase().includes(destinationSearchTerm.toLowerCase())
    )

    const onSubmit = handleSubmit(async (formData) => {
        // Validate destination is selected
        if (!selectedDestination) {
            toast.error("يرجى اختيار الوجهة")
            return
        }

        // Convert contract_status to old format: "contract / ratification / status"
        const finalData = {
            ...formData,
            destination: selectedDestination,
            contract_status: `${formData.contract_status.contract} / ${formData.contract_status.ratification} / ${formData.contract_status.status}`,
            disbursement_date: formData.disbursement_date || null,
        }
        
        const response = await dispatch(createShipment(finalData))
        if (createShipment.fulfilled.match(response)) {
            toast.success("تم إضافة شحنة جديدة")
            setOpen(false)
            reset()
            setSelectedDestination("")
            setDestinationSearchTerm("")
        }
    })

    useEffect(() => {
        if (!open) {
            reset()
            setSelectedDestination("")
            setShowAddDestination(false)
            setNewDestination("")
            setDestinationSearchTerm("")
        }
    }, [open, reset])

    return (
        <>
        <Dialog open={open} onOpenChange={setOpen}>
            <form>
                <DialogTrigger asChild>
                    <Button className="cursor-pointer">
                        <Plus />
                        <span>اضافة شحنة جديدة</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[725px] [&_[data-slot='dialog-close']]:!right-[95%] max-h-[90vh] overflow-y-auto thin-scrollbar">
                    <DialogHeader className="!text-start !py-2">
                        <DialogTitle>إضافة شحنة جديدة</DialogTitle>
                        <DialogDescription>
                            يمكنك إضافة شحنة جديدة من هنا، قم بملء البيانات ثم اضغط على زر إضافة.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 p-1">
                        {/* رقم البوليصة وتاريخ الوصول */}
                        <div className="flex gap-4">
                            <div className="grid gap-3 w-full">
                                <Label>رقم البوليصة *</Label>
                                <input {...register("bill_number")} placeholder="ادخل رقم البوليصة" />
                                {errors.bill_number && <span className="text-sm text-rose-400">{errors.bill_number.message}</span>}
                            </div>
                            <div className="grid gap-3 w-full">
                                <Label>تاريخ الوصول *</Label>
                                <input type="date" {...register("arrival_date")} />
                                {errors.arrival_date && <span className="text-sm text-rose-400">{errors.arrival_date.message}</span>}
                            </div>
                        </div>

                        {/* رقم البوليصة الفرعية واسم الشركة */}
                        <div className="flex gap-4">
                            <div className="grid gap-3 items-start w-full">
                                <Label>رقم البوليصة الفرعية *</Label>
                                <input {...register("sub_bill_number")} placeholder="ادخل رقم البوليصة الفرعية" />
                                {errors.sub_bill_number && <span className="text-sm text-rose-400">{errors.sub_bill_number.message}</span>}
                            </div>
                            <div className="grid gap-3 w-full">
                                <Label>اسم الشركة *</Label>
                                <input {...register("company_name")} placeholder="ادخل اسم الشركة الناقلة" />
                                {errors.company_name && <span className="text-sm text-rose-400">{errors.company_name.message}</span>}
                            </div>
                        </div>

                        {/* عدد الطرود والوزن */}
                        <div className="flex gap-4">
                            <div className="grid gap-3 w-full">
                                <Label>عدد الطرود *</Label>
                                <input type="number" {...register("package_count")} placeholder="ادخل عدد الطرود" min="1" />
                                {errors.package_count && <span className="text-sm text-rose-400">{errors.package_count.message}</span>}
                            </div>
                            <div className="grid gap-3 w-full">
                                <Label>الوزن (كجم) *</Label>
                                <input type="number" step="0.01" {...register("weight")} placeholder="ادخل وزن الشحنة بالكيلو" min="0" />
                                {errors.weight && <span className="text-sm text-rose-400">{errors.weight.message}</span>}
                            </div>
                        </div>

                        {/* الجهة */}
                        <div className="grid gap-3 w-full">
                            <Label className="flex items-center gap-2">
                                الجهة *
                            </Label>
                            
                            {showAddDestination && (
                                <div className="flex gap-2 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                                    <input 
                                        type="text" 
                                        placeholder="أدخل اسم الوجهة الجديدة"
                                        value={newDestination}
                                        onChange={(e) => setNewDestination(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-primary-300 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white"
                                    />
                                    <Button 
                                        type="button"
                                        size="sm"
                                        onClick={handleAddNewDestination}
                                        disabled={!newDestination.trim()}
                                        className="bg-primary-600 hover:bg-primary-700 rounded-lg"
                                    >
                                        <Check size={16} />
                                    </Button>
                                    <Button 
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setShowAddDestination(false)
                                            setNewDestination("")
                                        }}
                                        className="border-primary-300 text-primary-600 hover:bg-primary-50 rounded-lg"
                                    >
                                        <X size={16} />
                                    </Button>
                                </div>
                            )}
                            
                            <Select value={selectedDestination} onValueChange={handleDestinationChange} onOpenChange={(open) => {
                                if (!open) {
                                    setDestinationSearchTerm("")
                                }
                            }}>
                                <SelectTrigger className="w-full text-right border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-neutral-50 focus:bg-white px-4 py-3" dir="rtl">
                                    <SelectValue placeholder="ابحث واختر الوجهة">
                                        {selectedDestination || "ابحث واختر الوجهة"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent 
                                    className="max-h-[300px] text-right" 
                                    dir="rtl"
                                >
                                    <div className="p-2 border-b">
                                        <input 
                                            type="text" 
                                            placeholder="ابحث في الوجهات..."
                                            value={destinationSearchTerm}
                                            onChange={(e) => setDestinationSearchTerm(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            onPointerDown={(e) => e.stopPropagation()}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onKeyDown={(e) => e.stopPropagation()}
                                            onFocus={(e) => e.stopPropagation()}
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto">
                                        {filteredDestinations.length > 0 ? (
                                            <>
                                                {filteredDestinations.map((destination) => (
                                                    <SelectItem key={destination.id} value={destination.name} className="text-right" dir="rtl">
                                                        <div className="flex items-center justify-between w-full gap-2">
                                                            <button
                                                                type="button"
                                                                onPointerDown={(e) => {
                                                                    e.preventDefault()
                                                                    e.stopPropagation()
                                                                    handleDeleteDestination(destination.name)
                                                                }}
                                                                className="text-red-500 hover:text-red-700 p-1 rounded flex-shrink-0"
                                                                title="حذف الوجهة"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                            <span className="flex-1">{destination.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="add_new" className="text-primary-600 font-medium hover:bg-primary-50 border-t">
                                                    <div className="flex items-center gap-2">
                                                        <Plus size={16} />
                                                        إضافة وجهة جديدة
                                                    </div>
                                                </SelectItem>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-3 text-sm text-neutral-500 text-center">
                                                    لا توجد نتائج للبحث
                                                </div>
                                                <SelectItem value="add_new" className="text-primary-600 font-medium hover:bg-primary-50 border-t">
                                                    <div className="flex items-center gap-2">
                                                        <Plus size={16} />
                                                        إضافة وجهة جديدة
                                                    </div>
                                                </SelectItem>
                                            </>
                                        )}
                                    </div>
                                </SelectContent>
                            </Select>
                            {errors.destination && <span className="text-sm text-rose-400 flex items-center gap-1">
                                <AlertCircle size={14} />
                                {errors.destination.message}
                            </span>}
                        </div>

                        {/* رسوم الدفع والشهادة الجمركية */}
                        <div className="flex gap-4">
                            <div className="grid gap-3 w-full">
                                <Label>رسوم الدفع *</Label>
                                <input type="number" step="0.01" {...register("payment_fees")} placeholder="ادخل رسوم الدفع بالجنيه المصري" min="0" />
                                {errors.payment_fees && <span className="text-sm text-rose-400">{errors.payment_fees.message}</span>}
                            </div>
                            <div className="grid gap-3 w-full">
                                <Label>الشهادة الجمركية *</Label>
                                <input {...register("customs_certificate")} placeholder="ادخل رقم الشهادة الجمركية" />
                                {errors.customs_certificate && <span className="text-sm text-rose-400">{errors.customs_certificate.message}</span>}
                            </div>
                        </div>

                        {/* عقد / تصديق / حالة */}
                        <div className="grid gap-4 w-full">
                            <Label>عقد / تصديق / حالة *</Label>
                            <div className="flex gap-4 items-center">
                                <div className="grid gap-3 w-full">
                                    <input {...register('contract_status.contract')} min={0} type="number" placeholder="ادخل رقم العقد" className="w-full" />
                                    {errors.contract_status?.contract && <span className="text-sm text-rose-400">{errors.contract_status.contract.message}</span>}
                                </div>
                                <span>\</span>
                                <div className="grid gap-3 w-full">
                                    <Select dir="rtl" value={watch("contract_status.ratification")} onValueChange={(val) => setValue("contract_status.ratification", val, { shouldValidate: true })}>
                                        <SelectTrigger className="w-full !ring-0 col-span-2">
                                            <SelectValue placeholder="اختر  نوع التصديق" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contractOptions.map((opt, i) => (
                                                <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.contract_status?.ratification && <span className="text-sm text-rose-400">{errors.contract_status.ratification.message}</span>}
                                </div>
                                <span>\</span>
                                <div className="grid gap-3 w-full">
                                    <Select dir="rtl" value={watch("contract_status.status")} onValueChange={(val) => setValue("contract_status.status", val, { shouldValidate: true })}>
                                        <SelectTrigger className="w-full !ring-0 col-span-2">
                                            <SelectValue placeholder="اختر سنه الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearsOptions.map((opt, i) => (
                                                <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.contract_status?.status && <span className="text-sm text-rose-400">{errors.contract_status.status.message}</span>}
                                </div>
                            </div>
                        </div>

                        {/* تاريخ الصرف (اختياري) */}
                        <div className="grid gap-3 w-full">
                            <Label>تاريخ الصرف (اختياري)</Label>
                            <input type="date" {...register("disbursement_date")} />
                            {errors.disbursement_date && <span className="text-sm text-rose-400">{errors.disbursement_date.message}</span>}
                        </div>

                        {/* المستلم ورسوم الأرضية */}
                        <div className="flex gap-4">
                            <div className="grid gap-3 w-full">
                                <Label>المستلم *</Label>
                                <input {...register("receiver_name")} placeholder="ادخل اسم المستلم النهائي" />
                                {errors.receiver_name && <span className="text-sm text-rose-400">{errors.receiver_name.message}</span>}
                            </div>
                            <div className="grid gap-3 w-full">
                                <Label>رسوم الأرضية *</Label>
                                <input type="number" step="0.01" {...register("ground_fees")} placeholder="ادخل رسوم الأرضية بالجنيه المصري" min="0" />
                                {errors.ground_fees && <span className="text-sm text-rose-400">{errors.ground_fees.message}</span>}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button disabled={loading} variant="outline" className="cursor-pointer">إلغاء</Button>
                        </DialogClose>
                        <Button disabled={loading} type="submit" className="cursor-pointer" onClick={onSubmit}>
                            {loading ? (
                                <>
                                    <LoaderCircle className="animate-spin" />
                                    <span>إضافة ...</span>
                                </>
                            ) : (
                                <span>إضافة</span>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
        
        {/* Delete confirmation popup */}
        {deleteItem && (
            <div 
                className="fixed inset-0 flex items-center justify-center" 
                data-delete-popup 
                style={{ 
                    pointerEvents: 'auto',
                    zIndex: 9999999,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                    isolation: 'isolate'
                }}
            >
                <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteItem(null)} />
                <div 
                    className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6" 
                    dir="rtl" 
                    style={{ 
                        pointerEvents: 'auto',
                        position: 'relative',
                        zIndex: 10000000,
                        transform: 'translateZ(0)',
                        willChange: 'transform',
                        isolation: 'isolate'
                    }}
                >
                    <p className="text-gray-700 text-right mb-4">
                        هل أنت متأكد من حذف "{deleteItem.name}"؟
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setDeleteItem(null)
                            }}
                            className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium"
                            style={{ pointerEvents: 'auto' }}
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                deleteItem.onDelete()
                            }}
                            className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 font-medium"
                            style={{ pointerEvents: 'auto' }}
                        >
                            حذف
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}

export default AddCargo
