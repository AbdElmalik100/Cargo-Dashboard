import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image
} from "@react-pdf/renderer"
import { formatArabicDate } from "../../utils"

Font.register({
  family: "Cairo",
  src: "/fonts/Cairo-Regular.ttf",
})

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Cairo",
    direction: "rtl"
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  logo: {
    width: 80,
  },
  header: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold"
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    // borderRightWidth: 0,
    // borderBottomWidth: 0
  },
  row: {
    flexDirection: "row-reverse"
  },
  cell: {
    borderStyle: "solid",
    borderWidth: 1,
    // borderLeftWidth: 0,
    // borderTopWidth: 0,
    padding: 5,
    fontSize: 6,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
    flexBasis: 0,
  },
  wideCell: {
    flexGrow: 2,
  },
  headerCell: {
    backgroundColor: "#f0f0f0",
    fontSize: 6,
    fontWeight: "bold",
  },
  badgeContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    borderRadius: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 2,
  },
  badgeText: {
    fontSize: 5,
  }
})

const headers = [
  "حالة صرف الشحنة",
  "رقم البوليصة",
  "رقم البوليصة الفرعية",
  "تاريخ الوصول",
  "اسم الشركة",
  "عدد الطرود",
  "مصدر",
  "المتبقي",
  "الوزن",
  "الجهة",
  "رسوم الدفع",
  "الشهادة الجمركية",
  "الحالة",
  "تاريخ الصرف",
  "تاريخ التصدير",
  "المستلم",
  "رسوم الأرضية",
]

// no linked badge anymore; report mirrors the table

const OutShipmentsPDF = ({ data, title = "الشحنات الواردة الغير مصدرة" }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.headerRow}>
        <Image src="/images/logo.png" style={styles.logo} />
        <View style={{ flexDirection: "column", alignItems: 'flex-end', marginLeft: 20, marginRight: 20, fontSize: 12, fontWeight: "bold" }}>
          <Text>ادارة النقــــــــــــــــــــــــــــل</Text>
          <Text>فوج تشهيلات مطــارات ق.م</Text>
          <View style={{ flexDirection: "row-reverse", gap: '8px' }}>
            <Text>: التـــــــــــــاريخ</Text>
            <Text>{formatArabicDate(new Date())}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.header}>{title}</Text>

      <View style={styles.table}>
        <View style={styles.row}>
          {headers.map((h, idx) => (
            <Text
              key={idx}
              style={[styles.cell, styles.headerCell]}
            >
              {h}
            </Text>
          ))}
        </View>

        {data.map((row, rowIndex) => (
          <View style={styles.row} key={rowIndex}>
            <Text style={[styles.cell]}>{row.status ? "مكتملة" : "غير مكتملة"}</Text>
            <Text style={[styles.cell]}>{row.bill_number || '-'}</Text>
            <Text style={[styles.cell]}>{row.sub_bill_number || '-'}</Text>
            <Text style={[styles.cell]}>{row.arrival_date ? formatArabicDate(new Date(row.arrival_date)) : '-'}</Text>
            <Text style={[styles.cell]}>{row.company_name || '-'}</Text>
            <Text style={[styles.cell]}>{row.package_count || '-'}</Text>
            <Text style={[styles.cell]}>{row.exported_count ?? '-'}</Text>
            <Text style={[styles.cell]}>{row.remaining ?? '-'}</Text>
            <Text style={[styles.cell]}>{row.weight || '-'}</Text>
            <Text style={[styles.cell]}>{row.destination || '-'}</Text>
            <Text style={[styles.cell]}>{row.payment_fees || '-'}</Text>
            <Text style={[styles.cell]}>{row.customs_certificate || '-'}</Text>
            <Text style={[styles.cell, { fontSize: 5 }]} wrap={true}>{row.contract_status || '-'}</Text>
            <Text style={[styles.cell]}>{row.disbursement_date ? formatArabicDate(new Date(row.disbursement_date)) : '-'}</Text>
            <Text style={[styles.cell]}>{row.export_date ? formatArabicDate(new Date(row.export_date)) : '-'}</Text>
            <Text style={[styles.cell]}>{row.receiver_name || '-'}</Text>
            <Text style={[styles.cell]}>{row.ground_fees || '-'}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
)

export default OutShipmentsPDF
