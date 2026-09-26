import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { colors } from '../../styles/globalStyles';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getCurrentUser } from '../../services/auth';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';

const AssignmentsScreen = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        // Try multiple field name variations
        let snapshot = await getDocs(
          query(collection(db, 'assignments'), where('studentId', '==', user.uid))
        ).catch(() => null);
        
        if (!snapshot || snapshot.empty) {
          snapshot = await getDocs(
            query(collection(db, 'assignments'), where('student_id', '==', user.uid))
          ).catch(() => null);
        }
        
        if (!snapshot || snapshot.empty) {
          snapshot = await getDocs(
            query(collection(db, 'assignments'), where('studentUid', '==', user.uid))
          ).catch(() => null);
        }
        
        const data = snapshot && !snapshot.empty 
          ? snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          : [];
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (assignmentId) => {
    try {
      await updateDoc(doc(db, 'assignments', assignmentId), {
        status: 'submitted',
        submittedAt: new Date()
      });
      Alert.alert('Success', 'Assignment submitted!');
      loadAssignments();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.course}>{item.courseCode}</Text>
      <Text style={styles.due}>Due: {item.dueDate?.toDate().toDateString()}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      {item.status === 'pending' && (
        <CustomButton title="Submit" onPress={() => handleSubmit(item.id)} style={{ marginTop: 10 }} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Assignments</Text>
      <FlatList
        data={assignments}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No assignments</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light, padding: 15 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  card: { backgroundColor: colors.white, padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  title: { fontSize: 16, fontWeight: '600' },
  course: { color: colors.textMuted, marginTop: 4 },
  due: { marginTop: 5 },
  status: { fontWeight: '500', marginTop: 5 },
  empty: { textAlign: 'center', marginTop: 50, color: colors.textMuted },
});

export default AssignmentsScreen;