import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../styles/globalStyles';
import { getCurrentUser } from '../../services/auth';
import { getLecturerCourses, getStudentsInCourse } from '../../services/firestore';
import LoadingSpinner from '../../components/LoadingSpinner';

const MyCoursesScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (user) {
        const coursesData = await getLecturerCourses(user.uid, user.email, user.fullName);
        // Attach student count for each course
        const enriched = await Promise.all(coursesData.map(async (course) => {
          const students = await getStudentsInCourse(course.id);
          return { ...course, studentCount: students.length };
        }));
        setCourses(enriched);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Courses</Text>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No courses found for your account.</Text>
            <Text style={styles.emptySubtext}>Check that your lecturer assignment is present in course records.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Grades', { courseId: item.id, courseCode: item.code })}
          >
            <Text style={styles.code}>{item.code} - {item.name}</Text>
            <Text style={styles.details}>{item.studentCount} students enrolled</Text>
            <Text style={styles.schedule}>{item.schedule}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light, padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  card: { backgroundColor: colors.white, padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  code: { fontWeight: 'bold', fontSize: 16 },
  details: { color: colors.textMuted, marginTop: 5 },
  schedule: { marginTop: 5 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: colors.dark },
  emptySubtext: { textAlign: 'center', color: colors.textMuted },
});

export default MyCoursesScreen;