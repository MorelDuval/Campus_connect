import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/globalStyles';

const StatCard = ({ icon, value, label, color = colors.primary }) => (
  <View style={[styles.card, { borderLeftColor: color }]}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: '45%',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    margin: '2.5%',
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: { fontSize: 24, marginBottom: 5 },
  value: { fontSize: 22, fontWeight: 'bold', color: colors.dark },
  label: { fontSize: 12, color: colors.textMuted },
});

export default StatCard;