# Lab 6: Donation List (PB-102)

## Багийн гишүүд
- Driver: Г.Есүүхэй
- Navigator: Г.Ихбархасвад

## Юу хийсэн бэ?
Хандивийн жагсаалт харах функц (PB-102) - TDD аргаар хөгжүүлсэн

## Ажиллуулах

```bash
# Демо харах
node lab6/donation.js

# Тест ажиллуулах  
npm test lab6/donation.test.js
```

## Функцүүд
1. createDonation() - Шинэ хандив үүсгэх
2. getAllDonations() - Бүх хандивыг харах
3. getDonationsByStatus() - Төлөвөөр шүүх
4. getDonationById() - ID-аар хайх
5. getSortedDonations() - Эрэмбэлэх
6. getStats() - Статистик харах
7. updateDonationStatus() - Төлөв өөрчлөх

## Тестүүд
7 тест бичигдсэн - бүгд амжилттай ✅

## Git Commands

```bash
# Branch үүсгэх
git checkout -b feature/donation-list

# Commit хийх
git add lab6/
git commit -m "feat: add donation list (PB-102)"

# Push хийх
git push origin feature/donation-list
```

GitHub дээр Pull Request үүсгэх.