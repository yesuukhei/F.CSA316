# Лаб 11: Веб Хэрэглэгчийн Интерфейс

## Зорилго

1. Веб хэрэглэгчийн интерфейс хөгжүүлэх
2. Express.js сервер ашиглан REST API үүсгэх
3. HTML/CSS/JavaScript ашиглан орчин үеийн веб интерфейс хийх
4. Lab10-ийн нэвтрэх системийг веб дээр ашиглах

## Файлууд

- `server.js` - Express.js веб сервер (REST API)
- `public/index.html` - Үндсэн HTML хуудас
- `public/css/style.css` - Стиль, дизайн
- `public/js/app.js` - Frontend JavaScript код
- `readme.md` - Баримт бичиг

## Системийн бүтэц

### Backend (server.js)

Express.js сервер нь дараах API endpoint-уудыг агуулна:

#### `POST /api/register`

- Хэрэглэгч бүртгүүлэх
- Body: `{ username, password, email? }`
- Response: `{ success, message, user }`

#### `POST /api/login`

- Хэрэглэгч нэвтрэх
- Body: `{ username, password }`
- Response: `{ success, message, user, sessionId }`

#### `POST /api/logout`

- Хэрэглэгч гарах
- Body: `{ sessionId }`
- Response: `{ success, message }`

#### `GET /api/history/:userId?sessionId=...`

- Нэвтрэх түүх авах
- Query: `sessionId` (шаардлагатай)
- Response: `{ success, history }`

#### `GET /api/user?sessionId=...`

- Одоогийн хэрэглэгчийн мэдээлэл авах
- Query: `sessionId` (шаардлагатай)
- Response: `{ success, user }`

### Frontend

#### HTML (index.html)

- Нэвтрэх хуудас
- Бүртгүүлэх хуудас
- Нэвтрэх түүх хуудас
- Навигацийн цэс
- Хэрэглэгчийн мэдээлэл

#### CSS (style.css)

- Орчин үеийн, responsive дизайн
- Gradient background
- Card-based layout
- Animation эффектүүд
- Mobile-friendly

#### JavaScript (app.js)

- API дуудлага
- Хуудас солих (SPA-style)
- Session удирдлага
- Форм боловсруулалт
- Алдааны мэдээлэл харуулах

## Хэрэглэх

### Суулгах

```bash
# Express.js аль хэдийн суусан байна
# Хэрэв суусан бол:
npm install express
```

### Сервер ажиллуулах

```bash
node lab11/server.js
```

Сервер `http://localhost:3000` дээр ажиллана.

### Хөтөч дээр нээх

Веб хөтөч дээр дараах хаягийг нээнэ:

```
http://localhost:3000
```

## Функцууд

### 1. Бүртгүүлэх

- Хэрэглэгчийн нэр (мин 3 тэмдэгт)
- Нууц үг (мин 6 тэмдэгт)
- Имэйл (сонголттой)
- Баталгаажуулалт
- Амжилттай бол нэвтрэх хуудас руу шилжинэ

### 2. Нэвтрэх

- Хэрэглэгчийн нэр, нууц үг оруулах
- Session үүсгэх
- Амжилттай бол нэвтрэх түүх хуудас руу шилжинэ
- Хэрэглэгчийн мэдээлэл харагдана

### 3. Нэвтрэх Түүх

- Бүх нэвтрэх оролдлогуудыг харах
- Амжилттай/амжилтгүй статус
- Огноо, цаг
- Зөвхөн нэвтэрсэн хэрэглэгч харна

### 4. Гарах

- Session устгах
- Нэвтрэх хуудас руу буцах

## Дизайн

- **Орчин үеийн дизайн**: Gradient background, card-based layout
- **Responsive**: Mobile болон desktop дээр ажиллана
- **Animation**: Smooth transitions, fade effects
- **Color scheme**: Blue primary color, clean white cards
- **User-friendly**: Тодорхой алдааны мэдээлэл, амжилтын мэдэгдэл

## Технологи

### Backend

- **Express.js** - Веб сервер
- **Lab10 AuthService** - Нэвтрэх системийн логик
- **Session management** - In-memory session storage

### Frontend

- **HTML5** - Semantic markup
- **CSS3** - Modern styling, flexbox, animations
- **Vanilla JavaScript** - No frameworks, pure JS
- **Fetch API** - API дуудлага

## Session Management

Одоогийн байдлаар session-ууд memory дээр хадгалагдана (Map ашиглан).

Production дээр ашиглахдаа:

- Redis ашиглах
- JWT tokens ашиглах
- Cookie-based sessions

## Алдаа боловсруулалт

- API алдаануудыг зөв боловсруулна
- Хэрэглэгчид ойлгомжтой алдааны мэдээлэл харуулна
- Network алдаануудыг шалгана
- Validation алдаануудыг харуулна

## Жишээ

### API дуудлага (JavaScript)

```javascript
// Нэвтрэх
const response = await fetch("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "test", password: "password123" }),
});
const result = await response.json();
```

### Бүртгүүлэх

```javascript
// Бүртгүүлэх
const response = await fetch("/api/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "newuser",
    password: "password123",
    email: "user@example.com",
  }),
});
```

## Хувилбар

- v1.0.0 - Анхны хувилбар (Лаб 11)

## Тэмдэглэл

- Сервер ажиллуулахад lab10-ийн өгөгдлийн сан ашиглана
- Session-ууд сервер restart хийхэд алдагдана (in-memory storage)
- Production дээр HTTPS ашиглах шаардлагатай
- CORS тохиргоо хийх шаардлагатай бол (frontend тусдаа сервер дээр байвал)

## Дараагийн алхамууд

- JWT token authentication
- Password reset функц
- Email verification
- Remember me функц
- Better session management (Redis)
- Unit tests for API endpoints
