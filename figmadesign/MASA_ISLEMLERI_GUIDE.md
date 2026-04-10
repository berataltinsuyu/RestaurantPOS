# 📱 Masa İşlemleri Button - User Guide

## ✨ Overview

A single **"Masa İşlemleri"** (Table Actions) button has been added to the Tables screen header. This button provides access to all advanced table management operations without cluttering the table cards.

---

## 📍 Button Location

**Position:** Top section, in the filter chips row (after Tümü, Dolu, Boş, Ödeme)

**Visual Style:**
- White background
- VakıfBank gold border (#d4a017)
- Gold text color
- Settings icon
- "Masa İşlemleri" label

**Behavior:**
- Always visible (scrolls horizontally with filters)
- Positioned at the right end using `ml-auto`
- Opens bottom sheet on tap

---

## 🎯 Features

### Button Opens Bottom Sheet

When tapped, the "Masa İşlemleri" button opens a **bottom sheet** (Android native pattern) with 3 action cards:

1. **Masa Taşı** (Move Table)
   - Blue icon and background
   - "Bir masayı başka bir numaraya taşı"
   - Navigates to table selection screen

2. **Masa Birleştir** (Merge Tables)
   - Purple icon and background
   - "Birden fazla masayı birleştir"
   - Navigates to table selection screen

3. **Masa Ayır** (Split Table)
   - Amber icon and background
   - "Bir masayı birden fazla masaya böl"
   - Navigates to table selection screen

---

## 🔄 User Flow

### Flow Diagram:
```
Tables Screen
    ↓ (Tap "Masa İşlemleri")
Bottom Sheet
    ├─→ Masa Taşı → Table Selection → Move Table Flow
    ├─→ Masa Birleştir → Table Selection → Merge Table Flow
    └─→ Masa Ayır → Table Selection → Split Table Flow
```

### Detailed Steps:

#### 1. **Move Table Flow:**
1. Tap "Masa İşlemleri" button
2. Bottom sheet appears
3. Tap "Masa Taşı" card
4. Table Selection screen shows occupied tables
5. Select source table
6. Tap "Devam"
7. Move Table screen shows available target tables
8. Select target table
9. Confirm move
10. Return to Tables screen

#### 2. **Merge Tables Flow:**
1. Tap "Masa İşlemleri" button
2. Bottom sheet appears
3. Tap "Masa Birleştir" card
4. Table Selection screen shows occupied tables
5. Select main table
6. Tap "Devam"
7. Merge Table screen allows multi-select
8. Select tables to merge
9. Confirm merge
10. Return to Tables screen

#### 3. **Split Table Flow:**
1. Tap "Masa İşlemleri" button
2. Bottom sheet appears
3. Tap "Masa Ayır" card
4. Table Selection screen shows occupied tables
5. Select table to split
6. Tap "Devam"
7. Split Table screen shows split count selector
8. Choose number of tables (2-5)
9. Preview distribution
10. Confirm split
11. Return to Tables screen

---

## 🎨 Design Details

### Bottom Sheet:
```tsx
- Position: Fixed bottom
- Background: White
- Rounded top corners: 24px (rounded-t-3xl)
- Max height: 70% viewport
- Backdrop: Black 50% opacity
- Drag handle: Gray bar at top
```

### Action Cards:
```tsx
- Layout: Full width cards
- Padding: 16px
- Border: 2px gray-200
- Border radius: 12px (rounded-xl)
- Active state: scale-95
- Icon size: 48px (w-12 h-12)
- Icon background: Colored (blue/purple/amber)
```

### Color Coding:
- **Blue** (#3b82f6) - Move Table
- **Purple** (#a855f7) - Merge Tables
- **Amber** (#f59e0b) - Split Table

---

## 📱 Mobile UX Patterns

### Bottom Sheet (Android Native):
✅ **Drag handle** - Visual indicator for dismissal
✅ **Tap outside** - Dismisses sheet
✅ **Slide up animation** - Smooth entrance
✅ **Backdrop overlay** - Focuses attention
✅ **Scrollable** - If content exceeds viewport

### Touch Interactions:
✅ **48px+ touch targets** - Easy tapping
✅ **Active state** - Scale feedback on press
✅ **Visual hierarchy** - Icons + bold text
✅ **Clear labels** - No ambiguity
✅ **Descriptions** - Explains each action

---

## 🚫 What's NOT Changed

### Table Cards:
❌ **No new buttons added** - Cards remain clean
❌ **No layout changes** - Same 2-column grid
❌ **No interaction changes** - Same tap behavior
❌ **No styling changes** - Same status colors

### Existing Features:
✅ **Table click** - Still opens order/action menu
✅ **Long-press** - Still available (500ms)
✅ **Search** - Still filters tables
✅ **Status filters** - Still work as before
✅ **Stats cards** - Still show totals

---

## 🧪 Testing

### Test Scenario 1: Open Bottom Sheet
1. Go to `/mobile/tables`
2. Scroll horizontally in filter chips area
3. Tap "Masa İşlemleri" button
4. Verify: Bottom sheet slides up from bottom
5. Verify: 3 action cards visible
6. Tap outside
7. Verify: Sheet dismisses

### Test Scenario 2: Navigate to Move
1. Tap "Masa İşlemleri"
2. Tap "Masa Taşı" card
3. Verify: Navigates to `/mobile/table-selection?action=move`
4. Verify: Shows occupied tables
5. Verify: Shows search box
6. Select a table
7. Tap "Devam"
8. Verify: Navigates to Move Table flow

### Test Scenario 3: Navigate to Merge
1. Tap "Masa İşlemleri"
2. Tap "Masa Birleştir" card
3. Verify: Navigates to `/mobile/table-selection?action=merge`
4. Follow merge flow

### Test Scenario 4: Navigate to Split
1. Tap "Masa İşlemleri"
2. Tap "Masa Ayır" card
3. Verify: Navigates to `/mobile/table-selection?action=split`
4. Follow split flow

---

## 🔧 Technical Details

### Routes:
```typescript
/mobile/tables                    // Main screen with button
/mobile/table-selection           // Universal table picker
  ?action=move                    // For move flow
  ?action=merge                   // For merge flow
  ?action=split                   // For split flow
/mobile/move-table/:tableId       // Move destination
/mobile/merge-table/:tableId      // Merge selection
/mobile/split-table/:tableId      // Split configuration
```

### State Management:
```typescript
const [showGlobalActions, setShowGlobalActions] = useState(false);
```

### Icons Used:
- **Settings** - Button icon
- **Move** - Move table action
- **GitMerge** - Merge tables action
- **Split** - Split table action

---

## 💡 Why This Design?

### Clean UI:
✅ **Single button** - No clutter on table cards
✅ **Clear grouping** - All table operations in one place
✅ **Discoverable** - Visible in header area
✅ **Organized** - Bottom sheet keeps options structured

### Speed:
✅ **Fast access** - One tap to options
✅ **Visual scanning** - Icons help quick identification
✅ **Direct navigation** - Each action goes to dedicated flow
✅ **No ambiguity** - Clear descriptions

### Android Native:
✅ **Bottom sheet** - Standard Android pattern
✅ **Material Design** - Familiar to Android users
✅ **Gesture support** - Tap outside to dismiss
✅ **Animation** - Smooth slide up

---

## 📊 Component Hierarchy

```
MobileTables.tsx
  └─ Top Bar
      └─ Filter Chips
          └─ "Masa İşlemleri" Button
              └─ (Opens) Global Actions Bottom Sheet
                  ├─ Masa Taşı → TableSelection (action=move)
                  ├─ Masa Birleştir → TableSelection (action=merge)
                  └─ Masa Ayır → TableSelection (action=split)
```

---

## 🎯 Key Benefits

### For Waiters:
✅ **Less confusion** - All operations in one place
✅ **Faster workflow** - Direct access to actions
✅ **Clear options** - Visual icons + descriptions
✅ **Familiar pattern** - Android bottom sheet

### For UI:
✅ **Clean design** - No cluttered table cards
✅ **Scalable** - Easy to add more actions
✅ **Consistent** - Uses established patterns
✅ **Professional** - Matches VakıfBank brand

---

## 🚀 Future Enhancements

Possible additions to "Masa İşlemleri":
- [ ] Masa Sabitle (Pin Table)
- [ ] Masa Notları (Table Notes)
- [ ] Masa Geçmişi (Table History)
- [ ] Masa İstatistikleri (Table Stats)
- [ ] Toplu İşlemler (Bulk Operations)

---

**All features maintain VakıfBank mobile POS design standards** ✅

**Table cards remain completely unchanged** ✅

**Android-native patterns throughout** ✅
