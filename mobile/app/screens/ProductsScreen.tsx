import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity, Modal, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function ProductsScreen() {
  const [products, setProducts]     = useState<any[]>([]);
  const [filtered, setFiltered]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState<any>(null);

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    setFiltered(search.trim() === '' ? products : products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, products]);

  const fetchProducts = async () => {
    try { const r = await api.get('/products'); setProducts(r.data); setFiltered(r.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  if (loading) return <View style={s.centered}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <View style={s.container}>
      <View style={s.searchWrap}>
        <TextInput style={s.search} placeholder=" Search by name..." placeholderTextColor="#9ca3af"
          value={search} onChangeText={setSearch} />
      </View>
      <Text style={s.count}>{filtered.length} products</Text>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts(); }} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => setSelected(item)}>
            <View style={s.row}>
              <Text style={s.name}>{item.name}</Text>
              <Text style={s.sku}>{item.sku}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.meta}>Unit: {item.unit}</Text>
              <Text style={s.meta}>Min: {item.minimum_level}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View style={s.empty}><Text style={{ fontSize: 48 }}><Ionicons name="cube-outline" size={48} color="#9ca3af" /></Text><Text style={s.emptyText}>No products found</Text></View>}
        contentContainerStyle={{ paddingBottom: 32 }}
      />

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Product Details</Text>
              <TouchableOpacity onPress={() => setSelected(null)}><Text style={s.sheetClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView>
              {[
                { label: 'Name',        value: selected?.name },
                { label: 'SKU',         value: selected?.sku },
                { label: 'Unit',        value: selected?.unit },
                { label: 'Min Level',   value: selected?.minimum_level },
                { label: 'Description', value: selected?.description || '—' },
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
  count:       { paddingHorizontal: 16, paddingBottom: 8, fontSize: 13, color: '#6b7280' },
  card:        { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 10, elevation: 2 },
  row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name:        { fontSize: 14, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  sku:         { fontSize: 12, color: '#6b7280', backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  meta:        { fontSize: 12, color: '#6b7280' },
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