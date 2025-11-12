import AddInShipment from "../InShipments/AddInShipment"
import { Input } from "@/components/ui/input"
import CargoFilter from "./CargoFilter"
import CargoReportExport from "./CargoReportExport"
import ExportShipment from "../OutShipments/ExportShipment"


const CargoTableToolbar = ({ table, data, shipmentType = "in" }) => {
    const filteredData = table.getState().columnFilters.length === 0
        ? data
        : table.getFilteredRowModel().rows.map(row => row.original)

    const reportTitle = shipmentType === "in" 
        ? "تقرير الشحنات الواردة"
        : "الشحنات الواردة الغير مصدرة"

    return (
        <div className="flex items-center gap-4 justify-between py-4">
            <Input
                placeholder="بحث ..."
                // value={(table.getColumn("delegationHead")?.getFilterValue()) ?? ""}
                // onChange={(event) =>table.getColumn("delegationHead")?.setFilterValue(event.target.value)}
                value={table.getState().globalFilter ?? ""}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
                className="max-w-sm !ring-0"
            />
            <div className="flex items-center gap-2">
                <CargoFilter table={table} data={data} />
                <CargoReportExport data={filteredData} title={reportTitle} />
                {shipmentType === "in" && <AddInShipment />}
                {shipmentType === "out" && <ExportShipment />}
            </div>
        </div>
    )
}

export default CargoTableToolbar