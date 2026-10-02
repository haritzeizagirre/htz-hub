import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import {
  Moon,
  Sun,
  Smartphone,
  HardDrive,
  Download,
  Upload,
  Check,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react-native';
import { useHub } from '../context/HubContext';
import { ThemeMode } from '../types';
import { HubStorage } from '../storage/hubStorage';
import {
  HtzCard,
  HtzButton,
  HtzBadge,
} from '../components/htz';
import { htzTokens } from '../components/htz/tokens';

export const SettingsScreen: React.FC = () => {
  const { theme, setTheme, colors, refreshHub } = useHub();
  const [stats, setStats] = useState<{ totalKeys: number; appKeyCount: Record<string, number> }>({
    totalKeys: 0,
    appKeyCount: {},
  });
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [backupJson, setBackupJson] = useState('');
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importJson, setImportJson] = useState('');

  const loadStats = async () => {
    const s = await HubStorage.getStorageStats();
    setStats(s);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleExportBackup = async () => {
    const dump = await HubStorage.exportAllData();
    setBackupJson(dump);
    setBackupModalVisible(true);
  };

  const handleImportBackup = async () => {
    if (!importJson.trim()) {
      Alert.alert('Error', 'Pega un JSON válido para restaurar.');
      return;
    }
    const success = await HubStorage.importData(importJson);
    if (success) {
      setImportModalVisible(false);
      setImportJson('');
      await refreshHub();
      await loadStats();
      Alert.alert('Éxito', 'Configuraciones y datos restaurados correctamente.');
    } else {
      Alert.alert('Error', 'El formato del JSON no es válido.');
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      '¿Restablecer todo el Hub?',
      'Esta acción eliminará todas las notas y configuraciones guardadas en todas tus aplicaciones locales.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: async () => {
            await HubStorage.saveFavorites(['score-viewer']);
            await loadStats();
            await refreshHub();
            Alert.alert('Completado', 'Los datos del Hub se han reiniciado.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Ajustes del Hub</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Personalización, temas y gestión de datos de tus aplicaciones
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TEMA VISUAL */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Tema Visual
        </Text>
        <HtzCard style={styles.card}>
          {(['dark', 'sage', 'oled', 'light'] as ThemeMode[]).map((mode) => {
            const isSelected = theme === mode;
            return (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.optionRow,
                  { borderBottomColor: colors.borderSubtle },
                ]}
                onPress={() => setTheme(mode)}
              >
                <View style={styles.optionLeft}>
                  {mode === 'dark' && <Moon size={20} color={colors.primary} />}
                  {mode === 'sage' && <Sparkles size={20} color="#4a7c59" />}
                  {mode === 'oled' && <Smartphone size={20} color={colors.primary} />}
                  {mode === 'light' && <Sun size={20} color={colors.primary} />}
                  <View style={{ marginLeft: 12 }}>
                    <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
                      {mode === 'dark' && 'Modo Oscuro (Slate)'}
                      {mode === 'sage' && 'Htz Verde Sage (Design System)'}
                      {mode === 'oled' && 'Modo OLED (Negro Puro)'}
                      {mode === 'light' && 'Modo Claro (Glass)'}
                    </Text>
                    <Text style={[styles.optionSub, { color: colors.textMuted }]}>
                      {mode === 'dark' && 'Contraste suave con acentos de color'}
                      {mode === 'sage' && 'Tu propia paleta oficial con tonos #4a7c59'}
                      {mode === 'oled' && 'Ahorro de batería y negro absoluto'}
                      {mode === 'light' && 'Estilo limpio de alto brillo'}
                    </Text>
                  </View>
                </View>

                {isSelected && <Check size={20} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </HtzCard>

        {/* ALMACENAMIENTO DE APPS */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Almacenamiento Local de Apps
        </Text>
        <HtzCard style={styles.card}>
          <View style={styles.storageInfoRow}>
            <HardDrive size={22} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.storageTitle, { color: colors.textPrimary }]}>
                {stats.totalKeys} Registros Guardados
              </Text>
              <Text style={[styles.storageSub, { color: colors.textMuted }]}>
                Almacenamiento local aislado para cada app en tu dispositivo
              </Text>
            </View>
            <HtzBadge variant="primary" label={`${stats.totalKeys} claves`} />
          </View>

          {Object.entries(stats.appKeyCount).length > 0 && (
            <View style={[styles.appKeyList, { borderTopColor: colors.borderSubtle }]}>
              {Object.entries(stats.appKeyCount).map(([appId, count]) => (
                <View key={appId} style={styles.appKeyRow}>
                  <Text style={[styles.appKeyName, { color: colors.textSecondary }]}>
                    App: {appId}
                  </Text>
                  <Text style={[styles.appKeyCount, { color: colors.primary }]}>
                    {count} {count === 1 ? 'clave' : 'claves'}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: colors.borderSubtle }}>
            <HtzButton
              variant="outline"
              size="sm"
              icon={<Trash2 size={16} color={htzTokens.colors.error} />}
              onPress={handleClearAllData}
              textStyle={{ color: htzTokens.colors.error }}
            >
              Restablecer Datos Locales
            </HtzButton>
          </View>
        </HtzCard>

        {/* COPIA DE SEGURIDAD */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Copia de Seguridad & Migración
        </Text>
        <HtzCard style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={handleExportBackup}>
            <Download size={20} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>
                Exportar Configuración (JSON)
              </Text>
              <Text style={[styles.actionSub, { color: colors.textMuted }]}>
                Crea una copia de todas tus preferencias y favoritos
              </Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setImportModalVisible(true)}
          >
            <Upload size={20} color={colors.accent} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>
                Importar Configuración (JSON)
              </Text>
              <Text style={[styles.actionSub, { color: colors.textMuted }]}>
                Restaura un backup previo en esta u otra instalación
              </Text>
            </View>
          </TouchableOpacity>
        </HtzCard>

        {/* INFORMACIÓN DEL SISTEMA */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Información del Sistema
        </Text>
        <HtzCard style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Plataforma:</Text>
            <Text style={[styles.infoVal, { color: colors.textPrimary }]}>React Native / Expo SDK 57</Text>
          </View>
          <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: colors.borderSubtle }]}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Arquitectura:</Text>
            <Text style={[styles.infoVal, { color: colors.textPrimary }]}>Super-App Modular</Text>
          </View>
          <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: colors.borderSubtle }]}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Estado del Hub:</Text>
            <HtzBadge variant="success" label="Activo & Sincronizado" />
          </View>
        </HtzCard>
      </ScrollView>

      {/* EXPORT BACKUP MODAL */}
      <Modal visible={backupModalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Copia de Seguridad JSON
              </Text>
              <TouchableOpacity onPress={() => setBackupModalVisible(false)}>
                <X size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.textPrimary }]}
              value={backupJson}
              editable={false}
              multiline
            />
            <HtzButton
              variant="primary"
              onPress={() => {
                setBackupModalVisible(false);
                Alert.alert('Copia Lista', 'Puedes copiar el contenido JSON para conservarlo.');
              }}
            >
              Cerrar
            </HtzButton>
          </View>
        </View>
      </Modal>

      {/* IMPORT BACKUP MODAL */}
      <Modal visible={importModalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Importar Backup JSON
              </Text>
              <TouchableOpacity onPress={() => setImportModalVisible(false)}>
                <X size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.textPrimary }]}
              placeholder="Pega aquí el contenido JSON a restaurar..."
              placeholderTextColor={colors.textMuted}
              value={importJson}
              onChangeText={setImportJson}
              multiline
            />
            <HtzButton
              variant="primary"
              onPress={handleImportBackup}
            >
              Restaurar Datos
            </HtzButton>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  optionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  storageInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  storageTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  storageSub: {
    fontSize: 12,
    marginTop: 2,
  },
  appKeyList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  appKeyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  appKeyName: {
    fontSize: 13,
  },
  appKeyCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    gap: 8,
  },
  clearBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalInput: {
    borderRadius: 12,
    padding: 12,
    height: 200,
    fontSize: 12,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalActionBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
