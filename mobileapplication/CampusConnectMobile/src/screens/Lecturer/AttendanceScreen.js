import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../styles/globalStyles';
import { getCurrentUser } from '../../services/auth';
import { getLecturerCourses, getStudentsInCourse } from '../../services/firestore';
import { db } from '../../config/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const AttendanceScreen = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (user) {
        const coursesData = await getLecturerCourses(user.uid, user.email, user.fullName);
        setCourses(coursesData);
      }
    })();
  }, []);

  const loadStudents = async (courseId) => {
    const studentsData = await getStudentsInCourse(courseId);
    setStudents(studentsData);
    setSelectedCourse(courseId);
    const initialMap = {};
    studentsData.forEach(s => { initialMap[s.id] = 'present'; });
    setAttendanceMap(initialMap);
  };

  const toggleStatus = (studentId) => {
    const newMap = { ...attendanceMap };
    newMap[studentId] = newMap[studentId] === 'present' ? 'absent' : 'present';
    setAttendanceMap(newMap);
  };

  const saveAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];
    for (const [studentId, status] of Object.entries(attendanceMap)) {
      await addDoc(collection(db, 'attendance'), {
        studentId,
        courseId: selectedCourse,
        date: today,
        status,
        markedAt: new Date()
      });
    }
    Alert.alert('Saved', 'Attendance recorded');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance</Text>
      {!selectedCourse ? (
        <FlatList
          data={courses}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No courses available for attendance.</Text>
              <Text style={styles.emptySubtext}>If you are assigned to courses, check the lecturer field names in course records.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.courseCard} onPress={() => loadStudents(item.id)}>
              <Text style={styles.courseCode}>{item.code} - {item.name}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <>
          <FlatList
            data={students}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No students are enrolled in this course.</Text>
                <Text style={styles.emptySubtext}>Students may not yet have registered or enrollment records may use a different course field name.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.studentRow} onPress={() => toggleStatus(item.id)}>
                <Text>{item.fullName}</Text>
                <Text style={{ color: attendanceMap[item.id] === 'present' ? colors.success : colors.danger }}>
                  {attendanceMap[item.id]}
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveAttendance}>
            <Text style={styles.saveText}>Save Attendance</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: colors.light },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  courseCard: { padding: 15, backgroundColor: colors.white, borderRadius: 8, marginBottom: 10, elevation: 2 },
  courseCode: { fontWeight: '600' },
  studentRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: colors.white, marginBottom: 5, borderRadius: 5 },
  saveButton: { backgroundColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveText: { color: colors.white, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: colors.dark },
  emptySubtext: { textAlign: 'center', color: colors.textMuted },
});

export default AttendanceScreen;