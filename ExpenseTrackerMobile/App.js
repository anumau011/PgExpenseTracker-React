import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';

// Context Providers
import { GroupProvider } from './src/Context/GroupContext';
import { UserProvider } from './src/Context/CurrentUserIdContext';

// Screens
import LandingPage from './src/Components/LandingPage';
import LoginPage from './src/Components/LoginPage';
import SignUpPage from './src/Components/SignUpPage';
import GroupDashboard from './src/Components/GroupDashboard';

const Stack = createStackNavigator();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    // Request notification permissions
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    };

    requestPermissions();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <GroupProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator
              initialRouteName="Landing"
              screenOptions={{
                headerShown: false,
                gestureEnabled: false, // Disable swipe back gesture
              }}
            >
              <Stack.Screen 
                name="Landing" 
                component={LandingPage}
                options={{
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen 
                name="Login" 
                component={LoginPage}
                options={{
                  gestureEnabled: true,
                }}
              />
              <Stack.Screen 
                name="SignUp" 
                component={SignUpPage}
                options={{
                  gestureEnabled: true,
                }}
              />
              <Stack.Screen 
                name="Dashboard" 
                component={GroupDashboard}
                options={{
                  gestureEnabled: false, // Prevent going back from dashboard
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <Toast />
        </GroupProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}