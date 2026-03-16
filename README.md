# BookEase Pro v3.0 — Universal Appointment Platform

Works for ANY appointment-based business:
🏥 Healthcare · 🦷 Dental · 💇 Salon · 💆 Spa · 🏋️ Fitness · 🐾 Veterinary · 🦴 Physiotherapy · ⚖️ Legal · 📚 Coaching · 🏢 Other

## Quick Start

```bash
# 1. Create database
createdb bookease_pro

# 2. Backend
cd backend
cp .env.example .env        # fill in DB creds + JWT_SECRET
npm install
npm run dev                 # starts on http://localhost:5000

# 3. Seed (new terminal)
cd backend
npm run seed

# 4. Frontend
cd frontend
npm install
npm run dev                 # starts on http://localhost:5173
```

Login: superadmin@bookease.com / admin123

---

## Roles

| Role | Access |
|------|--------|
| SUPER_ADMIN | Create businesses of any category, assign admins, view all stats |
| ADMIN | Manage own business: services, staff, appointments |
| STAFF | View own schedule, mark appointments done |
| CUSTOMER | Browse all businesses by category, book appointments |

---

## Setup Flow

1. **Super Admin** → Login → Businesses → Create business (pick category) → assign admin email/password
2. **Admin** → Login → Add services → Add staff
3. **Customer** → Register → Browse (filter by category) → Select business → Book (service → staff → date/time → confirm)
4. **Staff** → Login → View schedule → Mark completed

---

## Adding a New Category

Edit one file: `frontend/src/config/categories.js`

```js
{ value: 'Photography', label: 'Photography', icon: '📷', staffLabel: 'Photographer', serviceLabel: 'Session', color: 'yellow' },
```

That's it. The icon, labels, and filters update everywhere automatically.

---

## API Endpoints

```
POST /auth/register
POST /auth/login
GET  /auth/me

GET    /businesses               All active businesses (public)
GET    /businesses/admin/all     All businesses with stats (SUPER_ADMIN)
GET    /businesses/:id           Business + services + staff
POST   /businesses               Create business (SUPER_ADMIN)
PUT    /businesses/:id           Update (SUPER_ADMIN)
DELETE /businesses/:id           Delete (SUPER_ADMIN)

GET/POST/PUT/DELETE /services    Admin's business services
GET/POST/PUT/DELETE /staff       Admin's business staff
GET  /staff/my-appointments      Staff's own schedule

GET  /appointments/all           All system appointments (SUPER_ADMIN)
GET  /appointments/business      Business appointments (ADMIN)
GET  /appointments/my            Customer's appointments
POST /appointments               Book appointment (CUSTOMER)
PUT  /appointments/:id           Update/cancel

GET  /super-admin/stats          System-wide stats
GET  /super-admin/users          All users
```
