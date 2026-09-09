import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { colors } from '../../styles/globalStyles';
import { getAvailableCourses, getStudentEnrollments, registerForCourse } from '../../services/firestore';
import { getCurrentUser } from '../../services/auth';
import CourseCard from '../../components/CourseCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const RegistrationScreen = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setError(null);
      const user = await getCurrentUser();
      const allCourses = await getAvailableCourses();
      setCourses(allCourses);
      if (user) {
        const enrolled = await getStudentEnrollments(user.uid);
        setEnrolledIds(enrolled);
      }
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Failed to load courses. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleRegister = async (courseId) => {
    try {
      const user = await getCurrentUser();
      await registerForCourse(user.uid, courseId);
      setEnrolledIds([...enrolledIds, courseId]);
      Alert.alert('Success', 'Registered for course');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Course Registration</Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            isEnrolled={enrolledIds.includes(item.id)}
            onRegister={handleRegister}
            onDrop={() => {}} // Add drop functionality if needed
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No courses available</Text>
            <Text style={styles.emptySubtext}>Courses for this semester have not been added yet.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        contentContainerStyle={courses.length === 0 ? styles.emptyList : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  errorBox: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark,
  },
  emptySubtext: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
});

export default RegistrationScreen;