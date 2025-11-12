import AddInShipment from "../InShipments/AddInShipment"
import { Input } from "@/components/ui/input"
import ShipmentFilter from "./ShipmentFilter"
import ShipmentReportExport from "./ShipmentReportExport"
import ExportShipment from "../OutShipments/ExportShipment"

const ShipmentTableToolbar = ({ table, data, shipmentType = "in" }) => {
    const filteredData = table.getState().columnFilters.length === 0
        ? data
        : table.getFilteredRowModel().rows.map(row => row.original)

    const reportTitle = shipmentType === "in"
        ? "تقرير الشحنات الواردة"
        : "تقرير الشحنات الصادرة"

    return (
        <div className="flex items-center gap-4 justify-between py-4">
            <Input
                placeholder="بحث ..."
                value={table.getState().globalFilter ?? ""}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
                className="max-w-sm !ring-0"
            />
            <div className="flex items-center gap-2">
                <ShipmentFilter table={table} data={data} />
                <ShipmentReportExport data={filteredData} title={reportTitle} shipmentType={shipmentType} />
                {shipmentType === "in" && <AddInShipment />}
                {shipmentType === "out" && <ExportShipment />}
            </div>
        </div>
    )
}

export default ShipmentTableToolbar
