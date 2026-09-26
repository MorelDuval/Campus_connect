import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { colors } from '../styles/globalStyles';
import { loginUser } from '../services/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await loginUser(normalizedEmail, password, role);
      const route = role === 'student' ? 'Student' : role === 'lecturer' ? 'Lecturer' : 'Admin';
      navigation.reset({ index: 0, routes: [{ name: route }] });
    } catch (error) {
      const messages = {
        'auth/invalid-credential': 'The email or password is incorrect.',
        'auth/invalid-login-credentials': 'The email or password is incorrect.',
        'auth/user-not-found': 'No account was found with this email.',
        'auth/wrong-password': 'The password is incorrect.',
        'auth/invalid-email': 'Enter a valid university email address.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/network-request-failed': 'Check your internet connection and try again.',
        'permission-denied': 'Your account profile cannot be read. Contact an administrator.',
      };
      Alert.alert('Login Failed', messages[error.code] || error.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Text style={styles.logo}>🎓</Text>
        <Text style={styles.title}>Campus Connect</Text>
        <Text style={styles.subtitle}>University Portal</Text>
      </View>
      <View style={styles.roleContainer}>
        {['student', 'lecturer', 'admin'].map(r => (
          <TouchableOpacity key={r} style={[styles.roleButton, role === r && styles.roleButtonActive]} onPress={() => setRole(r)}>
            <Text style={[styles.roleText, role === r && styles.roleTextActive]}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput style={styles.input} placeholder="University Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.loginButtonText}>Sign In</Text>}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.white },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { fontSize: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.primary, marginTop: 10 },
  subtitle: { fontSize: 16, color: colors.textMuted },
  roleContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 25 },
  roleButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginHorizontal: 5, backgroundColor: colors.light, borderWidth: 1, borderColor: colors.border },
  roleButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleText: { color: colors.text, fontWeight: '600' },
  roleTextActive: { color: colors.white },
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 15, fontSize: 16, marginBottom: 15 },
  loginButton: { backgroundColor: colors.primary, borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 10 },
  loginButtonText: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
});

export default LoginScreen;