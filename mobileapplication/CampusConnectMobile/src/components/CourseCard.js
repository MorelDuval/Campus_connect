import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/globalStyles';
import CustomButton from './CustomButton';

const CourseCard = ({ course, isEnrolled, onRegister, onDrop }) => (
  <View style={[styles.card, isEnrolled && styles.enrolled]}>
    <Text style={styles.code}>{course.code}</Text>
    <Text style={styles.name}>{course.name}</Text>
    <Text style={styles.details}>{course.credits} credits | {course.schedule}</Text>
    <Text style={styles.details}>{course.venue}</Text>
    {isEnrolled ? (
      <CustomButton title="Drop" variant="outline" onPress={() => onDrop(course.id)} />
    ) : (
      <CustomButton title="Register" onPress={() => onRegister(course.id)} />
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  enrolled: {
    borderColor: colors.success,
    borderWidth: 1,
  },
  code: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.primary,
  },
  name: {
    fontSize: 15,
    marginTop: 5,
  },
  details: {
    color: colors.textMuted,
    marginTop: 3,
  },
});

export default CourseCard;