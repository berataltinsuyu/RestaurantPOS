import { BillItemStatusCode, OrderDetail } from "../types/domain";

function normalizeCurrencyAmount(amount: number | null | undefined) {
  const parsed = Number(amount);

  if (Number.isFinite(parsed)) {
    return parsed;
  }

  console.warn("[formatCurrency] Invalid currency amount received. Falling back to 0.", {
    amount,
  });

  return 0;
}

export function formatCurrency(amount: number | null | undefined) {
  return `₺${normalizeCurrencyAmount(amount).toFixed(2)}`;
}

export function formatTableLabel(label: string) {
  const match = label.match(/(\d+)$/);

  if (!match) {
    return label;
  }

  return `Masa ${match[1]}`;
}

export function getOrderPaymentSummary(order: OrderDetail) {
  const subtotal = order.subtotal > 0 ? order.subtotal : order.total;
  const serviceFee =
    order.tax > 0 ? order.tax : roundCurrency(subtotal * 0.1);
  const total =
    order.tax > 0 || order.total > subtotal
      ? roundCurrency(order.total)
      : roundCurrency(subtotal + serviceFee);

  return {
    serviceFee,
    subtotal,
    total,
  };
}

export function roundCurrency(amount: number | null | undefined) {
  const normalizedAmount = normalizeCurrencyAmount(amount);
  return Math.round(normalizedAmount * 100) / 100;
}

export function formatOrderLineStatus(status?: BillItemStatusCode) {
  switch (status) {
    case 5:
      return "Sipariş Alındı";
    case 1:
      return "Hazırlanıyor";
    case 6:
      return "Hazır";
    case 7:
    case 2:
      return "Teslim Edildi";
    case 3:
      return "İptal";
    case 4:
      return "İkram";
    default:
      return null;
  }
}
