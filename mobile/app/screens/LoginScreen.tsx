import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

interface Props {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async () => {
    if (!username || !password) { setError('Please enter username and password'); return; }
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <View style={s.logo}>
            <Ionicons name="layers" size={48} color="#2563eb" />
            <Text style={s.logoText}>Overstok</Text>
            <Text style={s.logoSub}>Warehouse Management System</Text>
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}

          <Text style={s.label}>Username</Text>
          <TextInput style={s.input} placeholder="Enter your username" placeholderTextColor="#9ca3af"
            value={username} onChangeText={setUsername} autoCapitalize="none" />

          <Text style={s.label}>Password</Text>
          <TextInput style={s.input} placeholder="Enter your password" placeholderTextColor="#9ca3af"
            value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity style={s.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Login</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f3f4f6' },
  scroll:     { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card:       { backgroundColor: '#fff', borderRadius: 16, padding: 28, elevation: 4 },
  logo:       { alignItems: 'center', marginBottom: 32 },
  logoIcon:   { fontSize: 48 },
  logoText:   { fontSize: 28, fontWeight: 'bold', color: '#111827', marginTop: 8 },
  logoSub:    { fontSize: 13, color: '#6b7280', marginTop: 4 },
  error:      { color: '#dc2626', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  label:      { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input:      { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 14, color: '#111827', marginBottom: 16, backgroundColor: '#f9fafb' },
  button:     { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});