import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { getCurrentUser } from '../../services/auth';
import { getStudentEnrollments, getCoursesByIds } from '../../services/firestore';
import CourseCard from '../../components/CourseCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors } from '../../styles/globalStyles';

const CoursesScreen = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const courseIds = await getStudentEnrollments(user.uid);
          if (courseIds && courseIds.length > 0) {
            const enrolled = await getCoursesByIds(courseIds);
            setCourses(enrolled || []);
          } else {
            setCourses([]);
          }
        }
      } catch (error) {
        console.error('Error loading courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Courses</Text>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.code}>{item.code}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.details}>{item.schedule} | {item.venue}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No enrolled courses</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light, padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  card: { backgroundColor: colors.white, padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  code: { fontWeight: 'bold', color: colors.primary, fontSize: 16 },
  name: { fontSize: 15, marginTop: 5 },
  details: { color: colors.textMuted, marginTop: 3 },
  empty: { textAlign: 'center', marginTop: 50, color: colors.textMuted },
});

export default CoursesScreen;