// Tag / Badge Component

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSize } from '../../constants/typography';
import { BorderRadius, Spacing } from '../../constants/spacing';

interface TagProps {
  label: string;
  icon?: string;
  color?: string;
  bgColor?: string;
  style?: ViewStyle;
}

export function Tag({ label, icon, color, bgColor, style }: TagProps) {
  return (
    <View
      style={[
        styles.container,
        bgColor ? { backgroundColor: bgColor } : undefined,
        style,
      ]}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.label, color ? { color } : undefined]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tagBg,
    borderRadius: BorderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    gap: 4,
  },
  icon: {
    fontSize: 12,
  },
  label: {
    fontSize: FontSize.caption,
    fontWeight: '600',
    color: Colors.tagText,
  },
});
