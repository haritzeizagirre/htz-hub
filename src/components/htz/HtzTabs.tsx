import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { htzTokens } from './tokens';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface HtzTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const HtzTabs: React.FC<HtzTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.8}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onChange(tab.id)}
          >
            {tab.icon && (
              <View style={styles.iconWrapper}>
                {tab.icon}
              </View>
            )}
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: htzTokens.colors.surfaceContainerLowest,
    padding: 4,
    borderRadius: htzTokens.radius.md,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: htzTokens.radius.default,
    gap: 6,
  },
  activeTab: {
    backgroundColor: htzTokens.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  iconWrapper: {
    marginRight: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: htzTokens.colors.outline,
  },
  activeLabel: {
    color: htzTokens.colors.onPrimary,
    fontWeight: '800',
  },
});
