import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { colors } from '../../styles/globalStyles';
import { getStudentsInCourse } from '../../services/firestore';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';

const GradeEntryScreen = ({ route }) => {
  const courseId = route.params?.courseId;
  const courseCode = route.params?.courseCode;
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});

  useEffect(() => {
    (async () => {
      const studentsData = await getStudentsInCourse(courseId);
      setStudents(studentsData);
      // Initialize empty scores
      const initialScores = {};
      studentsData.forEach(s => { initialScores[s.id] = { ca: '', exam: '' }; });
      setScores(initialScores);
    })();
  }, [courseId]);

  const handleSave = async () => {
    try {
      for (const studentId of Object.keys(scores)) {
        const gradeRef = doc(collection(db, 'grades'));
        const existingQuery = query(collection(db, 'grades'), where('studentId', '==', studentId), where('courseId', '==', courseId));
        const existing = await getDocs(existingQuery);
        const data = {
          studentId,
          courseId,
          caScore: parseInt(scores[studentId].ca) || 0,
          examScore: parseInt(scores[studentId].exam) || 0,
          total: (parseInt(scores[studentId].ca) || 0) + (parseInt(scores[studentId].exam) || 0),
          status: 'draft'
        };
        if (existing.empty) {
          await setDoc(gradeRef, data);
        } else {
          await setDoc(existing.docs[0].ref, data, { merge: true });
        }
      }
      Alert.alert('Success', 'Grades saved!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderStudent = ({ item }) => (
    <View style={styles.studentRow}>
      <Text style={styles.name}>{item.fullName} ({item.studentId})</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="CA (40)"
          keyboardType="numeric"
          value={scores[item.id]?.ca}
          onChangeText={(text) => setScores({ ...scores, [item.id]: { ...scores[item.id], ca: text } })}
        />
        <TextInput
          style={styles.input}
          placeholder="Exam (60)"
          keyboardType="numeric"
          value={scores[item.id]?.exam}
          onChangeText={(text) => setScores({ ...scores, [item.id]: { ...scores[item.id], exam: text } })}
        />
      </View>
    </View>
  );

  if (!courseId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Select a course first</Text>
        <Text style={styles.helpText}>Open the Courses tab and pick a class to enter grades.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grade Entry - {courseCode}</Text>
      <FlatList
        data={students}
        keyExtractor={item => item.id}
        renderItem={renderStudent}
        ListEmptyComponent={<Text>No students enrolled</Text>}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save All Grades</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: colors.light },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  studentRow: { backgroundColor: colors.white, padding: 10, borderRadius: 8, marginBottom: 10, elevation: 2 },
  name: { fontWeight: '600', marginBottom: 5 },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 5, padding: 8, width: '48%' },
  saveButton: { backgroundColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveText: { color: colors.white, fontWeight: 'bold' },
  helpText: { marginTop: 10, color: colors.textMuted },
});

export default GradeEntryScreen;