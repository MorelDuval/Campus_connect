import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase'; // Change to '../../config/fibase' if needed

const ManageUsersScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('Computer Science');
  const [studentId, setStudentId] = useState('');
  const [level, setLevel] = useState('100');
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in Full Name, Email, and Password');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      const userData = {
        fullName,
        email,
        role,
        department,
        createdAt: new Date(),
        status: 'active'
      };

      if (role === 'student') {
        userData.studentId = studentId || `STU${Date.now()}`;
        userData.level = level;
      }

      await setDoc(doc(db, 'users', userId), userData);
      Alert.alert('Success', `User ${fullName} created successfully!`);
      navigation.goBack(); // Go back to the user list automatically
      
    } catch (error) {
      let message = 'Failed to create user';
      if (error.code === 'auth/email-already-in-use') message = 'This email is already registered.';
      else if (error.code === 'auth/weak-password') message = 'Password must be at least 6 characters.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Add New User</Text>
        
        <TextInput style={styles.input} placeholder="Full Name *" value={fullName} onChangeText={setFullName} />
        <TextInput style={styles.input} placeholder="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password * (min 6 chars)" value={password} onChangeText={setPassword} secureTextEntry />

        <View style={styles.pickerContainer}>
          {['student', 'lecturer', 'admin'].map((r) => (
            <TouchableOpacity key={r} style={[styles.pickerOption, role === r && styles.pickerOptionSelected]} onPress={() => setRole(r)}>
              <Text style={[styles.pickerText, role === r && styles.pickerTextSelected]}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {role === 'student' && (
          <>
            <TextInput style={styles.input} placeholder="Student ID (Optional)" value={studentId} onChangeText={setStudentId} />
            <View style={styles.pickerContainer}>
              {['100', '200', '300', '400'].map((lvl) => (
                <TouchableOpacity key={lvl} style={[styles.pickerOption, level === lvl && styles.pickerOptionSelected]} onPress={() => setLevel(lvl)}>
                  <Text style={[styles.pickerText, level === lvl && styles.pickerTextSelected]}>Level {lvl}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleCreateUser} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create User</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  scrollContainer: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 15, borderWidth: 1, borderColor: '#e0e0e0', fontSize: 16, marginBottom: 12 },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  pickerOption: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  pickerOptionSelected: { backgroundColor: '#667eea', borderColor: '#667eea' },
  pickerText: { fontSize: 14, color: '#666' },
  pickerTextSelected: { color: '#fff', fontWeight: 'bold' },
  button: { backgroundColor: '#667eea', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default ManageUsersScreen;