# VakıfBank Mobile Waiter POS - Guide

## Overview
Mobile waiter handheld POS application that extends the web-based restaurant POS system. Designed for waiters on Android handheld devices.

## Design System
The mobile app **strictly follows** the existing web POS design:
- ✅ Same color palette (white surfaces, dark text, gold accent #d4a017)
- ✅ Same typography and spacing
- ✅ Same button and input styles
- ✅ Same component logic
- ✅ Mobile-adapted layouts (not redesigned)

## Routes & Screens

### Authentication
- `/mobile/login` - Waiter login screen

### Main Screens
- `/mobile/tables` - **Main Screen** - Table plan with grid view
- `/mobile/table-action/:tableId` - Table action menu (bottom sheet)
- `/mobile/order/:tableId` - Order detail and management
- `/mobile/menu/:tableId` - Product selection menu
- `/mobile/payment/:tableId` - Payment screen
- `/mobile/payment-success/:tableId` - Payment success confirmation
- `/mobile/open-table/:tableId` - Open table flow

## Features

### 1. Table Plan (Main Screen)
- Grid view of all tables
- Visual status indicators:
  - **Boş** (Empty) - Gray
  - **Dolu** (Occupied) - Blue
  - **Ödeme Bekliyor** (Payment Pending) - Amber
  - **Ödendi** (Paid) - Green
- Quick stats dashboard
- Search functionality
- Filter by status
- Tap empty table → Open table
- Tap occupied table → View order

### 2. Table Actions
Bottom sheet menu with:
- Open table
- Move table
- Merge tables
- Split table

### 3. Order Management
- View all items
- Quantity controls (+/-)
- Add notes to items
- Remove items
- Real-time total calculation
- Add more products
- Go to payment

### 4. Product Menu
- Category tabs
- Product search
- Quick add to cart
- Cart preview
- Confirm and add to order

### 5. Payment
- Order summary
- Payment methods:
  - Card (POS device)
  - Cash
- Total calculation
- Complete payment
- Success screen

### 6. Open Table
- Guest count selection (quick buttons)
- Waiter assignment
- Confirm and open

## Key UX Principles

### Speed First
- Minimal clicks/taps
- One-hand usage where possible
- Quick actions always visible
- Auto-navigation after actions

### Clear Visual Hierarchy
- Same status colors as web
- Bold totals and important info
- Clear action buttons
- Consistent spacing

### Mobile Optimization
- Sticky headers/footers
- Bottom sheets for actions
- Large touch targets (44px+)
- Safe area handling
- Scroll optimization

## Component Reuse

The mobile app reuses these web components:
- `Button` - Same button styles
- All enterprise components (when applicable)
- Color system from web
- Typography system from web

## Color System (From Web POS)
```
Primary Gold: #d4a017
Primary Gold Hover: #b8860b
White: #ffffff
Gray 50: #f9fafb
Gray 100: #f3f4f6
Gray 200: #e5e7eb
Gray 600: #4b5563
Gray 900: #111827

Status Colors:
- Empty: gray-400
- Occupied: blue-500
- Payment Pending: amber-500
- Paid: green-500
```

## Typography (From Web POS)
- Base font: System font stack
- Headings: Bold, dark gray
- Body: Regular, gray-600
- Small text: 12px-14px
- Button text: 14px-16px, semibold

## Navigation Flow

```
Login
  ↓
Tables (Main)
  ├→ Empty Table → Open Table → Tables
  ├→ Occupied Table → Order
  │    ├→ Add Products → Menu → Order
  │    └→ Payment → Payment Success → Tables
  └→ Table Action Menu
       ├→ Open Table
       ├→ Move Table
       ├→ Merge Tables
       └→ Split Table
```

## Testing URLs

Start with:
- `/mobile/login` - Login screen
- `/mobile/tables` - Main table view (use demo login first)

Quick test flow:
1. Go to `/mobile/login`
2. Enter any credentials
3. Click "Giriş Yap"
4. View table grid
5. Click an occupied table (blue) → See order
6. Click empty table (gray) → Open table flow
7. From order → Add products → Menu
8. From order → Payment → Success

## What's NOT Included (By Design)
- ❌ Product management
- ❌ Reporting screens
- ❌ Admin panels
- ❌ Settings (waiter-focused only)

## Implementation Notes

### File Structure
```
/src/app/mobile/
  ├── MobileLogin.tsx
  ├── MobileTables.tsx (main screen)
  ├── TableActionMenu.tsx
  ├── MobileOrder.tsx
  ├── MobileMenu.tsx
  ├── MobilePayment.tsx
  ├── PaymentSuccess.tsx
  └── OpenTable.tsx
```

### State Management
- Uses React useState hooks
- Local state for most screens
- Navigation with useNavigate
- Route params with useParams

### Mobile-Specific Considerations
- Touch-friendly (12px minimum spacing)
- Bottom navigation/actions
- Sticky headers/footers
- Modal overlays for secondary actions
- Auto-focus on inputs where needed

## Future Enhancements
- Move table implementation
- Merge tables implementation
- Split table implementation
- Order synchronization
- Real-time updates
- Offline support
- Receipt printing

## Comparison: Web vs Mobile

| Feature | Web POS | Mobile Waiter App |
|---------|---------|-------------------|
| Target User | Cashier/Manager | Waiter |
| Device | Desktop/Tablet | Handheld Android |
| Layout | Sidebar + Main | Full screen mobile |
| Navigation | Sidebar menu | Bottom sheets |
| Table View | Grid with details | Compact grid |
| Primary Actions | Buttons bar | Bottom action bar |
| Design | Same system | Same system |
| Colors | ✅ Identical | ✅ Identical |
| Typography | ✅ Identical | ✅ Identical |
| Components | Desktop-optimized | Mobile-optimized |

## Summary

This mobile app is a **direct mobile extension** of the web POS, not a redesign. It maintains complete visual consistency while adapting to mobile constraints. The waiter can perform core operational tasks quickly on a handheld device, with the same professional VakıfBank brand experience.
