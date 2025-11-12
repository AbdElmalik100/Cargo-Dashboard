import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"
import DataTable from "../DataTable"
import { formatDate, formatCurrency, formatWeight } from "../../utils"
import { CheckCircle2, XCircle, Eye, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ViewOutShipment from "../OutShipments/ViewOutShipment"
import ShipmentReportExport from "../Shipments/ShipmentReportExport"

const OutShipmentsTable = ({ shipments }) => {
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
        {
            id: "in_shipments",
            header: () => <div className="text-start">الشحنات الواردة</div>,
            cell: ({ row }) => {
                const shipments = row.original?.in_shipments || []
                if (!shipments.length) {
                    return <div className="text-start text-neutral-500">-</div>
                }
                return (
                    <div className="flex flex-wrap gap-1 justify-start">
                        {shipments.map(shipment => (
                            <span
                                key={shipment.id}
                                className="inline-flex items-center gap-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 px-3 py-1 text-xs"
                            >
                                <span>{shipment.bill_number || '-'}</span>
                                <span className="text-neutral-400">/</span>
                                <span>{shipment.sub_bill_number || '-'}</span>
                            </span>
                        ))}
                    </div>
                )
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
            header: () => <div className="text-start">عدد الطرود</div>,
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
            header: () => <div className="text-start">رسوم الدفع</div>,
            cell: ({ row }) => <div className="text-start">{formatCurrency(row.getValue("payment_fees"))}</div>,
        },
        {
            accessorKey: "export_date",
            header: () => <div className="text-start">تاريخ التصدير</div>,
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
            accessorKey: "disbursement_date",
            header: () => <div className="text-start">تاريخ الصرف</div>,
            cell: ({ row }) => {
                const date = row.getValue("disbursement_date");
                return (
                    <div className="text-start">
                        {date ? formatDate(date) : '-'}
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-start">الإجراءات</div>,
            enableHiding: false,
            cell: ({ row }) => {
                const item = row.original
                return (
                    <DropdownMenu dir="rtl">
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 !ring-0">
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <ViewOutShipment item={item}>
                                <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                    <Eye />
                                    <span>عرض</span>
                                </DropdownMenuItem>
                            </ViewOutShipment>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ], [])

    const [sorting, setSorting] = useState([])
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

    const filteredData = table.getState().columnFilters.length === 0
        ? shipments || []
        : table.getFilteredRowModel().rows.map(row => row.original)

    return (
        <div className='border p-4 border-neutral-300 mt-8 rounded-2xl bg-white'>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-neutral-800">الشحنات الصادرة</h2>
                <ShipmentReportExport data={filteredData} title="الشحنات الصادرة" shipmentType="out" />
            </div>
            <DataTable table={table} columns={columns} />
        </div>
    )
}

export default OutShipmentsTable

