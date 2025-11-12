import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, CheckCircle2, XCircle, Eye, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMemo, useState, useEffect } from "react"
import DataTable from "../DataTable"
import ViewShipment from "../Shipments/ViewShipment"
import { useSelector, useDispatch } from "react-redux"
// Note: no out shipments fetched here; out shipments are handled in reports
import { getShipments } from "../../store/slices/inShipmentsSlice"
import { formatDate, formatCurrency, formatWeight } from "../../utils"
import ExportShipment from "./ExportShipment"
import ShipmentTableToolbar from "../Shipments/ShipmentTableToolbar"
//


const OutShipments = () => {
    const dispatch = useDispatch()
    const { shipments: inShipments = [] } = useSelector(state => state.inShipments || {})

    useEffect(() => {
        dispatch(getShipments())
    }, [dispatch])

    const columns = useMemo(() => [
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
        // Remove linked inshipment badge. We display inshipment data directly in the row.
        {
            accessorKey: "export_date",
            header: ({ column }) => (
                <div className="text-start">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        تاريخ التصدير
                        <ArrowUpDown />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const date = row.getValue("export_date");
                return (
                    <div className="text-start">
                        {date ? formatDate(date) : '-'}
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
            accessorKey: "exported_count",
            header: () => <div className="text-start">مصدر</div>,
        },
        {
            accessorKey: "remaining",
            header: () => <div className="text-start">المتبقي</div>,
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
            cell: ({ row }) => (
                <DropdownMenu dir="rtl">
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 !ring-0">
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {row.original?.__pending_in__ ? (
                            <>
                                <ViewShipment item={row.original.in_shipment}>
                                    <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                        <Eye />
                                        <span>عرض</span>
                                    </DropdownMenuItem>
                                </ViewShipment>
                                <ExportShipment inShipment={row.original.in_shipment}>
                                    <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                        <Send />
                                        <span>تصدير</span>
                                    </DropdownMenuItem>
                                </ExportShipment>
                            </>
                        ) : (
                            <>
                                <ViewShipment item={row.original}>
                                    <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                        <Eye />
                                        <span>عرض</span>
                                    </DropdownMenuItem>
                                </ViewShipment>
                                {row.original?.in_shipment && (
                                    <ExportShipment inShipment={row.original.in_shipment}>
                                        <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                            <Send />
                                            <span>تصدير</span>
                                        </DropdownMenuItem>
                                    </ExportShipment>
                                )}
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [dispatch])

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

    // Build synthetic rows for InShipments that still have remaining packages
    const pendingInRows = useMemo(() => {
        return (inShipments || [])
            .filter(s => Number(s.exported_count || 0) < Number(s.package_count || 0))
            .map(s => ({
                // Mark as pending in-shipment row
                __pending_in__: true,
                id: `pending-in-${s.id}`,
                // Map fields to match table columns
                status: s.status,
                in_shipment: s,
                export_date: null,
                bill_number: s.bill_number,
                sub_bill_number: s.sub_bill_number,
                arrival_date: s.arrival_date,
                company_name: s.company_name,
                package_count: s.package_count,
                exported_count: s.exported_count || 0,
                remaining: Math.max(0, Number(s.package_count || 0) - Number(s.exported_count || 0)),
                weight: s.weight,
                destination: s.destination,
                payment_fees: s.payment_fees,
                customs_certificate: s.customs_certificate,
                contract_status: s.contract_status,
                disbursement_date: s.disbursement_date,
                receiver_name: s.receiver_name,
                ground_fees: s.ground_fees,
            }))
    }, [inShipments])

    const tableData = useMemo(() => pendingInRows, [pendingInRows])

    const table = useReactTable({
        data: tableData,
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
            globalFilter,
        },
    })

    return (
        <div className='border p-4 border-neutral-300 mt-8 rounded-2xl bg-white'>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">تصدير الشحنات</h2>
            </div>
            <ShipmentTableToolbar table={table} data={tableData} shipmentType="out" />
            <DataTable table={table} columns={columns} />
        </div>
    )
}

export default OutShipments
