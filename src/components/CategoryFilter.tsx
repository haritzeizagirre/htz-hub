import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { AppCategory } from '../types';
import { HtzChip } from './htz';

interface CategoryFilterProps {
  selectedCategory: AppCategory;
  onSelectCategory: (category: AppCategory) => void;
}

const CATEGORIES: { key: AppCategory; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'deportes', label: 'Deportes' },
  { key: 'utilidades', label: 'Utilidades' },
  { key: 'herramientas', label: 'Herramientas' },
  { key: 'laboratorio', label: 'Laboratorio' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.key;
        return (
          <HtzChip
            key={cat.key}
            label={cat.label}
            selected={isSelected}
            variant="secondary"
            onPress={() => onSelectCategory(cat.key)}
          />
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    height: 42,
    maxHeight: 42,
    flexGrow: 0,
    marginBottom: 8,
  },
  container: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
});
