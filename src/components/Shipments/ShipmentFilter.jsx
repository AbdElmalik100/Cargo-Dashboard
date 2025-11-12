import { Filter } from "lucide-react"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { contractOptions } from "../../constants"

const ShipmentFilter = ({ table, data }) => {
    const [filters, setFilters] = useState({
        company_name: "",
        destination: "",
        contract_status: "",
        customs_certificate: "",
        start_date: "",
        end_date: "",
    })

    const applyFilter = (val, fieldName) => {
        const column = table.getColumn(fieldName)
        if (column) {
            column.setFilterValue(val === "" ? undefined : val)
        } else {
            console.error("ShipmentFilter: Column not found:", fieldName)
        }
        setFilters({ ...filters, [fieldName]: val })
    }

    const applyDateRangeFilter = (start, end) => {
        setFilters({ ...filters, start_date: start, end_date: end, date: "" })
        const column = table.getColumn("disbursement_date")
        if (!start && !end) {
            column?.setFilterValue(undefined)
        } else {
            const startDate = start ? new Date(start) : null
            const endDate = end ? new Date(end) : null
            if (
                (!start || !isNaN(startDate.getTime())) &&
                (!end || !isNaN(endDate.getTime()))
            ) {
                column?.setFilterValue({
                    start,
                    end,
                })
            }
        }
    }

    const clearFilter = () => {
        setFilters({
            company_name: "",
            destination: "",
            contract_status: "",
            customs_certificate: "",
            start_date: "",
            end_date: "",
        })
        table.resetColumnFilters()
    }

    const isFiltered = table.getState().columnFilters.length > 0

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="mr-auto !ring-0">
                    <Filter />
                    <span>فلتر</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto" align="end">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="leading-none font-medium">فلتر الشحنات</h4>
                        <p className="text-muted-foreground text-sm">
                            يمكنك تصفية الجدول حسب الحقول التالية:
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label>اسم الشركة</Label>
                            <Select
                                dir="rtl"
                                value={filters.company_name}
                                onValueChange={(val) => applyFilter(val, "company_name")}
                            >
                                <SelectTrigger className="w-full !ring-0 col-span-2">
                                    <SelectValue placeholder="اسم الشركة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(() => {
                                        const uniqueCompanies = [
                                            ...new Set(data.map((el) => el.company_name).filter(Boolean)),
                                        ].sort((a, b) => a.localeCompare(b, "ar"))

                                        if (uniqueCompanies.length === 0) {
                                            return <SelectItem value="no-data">لا توجد بيانات</SelectItem>
                                        }

                                        return uniqueCompanies.map((company, index) => (
                                            <SelectItem key={index} value={company}>
                                                {company}
                                            </SelectItem>
                                        ))
                                    })()}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label>الجهة</Label>
                            <Select
                                dir="rtl"
                                value={filters.destination}
                                onValueChange={(val) => applyFilter(val, "destination")}
                            >
                                <SelectTrigger className="w-full !ring-0 col-span-2">
                                    <SelectValue placeholder="الجهة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(() => {
                                        const uniqueDestinations = [
                                            ...new Set(data.map((el) => el.destination).filter(Boolean)),
                                        ].sort((a, b) => a.localeCompare(b, "ar"))

                                        if (uniqueDestinations.length === 0) {
                                            return <SelectItem value="no-data">لا توجد بيانات</SelectItem>
                                        }

                                        return uniqueDestinations.map((dest, index) => (
                                            <SelectItem key={index} value={dest}>
                                                {dest}
                                            </SelectItem>
                                        ))
                                    })()}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label>عقد / تصديق / حالة</Label>
                            <Select
                                dir="rtl"
                                value={filters.contract_status}
                                onValueChange={(val) => applyFilter(val, "contract_status")}
                            >
                                <SelectTrigger className="w-full !ring-0 col-span-2">
                                    <SelectValue placeholder="اختر الحالة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contractOptions.map((opt, i) => (
                                        <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label>الشهادة الجمركية</Label>
                            <Select
                                dir="rtl"
                                value={filters.customs_certificate}
                                onValueChange={(val) => applyFilter(val, "customs_certificate")}
                            >
                                <SelectTrigger className="w-full !ring-0 col-span-2">
                                    <SelectValue placeholder="الشهادة الجمركية" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(() => {
                                        const uniqueCerts = [
                                            ...new Set(data.map((el) => el.customs_certificate).filter(Boolean)),
                                        ].sort((a, b) => a.localeCompare(b, "ar"))

                                        if (uniqueCerts.length === 0) {
                                            return <SelectItem value="no-data">لا توجد بيانات</SelectItem>
                                        }

                                        return uniqueCerts.map((cert, index) => (
                                            <SelectItem key={index} value={cert}>
                                                {cert}
                                            </SelectItem>
                                        ))
                                    })()}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label>تاريخ الصرف من / إلى</Label>
                            <div className="col-span-2 flex gap-2">
                                <input
                                    className="w-full border rounded px-2 py-1"
                                    type="date"
                                    style={{ direction: "ltr" }}
                                    value={filters.start_date}
                                    onChange={(e) => applyDateRangeFilter(e.target.value, filters.end_date)}
                                />
                                <input
                                    className="w-full border rounded px-2 py-1"
                                    type="date"
                                    style={{ direction: "ltr" }}
                                    value={filters.end_date}
                                    onChange={(e) => applyDateRangeFilter(filters.start_date, e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {isFiltered && (
                        <Button className="w-full cursor-pointer" onClick={clearFilter}>
                            حذف جميع الفلاتر
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default ShipmentFilter
