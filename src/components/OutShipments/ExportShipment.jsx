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
import { useEffect, useState } from "react"
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

const ExportShipment = ({ children }) => {
    const dispatch = useDispatch()
    const [open, setOpen] = useState(false);
    const { loading: outLoading } = useSelector(state => state.outShipments)
    const { shipments: inShipments = [], loading: inLoading } = useSelector(state => state.inShipments)
    const { destinations: destinationsList, loading: destinationsLoading } = useSelector(state => state.destinations)
    const { companies: companiesList = [], loading: companiesLoading = false } = useSelector(state => state.companies || { companies: [], loading: false })
    const loading = inLoading || outLoading

    // Selected inshipments state
    const [selectedInShipments, setSelectedInShipments] = useState([])
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

    const validationSchema = yup.object({
        bill_number: yup.string().required("هذا الحقل لا يمكن أن يكون فارغًا"),
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
        ground_fees: yup.number().required("هذا الحقل لا يمكن أن يكون فارغًا").min(0, "يجب أن تكون الرسوم أكبر من أو تساوي صفر"),
        export_date: yup.string().required("تاريخ التصدير مطلوب"),
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
            export_date: new Date().toISOString().split('T')[0],
        },
    })


    // Filter non-exported inshipments
    const nonExportedShipments = inShipments.filter(shipment => !shipment.export)

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

    // Calculate aggregated values from selected inshipments (for display only)
    const aggregatedData = selectedInShipments.reduce((acc, shipment) => {
        acc.package_count += Number(shipment.package_count || 0)
        acc.weight += Number(shipment.weight || 0)
        acc.payment_fees += Number(shipment.payment_fees || 0)
        acc.ground_fees += Number(shipment.ground_fees || 0)
        return acc
    }, {
        package_count: 0,
        weight: 0,
        payment_fees: 0,
        ground_fees: 0
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

    const handleToggleShipment = (shipment) => {
        setSelectedInShipments(prev => {
            const exists = prev.find(s => s.id === shipment.id)
            if (exists) {
                return prev.filter(s => s.id !== shipment.id)
            } else {
                return [...prev, shipment]
            }
        })
    }

    const handleSelectAll = () => {
        if (selectedInShipments.length === filteredShipments.length) {
            setSelectedInShipments([])
        } else {
            setSelectedInShipments([...filteredShipments])
        }
    }

    const onSubmit = handleSubmit(async (formData) => {
        if (selectedInShipments.length === 0) {
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
            in_shipment_ids: selectedInShipments.map(s => s.id),
        }

        try {
            const createResponse = await dispatch(createOutShipment(finalData))

            if (createOutShipment.fulfilled.match(createResponse)) {
                dispatch(getAllOutShipments())
                dispatch(getOutShipmentsStats())
                dispatch(getShipments()) // Refresh inshipments to update export status
                setOpen(false)
                reset()
                setSelectedInShipments([])
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
            setSelectedInShipments([])
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
                        <Button className="cursor-pointer">
                            <Send />
                            تصدير شحنة جديدة
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[900px] [&_[data-slot='dialog-close']]:!right-[95%] max-h-[90vh] overflow-y-auto thin-scrollbar">
                        <DialogHeader className="!text-start !py-2">
                            <DialogTitle>تصدير الشحنة</DialogTitle>
                            <DialogDescription>
                                اختر الشحنات الواردة التي تريد تصديرها وقم بملء بيانات الشحنة الصادرة.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 p-1">
                            {/* Selection Section */}
                            <div className="border rounded-xl p-4 bg-neutral-50">
                                <div className="flex items-center justify-between mb-4">
                                    <Label className="text-lg font-semibold">اختر الشحنات الواردة</Label>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={selectedInShipments.length === filteredShipments.length && filteredShipments.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                        <span className="text-sm">تحديد الكل</span>
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        placeholder="ابحث في الشحنات..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                {/* Selected count */}
                                {selectedInShipments.length > 0 && (
                                    <div className="mb-4 p-2 bg-primary-50 border border-primary-200 rounded-md">
                                        <span className="text-sm font-medium text-primary-700">
                                            تم اختيار {selectedInShipments.length} شحنة
                                        </span>
                                    </div>
                                )}

                                {/* Shipments List */}
                                <div className="max-h-[200px] overflow-y-auto border rounded-lg bg-white">
                                    {filteredShipments.length === 0 ? (
                                        <div className="p-4 text-center text-neutral-500">
                                            {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد شحنات واردة متاحة للتصدير"}
                                        </div>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead className="bg-neutral-100 sticky top-0">
                                                <tr>
                                                    <th className="p-2 text-right w-12"></th>
                                                    <th className="p-2 text-right">رقم البوليصة</th>
                                                    <th className="p-2 text-right">رقم البوليصة الفرعية</th>
                                                    <th className="p-2 text-right">اسم الشركة</th>
                                                    <th className="p-2 text-right">الجهة</th>
                                                    <th className="p-2 text-right">الوزن</th>
                                                    <th className="p-2 text-right">عدد الطرود</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredShipments.map((shipment) => (
                                                    <tr
                                                        key={shipment.id}
                                                        className={`border-b hover:bg-neutral-50 cursor-pointer ${selectedInShipments.find(s => s.id === shipment.id) ? 'bg-primary-50' : ''
                                                            }`}
                                                        onClick={() => handleToggleShipment(shipment)}
                                                    >
                                                        <td className="p-2" onClick={(e) => e.stopPropagation()}>
                                                            <Checkbox
                                                                checked={!!selectedInShipments.find(s => s.id === shipment.id)}
                                                                onCheckedChange={() => handleToggleShipment(shipment)}
                                                            />
                                                        </td>
                                                        <td className="p-2">{shipment.bill_number || '-'}</td>
                                                        <td className="p-2">{shipment.sub_bill_number || '-'}</td>
                                                        <td className="p-2">{shipment.company_name || '-'}</td>
                                                        <td className="p-2">{shipment.destination}</td>
                                                        <td className="p-2">{formatWeight(shipment.weight)}</td>
                                                        <td className="p-2">{shipment.package_count || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>

                            {/* Form Fields */}
                            {selectedInShipments.length > 0 && (
                                <>
                                    {/* Aggregated Summary */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                        <div className="grid gap-1">
                                            <span className="text-xs text-blue-600">إجمالي عدد الطرود</span>
                                            <div className="p-2 px-3 rounded-lg border bg-white font-semibold">{aggregatedData.package_count}</div>
                                        </div>
                                        <div className="grid gap-1">
                                            <span className="text-xs text-blue-600">إجمالي الوزن</span>
                                            <div className="p-2 px-3 rounded-lg border bg-white font-semibold">{formatWeight(aggregatedData.weight)}</div>
                                        </div>
                                        <div className="grid gap-1">
                                            <span className="text-xs text-blue-600">إجمالي رسوم الدفع</span>
                                            <div className="p-2 px-3 rounded-lg border bg-white font-semibold">{formatCurrency(aggregatedData.payment_fees)}</div>
                                        </div>
                                        <div className="grid gap-1">
                                            <span className="text-xs text-blue-600">إجمالي رسوم الأرضية</span>
                                            <div className="p-2 px-3 rounded-lg border bg-white font-semibold">{formatCurrency(aggregatedData.ground_fees)}</div>
                                        </div>
                                    </div>

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
                                disabled={loading || selectedInShipments.length === 0}
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
                                    <span>تصدير ({selectedInShipments.length})</span>
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
