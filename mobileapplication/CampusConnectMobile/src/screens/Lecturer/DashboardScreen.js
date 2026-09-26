import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../styles/globalStyles';
import { getCurrentUser } from '../../services/auth';
import { getLecturerCourses } from '../../services/firestore';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const LecturerDashboard = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [courseCount, setCourseCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        const courses = await getLecturerCourses(currentUser.uid, currentUser.email, currentUser.fullName);
        setCourseCount(courses.length);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {user?.fullName?.split(' ')[0]}!</Text>
        <Text style={styles.role}>Lecturer</Text>
      </View>
      <View style={styles.statsGrid}>
        <StatCard icon="📚" value={courseCount} label="My Courses" color={colors.info} />
        <StatCard icon="👥" value="..." label="Students" color={colors.success} />
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Courses')}>
          <Text style={styles.actionText}>View Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.attendanceButton]} onPress={() => navigation.navigate('Attendance')}>
          <Text style={styles.actionText}>Take Attendance</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light },
  header: { padding: 20, backgroundColor: colors.primary },
  greeting: { fontSize: 24, fontWeight: 'bold', color: colors.white },
  role: { color: 'rgba(255,255,255,0.8)' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10 },
  actions: { padding: 20 },
  actionButton: { backgroundColor: colors.primary, padding: 15, borderRadius: 10, marginBottom: 12, alignItems: 'center' },
  attendanceButton: { backgroundColor: colors.success },
  actionText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
});

export default LecturerDashboard;