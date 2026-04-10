export interface Table {
  id: string;
  number: number;
  status: 'Boş' | 'Dolu' | 'Ödeme Bekliyor' | 'Ödendi';
  guests: number;
  total: number;
  waiter: string;
  time: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
}

export interface BillItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  date: string;
  time: string;
  tableNo: number;
  billNo: string;
  terminalNo: string;
  paymentType: 'Kart' | 'Nakit' | 'Bölünmüş';
  amount: number;
  status: 'Başarılı' | 'Başarısız' | 'İptal';
  referenceNo?: string;
}

export const mockTables: Table[] = [
  { id: '1', number: 1, status: 'Dolu', guests: 4, total: 850.50, waiter: 'Ahmet Yılmaz', time: '14:30' },
  { id: '2', number: 2, status: 'Boş', guests: 0, total: 0, waiter: '', time: '' },
  { id: '3', number: 3, status: 'Ödeme Bekliyor', guests: 2, total: 425.00, waiter: 'Ayşe Demir', time: '15:15' },
  { id: '4', number: 4, status: 'Dolu', guests: 6, total: 1240.75, waiter: 'Mehmet Kaya', time: '13:45' },
  { id: '5', number: 5, status: 'Boş', guests: 0, total: 0, waiter: '', time: '' },
  { id: '6', number: 6, status: 'Dolu', guests: 3, total: 620.25, waiter: 'Ahmet Yılmaz', time: '15:00' },
  { id: '7', number: 7, status: 'Ödendi', guests: 2, total: 385.50, waiter: 'Ayşe Demir', time: '14:00' },
  { id: '8', number: 8, status: 'Boş', guests: 0, total: 0, waiter: '', time: '' },
  { id: '9', number: 9, status: 'Dolu', guests: 5, total: 980.00, waiter: 'Mehmet Kaya', time: '14:45' },
  { id: '10', number: 10, status: 'Ödeme Bekliyor', guests: 4, total: 775.50, waiter: 'Ahmet Yılmaz', time: '15:30' },
  { id: '11', number: 11, status: 'Boş', guests: 0, total: 0, waiter: '', time: '' },
  { id: '12', number: 12, status: 'Dolu', guests: 2, total: 340.00, waiter: 'Ayşe Demir', time: '15:45' },
];

export const mockProducts: Product[] = [
  { id: 'p1', name: 'Espresso', category: 'İçecekler', price: 45.00 },
  { id: 'p2', name: 'Cappuccino', category: 'İçecekler', price: 55.00 },
  { id: 'p3', name: 'Latte', category: 'İçecekler', price: 60.00 },
  { id: 'p4', name: 'Türk Kahvesi', category: 'İçecekler', price: 40.00 },
  { id: 'p5', name: 'Çay', category: 'İçecekler', price: 25.00 },
  { id: 'p6', name: 'Filtre Kahve', category: 'İçecekler', price: 50.00 },
  { id: 'p7', name: 'Croissant', category: 'Tatlılar', price: 65.00 },
  { id: 'p8', name: 'Cheesecake', category: 'Tatlılar', price: 85.00 },
  { id: 'p9', name: 'Tiramisu', category: 'Tatlılar', price: 95.00 },
  { id: 'p10', name: 'Brownie', category: 'Tatlılar', price: 75.00 },
  { id: 'p11', name: 'Menemen', category: 'Yemekler', price: 120.00 },
  { id: 'p12', name: 'Omlet', category: 'Yemekler', price: 110.00 },
  { id: 'p13', name: 'Tost', category: 'Yemekler', price: 80.00 },
  { id: 'p14', name: 'Sezar Salata', category: 'Yemekler', price: 135.00 },
  { id: 'p15', name: 'Club Sandwich', category: 'Yemekler', price: 145.00 },
  { id: 'p16', name: 'Makarna', category: 'Yemekler', price: 140.00 },
];

export const mockBillItems: Record<string, BillItem[]> = {
  '1': [
    { id: 'b1', productId: 'p2', productName: 'Cappuccino', quantity: 2, price: 55.00 },
    { id: 'b2', productId: 'p15', productName: 'Club Sandwich', quantity: 2, price: 145.00 },
    { id: 'b3', productId: 'p8', productName: 'Cheesecake', quantity: 2, price: 85.00 },
    { id: 'b4', productId: 'p3', productName: 'Latte', quantity: 2, price: 60.00 },
  ],
  '3': [
    { id: 'b5', productId: 'p1', productName: 'Espresso', quantity: 2, price: 45.00 },
    { id: 'b6', productId: 'p14', productName: 'Sezar Salata', quantity: 2, price: 135.00 },
    { id: 'b7', productId: 'p10', productName: 'Brownie', quantity: 1, price: 75.00 },
  ],
  '4': [
    { id: 'b8', productId: 'p4', productName: 'Türk Kahvesi', quantity: 3, price: 40.00 },
    { id: 'b9', productId: 'p11', productName: 'Menemen', quantity: 3, price: 120.00 },
    { id: 'b10', productId: 'p16', productName: 'Makarna', quantity: 2, price: 140.00 },
    { id: 'b11', productId: 'p5', productName: 'Çay', quantity: 4, price: 25.00 },
  ],
  '6': [
    { id: 'b12', productId: 'p3', productName: 'Latte', quantity: 3, price: 60.00 },
    { id: 'b13', productId: 'p7', productName: 'Croissant', quantity: 3, price: 65.00 },
    { id: 'b14', productId: 'p9', productName: 'Tiramisu', quantity: 2, price: 95.00 },
  ],
  '9': [
    { id: 'b15', productId: 'p6', productName: 'Filtre Kahve', quantity: 4, price: 50.00 },
    { id: 'b16', productId: 'p15', productName: 'Club Sandwich', quantity: 3, price: 145.00 },
    { id: 'b17', productId: 'p8', productName: 'Cheesecake', quantity: 3, price: 85.00 },
  ],
  '10': [
    { id: 'b18', productId: 'p2', productName: 'Cappuccino', quantity: 4, price: 55.00 },
    { id: 'b19', productId: 'p13', productName: 'Tost', quantity: 4, price: 80.00 },
    { id: 'b20', productId: 'p10', productName: 'Brownie', quantity: 3, price: 75.00 },
  ],
  '12': [
    { id: 'b21', productId: 'p1', productName: 'Espresso', quantity: 2, price: 45.00 },
    { id: 'b22', productId: 'p12', productName: 'Omlet', quantity: 2, price: 110.00 },
  ],
};

export const mockTransactions: Transaction[] = [
  { id: 't1', date: '07.04.2026', time: '14:25', tableNo: 7, billNo: 'A-0157', terminalNo: 'T-001', paymentType: 'Kart', amount: 385.50, status: 'Başarılı', referenceNo: 'REF-789456123' },
  { id: 't2', date: '07.04.2026', time: '13:50', tableNo: 5, billNo: 'A-0156', terminalNo: 'T-002', paymentType: 'Nakit', amount: 540.00, status: 'Başarılı' },
  { id: 't3', date: '07.04.2026', time: '13:15', tableNo: 2, billNo: 'A-0155', terminalNo: 'T-001', paymentType: 'Kart', amount: 675.25, status: 'Başarılı', referenceNo: 'REF-789456122' },
  { id: 't4', date: '07.04.2026', time: '12:45', tableNo: 8, billNo: 'A-0154', terminalNo: 'T-001', paymentType: 'Bölünmüş', amount: 890.50, status: 'Başarılı', referenceNo: 'REF-789456121' },
  { id: 't5', date: '07.04.2026', time: '12:30', tableNo: 3, billNo: 'A-0153', terminalNo: 'T-002', paymentType: 'Kart', amount: 420.00, status: 'Başarısız' },
  { id: 't6', date: '06.04.2026', time: '19:30', tableNo: 4, billNo: 'A-0152', terminalNo: 'T-001', paymentType: 'Kart', amount: 1250.75, status: 'Başarılı', referenceNo: 'REF-789456120' },
  { id: 't7', date: '06.04.2026', time: '18:45', tableNo: 6, billNo: 'A-0151', terminalNo: 'T-002', paymentType: 'Nakit', amount: 680.00, status: 'Başarılı' },
  { id: 't8', date: '06.04.2026', time: '17:20', tableNo: 1, billNo: 'A-0150', terminalNo: 'T-001', paymentType: 'Kart', amount: 945.50, status: 'Başarılı', referenceNo: 'REF-789456119' },
];
