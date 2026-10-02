import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LayoutGrid, Star, Settings as SettingsIcon } from 'lucide-react-native';
import { HubProvider, useHub } from './src/context/HubContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SubAppContainer } from './src/components/SubAppContainer';

type TabType = 'home' | 'favorites' | 'settings';

const HubNavigation: React.FC = () => {
  const { colors, activeApp, favorites } = useHub();
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // If a sub-application is actively running, render it in full screen container
  if (activeApp) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <SubAppContainer app={activeApp} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <StatusBar
        barStyle={colors.textPrimary === '#FFFFFF' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Current Screen View */}
      <View style={styles.contentView}>
        {currentTab === 'home' && <HomeScreen />}
        {currentTab === 'favorites' && <FavoritesScreen />}
        {currentTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Bottom WeChat / iOS Tab Bar */}
      <View
        style={[
          styles.bottomTabBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.borderSubtle,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => setCurrentTab('home')}
        >
          <LayoutGrid
            size={22}
            color={currentTab === 'home' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: currentTab === 'home' ? colors.primary : colors.textMuted,
                fontWeight: currentTab === 'home' ? '700' : '500',
              },
            ]}
          >
            Explorar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => setCurrentTab('favorites')}
        >
          <View>
            <Star
              size={22}
              color={currentTab === 'favorites' ? colors.primary : colors.textMuted}
              fill={currentTab === 'favorites' ? colors.primary : 'transparent'}
            />
            {favorites.length > 0 && (
              <View style={[styles.badgeDot, { backgroundColor: colors.primary }]} />
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              {
                color: currentTab === 'favorites' ? colors.primary : colors.textMuted,
                fontWeight: currentTab === 'favorites' ? '700' : '500',
              },
            ]}
          >
            Favoritos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => setCurrentTab('settings')}
        >
          <SettingsIcon
            size={22}
            color={currentTab === 'settings' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: currentTab === 'settings' ? colors.primary : colors.textMuted,
                fontWeight: currentTab === 'settings' ? '700' : '500',
              },
            ]}
          >
            Ajustes
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <HubProvider>
        <HubNavigation />
      </HubProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  contentView: {
    flex: 1,
  },
  bottomTabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
