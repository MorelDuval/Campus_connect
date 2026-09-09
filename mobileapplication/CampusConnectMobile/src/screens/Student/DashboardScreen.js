import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../styles/globalStyles';
import { getCurrentUser } from '../../services/auth';
import { getStudentEnrollments, getStudentGrades } from '../../services/firestore';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [pendingAssignments] = useState(3); // mock
  const [gpa, setGpa] = useState('N/A');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        const courses = await getStudentEnrollments(currentUser.uid);
        setEnrollmentCount(courses.length);
        const grades = await getStudentGrades(currentUser.uid);
        if (grades.length) {
          const avg = grades.reduce((s, g) => s + (g.total || 0), 0) / grades.length;
          setGpa(avg.toFixed(2));
        }
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {user?.fullName?.split(' ')[0]}!</Text>
        <Text style={styles.subtitle}>{user?.department} | Level {user?.level}</Text>
      </View>
      <View style={styles.statsGrid}>
        <StatCard icon="📚" value={enrollmentCount} label="Enrolled" color={colors.info} />
        <StatCard icon="⏳" value={pendingAssignments} label="Pending" color={colors.warning} />
        <StatCard icon="📊" value={gpa} label="GPA" color={colors.success} />
        <StatCard icon="📅" value="85%" label="Attendance" color={colors.secondary} />
      </View>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Registration')}>
          <Text style={styles.actionIcon}>📝</Text><Text style={styles.actionText}>Register{'\n'}Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Timetable')}>
          <Text style={styles.actionIcon}>🕐</Text><Text style={styles.actionText}>View{'\n'}Timetable</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Assignments')}>
          <Text style={styles.actionIcon}>📤</Text><Text style={styles.actionText}>Submit{'\n'}Assignment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Fees')}>
          <Text style={styles.actionIcon}>💳</Text><Text style={styles.actionText}>Pay{'\n'}Fees</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light },
  header: { padding: 20, backgroundColor: colors.primary },
  greeting: { fontSize: 24, fontWeight: 'bold', color: colors.white },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', margin: 15 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  actionCard: { width: '45%', backgroundColor: colors.white, borderRadius: 10, padding: 20, margin: '2.5%', alignItems: 'center', elevation: 3 },
  actionIcon: { fontSize: 30 },
  actionText: { textAlign: 'center', marginTop: 10, fontWeight: '600' },
});

export default DashboardScreen;