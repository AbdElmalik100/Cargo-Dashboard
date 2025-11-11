import {
    filterFns,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMemo, useState } from "react"
import { Eye, Pencil, Trash2 } from "lucide-react"
import DataTable from "../DataTable"
import ViewCargo from "./ViewCargo"
import DeletePopup from "../DeletePopup"
import CargoTableToolbar from "./CargoTableToolbar"
import { formatCurrency, formatWeight } from "../../utils"
import { useSelector } from "react-redux"
import { deleteShipment } from "../../store/slices/inShipmentsSlice"
import EditCargo from "./EditCargo"





const Cargo = () => {
    const { shipments, loading } = useSelector(state => state.inShipments)
    const columns = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <div className="text-start ps-2">
                    <Checkbox
                        className="cursor-pointer"
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-start ps-2">
                    <Checkbox
                        className="cursor-pointer"
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "sub_bill_number",
            header: () => <div className="text-start">رقم البوليصة الفرعية</div>,
        },
        {
            accessorKey: "company_name",
            header: () => <div className="text-start">اسم الشركة</div>,
        },
        // {
        //     accessorKey: "military_certificate_date",
        //     header: () => <div className="text-start">تاريخ الشهادة الحربية</div>,
        // },
        {
            accessorKey: "package_count",
            header: ({ column }) => <div className="text-start">
                <Button
                    variant="ghost"
                    onClick={() => { column.toggleSorting(column.getIsSorted() === "asc") }}
                >
                    عدد الطرود
                    <ArrowUpDown />
                </Button>
            </div>,
        },
        {
            accessorKey: "weight",
            header: () => <div className="text-start">الوزن</div>,
            cell: ({ row }) => <div className="text-start">{formatWeight(row.getValue("weight"))}</div>,
        },
        {
            accessorKey: "destination",
            header: () => <div className="text-start">الجهة</div>,
        },
        // {
        //     accessorKey: "arrival_date",
        //     header: () => <div className="text-start">تاريخ الوارد</div>,
        // },
        // {
        //     accessorKey: "permit_withdrawal_date",
        //     header: () => <div className="text-start">تاريخ سحب الإذن</div>,
        // },
        {
            accessorKey: "payment_fees",
            header: ({ column }) => <div className="text-start">
                <Button
                    variant="ghost"
                    onClick={() => { column.toggleSorting(column.getIsSorted() === "asc") }}
                >
                    رسوم الدفع
                    <ArrowUpDown />
                </Button>
            </div>,
            cell: ({ row }) => <div className="text-start">{formatCurrency(row.getValue("payment_fees"))}</div>,
        },
        {
            accessorKey: "customs_certificate",
            header: () => <div className="text-start">الشهادة الجمركية</div>,
        },
        {
            accessorKey: "contract_status",
            header: () => <div className="text-start">الحالة</div>,
        },
        // {
        //     accessorKey: "shipment_submission_date",
        //     header: () => <div className="text-start">تاريخ تقديم الشحنة</div>,
        // },
        // {
        //     accessorKey: "release_permit_date",
        //     header: () => <div className="text-start">تاريخ إذن الإفراج</div>,
        // },
        {
            accessorKey: "disbursement_date",
            header: ({ column }) => <div className="text-start">
                <Button
                    variant="ghost"
                    onClick={() => { column.toggleSorting(column.getIsSorted() === "asc") }}
                >
                    تاريخ الصرف
                    <ArrowUpDown />
                </Button>
            </div>,
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue) return true

                const rowDateString = row.getValue(columnId)
                if (!rowDateString) return false

                const rowDate = new Date(rowDateString)
                if (isNaN(rowDate.getTime())) return false

                // Date range filter
                if (filterValue.start || filterValue.end) {
                    const { start, end } = filterValue

                    if (start) {
                        const startDate = new Date(start)
                        if (isNaN(startDate.getTime())) return false
                        if (rowDate < startDate) return false
                    }

                    if (end) {
                        const endDate = new Date(end)
                        if (isNaN(endDate.getTime())) return false
                        if (rowDate > endDate) return false
                    }

                    return true
                }

                // Single date filter
                if (typeof filterValue === 'string') {
                    const filterDate = new Date(filterValue)
                    if (isNaN(filterDate.getTime())) return false
                    return rowDate.toDateString() === filterDate.toDateString()
                }

                return true
            },
        },
        {
            accessorKey: "receiver_name",
            header: () => <div className="text-start">المستلم</div>,
        },
        {
            accessorKey: "ground_fees",
            header: () => <div className="text-start">رسوم الأرضية</div>,
            cell: ({ row }) => <div className="text-start">{formatCurrency(row.getValue("ground_fees"))}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                return (
                    <DropdownMenu dir="rtl">
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 !ring-0">
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <ViewCargo item={row.original}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Eye />
                                    <span>عرض</span>
                                </DropdownMenuItem>
                            </ViewCargo>
                            <EditCargo item={row.original}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Pencil />
                                    <span>تعديل</span>
                                </DropdownMenuItem>
                            </EditCargo>
                            <DeletePopup item={row.original} delFn={deleteShipment} loading={loading}>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <Trash2 />
                                    <span>حذف</span>
                                </DropdownMenuItem>
                            </DeletePopup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ], [])
    const [sorting, setSorting] = useState([
        {
            id: "disbursement_date",
            desc: true,
        }
    ])
    const [columnFilters, setColumnFilters] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({})
    const [rowSelection, setRowSelection] = useState({})
    const [globalFilter, setGlobalFilter] = useState('')

    const table = useReactTable({
        data: shipments,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: 'includesString', // or a custom filter fn

        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    })
    return (
        <div className='border p-4 border-neutral-300 mt-8 rounded-2xl bg-white'>
            <CargoTableToolbar table={table} data={shipments} />
            <DataTable table={table} columns={columns} />
        </div >
    )
}

export default Cargo