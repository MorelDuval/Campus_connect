import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const AdminDashboard = ({ navigation }) => {
  const parentNavigation = navigation.getParent();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>
      
      {/* Button to go to the User List */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Users')}
      >
        <Text style={styles.buttonText}>Manage Users</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#f39c12' }]}
        onPress={() => {
          if (parentNavigation) parentNavigation.navigate('ManageUsers');
          else navigation.navigate('ManageUsers');
        }}
      >
        <Text style={styles.buttonText}>Add New User</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f6fa' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2c3e50', marginBottom: 40 },
  button: { width: '100%', backgroundColor: '#667eea', padding: 18, borderRadius: 10, marginBottom: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AdminDashboard;