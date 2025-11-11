import * as XLSX from "xlsx"
import { saveAs } from "file-saver";
import { pdf } from "@react-pdf/renderer";

export const exportToExcel = (data, fileName = "Cargo report.xlsx") => {
    // Create a mapping from English keys → Arabic headers
    const headerMap = {
        status: "حالة صرف الشحنة",
        bill_number: "رقم البوليصة",
        sub_bill_number: "رقم البوليصة الفرعية",
        arrival_date: "تاريخ الوصول",
        company_name: "اسم الشركة",
        package_count: "عدد الطرود",
        weight: "الوزن",
        destination: "الجهة",
        payment_fees: "رسوم الدفع",
        customs_certificate: "الشهادة الجمركية",
        contract_status: "الحالة",
        disbursement_date: "تاريخ الصرف",
        receiver_name: "المستلم",
        ground_fees: "رسوم الأرضية",
    };

    // Convert data keys to Arabic headers
    const arabicData = data.map((item) => {
        let newItem = {};
        // Handle status field
        if (item.status !== undefined) {
            newItem[headerMap.status] = item.status ? "مكتملة" : "غير مكتملة";
        }
        // Handle other fields
        for (const key in item) {
            if (key !== 'status' && headerMap[key]) {
                // Format dates
                if (key === 'arrival_date' || key === 'disbursement_date') {
                    newItem[headerMap[key]] = item[key] ? formatDate(item[key]) : '-';
                } else {
                    newItem[headerMap[key]] = item[key] || '-';
                }
            }
        }
        return newItem;
    });

    // Generate worksheet
    const worksheet = XLSX.utils.json_to_sheet(arabicData);

    // Generate workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الجدول");

    // Export to Excel
    XLSX.writeFile(workbook, fileName);
};


export const exportToPDF = async (PDFComponent, fileName = 'Cargo report.pdf') => {
    const blob = await pdf(PDFComponent).toBlob();
    saveAs(blob, fileName);
};

export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 2,
    }).format(value);
}

export const formatWeight = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'unit',
        unit: 'kilogram',
        unitDisplay: 'short',
        minimumFractionDigits: 2,
    }).format(value);
}

export const formatArabicDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();

    // Return as Arabic numerals
    return `${year}/${month}/${day}`
        .replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]); // Convert to Arabic digits
};

export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${year}/${month}/${day}`;
};