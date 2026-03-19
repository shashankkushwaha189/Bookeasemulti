# BookEase Pro v3.0 — Universal Appointment Platform

A comprehensive appointment booking system that works for ANY appointment-based business:
🏥 Healthcare · 🦷 Dental · 💇 Salon · 💆 Spa · 🏋️ Fitness · 🐾 Veterinary · 🦴 Physiotherapy · ⚖️ Legal · 📚 Coaching · 🏢 Other

## 🚀 Features

### **Multi-Role System**
- **Super Admin**: Create businesses, assign admins, oversee entire system
- **Business Admin**: Manage services, staff, and appointments for their business
- **Staff**: View personal schedule, manage appointments
- **Customer**: Browse businesses, book appointments, manage bookings

### **Core Functionality**
- ✅ **Slot Lock System**: Prevents double bookings with real-time availability
- ✅ **Multi-Business Support**: Single platform for multiple business types
- ✅ **Category-Based Organization**: Filter businesses by service type
- ✅ **Role-Based Access Control**: Secure permissions for each user type
- ✅ **Responsive Design**: Works seamlessly on desktop and mobile
- ✅ **Real-Time Updates**: Instant availability checking and booking

### **Advanced Features**
- 📊 **Analytics Dashboard**: Track appointments, customers, and revenue
- 👁️ **Password Visibility Toggle**: Eye icon for show/hide password
- 📱 **Mobile-Optimized UI**: Hamburger menu with proper spacing
- 🔐 **Secure Authentication**: JWT-based auth with role management
- 📧 **Admin Credential Management**: Super Admin can edit admin accounts
- 🎯 **Smart Slot Management**: Automatic conflict prevention

## 🛠️ Tech Stack

### **Backend**
- **Node.js** + **Express.js** - REST API server
- **PostgreSQL** + **Sequelize ORM** - Database management
- **JWT** - Authentication & authorization
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### **Frontend**
- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client for API calls
- **Vite** - Fast development build tool

## 📋 Prerequisites

- Node.js 16+ 
- PostgreSQL 12+
- npm or yarn

## 🚀 Quick Start

### 1. Database Setup
```bash
# Create PostgreSQL database
createdb bookease_pro
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env        # Configure database and JWT
npm install
npm run dev                 # Starts on http://localhost:5000
```

### 3. Database Seeding
```bash
# In a new terminal
cd backend
npm run seed                # Creates super admin account
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev                 # Starts on http://localhost:5173
```

### 5. Default Login
```
Email: superadmin@bookease.com
Password: admin123
```

## 📁 Project Structure

```
bookease-pro/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API logic
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   └── config/         # Database config
│   ├── .env.example        # Environment variables template
│   ├── package.json
│   ├── seed.js            # Database seeder
│   └── server.js          # Express server
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── routes/         # React Router config
│   │   ├── api/            # API client
│   │   ├── config/         # App configuration
│   │   └── styles/         # Global styles
│   ├── public/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Super Admin** | ✅ Create/edit/delete businesses<br>✅ Assign admin credentials<br>✅ View system-wide statistics<br>✅ Manage all users |
| **Admin** | ✅ Manage business services<br>✅ Add/remove staff members<br>✅ View/manage appointments<br>✅ Edit business details |
| **Staff** | ✅ View personal schedule<br>✅ Update appointment status<br>✅ Manage assigned appointments |
| **Customer** | ✅ Browse businesses by category<br>✅ Book appointments<br>✅ View/manage bookings<br>✅ Cancel appointments |

## 🔄 Complete Workflow

### 1. **Super Admin Setup**
1. Login as Super Admin
2. Navigate to Businesses → Create Business
3. Select business category (Healthcare, Salon, etc.)
4. Fill business details and assign admin credentials
5. Activate business

### 2. **Business Admin Setup**
1. Login as Business Admin
2. Add Services (name, duration, price)
3. Add Staff Members (name, specialization, email)
4. Configure business hours and settings

### 3. **Customer Booking**
1. Register/Login as Customer
2. Browse businesses (filter by category)
3. Select business → View services
4. Choose service → Select staff
5. Pick date → View available time slots
6. Select time → Confirm booking

### 4. **Staff Management**
1. Login as Staff member
2. View daily/weekly schedule
3. Mark appointments as completed
4. Manage customer appointments

## 🎨 Adding New Business Categories

Edit `frontend/src/config/categories.js`:

```javascript
{
  value: 'Photography',
  label: 'Photography', 
  icon: '📷',
  staffLabel: 'Photographer',
  serviceLabel: 'Session',
  color: 'yellow'
}
```

The system automatically updates:
- ✅ Category filters
- ✅ Business icons
- ✅ Staff/service labels
- ✅ Color themes

## 🔗 API Endpoints

### **Authentication**
```
POST /auth/register     # Customer registration
POST /auth/login        # User login
GET  /auth/me           # Get current user
```

### **Businesses**
```
GET    /businesses               # Public business listing
GET    /businesses/admin/all     # All businesses (Super Admin)
GET    /businesses/:id           # Business details
POST   /businesses               # Create business (Super Admin)
PUT    /businesses/:id           # Update business (Admin/Super Admin)
DELETE /businesses/:id           # Delete business (Super Admin)
```

### **Services**
```
GET    /services                # Business services (Admin)
POST   /services                # Create service (Admin)
PUT    /services/:id            # Update service (Admin)
DELETE /services/:id            # Delete service (Admin)
```

### **Staff**
```
GET    /staff                   # Business staff (Admin)
POST   /staff                   # Add staff (Admin)
PUT    /staff/:id               # Update staff (Admin)
DELETE /staff/:id               # Remove staff (Admin)
GET    /staff/my-appointments   # Staff schedule (Staff)
```

### **Appointments**
```
GET    /appointments/all           # All appointments (Super Admin)
GET    /appointments/business      # Business appointments (Admin)
GET    /appointments/my            # Customer appointments
GET    /appointments/available-slots # Check slot availability
POST   /appointments               # Book appointment (Customer)
PUT    /appointments/:id           # Update appointment
```

### **Super Admin**
```
GET    /super-admin/stats         # System statistics
GET    /super-admin/users         # All users
PUT    /super-admin/users/:id     # Update user credentials
```

## 🔧 Environment Variables

Create `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookease_pro
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173

# For production (Render/Heroku)
DATABASE_URL=postgresql://user:password@host:port/database
```

## 🚀 Deployment

### **Backend (Render/Heroku)**
1. Push code to repository
2. Connect to deployment platform
3. Set environment variables
4. Deploy and run database migrations

### **Frontend (Vercel/Netlify)**
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting platform
```

### **Database**
- **Development**: Local PostgreSQL
- **Production**: Render PostgreSQL, Heroku Postgres, or AWS RDS

## 🎯 Key Features Implemented

### **Slot Lock System**
- Real-time availability checking
- Prevents double bookings
- Visual indicators for booked slots
- Backend validation for data integrity

### **Multi-Business Support**
- Single platform for multiple businesses
- Category-based organization
- Independent business management
- Cross-business analytics

### **Security Features**
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Input validation and sanitization

### **Mobile Optimization**
- Responsive design for all screen sizes
- Touch-friendly interface
- Optimized hamburger menu
- Proper spacing and layout

### **Admin Management**
- Super Admin can edit admin credentials
- Secure password reset functionality
- User role management
- System-wide user oversight

## 🐛 Troubleshooting

### **Common Issues**

**Database Connection Error**
```bash
# Check PostgreSQL is running
pg_ctl status

# Verify database exists
psql -l

# Check .env configuration
cat backend/.env
```

**CORS Errors**
```bash
# Verify CLIENT_URL in .env matches frontend URL
# Check backend CORS configuration
```

**Authentication Issues**
```bash
# Verify JWT_SECRET is set
# Check token expiration
# Clear browser localStorage
```

**Slot Availability Issues**
```bash
# Check database for existing appointments
# Verify time slot configuration
# Check timezone settings
```

## 📞 Support

For issues and questions:
1. Check this README for solutions
2. Review the troubleshooting section
3. Check the API documentation
4. Create an issue with detailed information

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**BookEase Pro v3.0** - The Universal Appointment Platform 🚀
