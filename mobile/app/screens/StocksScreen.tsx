import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity, Modal, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function StocksScreen() {
  const [stocks, setStocks]         = useState<any[]>([]);
  const [filtered, setFiltered]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState<any>(null);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [activeWH, setActiveWH]     = useState<number | null>(null);

  useEffect(() => { fetchStocks(); }, []);

  useEffect(() => {
    const map: Record<number, any> = {};
    stocks.forEach(s => { const w = s.location?.warehouse; if (w && !map[w.id]) map[w.id] = w; });
    setWarehouses(Object.values(map));
  }, [stocks]);

  useEffect(() => {
    let r = stocks;
    if (search.trim()) r = r.filter(s =>
      s.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.location?.code?.toLowerCase().includes(search.toLowerCase()) ||
      s.location?.warehouse?.name?.toLowerCase().includes(search.toLowerCase())
    );
    if (activeWH) r = r.filter(s => s.location?.warehouse?.id === activeWH);
    setFiltered(r);
  }, [search, activeWH, stocks]);

  const fetchStocks = async () => {
    try { const r = await api.get('/stocks'); setStocks(r.data); setFiltered(r.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  if (loading) return <View style={s.centered}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <View style={s.container}>
      <View style={s.searchWrap}>
        <TextInput style={s.search} placeholder="Search..." placeholderTextColor="#9ca3af"
          value={search} onChangeText={setSearch} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        <TouchableOpacity style={[s.chip, !activeWH && s.chipOn]} onPress={() => setActiveWH(null)}>
          <Text style={[s.chipTxt, !activeWH && s.chipTxtOn]}>All</Text>
        </TouchableOpacity>
        {warehouses.map(w => (
          <TouchableOpacity key={w.id} style={[s.chip, activeWH === w.id && s.chipOn]} onPress={() => setActiveWH(activeWH === w.id ? null : w.id)}>
            <Text style={[s.chipTxt, activeWH === w.id && s.chipTxtOn]}>{w.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={s.count}>{filtered.length} stock entries</Text>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStocks(); }} />}
        renderItem={({ item }) => {
          const isLow = item.quantity < (item.product?.minimum_level || 0);
          return (
            <TouchableOpacity style={[s.card, isLow && s.cardLow]} onPress={() => setSelected(item)}>
              <View style={s.row}>
                <Text style={s.name}>{item.product?.name || 'N/A'}</Text>
                <View style={[s.badge, isLow ? s.badgeLow : s.badgeOk]}>
                  <Text style={[s.badgeTxt, isLow ? s.badgeTxtLow : s.badgeTxtOk]}>{isLow ? 'Low' : 'OK'}</Text>
                </View>
              </View>
              <Text style={s.meta}><Ionicons name="location-outline" size={12} color="#6b7280" /> {item.location?.code} — {item.location?.warehouse?.name}</Text>
              <View style={s.row}>
                <Text style={[s.qty, isLow && { color: '#f59e0b' }]}>{item.quantity}</Text>
                <Text style={s.meta}>min: {item.product?.minimum_level}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<View style={s.empty}><Text style={{ fontSize: 48 }}><Ionicons name="layers-outline" size={48} color="#9ca3af" /></Text><Text style={s.emptyText}>No stocks found</Text></View>}
        contentContainerStyle={{ paddingBottom: 32 }}
      />

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Stock Details</Text>
              <TouchableOpacity onPress={() => setSelected(null)}><Text style={s.sheetClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView>
              {[
                { label: 'Stock ID',  value: `#${selected?.id}` },
                { label: 'Product',   value: selected?.product?.name },
                { label: 'SKU',       value: selected?.product?.sku },
                { label: 'Quantity',  value: selected?.quantity },
                { label: 'Location',  value: selected?.location?.code },
                { label: 'Warehouse', value: selected?.location?.warehouse?.name },
                { label: 'Min Level', value: selected?.product?.minimum_level },
              ].map(r => (
                <View key={r.label} style={s.detailRow}>
                  <Text style={s.detailLabel}>{r.label}</Text>
                  <Text style={s.detailValue}>{String(r.value ?? '—')}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={s.btn} onPress={() => setSelected(null)}>
              <Text style={s.btnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f3f4f6' },
  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchWrap:  { padding: 16, paddingBottom: 8 },
  search:      { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb' },
  chipScroll:  { marginBottom: 8 },
  chip:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 50, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', marginRight: 8 },
  chipOn:      { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipTxt:     { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  chipTxtOn:   { color: '#fff' },
  count:       { paddingHorizontal: 16, paddingBottom: 8, fontSize: 13, color: '#6b7280' },
  card:        { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 10, elevation: 2 },
  cardLow:     { borderLeftWidth: 4, borderLeftColor: '#f59e0b' },
  row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name:        { fontSize: 14, fontWeight: '700', color: '#111827', flex: 1 },
  badge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50 },
  badgeOk:     { backgroundColor: '#dcfce7' },
  badgeLow:    { backgroundColor: '#fef3c7' },
  badgeTxt:    { fontSize: 11, fontWeight: '700' },
  badgeTxtOk:  { color: '#059669' },
  badgeTxtLow: { color: '#d97706' },
  meta:        { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  qty:         { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  empty:       { alignItems: 'center', padding: 40 },
  emptyText:   { fontSize: 16, color: '#6b7280', marginTop: 12 },
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '80%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle:  { fontSize: 18, fontWeight: '700', color: '#111827' },
  sheetClose:  { fontSize: 20, color: '#6b7280' },
  detailRow:   { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  detailLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: '600', color: '#111827' },
  btn:         { backgroundColor: '#2563eb', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  btnText:     { color: '#fff', fontSize: 15, fontWeight: '600' },
});