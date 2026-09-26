import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, 
  StyleSheet, Alert, RefreshControl, Platform 
} from 'react-native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase'; // Change to '../../config/fibase' if needed

const UserManagementScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  // Load users from Firebase
  const loadUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = querySnapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data()
      }));
      setUsers(userList);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setDeletingUserId(null);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Function to delete a user
  const deleteUser = async (userId, fullName) => {
    const confirmDelete = Platform.OS === 'web'
      ? window.confirm(`Delete ${fullName}?`)
      : await new Promise((resolve) => {
          Alert.alert(
            'Delete User',
            `Are you sure you want to delete ${fullName}?`,
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
            ],
          );
        });

    if (!confirmDelete) return;

    setDeletingUserId(userId);
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      Alert.alert('Deleted', `${fullName} has been deleted.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.userName}>{item.fullName}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>Role: {item.role}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.deleteBtn, deletingUserId === item.id && styles.deleteBtnDisabled]} 
        onPress={() => deleteUser(item.id, item.fullName)}
        disabled={deletingUserId === item.id}
      >
        <Text style={styles.deleteBtnText}>{deletingUserId === item.id ? 'Deleting...' : 'Delete'}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={{ marginTop: 10 }}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Add Button */}
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => navigation.navigate('ManageUsers')}
        >
          <Text style={styles.addBtnText}>+ Add User</Text>
        </TouchableOpacity>
      </View>

      {/* User List */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadUsers(); }} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: '#999' }}>No users found.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  addBtn: { backgroundColor: '#667eea', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  userItem: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#666', marginVertical: 2 },
  userRole: { fontSize: 12, color: '#999' },
  deleteBtn: { backgroundColor: '#e74c3c', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  deleteBtnDisabled: { backgroundColor: '#c0392b' },
  deleteBtnText: { color: '#fff', fontSize: 12 },
});

export default UserManagementScreen;