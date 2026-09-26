import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../styles/globalStyles';
import { getCurrentUser } from '../../services/auth';
import { getStudentEnrollments, getCoursesByIds } from '../../services/firestore';
import LoadingSpinner from '../../components/LoadingSpinner';

const { width } = Dimensions.get('window');
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = ['8:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'];

const TimetableScreen = () => {
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    const user = await getCurrentUser();
    if (user) {
      const courseIds = await getStudentEnrollments(user.uid);
      const courses = await getCoursesByIds(courseIds);
      const schedule = {};
      courses.forEach(course => {
        const slots = course.schedule?.split(', ') || [];
        slots.forEach(slot => {
          const [day, time] = slot.split(' ');
          if (day && time) {
            if (!schedule[day]) schedule[day] = [];
            schedule[day].push({ ...course, time });
          }
        });
      });
      setTimetable(schedule);
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>My Timetable</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={styles.timeCell}><Text style={styles.cellText}>Time</Text></View>
            {days.map(day => (
              <View key={day} style={styles.dayCell}>
                <Text style={styles.cellText}>{day.substring(0,3)}</Text>
              </View>
            ))}
          </View>
          {timeSlots.map(slot => (
            <View key={slot} style={styles.row}>
              <View style={styles.timeCell}><Text style={styles.cellText}>{slot}</Text></View>
              {days.map(day => {
                const courses = timetable[day]?.filter(c => c.time === slot);
                return (
                  <View key={day} style={styles.cell}>
                    {courses?.map((course, i) => (
                      <View key={i} style={styles.courseBlock}>
                        <Text style={styles.courseCode}>{course.code}</Text>
                        <Text style={styles.courseVenue}>{course.venue}</Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light },
  header: { fontSize: 22, fontWeight: 'bold', padding: 15 },
  table: { marginHorizontal: 10 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.border },
  timeCell: { width: 80, padding: 10, justifyContent: 'center', borderRightWidth: 1, borderColor: colors.border },
  dayCell: { width: 120, padding: 10, alignItems: 'center', backgroundColor: colors.primary, borderRightWidth: 1, borderColor: colors.border },
  cell: { width: 120, minHeight: 60, padding: 5, borderRightWidth: 1, borderColor: colors.border },
  cellText: { fontWeight: '600', color: colors.white },
  courseBlock: { backgroundColor: '#e8f0fe', borderRadius: 5, padding: 4, marginBottom: 2 },
  courseCode: { fontSize: 12, fontWeight: 'bold', color: colors.primary },
  courseVenue: { fontSize: 10 },
});

export default TimetableScreen;