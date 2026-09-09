import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/globalStyles';

const CustomButton = ({ title, onPress, variant = 'primary', style }) => {
  const buttonStyle = [
    styles.button,
    variant === 'outline' && styles.outline,
    variant === 'danger' && styles.danger,
    style,
  ];
  const textStyle = [
    styles.text,
    variant === 'outline' && { color: colors.primary },
    variant === 'danger' && { color: colors.white },
  ];

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomButton;