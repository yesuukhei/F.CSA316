# Лаб 9: Алдаа боловсруулалт (Error Handling)

## Зорилго

1. Custom алдааны классууд үүсгэх
2. Алдааны мэдээллийг зөв боловсруулах
3. Лог хийх систем ашиглах

## Файлууд

- `exceptions/` - Алдааны классууд (AppError, ValidationError, NotFoundError)
- `utils/logger.js` - Лог хийх систем
- `services/DonationService.js` - Үйлчилгээний давхарга
- `donation.js` - Хандивын систем (custom алдаа ашиглана)

## Алдааны классууд

- **AppError** - Үндсэн класс (statusCode, details)
- **ValidationError** - Баталгаажуулалтын алдаа (400)
- **NotFoundError** - Олдсонгүй алдаа (404)
- **DatabaseError** - Өгөгдлийн сангийн алдаа (500)

## Лог хийх

- Алдааны мэдээллийг `logs/app-YYYY-MM-DD.log` файлд хадгална
- `logger.info()`, `logger.error()` ашиглана

## Service Layer

`DonationService` - Бизнес логикийг тусгаарлана, алдаа боловсруулна

## Хэрэглэх

```bash
# Код ажиллуулах
node lab9/donation.js

# Тест ажиллуулах
npm test -- lab9
```

## Жишээ

```javascript
const { ValidationError } = require("./lab9/exceptions");

try {
  createDonation({ title: "", description: "Test", ... });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Алдаа: ${error.message}`);
    console.log(`Статус код: ${error.statusCode}`);
  }
}
```
