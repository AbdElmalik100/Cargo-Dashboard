import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, CheckCircle2, XCircle } from "lucide-react"
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
import DeletePopup from "../DeletePopup"
import CargoTableToolbar from "../Cargos/CargoTableToolbar"
import EditInShipment from "./EditInShipment"
import ViewCargo from "../Cargos/ViewCargo"
import { useSelector } from "react-redux"
import { deleteShipment } from "../../store/slices/inShipmentsSlice"
import { formatDate, formatCurrency, formatWeight } from "../../utils"

const InShipments = () => {
    const { shipments } = useSelector(state => state.inShipments)
    
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
            accessorKey: "status",
            header: () => <div className="text-start">حالة صرف الشحنة</div>,
            cell: ({ row }) => {
                const status = row.getValue("status");
                return (
                    <div className="text-start">
                        {status ? (
                            <CheckCircle2 className="text-green-500" size={20} />
                        ) : (
                            <XCircle className="text-red-500" size={20} />
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "bill_number",
            header: () => <div className="text-start">رقم البوليصة</div>,
            cell: ({ row }) => {
                const billNumber = row.getValue("bill_number");
                return (
                    <div className="text-start">
                        {billNumber || '-'}
                    </div>
                );
            },
        },
        {
            accessorKey: "sub_bill_number",
            header: () => <div className="text-start">رقم البوليصة الفرعية</div>,
        },
        {
            accessorKey: "arrival_date",
            header: () => <div className="text-start">تاريخ الوصول</div>,
            cell: ({ row }) => {
                const date = row.getValue("arrival_date");
                return (
                    <div className="text-start">
                        {date ? formatDate(date) : '-'}
                    </div>
                );
            },
        },
        
        {
            accessorKey: "company_name",
            header: () => <div className="text-start">اسم الشركة</div>,
        },
        {
            accessorKey: "package_count",
            header: ({ column }) => (
                <div className="text-start">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        عدد الطرود
                        <ArrowUpDown />
                    </Button>
                </div>
            ),
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
        {
            accessorKey: "payment_fees",
            header: ({ column }) => (
                <div className="text-start">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        رسوم الدفع
                        <ArrowUpDown />
                    </Button>
                </div>
            ),
            cell: ({ row }) => <div className="text-start">{formatCurrency(row.getValue("payment_fees"))}</div>,
        },
        {
            accessorKey: "customs_certificate",
            header: () => <div className="text-start">الشهادة الجمركية</div>,
        },
        {
            accessorKey: "contract_status",
            header: () => <div className="text-start">الحالة</div>,
            cell: ({ row }) => {
                const contractStatus = row.getValue("contract_status");
                return (
                    <div className="text-start">
                        {contractStatus || '-'}
                    </div>
                );
            },
        },
        
        {
            accessorKey: "disbursement_date",
            header: ({ column }) => (
                <div className="text-start">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        تاريخ الصرف
                        <ArrowUpDown />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const date = row.getValue("disbursement_date");
                return (
                    <div className="text-start">
                        {date ? formatDate(date) : '-'}
                    </div>
                );
            },
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
                                <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                    <Eye />
                                    <span>عرض</span>
                                </DropdownMenuItem>
                            </ViewCargo>
                            <EditInShipment item={row.original}>
                                <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                    <Pencil />
                                    <span>تعديل</span>
                                </DropdownMenuItem>
                            </EditInShipment>
                            <DeletePopup 
                                item={row.original} 
                                delFn={deleteShipment}
                                onSelect={e => e.preventDefault()}
                            >
                                <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={e => e.preventDefault()}
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
        data: shipments || [],
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
        globalFilterFn: 'includesString',
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
            <CargoTableToolbar table={table} data={shipments || []} shipmentType="in" />
            <DataTable table={table} columns={columns} />
        </div>
    )
}

export default InShipments
