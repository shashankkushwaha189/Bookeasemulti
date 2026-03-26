# BookEase Mobile App

A React Native + Expo mobile application for the BookEase appointment booking system.

## Features

- **Multi-role Support**: Customer, Admin, Staff, and Super Admin roles
- **Authentication**: Secure login and registration system
- **Business Browsing**: Discover and browse businesses by category
- **Appointment Booking**: Complete booking flow with service selection, staff selection, and time slot booking
- **Appointment Management**: View, manage, and cancel appointments
- **Real-time Updates**: Live appointment status and availability
- **Responsive Design**: Optimized for mobile devices

## Tech Stack

- **React Native** with **Expo**
- **React Navigation** for navigation
- **Axios** for API communication
- **AsyncStorage** for local data persistence
- **React Native Paper** for UI components
- **React Native Vector Icons** for icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bookease-pro/mobile
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Update .env with your backend URL
EXPO_PUBLIC_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

5. Run the app:
- For Android: `npm run android`
- For iOS: `npm run ios`
- For web: `npm run web`

## Project Structure

```
mobile/
├── src/
│   ├── api/           # API configuration and endpoints
│   ├── contexts/      # React contexts (Auth, etc.)
│   ├── navigation/    # Navigation configuration
│   ├── screens/       # Screen components
│   │   ├── auth/      # Authentication screens
│   │   ├── customer/  # Customer-specific screens
│   │   ├── admin/     # Admin-specific screens
│   │   ├── staff/     # Staff-specific screens
│   │   └── super-admin/ # Super Admin screens
│   └── config/        # Configuration files
├── App.js             # Main app component
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## API Integration

The mobile app uses the same backend as the web application. Ensure your backend server is running and update the `EXPO_PUBLIC_API_URL` in your `.env` file.

### Endpoints Used

- **Authentication**: `/auth/login`, `/auth/register`, `/auth/me`
- **Businesses**: `/businesses`, `/businesses/:id`, `/businesses/:id/services`, `/businesses/:id/staff`
- **Appointments**: `/appointments/my`, `/appointments`, `/appointments/available-slots`
- **Services**: `/services`
- **Staff**: `/staff`

## User Roles

### Customer
- Browse businesses
- Book appointments
- View and manage appointments
- Cancel appointments

### Admin
- Manage services
- Manage staff
- View appointments
- Business analytics

### Staff
- View schedule
- Manage appointments
- Customer information

### Super Admin
- Manage all businesses
- User management
- System analytics

## Development Notes

### State Management
- Uses React Context for authentication
- Local state for screen-specific data
- AsyncStorage for token persistence

### Navigation
- Tab navigation for main app sections
- Stack navigation for modal flows
- Role-based navigation rendering

### Styling
- StyleSheet API for component styling
- Consistent color scheme and spacing
- Responsive design patterns

## Building for Production

1. Create a production build:
```bash
expo build:android
expo build:ios
```

2. Or use EAS Build:
```bash
eas build --platform android
eas build --platform ios
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **Network errors**: Ensure backend is running and accessible
3. **Authentication issues**: Check token storage and API headers

### Debugging

- Use Expo DevTools for debugging
- Console logging for API responses
- React DevTools for component inspection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
