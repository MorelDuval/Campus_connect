import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Platform } from 'react-native';
import { colors } from '../../styles/globalStyles';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { BarChart } from 'react-native-chart-kit';
import LoadingSpinner from '../../components/LoadingSpinner';

const ReportsScreen = () => {
  const [stats, setStats] = useState(null);
  const screenWidth = Dimensions.get('window').width - 30;

  useEffect(() => {
    (async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const students = usersSnap.docs.filter(d => d.data().role === 'student').length;
        const lecturers = usersSnap.docs.filter(d => d.data().role === 'lecturer').length;

        const coursesSnap = await getDocs(collection(db, 'courses'));
        const paymentsSnap = await getDocs(collection(db, 'payments'));
        const revenue = paymentsSnap.docs
          .filter(d => d.data().status === 'completed')
          .reduce((sum, d) => sum + (d.data().amount || 0), 0);

        setStats({ students, lecturers, courses: coursesSnap.size, revenue });
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

    if (!stats) return <LoadingSpinner />;

  // Ensure we have numbers
  const studentCount = stats.students || 0;
  const lecturerCount = stats.lecturers || 0;
  const courseCount = stats.courses || 0;
  const totalCount = studentCount + lecturerCount + courseCount;

  const chartData = {
    labels: ['Students', 'Lecturers', 'Courses'],
    datasets: [{ data: [studentCount, lecturerCount, courseCount] }],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>System Reports</Text>

      <View style={styles.statRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{studentCount}</Text>
          <Text>Students</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{lecturerCount}</Text>
          <Text>Lecturers</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{courseCount}</Text>
          <Text>Courses</Text>
        </View>
      </View>

      <Text style={styles.revenue}>Revenue: {(stats.revenue || 0).toLocaleString()} FCFA</Text>

      {totalCount > 0 ? (
        Platform.OS === 'web' ? (
          <View style={styles.chartFallback}>
            <Text style={styles.chartFallbackText}>Graph preview is unavailable on web.</Text>
            <Text style={styles.chartFallbackText}>Students: {studentCount}</Text>
            <Text style={styles.chartFallbackText}>Lecturers: {lecturerCount}</Text>
            <Text style={styles.chartFallbackText}>Courses: {courseCount}</Text>
          </View>
        ) : (
          <BarChart
            data={chartData}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero
            chartConfig={{
              backgroundColor: colors.white,
              backgroundGradientFrom: colors.white,
              backgroundGradientTo: colors.white,
              decimalCount: 0,
              color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
              labelColor: () => colors.dark,
            }}
            style={styles.chart}
          />
        )
      ) : (
        <Text style={styles.noData}>No data to display chart</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.dark,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.dark,
  },
  revenue: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: colors.dark,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  noData: {
    textAlign: 'center',
    color: colors.dark,
    marginTop: 20,
  },
  chartFallback: {
    backgroundColor: '#f2f2f2',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  chartFallbackText: {
    color: colors.dark,
    fontSize: 16,
    marginBottom: 8,
  },
});

export default ReportsScreen;