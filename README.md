# RestaurantPOS

VakıfBank markalı restoran adisyon, masa yönetimi ve POS ödeme uygulaması.

Bu proje, restoran ve kafe işletmeleri için geliştirilmiş bir yönetim sistemidir. Uygulama; masa takibi, adisyon yönetimi, ürün/mutfak akışı, ödeme alma, POS entegrasyonu, işlem geçmişi ve raporlama gibi süreçleri tek bir yapı altında toplar.

## Proje Yapısı

```text
RestaurantPOS/
├── backend/          # ASP.NET Core Web API
├── public/           # Statik frontend dosyaları
├── src/              # React frontend
├── package.json
├── vite.config.ts
├── README.md
└── .gitignore

Kullanılan Teknolojiler

Frontend
	•	React
	•	TypeScript
	•	Vite
	•	Tailwind CSS

Backend
	•	ASP.NET Core Web API
	•	Entity Framework Core
	•	PostgreSQL
	•	Supabase
	•	JWT Authentication
	•	Swagger / OpenAPI

Özellikler
	•	Kullanıcı girişi ve rol bazlı erişim
	•	Masa yönetimi
	•	Adisyon oluşturma ve düzenleme
	•	Ürün ve kategori yönetimi
	•	Menü yönetimi
	•	POS terminal yönetimi
	•	Nakit / kart / bölünmüş ödeme
	•	İade / iptal işlemleri
	•	İşlem geçmişi
	•	Gün sonu mutabakat
	•	Raporlama ekranları
	•	Rol ve yetki matrisi

Roller
	•	Garson
	•	Kasiyer
	•	Şube Müdürü
	•	Sistem Yöneticisi

Veritabanı

Backend, PostgreSQL provider ile çalışır ve Supabase Session Pooler üzerinden bağlanır.

Demo Giriş Bilgileri

Şube kodu: 8547293

Kullanıcılar:
	•	admin / Admin123!
	•	mudur / Mudur123!
	•	kasiyer / Kasiyer123!
	•	ahmet / Ahmet123!
	•	ayse / Ayse123!


Geliştirme Durumu

Bu proje aktif geliştirme altındadır. Bazı modüller demo/PoC seviyesinden gerçek kullanım senaryosuna geçirilmektedir.

Lisans

Bu proje eğitim, demo ve geliştirme amaçlı hazırlanmıştır.
