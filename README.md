# RestaurantPOS

RestaurantPOS, restoran ve kafe operasyonları için geliştirilen full-stack POS ve adisyon yönetim sistemidir. Proje; web yönetim paneli, mobil garson uygulaması, ASP.NET Core Web API backend, Supabase PostgreSQL veritabanı, masa/adisyon yönetimi, mutfak ekranı, ödeme akışları, menü yönetimi ve Excel ile toplu menü aktarımı modüllerinden oluşur.

---

## Türkçe

### Proje Özeti

RestaurantPOS; restoran, kafe ve benzeri işletmelerde masa operasyonlarını, adisyon süreçlerini, sipariş hazırlık durumlarını, ödeme kayıtlarını ve menü yönetimini tek bir sistem altında toplamak için geliştirilmiştir.

Bu proje, VakıfBank Ödeme Sistemleri Uygulama Geliştirme departmanındaki staj sürecinde geliştirilmiştir. Restoran/kafe POS süreçleri, adisyon yönetimi, ödeme akışları ve mobil garson/POS kullanım senaryolarını modellemek amacıyla hazırlanmıştır.

Proje kapsamı:

- Web POS ve yönetim paneli
- React Native / Expo mobil garson uygulaması
- ASP.NET Core Web API backend
- Supabase PostgreSQL veritabanı
- Supabase üzerinden canlı veri okuma ve realtime senkronizasyon
- Render backend deploy yapısı
- Vercel frontend deploy yapısı

Sistem hem yönetici/kasa tarafındaki web ekranlarını hem de garsonların sahada kullanabileceği mobil uygulama akışlarını destekler. Mobil uygulama yalnızca garson el terminali mantığında değil; Android POS cihazlarına yüklenerek hem sipariş/adisyon yönetimi hem ödeme alma süreçlerinde kullanılabilecek şekilde tasarlanmıştır.

### Öne Çıkan Özellikler

#### Web POS Paneli

- JWT tabanlı giriş ve oturum yönetimi
- Rol bazlı kullanıcı yapısı
- Masa planı ve hızlı masa işlemleri
- Masa açma, taşıma, birleştirme ve ayırma
- Adisyon oluşturma ve yönetme
- Adisyon detayı ekranı
- Ürün ekleme, adet değiştirme ve ürün silme
- Nakit, kart ve bölünmüş ödeme akışları
- Mutfak ekranı ve sipariş hazırlık takibi
- Sipariş durum takibi: Sipariş Alındı, Hazırlanıyor, Hazır, Teslim Edildi
- İşlem geçmişi
- İade ve iptal işlemleri
- Terminal yönetimi
- Gün sonu mutabakatı
- Gün sonu ve işlem geçmişi ekranlarında operasyonel verilerin dökümante edilmesi ve indirilebilir rapor/çıktı olarak alınabilmesi
- Raporlar ve grafikler
- Menü yönetimi
- Excel’den ürün/kategori aktarımı
- Excel şablon indirme
- Kategori tekrarlarını engelleyen import mantığı
- Rezervasyon yönetimi
- İkram onayı
- Rol ve yetki matrisi
- Ayarlar, kullanıcı, terminal, yazıcı ve entegrasyon ayarları

#### Mobil Garson Uygulaması

- Expo / React Native tabanlı mobil uygulama
- Garson girişi
- Masa planı görüntüleme
- Masa durumu takibi
- Masa açma
- Masa işlemleri
- Masa işlemleri ekranı
- Masa detayı
- Sipariş/adisyon detayı
- Ürün seçimi
- Kategori filtreleme
- Ürün arama
- Adet seçerek ürün ekleme
- Ödeme ekranı
- Nakit ödeme
- Kart / temassız ödeme akışı
- Bölünmüş ödeme ekranı
- Bölünmüş ödeme ekranı ve ödeme paylaştırma akışı
- Web mutfak ekranıyla senkron sipariş durumu
- Supabase üzerinden canlı veri okuma
- Backend API üzerinden gerçek yazma işlemleri

Mobil uygulama; masa, adisyon, ürün seçimi ve ödeme adımlarını sahada kullanılabilecek kompakt bir akış olarak sunar. Supabase üzerinden canlı veri okuma ve realtime senkronizasyon güncel veri görünürlüğü sağlar; masa açma, ürün ekleme, ödeme tamamlama gibi kritik yazma işlemleri backend API üzerinden yapılır.

### Web + Mobil Senkron Yapısı

RestaurantPOS, web ve mobil ekranlar arasında aynı operasyonel veriyi kullanacak şekilde tasarlanmıştır:

1. Garson mobil uygulamada masaya ürün ekler.
2. Ürün web mutfak ekranına düşer.
3. Mutfak personeli sipariş durumunu günceller.
4. Güncellenen durum masa/adisyon ekranlarında görünür.
5. Ödeme sonrası adisyon ve masa durumu backend üzerinden güncellenir.

Bu yapı, restoran operasyonundaki garson, mutfak ve kasa akışlarının aynı veri modeli üzerinde ilerlemesini sağlar.

### Teknoloji Yığını

#### Backend

- ASP.NET Core Web API
- .NET 8
- Entity Framework Core
- PostgreSQL / Supabase
- JWT Authentication
- FluentValidation
- ClosedXML ile Excel import
- Swagger / OpenAPI

#### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui tarzından ilham alan özel component yapısı
- React Router
- Sonner toast bildirimleri
- Lucide React ikonları

#### Mobile

- React Native
- Expo
- TypeScript
- Zustand
- React Navigation
- Supabase client

#### Deployment

- Vercel frontend deploy
- Render backend deploy
- Supabase PostgreSQL, canlı veri okuma ve realtime senkronizasyon altyapısı

### Mimari

RestaurantPOS modüler bir full-stack yapı üzerine kuruludur:

- `backend/` REST API, authentication, authorization, iş kuralları, EF Core repository/service katmanı ve veritabanı migration süreçlerini içerir.
- `src/` React tabanlı web POS panelini ve yönetim ekranlarını içerir.
- `mobileapp/` Expo tabanlı mobil garson/POS uygulamasını içerir.
- Supabase PostgreSQL ana operasyonel veritabanıdır.
- Supabase üzerinden canlı veri okuma ve realtime senkronizasyon mobil uygulamada güncel veri görünürlüğü için kullanılır.
- Kritik yazma işlemleri backend API üzerinden yapılır; böylece iş kuralları, audit logging ve yetki kontrolleri merkezi kalır.

Örnek operasyon akışı:

```text
Web / Mobile UI
      |
      v
ASP.NET Core Web API
      |
      v
EF Core Service + Repository Layer
      |
      v
Supabase PostgreSQL
```

Mobil canlı okuma ve senkron görünürlük:

```text
Supabase PostgreSQL
      |
      v
Supabase live reads / realtime sync
      |
      v
Expo mobile app
```

### Veritabanı ve Süreç Yapısı

Tam SQL scripti README içinde tutulmaz. Veritabanı EF Core migration yapısı ve Supabase PostgreSQL şeması üzerinden yönetilir.

#### 1. İş Yeri ve Kullanıcı Yönetimi

- `Branches`
- `Users`
- `Roles`
- `Permissions`
- `RolePermissions`
- `AppSettings`

Bu grup şube, kullanıcı, rol, yetki ve uygulama ayarı yönetimini kapsar.

#### 2. Masa ve Adisyon Yönetimi

- `RestaurantTables`
- `Bills`
- `BillItems`
- `TableReservations`

Bu grup masa durumu, aktif adisyon, adisyon satırları ve rezervasyon süreçlerini yönetir.

#### 3. Ürün ve Menü Yönetimi

- `ProductCategories`
- `Products`

Bu grup ürün, kategori, menü görünürlüğü ve Excel import süreçlerinin temelini oluşturur.

#### 4. Ödeme ve POS Terminal Süreçleri

- `Payments`
- `PosTerminals`
- `Shifts`
- `PrinterSettings`

Bu grup ödeme kayıtları, terminal bilgileri, vardiya süreçleri ve yazıcı ayarlarını kapsar.

#### 5. Denetim ve Operasyon Kayıtları

- `AuditLogs`
- `__EFMigrationsHistory`

Bu grup kritik operasyon kayıtları ve EF Core migration geçmişi için kullanılır.

#### Temel İlişkiler

- `Branches` birçok kullanıcı, masa, terminal, ayar ve shift kaydına bağlıdır.
- `RestaurantTables` aktif adisyonu `CurrentBillId` ile `Bills` tablosuna bağlar.
- `Bills`, masa, şube, garson ve ödeme toplamlarını tutar.
- `BillItems`, adisyon satırlarını ürün snapshot bilgisiyle saklar.
- `Products`, `ProductCategories` tablosuna bağlıdır.
- `Payments`, `Bills`, `Users` ve `PosTerminals` ile ilişkilidir.
- `RolePermissions`, rollerin hangi yetkilere sahip olduğunu yönetir.
- `AuditLogs`, kritik operasyon kayıtlarını tutar.
- `TableReservations`, masa rezervasyonlarını tutar.

ERD notu: Veritabanı şeması ekran görüntüsü `docs/screenshots/database-schema.png` altında tutulabilir.

### Ekran Görüntüleri

Görseller `docs/screenshots/` altında tutulacak şekilde referanslanmıştır. Bu repo kopyasında screenshot dosyaları henüz bulunmuyorsa tabloda hedef dosya pathleri gösterilir; görseller eklendiğinde pathler GitHub üzerinde preview formatına çevrilebilir.

#### Web Screenshots

| Ekran | Dosya |
| --- | --- |
| Dashboard / Masa Planı | `docs/screenshots/web-dashboard.png` |
| Adisyon Detayı | `docs/screenshots/web-bill-detail.png` |
| Ödeme Ekranı | `docs/screenshots/web-payment-screen.png` |
| Bölünmüş Ödeme | `docs/screenshots/web-split-payment.png` |
| Mutfak Ekranı | `docs/screenshots/web-kitchen.png` |
| İşlem Geçmişi | `docs/screenshots/web-history.png` |
| İade / İptal | `docs/screenshots/web-refund.png` |
| Terminal Yönetimi | `docs/screenshots/web-terminal-management.png` |
| Gün Sonu Mutabakat | `docs/screenshots/web-end-of-day.png` |
| Raporlar | `docs/screenshots/web-reports.png` |
| Menü Yönetimi | `docs/screenshots/web-menu-management.png` |
| Rol ve Yetki Matrisi | `docs/screenshots/web-role-permissions.png` |
| Veritabanı Şeması | `docs/screenshots/database-schema.png` |

#### Mobile Screenshots

| Ekran | Dosya |
| --- | --- |
| Mobil Masa Planı | `docs/screenshots/mobile-tables.png` |
| Mobil Masa Detayı | `docs/screenshots/mobile-table-detail.png` |
| Mobil Masa İşlemleri | `docs/screenshots/mobile-table-actions.png` |
| Mobil Ürün Seçimi | `docs/screenshots/mobile-product-selection.png` |
| Mobil Ödeme | `docs/screenshots/mobile-payment.png` |
| Mobil Bölünmüş Ödeme | `docs/screenshots/mobile-split-payment.png` |
| Mobil Temassız Ödeme Bekleme | `docs/screenshots/mobile-contactless-payment.png` |

### Proje Yapısı

```text
RestaurantPOS/
├── backend/             # ASP.NET Core Web API
├── src/                 # React + Vite web frontend
├── mobileapp/           # Expo / React Native mobile app
├── docs/screenshots/    # GitHub README screenshot assets
├── README.md
├── package.json
└── RestaurantPOS.sln
```

### Kurulum

#### 1. Repoyu Klonlama

```bash
git clone <repository-url>
cd RestaurantPOS
```

#### 2. Backend Çalıştırma

```bash
dotnet restore backend/Backend.csproj
dotnet ef database update --project backend/Backend.csproj
dotnet run --project backend/Backend.csproj
```

Backend varsayılan olarak ASP.NET Core ayarlarına göre çalışır. Swagger adresi ortam konfigürasyonuna göre değişebilir.

Backend Swagger: `<backend-base-url>/swagger`

#### 3. Web Frontend Çalıştırma

```bash
npm install
npm run dev
```

Frontend Vite üzerinden çalışır. API adresi `VITE_API_BASE_URL` ile verilir.

#### 4. Mobil Uygulamayı Çalıştırma

```bash
cd mobileapp
npm install
npm run start
# veya cache temizleyerek:
npm run start:clear
# alternatif:
npx expo start -c
```

Expo açıldıktan sonra iOS simulator, Android emulator veya Expo Go ile QR kod okutularak fiziksel cihaz üzerinden test edilebilir.

#### 5. Örnek Env Değişkenleri

Gerçek secret, connection string, token veya şifre README içinde tutulmamalıdır. Aşağıdaki değerler sadece değişken adlarını göstermek için verilmiştir.

Backend:

```env
ConnectionStrings__DefaultConnection=
Jwt__Key=
```

Web frontend:

```env
VITE_API_BASE_URL=
```

Mobile:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
EXPO_PUBLIC_BACKEND_BASE_URL=
```

### Canlı Demo / Demo Kullanım

- Canlı frontend: https://restaurant-pos-pink.vercel.app
- Backend Swagger: `<backend-swagger-url>/swagger`
- Demo giriş bilgileri:

| Rol / Kullanıcı | Kullanıcı adı | Şifre |
| --- | --- | --- |
| Garson | `ahmet` | `Ahmet123!` |
| Garson | `ayse` | `Ayse123!` |
| Kasiyer | `kasiyer` | `Kasiyer123!` |
| Şube Müdürü | `mudur` | `Mudur123!` |
| Sistem Yöneticisi | `admin` | `Admin123!` |

- Bu bilgiler yalnızca portfolyo/teknik inceleme amacıyla hazırlanmış demo kullanıcılarıdır.
- Frontend Vercel üzerinde, backend Render üzerinde, veritabanı Supabase üzerinde çalışmaktadır.
- Render backend ücretsiz/uyuyan servis mantığıyla çalışabileceği için ilk giriş veya ilk API isteği birkaç saniye sürebilir.
- İlk denemede gecikme yaşanırsa kısa süre bekleyip tekrar denenebilir.
- Ödeme alma ekranları ve terminal yönetimi ekranı şu an için gerçek banka/POS entegrasyonu içermeyen UI/mockup niteliğindedir.
- Kart ödeme, terminal bağlantısı ve bazı POS süreçleri demo/mock akışlarla simüle edilmektedir.
- Nakit ödeme ve temel backend ödeme kayıt süreçleri çalışmaktadır.
- Gerçek banka entegrasyonu production seviyesinde implement edilmemiştir.

### Güvenlik ve Production Notu

Bu proje portfolyo/staj projesi niteliğindedir. Finalize edilmiş production ürünü değildir. README içinde yer alan demo kullanıcıları production hesabı değildir; yalnızca teknik inceleme ve portfolyo gösterimi için hazırlanmıştır. RLS/policy, gerçek POS entegrasyonu, test kapsamı, monitoring, rate limiting ve operasyonel güvenlik daha da geliştirilebilir.

---

## English

### Project Overview

RestaurantPOS is a full-stack POS and bill management system built for restaurant and cafe operations. It includes a web management panel, a mobile waiter application, an ASP.NET Core Web API backend, Supabase PostgreSQL, table/bill management, kitchen tracking, payment flows, menu management, and Excel-based bulk menu import.

This project was developed during an internship in the VakıfBank Payment Systems Application Development department. It was prepared to model restaurant/cafe POS processes, bill management, payment flows, and mobile waiter/POS usage scenarios.

Project scope:

- Web POS dashboard
- React Native / Expo mobile waiter application
- ASP.NET Core Web API backend
- Supabase PostgreSQL database
- Supabase live reads and realtime synchronization
- Render backend deployment
- Vercel frontend deployment

The system is designed to support both web-based management/cashier workflows and mobile workflows used by waiters on the floor. The mobile app is not limited to handheld waiter terminals; it is also designed to run on Android POS devices for both order/bill management and payment collection flows.

### Key Features

#### Web POS Panel

- JWT-based authentication
- Role-based user structure
- Table plan and quick table operations
- Open, move, merge and split tables
- Create and manage bills
- Bill detail screen
- Add products, change quantities and remove items
- Cash, card and split payment flows
- Kitchen screen and order preparation tracking
- Order status tracking: Order Received, Preparing, Ready, Delivered
- Transaction history
- Refund and cancellation workflows
- Terminal management
- End-of-day reconciliation
- Downloadable/exportable operational records from end-of-day and transaction history screens
- Reports and charts
- Menu management
- Product/category import from Excel
- Excel template download
- Import logic that prevents duplicate category creation
- Reservations
- Complimentary item approval
- Role and permission matrix
- Settings for users, terminals, printers and integrations

#### Mobile Waiter Application

- Expo / React Native mobile application
- Waiter login
- Table plan view
- Table status tracking
- Open table flow
- Table operations
- Table actions screen
- Table detail screen
- Order/bill detail screen
- Product selection
- Category filtering
- Product search
- Add products with selected quantity
- Payment screen
- Cash payment
- Card / contactless payment flow
- Split payment screen
- Split payment screen and payment allocation flow
- Order status synchronized with the web kitchen screen
- Live data reads through Supabase
- Real write operations through the backend API

The mobile app provides a compact operational flow for table, bill, product selection and payment steps. Supabase live reads and realtime synchronization provide up-to-date data visibility, while critical write operations such as opening tables, adding items and completing payments go through the backend API.

### Web + Mobile Synchronization

RestaurantPOS is designed around a shared operational data model:

1. A waiter adds products from the mobile app.
2. The item appears on the web kitchen screen.
3. Kitchen staff updates the preparation status.
4. Updated statuses are visible on table and bill screens.
5. After payment, the bill and table status are updated through the backend.

This flow keeps waiter, kitchen and cashier operations aligned on the same backend data.

### Technology Stack

#### Backend

- ASP.NET Core Web API
- .NET 8
- Entity Framework Core
- PostgreSQL / Supabase
- JWT Authentication
- FluentValidation
- ClosedXML for Excel import
- Swagger / OpenAPI

#### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- custom component structure inspired by shadcn/ui style
- React Router
- Sonner toast notifications
- Lucide React icons

#### Mobile

- React Native
- Expo
- TypeScript
- Zustand
- React Navigation
- Supabase client

#### Deployment

- Vercel for the frontend
- Render for the backend
- Supabase for PostgreSQL, live reads and realtime synchronization

### Architecture

RestaurantPOS follows a modular full-stack architecture:

- `backend/` contains the REST API, authentication, authorization, business rules, EF Core repository/service layer and database migrations.
- `src/` contains the React-based web POS panel and management screens.
- `mobileapp/` contains the Expo-based mobile waiter/POS application.
- Supabase PostgreSQL is the primary operational database.
- Supabase live reads and realtime synchronization are used by the mobile app for up-to-date data visibility.
- Critical write operations go through the backend API so business rules, audit logging and authorization remain centralized.

High-level request flow:

```text
Web / Mobile UI
      |
      v
ASP.NET Core Web API
      |
      v
EF Core Service + Repository Layer
      |
      v
Supabase PostgreSQL
```

Mobile live read flow:

```text
Supabase PostgreSQL
      |
      v
Supabase live reads / realtime sync
      |
      v
Expo mobile app
```

### Database and Process Structure

The full SQL script is intentionally not embedded in this README. The schema is managed through EF Core migrations and the Supabase PostgreSQL database.

#### 1. Business and User Management

- `Branches`
- `Users`
- `Roles`
- `Permissions`
- `RolePermissions`
- `AppSettings`

This group covers branch, user, role, permission and application setting management.

#### 2. Table and Bill Management

- `RestaurantTables`
- `Bills`
- `BillItems`
- `TableReservations`

This group manages table status, active bills, bill line items and reservations.

#### 3. Product and Menu Management

- `ProductCategories`
- `Products`

This group is the basis for product records, categories, menu availability and Excel import flows.

#### 4. Payment and POS Terminal Processes

- `Payments`
- `PosTerminals`
- `Shifts`
- `PrinterSettings`

This group covers payment records, terminal information, shift operations and printer settings.

#### 5. Audit and Operational Records

- `AuditLogs`
- `__EFMigrationsHistory`

This group is used for critical operation logs and EF Core migration history.

#### Core Relationships

- `Branches` has many users, tables, terminals, settings and shifts.
- `RestaurantTables` links the active bill through `CurrentBillId` to `Bills`.
- `Bills` stores table, branch, waiter and payment total information.
- `BillItems` stores bill line items with product snapshot data.
- `Products` belongs to `ProductCategories`.
- `Payments` relates to `Bills`, `Users` and `PosTerminals`.
- `RolePermissions` controls which permissions each role has.
- `AuditLogs` stores critical operation records.
- `TableReservations` stores table reservations.

ERD note: A database schema screenshot can be kept under `docs/screenshots/database-schema.png`.

### Screenshots

Screenshots are referenced under `docs/screenshots/`. If the screenshot files are not present in this repository copy yet, the tables show the intended target paths; once the images are added, the paths can be converted to GitHub image previews.

#### Web Screenshots

| Screen | File |
| --- | --- |
| Dashboard / Table Plan | `docs/screenshots/web-dashboard.png` |
| Bill Detail | `docs/screenshots/web-bill-detail.png` |
| Payment Screen | `docs/screenshots/web-payment-screen.png` |
| Split Payment | `docs/screenshots/web-split-payment.png` |
| Kitchen Screen | `docs/screenshots/web-kitchen.png` |
| Transaction History | `docs/screenshots/web-history.png` |
| Refund / Cancel | `docs/screenshots/web-refund.png` |
| Terminal Management | `docs/screenshots/web-terminal-management.png` |
| End-of-Day Reconciliation | `docs/screenshots/web-end-of-day.png` |
| Reports | `docs/screenshots/web-reports.png` |
| Menu Management | `docs/screenshots/web-menu-management.png` |
| Role and Permission Matrix | `docs/screenshots/web-role-permissions.png` |
| Database Schema | `docs/screenshots/database-schema.png` |

#### Mobile Screenshots

| Screen | File |
| --- | --- |
| Mobile Table Plan | `docs/screenshots/mobile-tables.png` |
| Mobile Table Detail | `docs/screenshots/mobile-table-detail.png` |
| Mobile Table Actions | `docs/screenshots/mobile-table-actions.png` |
| Mobile Product Selection | `docs/screenshots/mobile-product-selection.png` |
| Mobile Payment | `docs/screenshots/mobile-payment.png` |
| Mobile Split Payment | `docs/screenshots/mobile-split-payment.png` |
| Mobile Contactless Payment Waiting | `docs/screenshots/mobile-contactless-payment.png` |

### Project Structure

```text
RestaurantPOS/
├── backend/             # ASP.NET Core Web API
├── src/                 # React + Vite web frontend
├── mobileapp/           # Expo / React Native mobile app
├── docs/screenshots/    # GitHub README screenshot assets
├── README.md
├── package.json
└── RestaurantPOS.sln
```

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd RestaurantPOS
```

#### 2. Run the Backend

```bash
dotnet restore backend/Backend.csproj
dotnet ef database update --project backend/Backend.csproj
dotnet run --project backend/Backend.csproj
```

Backend Swagger: `<backend-base-url>/swagger`

#### 3. Run the Web Frontend

```bash
npm install
npm run dev
```

The web frontend uses `VITE_API_BASE_URL` for the backend API URL.

#### 4. Run the Mobile App

```bash
cd mobileapp
npm install
npm run start
# or start with a cleared Expo cache:
npm run start:clear
# alternative:
npx expo start -c
```

After Expo starts, the app can be tested on an iOS simulator, Android emulator, or a physical device by scanning the QR code with Expo Go.

#### 5. Example Environment Variables

Do not store real secrets, connection strings, tokens or passwords in this README. The values below show only the expected variable names.

Backend:

```env
ConnectionStrings__DefaultConnection=
Jwt__Key=
```

Web frontend:

```env
VITE_API_BASE_URL=
```

Mobile:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
EXPO_PUBLIC_BACKEND_BASE_URL=
```

### Live Demo / Demo Usage

- The live frontend URL, backend Swagger placeholder and demo account table are listed once in the Turkish `Canlı Demo / Demo Kullanım` section above.
- The listed accounts are demo users prepared only for portfolio and technical review purposes.
- The frontend is hosted on Vercel, the backend is hosted on Render, and the database runs on Supabase.
- Because the Render backend may run as a free/sleeping service, the first login or first API request can take a few seconds.
- If the first attempt feels delayed, wait briefly and try again.
- Payment collection screens and terminal management screens are currently UI/mockup flows without a real bank/POS integration.
- Card payment, terminal connection and some POS-related processes are simulated through demo/mock flows.
- Cash payment and core backend payment record flows are functional.
- A production-grade bank integration has not been implemented.

### Security and Production Note

This project is a portfolio/internship project. It is not a finalized production product. The demo users listed in this README are not production accounts; they are prepared only for technical review and portfolio demonstration. RLS/policies, real POS integration, test coverage, monitoring, rate limiting and operational security can be improved further before production use.
