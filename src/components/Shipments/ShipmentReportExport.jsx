import { exportToExcel, exportToPDF } from '../../utils'
import InShipmentsPDF from '../PDF Templates/InShipmentsPDF'
import OutShipmentsPDF from '../PDF Templates/OutShipmentsPDF'
import { FileDown, FileSpreadsheet, Share } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const ShipmentReportExport = ({ data, title, shipmentType = "in" }) => {
    const pdfElement = shipmentType === "out"
        ? <OutShipmentsPDF data={data} title={title} />
        : <InShipmentsPDF data={data} title={title} />

    return (
        <DropdownMenu dir='rtl'>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="!ring-0">
                    <Share />
                    <span>تصدير تقرير</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={e => exportToPDF(pdfElement)}>
                    <FileDown className="text-[#ef5350]" />
                    <span>PDF file</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={e => exportToExcel(data)}>
                    <FileSpreadsheet className="text-[#33c481]" />
                    <span>Excel file</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default ShipmentReportExport
