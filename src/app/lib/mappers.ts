import type {
  BillItemDto,
  BillSummaryDto,
  PaymentDto,
  PermissionToggleDto,
  PosTerminalDto,
  TableSummaryDto,
} from "../types/api";

const localizedTextMap: Record<string, string> = {
  "Gunes Cafe & Restaurant": "Güneş Cafe & Restaurant",
  "Vakif Lezzet Restoran": "Vakıf Lezzet Restoran",
  "Bagdat Cad. No: 45, Kadikoy/Istanbul": "Bağdat Cad. No: 45, Kadıköy/İstanbul",
  "Ic Salon": "İç Salon",
  "Atanmadi": "Atanmadı",
  "Turk Kahvesi": "Türk Kahvesi",
  Cay: "Çay",
  Icecekler: "İçecekler",
  Tatlilar: "Tatlılar",
  "Ahmet Yilmaz": "Ahmet Yılmaz",
  "Ayse Demir": "Ayşe Demir",
  "Sistem Yoneticisi": "Sistem Yöneticisi",
  SubeMuduru: "Şube Müdürü",
  SistemYoneticisi: "Sistem Yöneticisi",
  Goruntule: "Görüntüle",
  Duzenle: "Düzenle",
  Indirim: "İndirim",
  Iade: "İade",
  Iptal: "İptal",
  GunSonu: "Gün Sonu",
  MenuYonetimi: "Menü Yönetimi",
  MenuManagement: "Menü Yönetimi",
  "Manage menu products and availability.": "Menü ürünlerini ve servis uygunluğunu yönetin.",
  "VakifBank SmartPOS Pro": "VakıfBank SmartPOS Pro",
  "VakifBank MobilPOS": "VakıfBank MobilPOS",
  "VakifBank SmartPOS": "VakıfBank SmartPOS",
  "Adisyon Olusturuldu": "Adisyon Oluşturuldu",
  "Odeme Talebi Alindi": "Ödeme Talebi Alındı",
  "Odeme Basarili": "Ödeme Başarılı",
  "Odeme Basarisiz": "Ödeme Başarısız",
  "Odeme Iptal Edildi": "Ödeme İptal Edildi",
  "Iade Talebi Alindi": "İade Talebi Alındı",
  "Iade Basarili": "İade Başarılı",
  "Iade Basarisiz": "İade Başarısız",
  Tukendi: "Tükendi",
  Basarili: "Başarılı",
  Basarisiz: "Başarısız",
  Bekliyor: "Bekliyor",
  BolunmusOdeme: "Bölünmüş Ödeme",
  Odeme: "Ödeme",
  "Payment cancelled.": "Ödeme iptal edildi.",
};

export const localizeText = (value?: string | null) => {
  if (!value) {
    return "";
  }

  return localizedTextMap[value] || value;
};

export const formatCurrency = (amount: number) =>
  `${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`;

export const formatDate = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("tr-TR");
};

export const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getInitials = (fullName?: string | null) => {
  if (!fullName) {
    return "VB";
  }

  return localizeText(fullName)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

export const toUiTableStatus = (status: TableSummaryDto["status"]) => {
  switch (status) {
    case "Bos":
      return "Boş";
    case "Dolu":
      return "Dolu";
    case "OdemeBekliyor":
      return "Ödeme Bekliyor";
    case "Odendi":
      return "Ödendi";
    default:
      return status;
  }
};

export const toUiBillStatus = (status: BillSummaryDto["status"]) => {
  switch (status) {
    case "Acik":
      return "Açık";
    case "OdemeBekliyor":
      return "Ödeme Bekliyor";
    case "Kapandi":
      return "Kapandı";
    case "Iptal":
      return "İptal";
    default:
      return status;
  }
};

export const toUiTerminalStatus = (status: PosTerminalDto["status"]) => {
  switch (status) {
    case "Bagli":
      return "Bağlı";
    case "Islemde":
      return "İşlemde";
    case "Cevrimdisi":
      return "Çevrimdışı";
    case "Mesgul":
      return "Meşgul";
    default:
      return status;
  }
};

export const toUiPaymentStatus = (status: PaymentDto["status"]) => {
  switch (status) {
    case "Bekliyor":
      return "Bekliyor";
    case "PosaGonderildi":
      return "POS'a Gönderildi";
    case "Basarili":
      return "Başarılı";
    case "Basarisiz":
      return "Başarısız";
    case "IptalEdildi":
      return "İptal Edildi";
    default:
      return status;
  }
};

export const toUiPaymentType = (paymentType: PaymentDto["paymentType"] | string) => {
  switch (paymentType) {
    case "Kart":
      return "Kart";
    case "Nakit":
      return "Nakit";
    case "BolunmusOdeme":
      return "Bölünmüş";
    case "Iade":
      return "İade";
    default:
      return localizeText(paymentType);
  }
};

export const toUiTransactionStatus = (status: string) => {
  switch (status) {
    case "Basarili":
      return "Başarılı";
    case "Basarisiz":
      return "Başarısız";
    case "Iptal":
      return "İptal";
    case "Bekliyor":
      return "Beklemede";
    default:
      return localizeText(status);
  }
};

export const toUiTransactionType = (transactionType: string) => {
  switch (transactionType) {
    case "Odeme":
      return "Ödeme";
    case "Iade":
      return "İade";
    case "Iptal":
      return "İptal";
    case "BolunmusOdeme":
      return "Bölünmüş Ödeme";
    default:
      return localizeText(transactionType);
  }
};

export const toUiProductStatus = (status: string) => {
  switch (status) {
    case "Aktif":
      return "Aktif";
    case "Pasif":
      return "Pasif";
    case "Tukendi":
      return "Tükendi";
    default:
      return localizeText(status);
  }
};

export const toDrawerTransactionStatus = (status: string, transactionType?: string) => {
  if (transactionType === "Iade" && status === "Basarili") {
    return "refunded";
  }

  if (status === "Iptal") {
    return "cancelled";
  }

  switch (status) {
    case "Basarili":
      return "success";
    case "Basarisiz":
      return "failed";
    default:
      return "pending";
  }
};

export const toUiTimelineDetail = (detail?: string | null) => {
  if (!detail) {
    return undefined;
  }

  const billOpenedMatch = detail.match(/^Bill (.+) opened for table (.+)\.$/);
  if (billOpenedMatch) {
    return `Adisyon ${billOpenedMatch[1]} masa ${billOpenedMatch[2]} için açıldı.`;
  }

  const paymentRequestedMatch = detail.match(/^(.+) payment requested\.$/);
  if (paymentRequestedMatch) {
    return `${toUiPaymentType(paymentRequestedMatch[1])} ödeme talebi alındı.`;
  }

  const refundRequestedMatch = detail.match(/^Refund requested for (.+)\.$/);
  if (refundRequestedMatch) {
    return `İade talebi ${refundRequestedMatch[1]} referanslı işlem için oluşturuldu.`;
  }

  return localizeText(detail);
};

export const toUiBillItemStatus = (status: BillItemDto["status"]) => {
  switch (status) {
    case "Hazirlaniyor":
      return "Hazırlanıyor";
    case "ServisEdildi":
      return "Servis Edildi";
    case "Iptal":
      return "İptal";
    case "Ikram":
      return "İkram";
    default:
      return status;
  }
};

export const toUiPermissionLabel = (permission: PermissionToggleDto) =>
  localizeText(permission.name) || permission.code;

export const parseTableNumber = (tableNo: string) => {
  const numericValue = Number(tableNo.replace(/[^\d]/g, ""));
  return Number.isNaN(numericValue) ? 0 : numericValue;
};

export const buildBillMapByTableId = (bills: BillSummaryDto[]) =>
  new Map<number, BillSummaryDto>(bills.map((bill) => [bill.tableId, bill]));

export const statusTone = (status: string) => {
  switch (status) {
    case "Başarılı":
    case "Bağlı":
      return "success";
    case "Başarısız":
    case "Çevrimdışı":
      return "error";
    case "Ödeme Bekliyor":
    case "POS'a Gönderildi":
    case "İşlemde":
    case "Meşgul":
      return "warning";
    default:
      return "neutral";
  }
};
