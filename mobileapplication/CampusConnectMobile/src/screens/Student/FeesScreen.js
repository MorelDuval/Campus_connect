import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { colors } from '../../styles/globalStyles';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getCurrentUser } from '../../services/auth';
import LoadingSpinner from '../../components/LoadingSpinner';

const FeesScreen = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        // Try multiple field name variations
        let snapshot = await getDocs(
          query(collection(db, 'payments'), where('studentId', '==', user.uid))
        ).catch(() => null);
        
        if (!snapshot || snapshot.empty) {
          snapshot = await getDocs(
            query(collection(db, 'payments'), where('student_id', '==', user.uid))
          ).catch(() => null);
        }
        
        if (!snapshot || snapshot.empty) {
          snapshot = await getDocs(
            query(collection(db, 'payments'), where('studentUid', '==', user.uid))
          ).catch(() => null);
        }
        
        const data = snapshot && !snapshot.empty
          ? snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          : [];
        setPayments(data);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Fee Payments</Text>
      {payments.length === 0 ? (
        <Text style={styles.empty}>No payment records</Text>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.type}>{item.type} Fee</Text>
              <Text style={styles.amount}>{item.amount} FCFA</Text>
              <Text style={[styles.status, { color: item.status === 'completed' ? colors.success : colors.warning }]}>
                {item.status}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light, padding: 15 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  card: { backgroundColor: colors.white, padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  type: { fontWeight: '600', fontSize: 16 },
  amount: { marginTop: 5, fontSize: 15 },
  status: { marginTop: 5, textTransform: 'capitalize' },
  empty: { textAlign: 'center', marginTop: 50, color: colors.textMuted },
});

export default FeesScreen;