import React, { useState, useEffect, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, Animated, TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen     from './screens/LoginScreen';
import HomeScreen      from './screens/HomeScreen';
import ProductsScreen  from './screens/ProductsScreen';
import StocksScreen    from './screens/StocksScreen';
import TrucksScreen  from './screens/TrucksScreen';
import DriversScreen from './screens/DriversScreen';
import MovementsScreen from './screens/MovementsScreen';

// ─── TYPES ─────────────────────────────────────────────────
interface User {
  fullname: string;
  username: string;
  role: { name: string };
}

// ─── DRAWER CONTEXT ────────────────────────────────────────
const DrawerContext = createContext({ open: false, toggle: () => {}, close: () => {} });

function DrawerProvider({ children }: any) {
  const [open, setOpen] = useState(false);
  return (
    <DrawerContext.Provider value={{
      open,
      toggle: () => setOpen(v => !v),
      close:  () => setOpen(false),
    }}>
      {children}
    </DrawerContext.Provider>
  );
}

const useDrawer = () => useContext(DrawerContext);

// ─── DRAWER MENU ───────────────────────────────────────────
const DRAWER_WIDTH = 280;

function DrawerMenu({ onLogout }: any) {
  const { open, close } = useDrawer();
  const [user, setUser]       = useState<User | null>(null);
  const [visible, setVisible] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim  = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  useEffect(() => {
    if (open) setVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: open ? 0 : -DRAWER_WIDTH, duration: 280, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: open ? 1 : 0,             duration: 280, useNativeDriver: true }),
    ]).start(() => { if (!open) setVisible(false); });
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    close();
    onLogout();
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={close}>
        <Animated.View style={[d.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>
      <Animated.View style={[d.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <View style={d.userSection}>
          <View style={d.avatar}>
            <Text style={d.avatarText}>{user?.fullname?.charAt(0)?.toUpperCase() || '?'}</Text>
          </View>
          <Text style={d.userName}>{user?.fullname || 'User'}</Text>
          <Text style={d.userRole}>{user?.role?.name}</Text>
          <Text style={d.userEmail}>{user?.username}</Text>
        </View>
        <View style={d.badge}>
          <Ionicons name="eye-outline" size={14} color="#059669" />
          <Text style={d.badgeText}>Read-only mode</Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={d.footer}>
          <TouchableOpacity style={d.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            <Text style={d.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const d = StyleSheet.create({
  backdrop:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawer:      { position: 'absolute', top: 0, left: 0, bottom: 0, width: DRAWER_WIDTH, backgroundColor: '#fff', elevation: 8 },
  userSection: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, backgroundColor: '#2563eb', alignItems: 'center' },
  avatar:      { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText:  { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  userName:    { fontSize: 17, fontWeight: '700', color: '#fff' },
  userRole:    { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  userEmail:   { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  badge:       { flexDirection: 'row', alignItems: 'center', gap: 6, margin: 16, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8, borderWidth: 1, borderColor: '#86efac' },
  badgeText:   { fontSize: 13, color: '#059669', fontWeight: '600' },
  footer:      { padding: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  logoutBtn:   { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 10, backgroundColor: '#fef2f2' },
  logoutText:  { fontSize: 15, fontWeight: '600', color: '#dc2626' },
});

// ─── NAVIGATION ────────────────────────────────────────────
const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

function HamburgerButton() {
  const { toggle } = useDrawer();
  return (
    <TouchableOpacity onPress={toggle} style={{ paddingHorizontal: 16 }}>
      <Ionicons name="menu" size={26} color="#111827" />
    </TouchableOpacity>
  );
}

function TabNavigator({ onLogout }: any) {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor:   '#2563eb',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle:             { backgroundColor: '#fff', borderTopColor: '#e5e7eb', height: 60, paddingBottom: 6 },
          tabBarLabelStyle:        { fontSize: 11, fontWeight: '600' },
          headerStyle:             { backgroundColor: '#fff' },
          headerTintColor:         '#111827',
          headerTitleStyle:        { fontWeight: '700', fontSize: 18 },
          headerLeft:              () => <HamburgerButton />,
        }}>
        <Tab.Screen name="Home"      component={HomeScreen}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home-outline"            size={size} color={color} /> }} />
        <Tab.Screen name="Products"  component={ProductsScreen}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline"            size={size} color={color} /> }} />
        <Tab.Screen name="Stocks"    component={StocksScreen}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="layers-outline"          size={size} color={color} /> }} />
        <Tab.Screen name="Trucks"  component={TrucksScreen}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="car-sport-outline" size={size} color={color} /> }} />
        <Tab.Screen name="Drivers" component={DriversScreen}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
        <Tab.Screen name="Movements" component={MovementsScreen}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="swap-horizontal-outline" size={size} color={color} /> }} />
      </Tab.Navigator>
      <DrawerMenu onLogout={onLogout} />
    </View>
  );
}

function AppNavigator() {
  const [loading, setLoading]       = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('token');
    setIsLoggedIn(!!t);
    setLoading(false);
  }, []);

  if (loading) return (
  <View style={{ flex: 1, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color: 'white' }}>Loading...</Text>
  </View>
);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Main">
          {() => <TabNavigator onLogout={() => setIsLoggedIn(false)} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Login">
          {() => <LoginScreen onLogin={() => setIsLoggedIn(true)} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <DrawerProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </DrawerProvider>
  );
}