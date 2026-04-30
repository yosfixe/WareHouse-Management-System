import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity, Modal, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  IN:         { bg: '#dcfce7', text: '#059669', border: '#86efac' },
  OUT:        { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
  TRANSFER:   { bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' },
  ADJUSTMENT: { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' },
};
const TYPES = ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'];

export default function MovementsScreen() {
  const [movements, setMovements]   = useState<any[]>([]);
  const [filtered, setFiltered]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selected, setSelected]     = useState<any>(null);

  useEffect(() => { fetchMovements(); }, []);

  useEffect(() => {
    let r = movements;
    if (search.trim()) r = r.filter(m =>
      m.stock?.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.reason?.toLowerCase().includes(search.toLowerCase()) ||
      m.driver?.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.user?.fullname?.toLowerCase().includes(search.toLowerCase())
    );
    if (typeFilter) r = r.filter(m => m.movement_type === typeFilter);
    setFiltered(r);
  }, [search, typeFilter, movements]);

  const fetchMovements = async () => {
    try {
      const r = await api.get('/stocks/movements');
      setMovements(r.data);
      setFiltered(r.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  if (loading) return <View style={s.centered}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <View style={s.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.statsRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {TYPES.map(t => {
          const c = TYPE_COLORS[t];
          return (
            <View key={t} style={[s.statChip, { backgroundColor: c.bg, borderColor: c.border }]}>
              <Text style={[s.statCount, { color: c.text }]}>{movements.filter(m => m.movement_type === t).length}</Text>
              <Text style={[s.statLabel, { color: c.text }]}>{t}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={s.searchWrap}>
        <TextInput style={s.search} placeholder="🔍 Search..." placeholderTextColor="#9ca3af" value={search} onChangeText={setSearch} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        <TouchableOpacity style={[s.chip, !typeFilter && s.chipOn]} onPress={() => setTypeFilter(null)}>
          <Text style={[s.chipTxt, !typeFilter && s.chipTxtOn]}>All</Text>
        </TouchableOpacity>
        {TYPES.map(t => {
          const on = typeFilter === t;
          const c  = TYPE_COLORS[t];
          return (
            <TouchableOpacity key={t} style={[s.chip, on && { backgroundColor: c.bg, borderColor: c.border }]} onPress={() => setTypeFilter(on ? null : t)}>
              <Text style={[s.chipTxt, on && { color: c.text }]}>{t}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={s.count}>{filtered.length} movements</Text>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMovements(); }} />}
        renderItem={({ item }) => {
          const c = TYPE_COLORS[item.movement_type] || TYPE_COLORS.ADJUSTMENT;
          return (
            <TouchableOpacity style={s.card} onPress={() => setSelected(item)}>
              <View style={s.row}>
                <View style={[s.typeBadge, { backgroundColor: c.bg, borderColor: c.border }]}>
                  <Text style={[s.typeTxt, { color: c.text }]}>{item.movement_type}</Text>
                </View>
                <Text style={s.ts}>{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'N/A'}</Text>
              </View>
              <Text style={s.name}>{item.stock?.product?.name || 'N/A'}</Text>
              <View style={s.row}>
                <Text style={s.meta}>Qty: <Text style={{ fontWeight: '700', color: '#111827' }}>{item.quantity}</Text></Text>
                {item.driver && <Text style={s.meta}><Ionicons name="car-outline" size={12} color="#6b7280" /> {item.driver.name}</Text>}
              </View>
              {item.reason ? <Text style={s.reason} numberOfLines={1}>{item.reason}</Text> : null}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<View style={s.empty}><Text style={{ fontSize: 48 }}><Ionicons name="swap-horizontal-outline" size={48} color="#9ca3af" /></Text><Text style={s.emptyText}>No movements found</Text></View>}
        contentContainerStyle={{ paddingBottom: 32 }}
      />

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Movement Details</Text>
              <TouchableOpacity onPress={() => setSelected(null)}><Text style={s.sheetClose}>✕</Text></TouchableOpacity>
            </View>
            {selected && (() => {
              const c = TYPE_COLORS[selected.movement_type] || TYPE_COLORS.ADJUSTMENT;
              return (
                <ScrollView>
                  <View style={[s.typeBadgeLg, { backgroundColor: c.bg, borderColor: c.border }]}>
                    <Text style={[s.typeTxtLg, { color: c.text }]}>{selected.movement_type}</Text>
                  </View>
                  {[
                    { label: 'Movement ID', value: `#${selected.id}` },
                    { label: 'Product',     value: selected.stock?.product?.name || 'N/A' },
                    { label: 'SKU',         value: selected.stock?.product?.sku  || 'N/A' },
                    { label: 'Quantity',    value: selected.quantity },
                    { label: 'From',        value: selected.from_location ? `${selected.from_location.code} (${selected.from_location.warehouse?.name})` : '—' },
                    { label: 'To',          value: selected.to_location   ? `${selected.to_location.code} (${selected.to_location.warehouse?.name})`     : '—' },
                    { label: 'Driver',      value: selected.driver ? `${selected.driver.name} (${selected.driver.truck?.plate || '—'})` : '—' },
                    { label: 'User',        value: selected.user?.fullname || 'N/A' },
                    { label: 'Reason',      value: selected.reason || '—' },
                    { label: 'Timestamp',   value: selected.timestamp ? new Date(selected.timestamp).toLocaleString() : 'N/A' },
                  ].map(r => (
                    <View key={r.label} style={s.detailRow}>
                      <Text style={s.detailLabel}>{r.label}</Text>
                      <Text style={s.detailValue}>{String(r.value)}</Text>
                    </View>
                  ))}
                </ScrollView>
              );
            })()}
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
  container:    { flex: 1, backgroundColor: '#f3f4f6' },
  centered:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsRow:     { marginTop: 12, marginBottom: 4 },
  statChip:     { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginRight: 8, minWidth: 80 },
  statCount:    { fontSize: 20, fontWeight: 'bold' },
  statLabel:    { fontSize: 11, fontWeight: '600', marginTop: 2 },
  searchWrap:   { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  search:       { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb' },
  chipScroll:   { marginBottom: 4 },
  chip:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 50, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', marginRight: 8 },
  chipOn:       { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipTxt:      { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  chipTxtOn:    { color: '#fff' },
  count:        { paddingHorizontal: 16, paddingBottom: 8, fontSize: 13, color: '#6b7280' },
  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 10, elevation: 2 },
  row:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  typeBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50, borderWidth: 1 },
  typeTxt:      { fontSize: 11, fontWeight: '700' },
  ts:           { fontSize: 12, color: '#9ca3af' },
  name:         { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 6 },
  meta:         { fontSize: 12, color: '#6b7280' },
  reason:       { fontSize: 12, color: '#9ca3af', fontStyle: 'italic', marginTop: 4 },
  empty:        { alignItems: 'center', padding: 40 },
  emptyText:    { fontSize: 16, color: '#6b7280', marginTop: 12 },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
  sheetHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle:   { fontSize: 18, fontWeight: '700', color: '#111827' },
  sheetClose:   { fontSize: 20, color: '#6b7280' },
  typeBadgeLg:  { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 50, borderWidth: 1, marginBottom: 16 },
  typeTxtLg:    { fontSize: 13, fontWeight: '700' },
  detailRow:    { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  detailLabel:  { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  detailValue:  { fontSize: 15, fontWeight: '600', color: '#111827' },
  btn:          { backgroundColor: '#2563eb', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  btnText:      { color: '#fff', fontSize: 15, fontWeight: '600' },
});