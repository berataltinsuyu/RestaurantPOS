import { OrderDetail } from "../types/domain";

export function formatCurrency(amount: number) {
  return `₺${amount.toFixed(2)}`;
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

export function roundCurrency(amount: number) {
  return Math.round(amount * 100) / 100;
}
