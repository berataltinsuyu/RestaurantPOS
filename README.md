# 🍽️ RestaurantPOS

RestaurantPOS, restoran ve kafe operasyonlarını yönetmek için geliştirilen full-stack bir POS ve adisyon yönetim sistemidir.  
Proje; web tabanlı yönetim paneli, mobil garson uygulaması ve .NET backend altyapısından oluşur.

---

## Proje Özeti

RestaurantPOS; restoranlarda masa yönetimi, adisyon takibi, sipariş yönetimi, ödeme alma ve operasyonel süreçleri dijitalleştirmek amacıyla geliştirilmiştir.

Sistem temel olarak şu bileşenlerden oluşur:

- **Web POS arayüzü**
- **Mobil garson uygulaması**
- **ASP.NET Core Web API backend**
- **Supabase PostgreSQL veritabanı**
- **Supabase Realtime senkronizasyon altyapısı**

---

## Proje Yapısı

```text
RestaurantPOS/
├── backend/                 # ASP.NET Core Web API
├── src/                     # React web arayüzü
├── public/                  # Statik frontend dosyaları
├── mobileapp/               # React Native (Expo) mobil garson uygulaması
├── figmadesign/             # Referans tasarım / mockup dosyaları
├── package.json
├── vite.config.ts
├── README.md
└── .gitignore


Bileşenler

Web Uygulaması

Web tarafı restoran yönetim ekranlarını içerir.

Örnek kullanım alanları:
	•	masa planı görüntüleme
	•	ürün ve kategori yönetimi
	•	adisyon takibi
	•	ödeme süreçleri
	•	rol ve yetki yönetimi
	•	terminal ve operasyon yönetimi

Mobil Uygulama

mobileapp/ klasörü gerçek mobil uygulamayı içerir.

Mobil uygulama temel olarak garsonların el terminali üzerinden şu işlemleri yapmasına odaklanır:
	•	masa planını görüntüleme
	•	masa açma
	•	sipariş detayını görüntüleme
	•	ürün ekleme
	•	ödeme alma
	•	bölünmüş ödeme
	•	temassız kart okutma akışı

Tasarım Referansları

figmadesign/ klasörü çalışma ve referans amaçlıdır.

Bu klasör:
	•	üretim kodu değildir
	•	yalnızca tasarım ve akış referansı olarak tutulur

Gerçek mobil uygulama yalnızca mobileapp/ içindedir.

⸻

Kullanılan Teknolojiler

Frontend (Web)
	•	React
	•	TypeScript
	•	Vite
	•	Tailwind CSS

Backend
	•	ASP.NET Core Web API
	•	Entity Framework Core
	•	PostgreSQL
	•	JWT Authentication
	•	Swagger / OpenAPI

Mobile
	•	React Native
	•	Expo
	•	React Navigation
	•	Zustand

Database / Sync
	•	Supabase PostgreSQL
	•	Supabase Realtime

⸻

Temel Özellikler
	•	kullanıcı girişi ve oturum yönetimi
	•	masa planı ve masa durumu takibi
	•	adisyon oluşturma ve yönetme
	•	siparişe ürün ekleme
	•	kategori ve ürün listeleme
	•	nakit ödeme
	•	kart ile ödeme
	•	bölünmüş ödeme
	•	masa taşıma
	•	masa birleştirme / ayırma akışları
	•	gerçek veri okuma
	•	mobil ve web arasında ortak veri modeli

⸻

Veri Modeli

Sistem adisyon (bill) bazlı çalışır.

Ana tablolar:
	•	RestaurantTables
	•	Bills
	•	BillItems
	•	Payments
	•	Products
	•	ProductCategories
	•	Users
	•	Branches

⸻

Mimari Notlar

Mobil tarafta

Mobil uygulama:
	•	Supabase üzerinden veri okur
	•	Realtime ile güncel durumu dinler
	•	kritik işlemler için backend API kullanır

Yazma işlemleri

Aşağıdaki işlemler mobilde sadece local state ile değil, gerçek backend akışı ile çalışmalıdır:
	•	masa açma
	•	masa taşıma
	•	ödeme tamamlama
	•	ürün ekleme
	•	split payment işlemleri

Geliştirme Notları
	•	figmadesign/ sadece referans amaçlıdır
	•	mobileapp/ gerçek mobil uygulamadır
	•	backend ve web ile ortak veri modeli kullanılmaktadır
	•	mobil uygulama aktif geliştirme altındadır
	•	bazı akışlar halen stabilizasyon ve UX iyileştirme aşamasındadır

⸻

Mevcut Durum

Şu an projede:
	•	mobil uygulama çalışır durumdadır
	•	Supabase veri okuma entegrasyonu bulunmaktadır
	•	bazı write işlemleri backend entegrasyonu ile ilerlemektedir
	•	UI/UX iyileştirmeleri devam etmektedir
	•	gerçek kullanım senaryoları üzerinden hata ayıklama ve düzeltme sürmektedir

⸻

Lisans

Bu proje eğitim, demo, geliştirme ve portföy amaçlı hazırlanan bir staj projesidir.