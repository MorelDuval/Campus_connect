import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { colors } from '../../styles/globalStyles';
import { getCurrentUser } from '../../services/auth';
import { getStudentGrades } from '../../services/firestore';
import LoadingSpinner from '../../components/LoadingSpinner';

const GradesScreen = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (user) {
        const data = await getStudentGrades(user.uid);
        setGrades(data);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Grades</Text>
      {grades.length === 0 ? (
        <Text style={styles.empty}>No grades published yet</Text>
      ) : (
        <FlatList
          data={grades}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.course}>{item.courseId}</Text>
              <Text>CA: {item.caScore} | Exam: {item.examScore}</Text>
              <Text style={styles.total}>Total: {item.total} – Grade: {item.grade}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: colors.light },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  card: { backgroundColor: colors.white, padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  course: { fontWeight: 'bold', fontSize: 16 },
  total: { marginTop: 5, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 50, color: colors.textMuted },
});

export default GradesScreen;