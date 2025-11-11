import { exportToExcel, exportToPDF } from '../../utils'
import CargoReportPDF from '../PDF Templates/CargoReportPDF'
import { FileDown, FileSpreadsheet, Share } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const CargoReportExport = ({data, title}) => {
    return (
        <DropdownMenu dir='rtl'>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="!ring-0">
                    <Share />
                    <span>تصدير تقرير</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={e => exportToPDF(<CargoReportPDF data={data} title={title} />)}>
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

export default CargoReportExport