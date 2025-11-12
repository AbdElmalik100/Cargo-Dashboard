import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BadgeCheck, IdCard, Package, Weight, Building2, CalendarDays, FileText, User, Coins, Factory, ClipboardList, CheckCircle2, XCircle } from "lucide-react"
import { formatCurrency, formatWeight, formatDate } from "../../utils"
import { useState } from "react"


const Field = ({ label, value, icon }) => (
    <div className="flex flex-col gap-1 p-3 rounded-xl border border-neutral-200 bg-neutral-50">
        <div className="flex items-center gap-2 text-neutral-500 text-sm">
            {icon}
            <span>{label}</span>
        </div>
        <div className="font-semibold text-neutral-900 break-words" style={{direction: "rtl"}}>{value ?? "-"}</div>
    </div>
)

const ViewOutShipment = ({ item, children }) => {
    const [open, setOpen] = useState(false)
    
    // Calculate status based on disbursement_date
    const status = item?.disbursement_date ? true : false
    const inShipment = item?.in_shipment || null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[860px] [&_[data-slot='dialog-close']]:!right-[95%] max-h-[90vh] overflow-y-auto thin-scrollbar">
                <DialogHeader className="!text-start">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="text-sky-600" />
                        <DialogTitle>تفاصيل الشحنة الصادرة</DialogTitle>
                    </div>
                    <DialogDescription>
                        معاينة البيانات كاملة للشحنة المحددة
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    {status ? (
                        <div className="flex items-center gap-3 p-4 rounded-xl border border-green-200 bg-green-50">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="size-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-green-900">حالة الشحنة: مكتملة</h3>
                                <p className="text-xs text-green-700 mt-1">تم صرف الشحنة بتاريخ {item?.disbursement_date ? formatDate(item.disbursement_date) : '-'}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <XCircle className="size-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-red-900">حالة الشحنة: غير مكتملة</h3>
                                <p className="text-xs text-red-700 mt-1">لم يتم صرف الشحنة بعد - في انتظار تاريخ الصرف</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <Field label="رقم البوليصة" value={item?.bill_number || '-'} icon={<IdCard className="size-4" />} />
                        <Field label="رقم البوليصة الفرعية" value={item?.sub_bill_number} icon={<IdCard className="size-4" />} />
                        <Field label="تاريخ الوصول" value={item?.arrival_date ? formatDate(item.arrival_date) : '-'} icon={<CalendarDays className="size-4" />} />

                        <Field label="اسم الشركة" value={item?.company_name} icon={<Building2 className="size-4" />} />
                        <Field label="عدد الطرود" value={item?.package_count} icon={<Package className="size-4" />} />
                        <Field label="الوزن" value={formatWeight(item?.weight)} icon={<Weight className="size-4" />} />

                        <Field label="الجهة" value={item?.destination} icon={<Factory className="size-4" />} />
                        <Field label="رسوم الدفع" value={formatCurrency(item?.payment_fees)} icon={<Coins className="size-4" />} />
                        <Field label="الشهادة الجمركية" value={item?.customs_certificate} icon={<FileText className="size-4" />} />

                        <Field label="عقد / تصديق / حالة" value={item?.contract_status} icon={<BadgeCheck className="size-4" />} />
                        <Field label="تاريخ الصرف" value={item?.disbursement_date ? formatDate(item.disbursement_date) : '-'} icon={<CalendarDays className="size-4" />} />
                        <Field label="المستلم" value={item?.receiver_name} icon={<User className="size-4" />} />

                        <Field label="رسوم الأرضية" value={formatCurrency(item?.ground_fees)} icon={<Coins className="size-4" />} />
                        <Field label="تاريخ التصدير" value={item?.export_date ? formatDate(item.export_date) : '-'} icon={<CalendarDays className="size-4" />} />
                        <Field label="تاريخ الإنشاء" value={item?.created_at ? new Date(item.created_at).toLocaleString('ar-EG') : '-'} icon={<CalendarDays className="size-4" />} />

                        <Field label="آخر تحديث" value={item?.updated_at ? new Date(item.updated_at).toLocaleString('ar-EG') : '-'} icon={<CalendarDays className="size-4" />} />
                    </div>

                    {inShipment && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <Field label="(واردة) رقم البوليصة" value={inShipment.bill_number || '-'} icon={<IdCard className="size-4" />} />
                            <Field label="(واردة) رقم البوليصة الفرعية" value={inShipment.sub_bill_number} icon={<IdCard className="size-4" />} />
                            <Field label="(واردة) تاريخ الوصول" value={inShipment.arrival_date ? formatDate(inShipment.arrival_date) : '-'} icon={<CalendarDays className="size-4" />} />

                            <Field label="(واردة) اسم الشركة" value={inShipment.company_name} icon={<Building2 className="size-4" />} />
                            <Field label="(واردة) عدد الطرود" value={inShipment.package_count} icon={<Package className="size-4" />} />
                            <Field label="(واردة) المُصَدَّر" value={inShipment.exported_count || 0} icon={<Package className="size-4" />} />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button className="cursor-pointer" onClick={() => setOpen(false)}>إغلاق</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ViewOutShipment

