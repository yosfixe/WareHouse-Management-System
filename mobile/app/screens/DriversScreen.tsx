import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity, Modal, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function DriversScreen() {
  const [drivers, setDrivers]       = useState<any[]>([]);
  const [filtered, setFiltered]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState<any>(null);

  useEffect(() => { fetchDrivers(); }, []);

  useEffect(() => {
    setFiltered(search.trim() === '' ? drivers : drivers.filter(d =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.phone?.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, drivers]);

  const fetchDrivers = async () => {
    try { const r = await api.get('/drivers'); setDrivers(r.data); setFiltered(r.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  if (loading) return <View style={s.centered}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <View style={s.container}>
      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={16} color="#9ca3af" style={s.searchIcon} />
        <TextInput style={s.search} placeholder="Search by name or phone..."
          placeholderTextColor="#9ca3af" value={search} onChangeText={setSearch} />
      </View>
      <Text style={s.count}>{filtered.length} drivers</Text>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDrivers(); }} />}
        renderItem={({ item }) => {
          const onDuty = item.status === 'On Duty';
          return (
            <TouchableOpacity style={s.card} onPress={() => setSelected(item)}>
              <View style={s.cardHeader}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{item.name?.charAt(0)?.toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <View style={s.phoneRow}>
                    <Ionicons name="call-outline" size={12} color="#6b7280" />
                    <Text style={s.phone}>{item.phone}</Text>
                  </View>
                </View>
                <View style={[s.badge, onDuty ? s.badgeOnDuty : s.badgeStandby]}>
                  <Text style={[s.badgeTxt, onDuty ? s.badgeTxtOnDuty : s.badgeTxtStandby]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              {item.truck && (
                <View style={s.truckRow}>
                  <Ionicons name="car-sport-outline" size={13} color="#6b7280" />
                  <Text style={s.meta}>{item.truck.plate} — {item.truck.model}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="person-outline" size={48} color="#9ca3af" />
            <Text style={s.emptyText}>No drivers found</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Driver Details</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Ionicons name="close-outline" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {[
                { label: 'Name',       value: selected?.name },
                { label: 'Phone',      value: selected?.phone },
                { label: 'Status',     value: selected?.status },
                { label: 'Truck',      value: selected?.truck ? `${selected.truck.plate} — ${selected.truck.model}` : '—' },
                { label: 'Capacity',   value: selected?.truck?.capacity ?? '—' },
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
  container:       { flex: 1, backgroundColor: '#f3f4f6' },
  centered:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchWrap:      { flexDirection: 'row', alignItems: 'center', margin: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12 },
  searchIcon:      { marginRight: 8 },
  search:          { flex: 1, padding: 12, fontSize: 14, color: '#111827' },
  count:           { paddingHorizontal: 16, paddingBottom: 8, fontSize: 13, color: '#6b7280' },
  card:            { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 10, elevation: 2 },
  cardHeader:      { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar:          { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText:      { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  name:            { fontSize: 15, fontWeight: '700', color: '#111827' },
  phoneRow:        { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  phone:           { fontSize: 12, color: '#6b7280' },
  badge:           { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50 },
  badgeOnDuty:     { backgroundColor: '#dbeafe' },
  badgeStandby:    { backgroundColor: '#dcfce7' },
  badgeTxt:        { fontSize: 11, fontWeight: '700' },
  badgeTxtOnDuty:  { color: '#2563eb' },
  badgeTxtStandby: { color: '#059669' },
  truckRow:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta:            { fontSize: 12, color: '#6b7280' },
  empty:           { alignItems: 'center', padding: 40, gap: 12 },
  emptyText:       { fontSize: 16, color: '#6b7280' },
  overlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:           { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '80%' },
  sheetHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle:      { fontSize: 18, fontWeight: '700', color: '#111827' },
  detailRow:       { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  detailLabel:     { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  detailValue:     { fontSize: 15, fontWeight: '600', color: '#111827' },
  btn:             { backgroundColor: '#2563eb', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  btnText:         { color: '#fff', fontSize: 15, fontWeight: '600' },
});