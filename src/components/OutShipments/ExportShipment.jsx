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
import { LoaderCircle, Plus, X, Check, AlertCircle, Send } from "lucide-react"
import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { useEffect, useMemo, useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createOutShipment, getAllOutShipments, getOutShipmentsStats } from "../../store/slices/outShipmentsSlice"
import { useDispatch, useSelector } from "react-redux"
import { getShipments } from "../../store/slices/inShipmentsSlice"
import { getDestinations, createDestination, deleteDestination } from "../../store/slices/destinationsSlice"
import { getCompanies, createCompany, deleteCompany } from "../../store/slices/companiesSlice"
import DeletePopup from "../DeletePopup"
import { contractOptions, yearsOptions } from "../../constants"
import { formatCurrency, formatWeight } from "../../utils"

const ExportShipment = ({ children, inShipment: presetInShipment = null }) => {
    const dispatch = useDispatch()
    const [open, setOpen] = useState(false);
    const { loading: outLoading } = useSelector(state => state.outShipments)
    const { shipments: inShipments = [], loading: inLoading } = useSelector(state => state.inShipments)
    const { destinations: destinationsList, loading: destinationsLoading } = useSelector(state => state.destinations)
    const { companies: companiesList = [], loading: companiesLoading = false } = useSelector(state => state.companies || { companies: [], loading: false })
    const loading = inLoading || outLoading

    // Selected inshipments state
    const [selectedInShipment, setSelectedInShipment] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")

    // Destination state
    const [selectedDestination, setSelectedDestination] = useState("")
    const [showAddDestination, setShowAddDestination] = useState(false)
    const [newDestination, setNewDestination] = useState("")
    const [destinationSearchTerm, setDestinationSearchTerm] = useState("")
    const [deleteDestinationDialog, setDeleteDestinationDialog] = useState({ open: false, destination: null })

    // Company state
    const [selectedCompany, setSelectedCompany] = useState("")
    const [showAddCompany, setShowAddCompany] = useState(false)
    const [newCompany, setNewCompany] = useState("")
    const [companySearchTerm, setCompanySearchTerm] = useState("")
    const [deleteCompanyDialog, setDeleteCompanyDialog] = useState({ open: false, company: null })

    // Calculate aggregated values from selected inshipments (for display only)
    const remainingPackages = selectedInShipment
        ? Math.max(0, Number(selectedInShipment.package_count || 0) - Number(selectedInShipment.exported_count || 0))
        : 0

    const validationSchema = useMemo(() => (
        yup.object({
            bill_number: yup.string().required("هذا الحقل لا يمكن أن يكون فارغًا"),
            arrival_date: yup.string().required("هذا الحقل لا يمكن أن يكون فارغًا"),
            sub_bill_number: yup.string().required("هذا الحقل لا يمكن أن يكون فارغًا"),
            company_name: yup.string().required("هذا الحقل لا يمكن أن يكون فارغًا"),
            package_count: yup
                .number()
                .typeError("يجب إدخال رقم صحيح")
                .required("هذا الحقل لا يمكن أن يكون فارغًا")
                .min(1, "يجب أن يكون العدد أكبر من صفر")
                .max(remainingPackages || 0, `لا يمكن أن يتجاوز المتبقي: ${remainingPackages || 0}`),
            weight: yup.number().required("هذا الحقل لا يمكن أن يكون فارغًا").min(0, "يجب أن يكون الوزن أكبر من أو يساوي صفر").typeError("يجب إدخال رقم صحيح"),
            destination: yup.string().required("هذا الحقل لا يمكن أن يكون فارغًا"),
            payment_fees: yup.number().required("هذا الحقل لا يمكن أن يكون فارغًا").min(0, "يجب أن تكون الرسوم أكبر من أو تساوي صفر").typeError("يجب إدخال رقم صحيح"),
            customs_certificate: yup.string().required("هذا الحقل لا يمكن أن يكون فارغًا"),
            contract_status: yup.object({
                contract: yup.string().required("حقل العقد مطلوب"),
                ratification: yup.string().required("حقل التصديق مطلوب"),
                status: yup.string().required("حالة العقد مطلوبة"),
            }),
            disbursement_date: yup.string().nullable(),
            receiver_name: yup.string().required("هذا الحقل لا يمكن أن يكون فارغًا"),
            ground_fees: yup.number().required("هذا الحقل لا يمكن أن يكون فارغًا").min(0, "يجب أن تكون الرسوم أكبر من أو تساوي صفر").typeError("يجب إدخال رقم صحيح"),
            export_date: yup.string().required("تاريخ التصدير مطلوب"),
        })
    ), [remainingPackages])

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
            export_date: new Date().toISOString().split('T')[0],
        },
    })


    // Filter non-exported or partially exported inshipments (remain visible until fully exported)
    const nonExportedShipments = inShipments.filter(shipment => {
        const total = Number(shipment.package_count || 0)
        const exported = Number(shipment.exported_count || 0)
        return exported < total
    })

    // Filter shipments based on search
    const filteredShipments = nonExportedShipments.filter(shipment => {
        const searchLower = searchTerm.toLowerCase()
        return (
            shipment.bill_number?.toLowerCase().includes(searchLower) ||
            shipment.sub_bill_number?.toLowerCase().includes(searchLower) ||
            shipment.company_name?.toLowerCase().includes(searchLower) ||
            shipment.destination?.toLowerCase().includes(searchLower)
        )
    })

    // Load non-exported inshipments, destinations and companies on mount
    useEffect(() => {
        if (open) {
            dispatch(getShipments())
            dispatch(getDestinations())
            dispatch(getCompanies()).catch(() => {
                // Silently handle if companies API doesn't exist yet
            })
        }
    }, [dispatch, open])

    // When dialog opens with a preset inshipment, preselect it
    useEffect(() => {
        if (open && presetInShipment) {
            setSelectedInShipment(presetInShipment)
        }
    }, [open, presetInShipment])




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

    const handleCompanyChange = (value) => {
        setSelectedCompany(value)
        if (value === "add_new") {
            setShowAddCompany(true)
        } else {
            setValue('company_name', value, { shouldValidate: true })
        }
    }

    const handleAddNewCompany = async () => {
        const name = newCompany.trim()
        if (!name) {
            return
        }
        try {
            const result = await dispatch(createCompany(name)).unwrap()
            setSelectedCompany(result.name)
            setValue('company_name', result.name, { shouldValidate: true })
            setNewCompany("")
            setShowAddCompany(false)
            setCompanySearchTerm("")
        } catch (e) {
            // Error is already handled in the slice
        }
    }

    // Filter destinations based on search
    const filteredDestinations = destinationsList.filter(destination =>
        destination.name.toLowerCase().includes(destinationSearchTerm.toLowerCase())
    )

    // Filter companies based on search - companies are objects with id and name
    const filteredCompanies = companiesList.filter(company =>
        company.name && company.name.toLowerCase().includes(companySearchTerm.toLowerCase())
    )

    const handleSelectShipment = (shipment) => {
        setSelectedInShipment(prev => (prev && prev.id === shipment.id ? null : shipment))
        if (shipment && shipment.id === selectedInShipment?.id) return
        // Reset form values when changing selected shipment
        setValue('package_count', '')
    }

    const handleSelectAll = () => { }

    const onSubmit = handleSubmit(async (formData) => {
        if (!selectedInShipment) {
            return
        }

        // Validate destination is selected
        if (!selectedDestination) {
            return
        }
        // Validate company is selected
        if (!selectedCompany) {
            return
        }

        // Convert contract_status to format: "contract / ratification / status"
        const finalData = {
            ...formData,
            destination: selectedDestination,
            contract_status: `${formData.contract_status.contract} / ${formData.contract_status.ratification} / ${formData.contract_status.status}`,
            disbursement_date: formData.disbursement_date || null,
            export_date: formData.export_date || null,
            in_shipment_id: selectedInShipment.id,
        }

        try {
            const createResponse = await dispatch(createOutShipment(finalData))

            if (createOutShipment.fulfilled.match(createResponse)) {
                dispatch(getAllOutShipments())
                dispatch(getOutShipmentsStats())
                dispatch(getShipments()) // Refresh inshipments to update export status
                setOpen(false)
                reset()
                setSelectedInShipment(null)
                setSelectedDestination("")
                setDestinationSearchTerm("")
                setSelectedCompany("")
                setCompanySearchTerm("")
                setSearchTerm("")
            }
        } catch (error) {
        }
    })

    useEffect(() => {
        if (!open) {
            reset()
            setSelectedInShipment(null)
            setSelectedDestination("")
            setShowAddDestination(false)
            setNewDestination("")
            setDestinationSearchTerm("")
            setSelectedCompany("")
            setShowAddCompany(false)
            setNewCompany("")
            setCompanySearchTerm("")
            setSearchTerm("")
        }
    }, [open, reset])

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <form>
                    <DialogTrigger asChild>
                        {children ? (
                            children
                        ) : (
                            <Button className="cursor-pointer">
                                <Send />
                                تصدير شحنة جديدة
                            </Button>
                        )}
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[900px] [&_[data-slot='dialog-close']]:!right-[95%] max-h-[90vh] overflow-y-auto thin-scrollbar">
                        <DialogHeader className="!text-start !py-2">
                            <DialogTitle>تصدير الشحنة</DialogTitle>
                            <DialogDescription>
                                اختر الشحنة الواردة ثم قم بملء بيانات الشحنة الصادرة.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 p-1">


                            {/* Form Fields */}
                            {selectedInShipment && (
                                <>
                                    {/* Selected InShipment Summary */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                        <div className="grid gap-1">
                                            <span className="text-xs text-blue-600">عدد الطرود (الواردة)</span>
                                            <div className="p-2 px-3 rounded-lg border bg-white font-semibold">{selectedInShipment.package_count}</div>
                                        </div>
                                        <div className="grid gap-1">
                                            <span className="text-xs text-blue-600">المُصَدَّر</span>
                                            <div className="p-2 px-3 rounded-lg border bg-white font-semibold">{selectedInShipment.exported_count || 0}</div>
                                        </div>
                                        <div className="grid gap-1">
                                            <span className="text-xs text-blue-600">المتبقي</span>
                                            <div className="p-2 px-3 rounded-lg border bg-white font-semibold">{remainingPackages}</div>
                                        </div>
                                        <div className="grid gap-1">
                                            <span className="text-xs text-blue-600">الوزن</span>
                                            <div className="p-2 px-3 rounded-lg border bg-white font-semibold">{formatWeight(selectedInShipment.weight)}</div>
                                        </div>
                                        <div className="grid gap-1">
                                            <span className="text-xs text-blue-600">رسوم الأرضية</span>
                                            <div className="p-2 px-3 rounded-lg border bg-white font-semibold">{formatCurrency(selectedInShipment.ground_fees)}</div>
                                        </div>
                                    </div>

                                    {/* رقم البوليصة وتاريخ الوصول */}
                                    <div className="flex gap-4 items-start">
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
                                    <div className="flex gap-4 items-start">
                                        <div className="grid gap-3 items-start w-full">
                                            <Label>رقم البوليصة الفرعية *</Label>
                                            <input {...register("sub_bill_number")} placeholder="ادخل رقم البوليصة الفرعية" />
                                            {errors.sub_bill_number && <span className="text-sm text-rose-400">{errors.sub_bill_number.message}</span>}
                                        </div>
                                        <div className="grid gap-3 w-full">
                                            <Label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                                <span>اسم الشركة *</span>
                                            </Label>

                                            {showAddCompany && (
                                                <div className="flex gap-2 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                                                    <input
                                                        type="text"
                                                        placeholder="أدخل اسم الشركة الجديدة"
                                                        value={newCompany}
                                                        onChange={(e) => setNewCompany(e.target.value)}
                                                        className="flex-1 px-4 py-2 border border-primary-300 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white"
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={handleAddNewCompany}
                                                        disabled={!newCompany.trim() || companiesLoading}
                                                        className="bg-primary-600 hover:bg-primary-700 rounded-lg"
                                                    >
                                                        <Check size={16} />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setShowAddCompany(false)
                                                            setNewCompany("")
                                                        }}
                                                        className="border-primary-300 text-primary-600 hover:bg-primary-50 rounded-lg"
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                </div>
                                            )}

                                            <Select value={selectedCompany} onValueChange={handleCompanyChange} onOpenChange={(open) => {
                                                if (!open) {
                                                    setCompanySearchTerm("")
                                                }
                                            }}>
                                                <SelectTrigger className="w-full text-right border-neutral-200 rounded-md focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-neutral-50 focus:bg-white px-4 py-3" dir="rtl">
                                                    <SelectValue placeholder="ابحث واختر الشركة">
                                                        {selectedCompany || "ابحث واختر الشركة"}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent
                                                    className="max-h-[300px] text-right"
                                                    dir="rtl"
                                                >
                                                    <div className="p-2 border-b">
                                                        <input
                                                            type="text"
                                                            placeholder="ابحث في الشركات..."
                                                            value={companySearchTerm}
                                                            onChange={(e) => setCompanySearchTerm(e.target.value)}
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
                                                        {filteredCompanies.length > 0 ? (
                                                            <>
                                                                {filteredCompanies.map((company) => (
                                                                    <SelectItem key={company.id} value={company.name} className="text-right" dir="rtl">
                                                                        <div className="flex items-center justify-between w-full gap-2">
                                                                            <button
                                                                                type="button"
                                                                                className="text-red-500 hover:text-red-700 p-1 rounded flex-shrink-0"
                                                                                title="حذف الشركة"
                                                                                onPointerDown={(e) => {
                                                                                    e.preventDefault()
                                                                                    e.stopPropagation()
                                                                                    setDeleteCompanyDialog({ open: true, company })
                                                                                }}
                                                                            >
                                                                                <X size={16} />
                                                                            </button>
                                                                            <span className="flex-1">{company.name}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                                <SelectItem value="add_new" className="text-primary-600 font-medium hover:bg-primary-50 border-t">
                                                                    <div className="flex items-center gap-2">
                                                                        <Plus size={16} />
                                                                        إضافة شركة جديدة
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
                                                                        إضافة شركة جديدة
                                                                    </div>
                                                                </SelectItem>
                                                            </>
                                                        )}
                                                    </div>
                                                </SelectContent>
                                            </Select>
                                            {errors.company_name && <span className="text-sm text-rose-400 flex items-center gap-1">
                                                <AlertCircle size={14} />
                                                {errors.company_name.message}
                                            </span>}
                                        </div>
                                    </div>

                                    {/* عدد الطرود والوزن */}
                                    <div className="flex gap-4 items-start">
                                        <div className="grid gap-3 w-full">
                                            <Label>عدد الطرود *</Label>
                                            <input type="number" {...register("package_count")} placeholder="ادخل عدد الطرود" min="1" max={remainingPackages || undefined} />
                                            {errors.package_count && <span className="text-sm text-rose-400">{errors.package_count.message}</span>}
                                            {remainingPackages > 0 && (
                                                <span className="text-xs text-neutral-500">لا يمكن أن يتجاوز المتبقي: {remainingPackages}</span>
                                            )}
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
                                            <SelectTrigger className="w-full text-right border-neutral-200 rounded-md focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-neutral-50 focus:bg-white px-4 py-3" dir="rtl">
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
                                                                            className="text-red-500 hover:text-red-700 p-1 rounded flex-shrink-0"
                                                                            title="حذف الوجهة"
                                                                            onPointerDown={(e) => {
                                                                                e.preventDefault()
                                                                                e.stopPropagation()
                                                                                setDeleteDestinationDialog({ open: true, destination })
                                                                            }}
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
                                    <div className="flex gap-4 items-start">
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
                                    <div className="flex gap-4 items-start">
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

                                    {/* تاريخ التصدير */}
                                    <div className="grid gap-3 w-full">
                                        <Label>تاريخ التصدير *</Label>
                                        <input type="date" {...register("export_date")} />
                                        {errors.export_date && <span className="text-sm text-rose-400">{errors.export_date.message}</span>}
                                    </div>
                                </>
                            )}
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button disabled={loading} variant="outline" className="cursor-pointer">إلغاء</Button>
                            </DialogClose>
                            <Button
                                disabled={loading}
                                type="submit"
                                className="cursor-pointer"
                                onClick={onSubmit}
                            >
                                {loading ? (
                                    <>
                                        <LoaderCircle className="animate-spin" />
                                        <span>تصدير ...</span>
                                    </>
                                ) : (
                                    <span>تصدير</span>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>
            {deleteDestinationDialog.destination && (
                <DeletePopup
                    item={deleteDestinationDialog.destination}
                    delFn={deleteDestination}
                    loading={destinationsLoading}
                    open={deleteDestinationDialog.open}
                    onOpenChange={(open) => {
                        if (!open) {
                            setDeleteDestinationDialog({ open: false, destination: null })
                        }
                    }}
                    onSuccess={() => {
                        if (selectedDestination === deleteDestinationDialog.destination?.name) {
                            setSelectedDestination("")
                            setValue('destination', "", { shouldValidate: true })
                        }
                        setDeleteDestinationDialog({ open: false, destination: null })
                    }}
                />
            )}
            {deleteCompanyDialog.company && (
                <DeletePopup
                    item={deleteCompanyDialog.company}
                    delFn={deleteCompany}
                    loading={companiesLoading}
                    open={deleteCompanyDialog.open}
                    onOpenChange={(open) => {
                        if (!open) {
                            setDeleteCompanyDialog({ open: false, company: null })
                        }
                    }}
                    onSuccess={() => {
                        if (selectedCompany === deleteCompanyDialog.company?.name) {
                            setSelectedCompany("")
                            setValue('company_name', "", { shouldValidate: true })
                        }
                        setDeleteCompanyDialog({ open: false, company: null })
                    }}
                />
            )}
        </>
    )
}

export default ExportShipment
