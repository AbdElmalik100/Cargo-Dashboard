export const randomImages = [
    '/images/img_1.png',
    '/images/img_4.jpeg',
    '/images/img_5.jpg',
]

export const navLinks = [
    {
        name: "الشحنات الواردة",
        iconName: "ArrowDownToLine",
        to: "/in-shipments"
    },
    {
        name: "تصدير الشحنات",
        iconName: "ArrowUpFromLine",
        to: "/out-shipments"
    },
    {
        name: "تقارير الشحنات",
        iconName: "ClipboardList",
        to: "/shipments-reports"
    }
]

export const yearsOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
});

export const contractOptions = [
    { value: "نهائي", label: "نهائي" },
    { value: "مؤقت", label: "مؤقت" },
]