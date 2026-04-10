🍽️ RestaurantPOS

🇹🇷 Türkçe

RestaurantPOS, restoran ve kafe işletmeleri için geliştirilmiş uçtan uca adisyon, masa yönetimi ve POS ödeme sistemidir.

Proje; web tabanlı yönetim paneli, mobil garson uygulaması ve .NET backend altyapısı ile birlikte çalışan modern bir restoran otomasyon çözümüdür.

⸻

🚀 Proje Amacı

RestaurantPOS’un amacı:
	•	Restoran operasyonlarını dijitalleştirmek
	•	Garson, kasiyer ve yönetici süreçlerini hızlandırmak
	•	Hataları azaltmak ve veri doğruluğunu artırmak
	•	Gerçek zamanlı (realtime) sistem ile tüm cihazları senkronize çalıştırmak

	RestaurantPOS/
├── backend/                 # ASP.NET Core Web API (Business Logic & API)
├── src/                    # React Web POS (Frontend)
├── public/                 # Statik dosyalar
├── mobileapp/              # React Native (Expo) Garson Uygulaması
├── figmadesign/            # UI mockup & referans tasarımlar (runtime değil)
├── package.json
├── vite.config.ts
├── README.md
└── .gitignore

📱 Mobile App (Garson Uygulaması)

mobileapp/ klasörü, gerçek React Native garson el terminali uygulamasını içerir.

figmadesign/ → sadece referans
mobileapp/   → gerçek uygulama

figmadesign/:
	•	UI taslakları
	•	ekran akışları
	•	tasarım referansları

Production kodu değildir.

⸻

🏗️ Sistem Mimarisi

Backend
	•	ASP.NET Core Web API
	•	Entity Framework Core
	•	PostgreSQL (Supabase)

Frontend (Web)
	•	React
	•	TypeScript
	•	Vite
	•	Tailwind CSS

Mobile (Garson Uygulaması)
	•	React Native (Expo)
	•	React Navigation
	•	Zustand (state management)
	•	Supabase Realtime

⸻

🧠 Veri Modeli (Core Domain)

Sistem adisyon (bill) tabanlı çalışır:
	•	RestaurantTables → masa durumu
	•	Bills → aktif adisyon
	•	BillItems → sipariş kalemleri
	•	Payments → ödeme kayıtları

⸻

🔄 Realtime Senkronizasyon

Mobil ve web uygulama aynı veri üzerinde çalışır:
	•	Masa aç/kapat → anlık güncellenir
	•	Sipariş ekleme → tüm cihazlara yansır
	•	Ödeme → realtime update

Kullanılan teknoloji:
	•	Supabase Realtime

⸻

💳 Ödeme Sistemi

Desteklenen ödeme tipleri:
	•	Nakit ödeme
	•	Kart ile ödeme (POS simülasyonu)
	•	Bölünmüş ödeme (Split Payment)

Split Payment
	•	Aynı adisyon için birden fazla ödeme
	•	SplitPaymentGroupId ile gruplanır

⸻

👥 Roller
	•	Garson
	•	Kasiyer
	•	Şube Müdürü
	•	Sistem Yöneticisi

⸻

⚙️ Özellikler
	•	Kullanıcı girişi ve rol yönetimi
	•	Masa yönetimi
	•	Adisyon oluşturma
	•	Ürün & kategori yönetimi
	•	Menü yönetimi
	•	POS terminal entegrasyonu
	•	Nakit / kart / split ödeme
	•	İade / iptal işlemleri
	•	Gün sonu işlemleri
	•	Raporlama
	•	Yetki matrisi

⸻

🔐 Kimlik Doğrulama
	•	JWT Authentication
	•	Role-based authorization

📌 Geliştirme Durumu

Proje aktif geliştirme altındadır:
	•	Web POS büyük ölçüde tamamlandı
	•	Mobile app geliştirme ve stabilizasyon aşamasında
	•	Backend modüler genişlemeye açık

⸻

📜 Lisans

Bu proje eğitim, demo ve geliştirme amaçlı hazırlanmıştır.

⸻
