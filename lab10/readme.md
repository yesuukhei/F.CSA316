# Лаб 10: Нэвтрэх систем - Мэдээллийн сантай интеграц

## Зорилго

1. Нэвтрэх систем хөгжүүлэх - Хэрэглэгчийн бүртгэл, нэвтрэх, гарах
2. SQLite мэдээллийн сантай интеграц хийх
3. Нэвтрэх түүх хадгалах - Хэрэглэгчийн нэвтрэх оролдлогын түүх
4. Интеграци тест бичих - Бүх системийн бүрэлдэхүүн хэсгүүд хамтдаа зөв ажиллаж байгааг шалгах

## Файлууд

- `database.js` - SQLite өгөгдлийн сангийн модуль
- `services/AuthService.js` - Нэвтрэх системийн үйлчилгээ
- `auth.js` - Үндсэн програм (цэс, интеграци тест)
- `auth.integration.test.js` - Интеграци тестүүд
- `data/auth.db` - Өгөгдлийн сангийн файл (автоматаар үүснэ)

## Системийн бүтэц

### Өгөгдлийн сангийн схем

#### users хүснэгт

- `id` - INTEGER PRIMARY KEY AUTOINCREMENT
- `username` - TEXT UNIQUE NOT NULL
- `password_hash` - TEXT NOT NULL
- `email` - TEXT
- `created_at` - TEXT NOT NULL DEFAULT (datetime('now'))

#### login_history хүснэгт

- `id` - INTEGER PRIMARY KEY AUTOINCREMENT
- `user_id` - INTEGER NOT NULL (FOREIGN KEY)
- `login_time` - TEXT NOT NULL DEFAULT (datetime('now'))
- `success` - INTEGER NOT NULL DEFAULT 1 (1 = амжилттай, 0 = амжилтгүй)
- `ip_address` - TEXT

#### logout_history хүснэгт

- `id` - INTEGER PRIMARY KEY AUTOINCREMENT
- `user_id` - INTEGER NOT NULL (FOREIGN KEY)
- `logout_time` - TEXT NOT NULL DEFAULT (datetime('now'))

## Үндсэн функцууд

### AuthService

#### `register(username, password, email)`

- Хэрэглэгч бүртгүүлэх
- Нууц үгийг hash хийх (crypto.pbkdf2Sync)
- Баталгаажуулалт: хэрэглэгчийн нэр (мин 3 тэмдэгт), нууц үг (мин 6 тэмдэгт), имэйл формат
- Дубликат хэрэглэгчийн нэрийг шалгах

#### `login(username, password, ipAddress)`

- Хэрэглэгч нэвтрэх
- Нууц үгийг шалгах
- Нэвтрэх оролдлогыг түүхэнд бүртгэх (амжилттай/амжилтгүй)

#### `logout(userId)`

- Хэрэглэгч гарах
- Гарах түүхийг бүртгэх

#### `getLoginHistory(userId)`

- Хэрэглэгчийн нэвтрэх түүхийг авах
- Амжилттай/амжилтгүй оролдлогуудыг харуулах

#### `getUserByUsername(username)`

- Хэрэглэгчийг нэрээр нь олох

## Алдаа боловсруулалт

Систем нь lab9-ийн алдааны классуудыг ашиглана:

- `ValidationError` - Баталгаажуулалтын алдаа (400)
- `NotFoundError` - Олдсонгүй алдаа (404)
- `DatabaseError` - Өгөгдлийн сангийн алдаа (500)

## Лог хийх

Бүх үйлдлүүд `lab9/utils/logger.js` ашиглан лог хийгдэнэ:

- Хэрэглэгч бүртгэгдсэн
- Нэвтрэх оролдлого
- Гарах
- Алдаа гарсан тохиолдол

## Хэрэглэх

### Программ ажиллуулах

```bash
node lab10/auth.js
```

Программ ажиллуулахад:

1. Эхлээд интеграци тестүүд автоматаар ажиллана
2. Дараа нь үндсэн цэс гарч ирнэ

### Цэсний сонголтууд

1. **Бүртгүүлэх (Register)** - Шинэ хэрэглэгч бүртгүүлэх
2. **Нэвтрэх (Login)** - Бүртгэлтэй хэрэглэгч нэвтрэх
3. **Нэвтрэх түүх харах (View Login History)** - Нэвтрэх оролдлогын түүх
4. **Гарах (Logout)** - Нэвтэрсэн хэрэглэгч гарах
5. **Программ дуусгах (Exit)** - Программ хаах

### Тест ажиллуулах

```bash
npm test -- lab10
```

Эсвэл тодорхой тест файл:

```bash
npm test -- lab10/auth.integration.test.js
```

## Интеграци тестүүд

Тестүүд дараах сценариудыг шалгана:

1. **Бүрэн хэрэглэгчийн урсгал** - Бүртгүүлэх → Нэвтрэх → Түүх харах → Гарах
2. **Бүртгэл** - Хүчинтэй өгөгдөл, алдааны тохиолдлууд
3. **Нэвтрэх** - Зөв/буруу нууц үг, олдохгүй хэрэглэгч
4. **Нэвтрэх түүх** - Түүх авах, хоосон түүх
5. **Гарах** - Амжилттай гарах
6. **Өгөгдлийн сангийн үйлдлүүд** - Хадгалах, унших
7. **Алдаа боловсруулалт** - ValidationError, NotFoundError
8. **Нууц үгийн аюулгүй байдал** - Hash хийх, шалгах

## Жишээ

### Хэрэглэгч бүртгүүлэх

```javascript
const AuthService = require("./services/AuthService");

const authService = new AuthService();
authService.initialize();

try {
  const user = authService.register(
    "testuser",
    "password123",
    "test@example.com"
  );
  console.log(`Бүртгэгдлээ: ${user.username} (ID: ${user.id})`);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Алдаа: ${error.message}`);
  }
}
```

### Нэвтрэх

```javascript
try {
  const user = authService.login("testuser", "password123");
  console.log(`Нэвтэрлээ: ${user.username}`);
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log("Хэрэглэгч олдсонгүй");
  } else if (error instanceof ValidationError) {
    console.log("Нууц үг буруу");
  }
}
```

### Нэвтрэх түүх

```javascript
const history = authService.getLoginHistory(userId);
history.forEach((entry) => {
  console.log(
    `${entry.loginTime} - ${entry.success ? "Амжилттай" : "Амжилтгүй"}`
  );
});
```

## Технологи

- **Node.js** - Үндсэн платформ
- **better-sqlite3** - SQLite өгөгдлийн сан
- **crypto** - Нууц үг hash хийх (pbkdf2)
- **readline** - Хэрэглэгчийн оролт унших
- **Jest** - Тест ажиллуулах

## Хувилбар

- v1.0.0 - Анхны хувилбар (Лаб 10)

## Тэмдэглэл

- Өгөгдлийн сангийн файл `lab10/data/auth.db` байрлалд үүснэ
- Тест өгөгдлийн сангууд тест дууссаны дараа автоматаар устгагдана
- Бүх логууд `lab9/logs/` хавтаст хадгалагдана
