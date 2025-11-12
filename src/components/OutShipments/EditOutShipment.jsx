import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useForm } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { toast } from "sonner"
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
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { LoaderCircle, Plus, X, Check, AlertCircle } from "lucide-react"

import { getDestinations, createDestination, deleteDestination } from "../../store/slices/destinationsSlice"
import { getCompanies, createCompany, deleteCompany } from "../../store/slices/companiesSlice"
import { getShipments } from "../../store/slices/inShipmentsSlice"
import { updateOutShipment, getAllOutShipments, getOutShipmentsStats } from "../../store/slices/outShipmentsSlice"
import DeletePopup from "../DeletePopup"
import { contractOptions, yearsOptions } from "../../constants"
import { formatCurrency, formatWeight } from "../../utils"

const EditOutShipment = ({ item, children }) => {
    const dispatch = useDispatch()
    const [open, setOpen] = useState(false)

    const { loading: outLoading } = useSelector(state => state.outShipments)
    const { shipments: inShipments = [], loading: inLoading } = useSelector(state => state.inShipments)
    const { destinations: destinationsList = [], loading: destinationsLoading } = useSelector(state => state.destinations)
    const { companies: companiesList = [], loading: companiesLoading = false } = useSelector(state => state.companies || { companies: [], loading: false })
    const loading = outLoading || inLoading

    const [selectedInShipments, setSelectedInShipments] = useState(item?.in_shipments || [])
    const [searchTerm, setSearchTerm] = useState("")

    const [selectedDestination, setSelectedDestination] = useState(item?.destination || "")
    const [showAddDestination, setShowAddDestination] = useState(false)
    const [newDestination, setNewDestination] = useState("")
    const [destinationSearchTerm, setDestinationSearchTerm] = useState("")
    const [deleteDestinationDialog, setDeleteDestinationDialog] = useState({ open: false, destination: null })

    const [selectedCompany, setSelectedCompany] = useState(item?.company_name || "")
    const [showAddCompany, setShowAddCompany] = useState(false)
    const [newCompany, setNewCompany] = useState("")
    const [companySearchTerm, setCompanySearchTerm] = useState("")
    const [deleteCompanyDialog, setDeleteCompanyDialog] = useState({ open: false, company: null })

    const selectedIds = useMemo(() => new Set(selectedInShipments.map(shipment => shipment.id)), [selectedInShipments])

    const availableShipments = useMemo(() => {
        return inShipments.filter(shipment => !shipment.export || selectedIds.has(shipment.id))
    }, [inShipments, selectedIds])

    const filteredShipments = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase()
        return availableShipments.filter(shipment => {
            return (
                shipment.bill_number?.toLowerCase().includes(lowerSearch) ||
                shipment.sub_bill_number?.toLowerCase().includes(lowerSearch) ||
                shipment.company_name?.toLowerCase().includes(lowerSearch) ||
                shipment.destination?.toLowerCase().includes(lowerSearch)
            )
        })
    }, [availableShipments, searchTerm])

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
            bill_number: item?.bill_number || "",
            arrival_date: item?.arrival_date || "",
            sub_bill_number: item?.sub_bill_number || "",
            company_name: item?.company_name || "",
            package_count: item?.package_count || "",
            weight: item?.weight || "",
            destination: item?.destination || "",
            payment_fees: item?.payment_fees || "",
            customs_certificate: item?.customs_certificate || "",
            contract_status: {
                contract: "",
                ratification: "نهائي",
                status: new Date().getFullYear().toString(),
            },
            disbursement_date: item?.disbursement_date || "",
            receiver_name: item?.receiver_name || "",
            ground_fees: item?.ground_fees || "",
            export_date: item?.export_date ? new Date(item.export_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        },
    })

    useEffect(() => {
        if (open) {
            dispatch(getDestinations())
            dispatch(getCompanies()).catch(() => {})
            dispatch(getShipments())

            const contractParts = item?.contract_status ? item.contract_status.split(' / ') : ["", "نهائي", new Date().getFullYear().toString()]
            const formatDate = (value) => {
                if (!value) return ""
                const date = new Date(value)
                return isNaN(date.getTime()) ? "" : date.toISOString().split('T')[0]
            }

            reset({
                bill_number: item?.bill_number || "",
                arrival_date: formatDate(item?.arrival_date),
                sub_bill_number: item?.sub_bill_number || "",
                company_name: item?.company_name || "",
                package_count: item?.package_count || "",
                weight: item?.weight || "",
                destination: item?.destination || "",
                payment_fees: item?.payment_fees || "",
                customs_certificate: item?.customs_certificate || "",
                contract_status: {
                    contract: contractParts[0] || "",
                    ratification: contractParts[1] || "نهائي",
                    status: contractParts[2] || new Date().getFullYear().toString(),
                },
                disbursement_date: formatDate(item?.disbursement_date),
                receiver_name: item?.receiver_name || "",
                ground_fees: item?.ground_fees || "",
                export_date: formatDate(item?.export_date) || new Date().toISOString().split('T')[0],
            })

            setSelectedDestination(item?.destination || "")
            setSelectedCompany(item?.company_name || "")
            setSelectedInShipments(item?.in_shipments || [])
        } else {
            reset()
            setSelectedDestination("")
            setSelectedCompany("")
            setSelectedInShipments([])
            setSearchTerm("")
            setDestinationSearchTerm("")
            setCompanySearchTerm("")
            setShowAddCompany(false)
            setShowAddDestination(false)
        }
    }, [open, item, dispatch, reset])

    const aggregatedData = useMemo(() => {
        return selectedInShipments.reduce((acc, shipment) => {
            acc.package_count += Number(shipment.package_count || 0)
            acc.weight += Number(shipment.weight || 0)
            acc.payment_fees += Number(shipment.payment_fees || 0)
            acc.ground_fees += Number(shipment.ground_fees || 0)
            return acc
        }, {
            package_count: 0,
            weight: 0,
            payment_fees: 0,
            ground_fees: 0,
        })
    }, [selectedInShipments])

    const handleToggleShipment = (shipment) => {
        setSelectedInShipments(prev => {
            const exists = prev.some(s => s.id === shipment.id)
            if (exists) {
                return prev.filter(s => s.id !== shipment.id)
            }
            const normalized = inShipments.find(s => s.id === shipment.id) || shipment
            return [...prev, normalized]
        })
    }

    const handleSelectAll = () => {
        const allSelected = filteredShipments.length > 0 && filteredShipments.every(shipment => selectedIds.has(shipment.id))
        if (allSelected) {
            setSelectedInShipments(prev => prev.filter(shipment => !filteredShipments.some(fs => fs.id === shipment.id)))
        } else {
            const merged = [...selectedInShipments]
            filteredShipments.forEach(shipment => {
                if (!selectedIds.has(shipment.id)) {
                    const normalized = inShipments.find(s => s.id === shipment.id) || shipment
                    merged.push(normalized)
                }
            })
            setSelectedInShipments(merged)
        }
    }

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
        } catch (error) {
            /* handled in slice */
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
            toast.error("يرجى إدخال اسم الشركة")
            return
        }
        try {
            const result = await dispatch(createCompany(name)).unwrap()
            setSelectedCompany(result.name)
            setValue('company_name', result.name, { shouldValidate: true })
            setNewCompany("")
            setShowAddCompany(false)
            setCompanySearchTerm("")
        } catch (error) {
            /* handled in slice */
        }
    }

    const filteredDestinations = destinationsList.filter(destination =>
        destination.name.toLowerCase().includes(destinationSearchTerm.toLowerCase())
    )

    const filteredCompanies = companiesList.filter(company =>
        company.name && company.name.toLowerCase().includes(companySearchTerm.toLowerCase())
    )

    const onSubmit = handleSubmit(async (formData) => {
        if (selectedInShipments.length === 0) {
            toast.error("يرجى اختيار شحنة واحدة على الأقل")
            return
        }
        if (!selectedDestination) {
            toast.error("يرجى اختيار الوجهة")
            return
        }
        if (!selectedCompany) {
            toast.error("يرجى اختيار الشركة")
            return
        }

        const finalData = {
            ...formData,
            destination: selectedDestination,
            contract_status: `${formData.contract_status.contract} / ${formData.contract_status.ratification} / ${formData.contract_status.status}`,
            disbursement_date: formData.disbursement_date || null,
            export_date: formData.export_date || null,
            in_shipment_ids: selectedInShipments.map(s => s.id),
        }

        const response = await dispatch(updateOutShipment({ id: item.id, data: finalData }))
        if (updateOutShipment.fulfilled.match(response)) {
            dispatch(getAllOutShipments())
            dispatch(getOutShipmentsStats())
            dispatch(getShipments())
            setOpen(false)
        }
    })

    const renderInShipmentBadges = () => (
        <div className="flex flex-wrap gap-2 bg-neutral-50 border border-neutral-200 rounded-xl p-4">
            {selectedInShipments.length > 0 ? selectedInShipments.map(shipment => (
                <div key={shipment.id} className="flex flex-col gap-1 min-w-[140px] border border-primary-200 bg-white rounded-lg p-3 text-right">
                    <span className="text-xs text-neutral-500">رقم البوليصة</span>
                    <span className="text-sm font-semibold text-neutral-800">{shipment.bill_number || '-'}</span>
                    <span className="text-xs text-neutral-500 mt-2">رقم البوليصة الفرعية</span>
                    <span className="text-sm font-semibold text-neutral-800">{shipment.sub_bill_number || '-'}</span>
                </div>
            )) : (
                <span className="text-sm text-neutral-500">لا توجد شحنات محددة بعد</span>
            )}
        </div>
    )

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <form>
                    <DialogTrigger asChild>
                        {children}
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[900px] [&_[data-slot='dialog-close']]:!right-[95%] max-h-[90vh] overflow-y-auto thin-scrollbar">
                        <DialogHeader className="!text-start !py-2">
                            <DialogTitle>تعديل الشحنة الصادرة</DialogTitle>
                            <DialogDescription>
                                قم بتحديث بيانات الشحنة الصادرة وتعديل الشحنات الواردة المرتبطة بها.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 p-1">
                            <div className="border rounded-xl p-4 bg-neutral-50">
                                <div className="flex items-center justify-between mb-4">
                                    <Label className="text-lg font-semibold">اختر الشحنات الواردة</Label>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={filteredShipments.length > 0 && filteredShipments.every(shipment => selectedIds.has(shipment.id))}
                                            onCheckedChange={handleSelectAll}
                                        />
                                        <span className="text-sm">تحديد الكل</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <input
                                        type="text"
                                        placeholder="ابحث في الشحنات..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                {selectedInShipments.length > 0 && (
                                    <div className="mb-4 p-2 bg-primary-50 border border-primary-200 rounded-lg text-primary-700 text-sm font-medium">
                                        تم اختيار {selectedInShipments.length} شحنة واردة
                                    </div>
                                )}

                                <div className="max-h-[200px] overflow-y-auto border rounded-lg bg-white">
                                    {filteredShipments.length === 0 ? (
                                        <div className="p-4 text-center text-neutral-500">
                                            {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد شحنات متاحة للتعديل"}
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
                                                        className={`border-b hover:bg-neutral-50 cursor-pointer ${selectedIds.has(shipment.id) ? 'bg-primary-50' : ''}`}
                                                        onClick={() => handleToggleShipment(shipment)}
                                                    >
                                                        <td className="p-2" onClick={(e) => e.stopPropagation()}>
                                                            <Checkbox
                                                                checked={selectedIds.has(shipment.id)}
                                                                onCheckedChange={() => handleToggleShipment(shipment)}
                                                            />
                                                        </td>
                                                        <td className="p-2">{shipment.bill_number || '-'}</td>
                                                        <td className="p-2">{shipment.sub_bill_number || '-'}</td>
                                                        <td className="p-2">{shipment.company_name || '-'}</td>
                                                        <td className="p-2">{shipment.destination || '-'}</td>
                                                        <td className="p-2">{formatWeight(shipment.weight)}</td>
                                                        <td className="p-2">{shipment.package_count || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>

                            {renderInShipmentBadges()}

                            {selectedInShipments.length > 0 && (
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
                            )}

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

                            <div className="flex gap-4">
                                <div className="grid gap-3 w-full">
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

                                    <Select value={selectedCompany} onValueChange={handleCompanyChange} onOpenChange={(isOpen) => {
                                        if (!isOpen) {
                                            setCompanySearchTerm("")
                                        }
                                    }}>
                                        <SelectTrigger className="w-full text-right border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-neutral-50 focus:bg-white px-4 py-3" dir="rtl">
                                            <SelectValue placeholder="ابحث واختر الشركة">
                                                {selectedCompany || "ابحث واختر الشركة"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px] text-right" dir="rtl">
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
                                                        {filteredCompanies.map(company => (
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

                                <Select value={selectedDestination} onValueChange={handleDestinationChange} onOpenChange={(isOpen) => {
                                    if (!isOpen) {
                                        setDestinationSearchTerm("")
                                    }
                                }}>
                                    <SelectTrigger className="w-full text-right border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-neutral-50 focus:bg-white px-4 py-3" dir="rtl">
                                        <SelectValue placeholder="ابحث واختر الوجهة">
                                            {selectedDestination || "ابحث واختر الوجهة"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px] text-right" dir="rtl">
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
                                                    {filteredDestinations.map(destination => (
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

                            <div className="grid gap-3 w-full">
                                <Label>تاريخ الصرف (اختياري)</Label>
                                <input type="date" {...register("disbursement_date")} />
                                {errors.disbursement_date && <span className="text-sm text-rose-400">{errors.disbursement_date.message}</span>}
                            </div>

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

                            <div className="grid gap-3 w-full">
                                <Label>تاريخ التصدير *</Label>
                                <input type="date" {...register("export_date")} />
                                {errors.export_date && <span className="text-sm text-rose-400">{errors.export_date.message}</span>}
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button disabled={loading} variant="outline" className="cursor-pointer">إلغاء</Button>
                            </DialogClose>
                            <Button disabled={loading || selectedInShipments.length === 0} type="submit" className="cursor-pointer" onClick={onSubmit}>
                                {loading ? (
                                    <>
                                        <LoaderCircle className="animate-spin" />
                                        <span>حفظ التعديلات ...</span>
                                    </>
                                ) : (
                                    <span>تعديل</span>
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

export default EditOutShipment
