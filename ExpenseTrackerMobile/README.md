# PG Expense Tracker Mobile App

A React Native Expo mobile application for tracking group expenses, converted from the original React web application.

## Features

- **User Authentication**: Login and signup functionality
- **Group Management**: Create, join, and manage expense groups
- **Expense Tracking**: Add, view, and delete expenses
- **Member Management**: View group members and their spending
- **Real-time Updates**: Automatic refresh of expense data
- **Cross-platform**: Works on both iOS and Android

## Installation

1. **Install dependencies**:
   ```bash
   cd ExpenseTrackerMobile
   npm install
   ```

2. **Configure API URL**:
   Update the `API_BASE_URL` in `src/Utils/api.js` with your backend URL:
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.com';
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on device/simulator**:
   - For iOS: `npm run ios`
   - For Android: `npm run android`
   - For web: `npm run web`

## Key Differences from Web Version

### Navigation
- Uses React Navigation instead of React Router
- Stack navigation with gesture controls disabled for dashboard
- Modal presentations for forms

### Storage
- AsyncStorage instead of localStorage
- Async/await patterns for storage operations

### UI Components
- Native components (View, Text, TouchableOpacity, etc.)
- Linear gradients using expo-linear-gradient
- Vector icons using @expo/vector-icons
- Toast notifications using react-native-toast-message

### Platform-specific Features
- Native keyboard handling
- Pull-to-refresh functionality
- Platform-specific styling
- Safe area handling

## Project Structure

```
ExpenseTrackerMobile/
├── src/
│   ├── Components/
│   │   ├── LandingPage.js
│   │   ├── LoginPage.js
│   │   ├── SignUpPage.js
│   │   ├── GroupDashboard.js
│   │   ├── ExpenseList.js
│   │   ├── MemberList.js
│   │   ├── AddExpenseModal.js
│   │   ├── CreateGroupModal.js
│   │   └── JoinGroupModal.js
│   ├── Context/
│   │   ├── CurrentUserIdContext.js
│   │   └── GroupContext.js
│   └── Utils/
│       ├── api.js
│       └── Calculation.js
├── App.js
├── app.json
└── package.json
```

## Backend Compatibility

The mobile app uses the same backend API endpoints as the web version:
- `/auth/login` - User authentication
- `/auth/register` - User registration
- `/pg/create-group` - Create expense group
- `/pg/join-group` - Join expense group
- `/pg/my-groups` - Get user's groups
- `/pg/addExpenseToGroups` - Add expense
- `/pg/delete/expense/:id` - Delete expense

## Configuration

### API Configuration
Update `src/Utils/api.js` with your backend URL.

### App Configuration
Modify `app.json` for:
- App name and slug
- Icons and splash screen
- Platform-specific settings
- Notification permissions

## Building for Production

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

## Key Features Maintained

1. **Same Routes**: All navigation flows preserved
2. **Backend Integration**: No changes to API calls
3. **User Experience**: Dashboard remains accessible until manual navigation
4. **Data Persistence**: User sessions and group selections maintained
5. **Real-time Updates**: Expense and group data synchronization

## Notes

- The app prevents users from accidentally navigating back from the dashboard
- All modals and forms use native mobile UI patterns
- Responsive design adapts to different screen sizes
- Toast notifications provide user feedback
- Pull-to-refresh functionality for data updates