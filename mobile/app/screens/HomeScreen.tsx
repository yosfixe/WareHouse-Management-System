import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

interface User {
  fullname: string;
  role: { name: string };
}

interface Stats {
  counts: { products: number; warehouses: number; locations: number; stocks: number; users: number };
  alerts: { low_stock_products: number; expiring_stock: number };
  warehouse_utilization: { utilization_percentage: number; total_capacity: number; total_used: number };
  warehouses: any[];
}

export default function HomeScreen() {
  const [stats, setStats]           = useState<Stats | null>(null);
  const [stocks, setStocks]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser]             = useState<User | null>(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashRes, stockRes] = await Promise.all([api.get('/dashboard'), api.get('/stocks')]);
      setStats(dashRes.data);
      setStocks(stockRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const lowStockItems = stocks.filter(s => s.quantity < (s.product?.minimum_level || 0));
  const utilization   = stats?.warehouse_utilization?.utilization_percentage || 0;

  if (loading) return (
    <View style={s.centered}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={s.loadingText}>Loading dashboard...</Text>
    </View>
  );

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}>

      <View style={s.welcomeCard}>
        <Text style={s.welcomeGreeting}>Welcome back,</Text>
        <Text style={s.welcomeName}>{user?.fullname || 'User'}</Text>
        <Text style={s.welcomeRole}>{user?.role?.name}</Text>
      </View>

      <Text style={s.sectionTitle}>Overview</Text>
      <View style={s.statsGrid}>
        {[
          { label: 'Products',   value: stats?.counts?.products,   color: '#2563eb' },
          { label: 'Warehouses', value: stats?.counts?.warehouses, color: '#7c3aed' },
          { label: 'Locations',  value: stats?.counts?.locations,  color: '#059669' },
          { label: 'Stocks',     value: stats?.counts?.stocks,     color: '#d97706' },
        ].map(c => (
          <View key={c.label} style={[s.statCard, { borderLeftColor: c.color }]}>
            <Text style={s.statLabel}>{c.label}</Text>
            <Text style={[s.statValue, { color: c.color }]}>{c.value ?? '-'}</Text>
          </View>
        ))}
      </View>

      <Text style={s.sectionTitle}>Storage Utilization</Text>
      <View style={s.card}>
        <View style={s.row}>
          <Text style={s.cardLabel}>Overall Capacity Used</Text>
          <Text style={s.pct}>{utilization}%</Text>
        </View>
        <View style={s.progressBar}>
          <View style={[s.progressFill, {
            width: `${Math.min(utilization, 100)}%`,
            backgroundColor: utilization >= 90 ? '#ef4444' : utilization >= 70 ? '#f59e0b' : '#10b981',
          }]} />
        </View>
        <View style={s.row}>
          <Text style={s.cardSub}>Total: {stats?.warehouse_utilization?.total_capacity?.toLocaleString()}</Text>
          <Text style={s.cardSub}>Used: {stats?.warehouse_utilization?.total_used?.toLocaleString()}</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>Alerts</Text>
      <View style={s.alertsRow}>
        {[
          { icon: <Ionicons name="warning-outline" size={16} color="#f59e0b" />, value: stats?.alerts?.low_stock_products || 0, label: 'Low Stock', bg: '#fef3c7', border: '#f59e0b' },
          { icon: <Ionicons name="time-outline" size={16} color="#ef4444" />, value: stats?.alerts?.expiring_stock     || 0, label: 'Expiring',  bg: '#fee2e2', border: '#ef4444' },
          { icon: <Ionicons name="people-outline" size={16} color="#10b981" />, value: stats?.counts?.users              || 0, label: 'Users',     bg: '#dcfce7', border: '#10b981' },
        ].map(a => (
          <View key={a.label} style={[s.alertCard, { backgroundColor: a.bg, borderColor: a.border }]}>
            <Text style={s.alertIcon}>{a.icon}</Text>
            <Text style={s.alertValue}>{a.value}</Text>
            <Text style={s.alertLabel}>{a.label}</Text>
          </View>
        ))}
      </View>

      {lowStockItems.length > 0 && (
        <>
          <Text style={s.sectionTitle}><Ionicons name="warning-outline" size={16} color="#f59e0b" /> Low Stock Items</Text>
          {lowStockItems.slice(0, 5).map((stock: any) => (
            <View key={stock.id} style={s.lowStockItem}>
              <View style={{ flex: 1 }}>
                <Text style={s.lowStockName}>{stock.product?.name}</Text>
                <Text style={s.lowStockLoc}>{stock.location?.code} — {stock.location?.warehouse?.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.lowStockQty}>{stock.quantity}</Text>
                <Text style={s.lowStockMin}>min: {stock.product?.minimum_level}</Text>
              </View>
            </View>
          ))}
          {lowStockItems.length > 5 && <Text style={s.moreText}>+{lowStockItems.length - 5} more</Text>}
        </>
      )}

      <Text style={s.sectionTitle}>Warehouses</Text>
      {(stats?.warehouses || []).map((w: any) => {
        const util  = w.capacity > 0 ? ((w.current_size / w.capacity) * 100).toFixed(1) : 0;
        const color = Number(util) >= 90 ? '#ef4444' : Number(util) >= 70 ? '#f59e0b' : Number(util) >= 40 ? '#3b82f6' : '#10b981';
        return (
          <View key={w.id} style={s.warehouseCard}>
            <View style={s.row}>
              <Text style={s.warehouseName}>{w.name}</Text>
              <Text style={[s.pct, { color }]}>{util}%</Text>
            </View>
            <Text style={s.warehouseAddr}>{w.address}</Text>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: `${Math.min(Number(util), 100)}%`, backgroundColor: color }]} />
            </View>
            <View style={s.row}>
              <Text style={s.cardSub}>Capacity: {parseInt(w.capacity).toLocaleString()}</Text>
              <Text style={s.cardSub}>Used: {parseInt(w.current_size).toLocaleString()}</Text>
            </View>
          </View>
        );
      })}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f3f4f6' },
  centered:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:     { marginTop: 12, color: '#6b7280', fontSize: 14 },
  welcomeCard:     { margin: 16, backgroundColor: '#2563eb', borderRadius: 16, padding: 20 },
  welcomeGreeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  welcomeName:     { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  welcomeRole:     { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  sectionTitle:    { fontSize: 16, fontWeight: '700', color: '#111827', marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  statsGrid:       { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  statCard:        { backgroundColor: '#fff', borderRadius: 12, padding: 16, margin: 4, width: '46%', borderLeftWidth: 4, elevation: 2 },
  statLabel:       { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  statValue:       { fontSize: 28, fontWeight: 'bold' },
  card:            { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 16, elevation: 2 },
  row:             { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardLabel:       { fontSize: 14, color: '#374151', fontWeight: '600' },
  cardSub:         { fontSize: 12, color: '#6b7280' },
  pct:             { fontSize: 14, fontWeight: 'bold', color: '#2563eb' },
  progressBar:     { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill:    { height: '100%', borderRadius: 4 },
  alertsRow:       { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  alertCard:       { flex: 1, borderRadius: 12, padding: 14, borderWidth: 1, alignItems: 'center' },
  alertIcon:       { fontSize: 20, marginBottom: 4 },
  alertValue:      { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  alertLabel:      { fontSize: 11, color: '#6b7280', marginTop: 2, textAlign: 'center' },
  lowStockItem:    { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginHorizontal: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#f59e0b' },
  lowStockName:    { fontSize: 13, fontWeight: '600', color: '#111827' },
  lowStockLoc:     { fontSize: 12, color: '#6b7280', marginTop: 2 },
  lowStockQty:     { fontSize: 20, fontWeight: 'bold', color: '#f59e0b' },
  lowStockMin:     { fontSize: 11, color: '#9ca3af' },
  moreText:        { textAlign: 'center', color: '#6b7280', fontSize: 13, marginVertical: 8 },
  warehouseCard:   { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 10, elevation: 2 },
  warehouseName:   { fontSize: 14, fontWeight: '700', color: '#111827' },
  warehouseAddr:   { fontSize: 12, color: '#6b7280', marginBottom: 10 },
});