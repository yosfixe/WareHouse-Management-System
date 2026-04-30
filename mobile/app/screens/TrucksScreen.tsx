import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity, Modal, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function TrucksScreen() {
  const [trucks, setTrucks]         = useState<any[]>([]);
  const [filtered, setFiltered]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState<any>(null);

  useEffect(() => { fetchTrucks(); }, []);

  useEffect(() => {
    setFiltered(search.trim() === '' ? trucks : trucks.filter(t =>
      t.plate?.toLowerCase().includes(search.toLowerCase()) ||
      t.model?.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, trucks]);

  const fetchTrucks = async () => {
    try { const r = await api.get('/trucks'); setTrucks(r.data); setFiltered(r.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  if (loading) return <View style={s.centered}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <View style={s.container}>
      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={16} color="#9ca3af" style={s.searchIcon} />
        <TextInput style={s.search} placeholder="Search by plate or model..."
          placeholderTextColor="#9ca3af" value={search} onChangeText={setSearch} />
      </View>
      <Text style={s.count}>{filtered.length} trucks</Text>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTrucks(); }} />}
        renderItem={({ item }) => {
          const inUse = item.status === 'In Use';
          return (
            <TouchableOpacity style={s.card} onPress={() => setSelected(item)}>
              <View style={s.cardHeader}>
                <View style={s.iconWrap}>
                  <Ionicons name="car-sport-outline" size={24} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.plate}>{item.plate}</Text>
                  <Text style={s.model}>{item.model}</Text>
                </View>
                <View style={[s.badge, inUse ? s.badgeInUse : s.badgeStandby]}>
                  <Text style={[s.badgeTxt, inUse ? s.badgeTxtInUse : s.badgeTxtStandby]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <View style={s.cardFooter}>
                <Ionicons name="speedometer-outline" size={13} color="#6b7280" />
                <Text style={s.meta}>Capacity: {item.capacity}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="car-sport-outline" size={48} color="#9ca3af" />
            <Text style={s.emptyText}>No trucks found</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Truck Details</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Ionicons name="close-outline" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {[
                { label: 'Plate',    value: selected?.plate },
                { label: 'Model',    value: selected?.model },
                { label: 'Capacity', value: selected?.capacity },
                { label: 'Status',   value: selected?.status },
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
  container:    { flex: 1, backgroundColor: '#f3f4f6' },
  centered:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchWrap:   { flexDirection: 'row', alignItems: 'center', margin: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12 },
  searchIcon:   { marginRight: 8 },
  search:       { flex: 1, padding: 12, fontSize: 14, color: '#111827' },
  count:        { paddingHorizontal: 16, paddingBottom: 8, fontSize: 13, color: '#6b7280' },
  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 10, elevation: 2 },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconWrap:     { width: 44, height: 44, borderRadius: 10, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  plate:        { fontSize: 15, fontWeight: '700', color: '#111827' },
  model:        { fontSize: 12, color: '#6b7280', marginTop: 2 },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50 },
  badgeInUse:   { backgroundColor: '#dbeafe' },
  badgeStandby: { backgroundColor: '#dcfce7' },
  badgeTxt:     { fontSize: 11, fontWeight: '700' },
  badgeTxtInUse:   { color: '#2563eb' },
  badgeTxtStandby: { color: '#059669' },
  cardFooter:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta:         { fontSize: 12, color: '#6b7280' },
  empty:        { alignItems: 'center', padding: 40, gap: 12 },
  emptyText:    { fontSize: 16, color: '#6b7280' },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '80%' },
  sheetHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle:   { fontSize: 18, fontWeight: '700', color: '#111827' },
  detailRow:    { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  detailLabel:  { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  detailValue:  { fontSize: 15, fontWeight: '600', color: '#111827' },
  btn:          { backgroundColor: '#2563eb', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  btnText:      { color: '#fff', fontSize: 15, fontWeight: '600' },
});