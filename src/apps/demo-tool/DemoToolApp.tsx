import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Wrench,
  Activity,
  Sliders,
  Plus,
  Minus,
  RotateCcw,
  Save,
  Trash2,
  CheckCircle2,
} from 'lucide-react-native';
import { SubAppProps } from '../../types';
import {
  HtzCard,
  HtzButton,
  HtzTabs,
  HtzBadge,
  HtzInput,
} from '../../components/htz';
import { htzTokens } from '../../components/htz/tokens';

export const DemoToolApp: React.FC<SubAppProps> = ({ onExitToHub, storage }) => {
  const [activeTab, setActiveTab] = useState<'tools' | 'diag' | 'settings'>('tools');
  const [counter, setCounter] = useState(0);
  const [note, setNote] = useState('');
  const [savedNote, setSavedNote] = useState('');
  const [saveStatus, setSaveStatus] = useState(false);

  useEffect(() => {
    // Load persisted state for this sub-app
    (async () => {
      const storedCounter = await storage.get<number>('counter', 0);
      if (storedCounter !== null) setCounter(storedCounter);
      const storedNote = await storage.get<string>('quick_note', '');
      if (storedNote) {
        setNote(storedNote);
        setSavedNote(storedNote);
      }
    })();
  }, []);

  const handleUpdateCounter = async (delta: number) => {
    const next = counter + delta;
    setCounter(next);
    await storage.set('counter', next);
  };

  const handleResetCounter = async () => {
    setCounter(0);
    await storage.set('counter', 0);
  };

  const handleSaveNote = async () => {
    await storage.set('quick_note', note);
    setSavedNote(note);
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const handleClearData = async () => {
    Alert.alert(
      'Limpiar Datos de DevLab',
      '¿Seguro que deseas reiniciar los datos locales de esta aplicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            await storage.clear();
            setCounter(0);
            setNote('');
            setSavedNote('');
          },
        },
      ]
    );
  };

  const demoTabs = [
    {
      id: 'tools',
      label: 'Herramientas',
      icon: (
        <Wrench
          size={16}
          color={activeTab === 'tools' ? htzTokens.colors.primary : htzTokens.colors.outline}
        />
      ),
    },
    {
      id: 'diag',
      label: 'Diagnóstico',
      icon: (
        <Activity
          size={16}
          color={activeTab === 'diag' ? htzTokens.colors.primary : htzTokens.colors.outline}
        />
      ),
    },
    {
      id: 'settings',
      label: 'Ajustes',
      icon: (
        <Sliders
          size={16}
          color={activeTab === 'settings' ? htzTokens.colors.primary : htzTokens.colors.outline}
        />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Top App Header with Exit button */}
      <View style={styles.header}>
        <HtzButton
          variant="ghost"
          size="sm"
          icon={<ArrowLeft size={18} color={htzTokens.colors.onSurface} />}
          onPress={onExitToHub}
        >
          Hub
        </HtzButton>
        <View style={styles.titleContainer}>
          <Text style={styles.appTitle}>DevLab & Tools</Text>
          <Text style={styles.appSubtitle}>Sub-App Móvil v1.2.0</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* Sub-App Navigation Tabs using HtzTabs */}
      <View style={styles.tabsWrapper}>
        <HtzTabs
          tabs={demoTabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as 'tools' | 'diag' | 'settings')}
        />
      </View>

      {/* Tab Contents */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'tools' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contador Persistente</Text>
            <Text style={styles.sectionDesc}>
              Este contador persiste su valor exclusivamente en el almacenamiento de esta sub-app.
            </Text>

            <HtzCard style={styles.counterCard}>
              <Text style={styles.counterValue}>{counter}</Text>
              <View style={styles.counterControls}>
                <HtzButton
                  variant="outline"
                  size="md"
                  icon={<Minus size={20} color={htzTokens.colors.onSurface} />}
                  onPress={() => handleUpdateCounter(-1)}
                  style={styles.counterCircleBtn}
                />
                <HtzButton
                  variant="ghost"
                  size="sm"
                  icon={<RotateCcw size={18} color={htzTokens.colors.outline} />}
                  onPress={handleResetCounter}
                />
                <HtzButton
                  variant="primary"
                  size="md"
                  icon={<Plus size={20} color="#FFFFFF" />}
                  onPress={() => handleUpdateCounter(1)}
                  style={styles.counterCircleBtn}
                />
              </View>
            </HtzCard>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Nota Rápida Local</Text>
            <HtzCard style={styles.noteCard}>
              <HtzInput
                placeholder="Escribe algo aquí para probar persistencia..."
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                containerStyle={{ marginBottom: 12 }}
              />
              <HtzButton
                variant={saveStatus ? 'secondary' : 'primary'}
                icon={
                  saveStatus ? (
                    <CheckCircle2 size={18} color="#FFFFFF" />
                  ) : (
                    <Save size={18} color="#FFFFFF" />
                  )
                }
                onPress={handleSaveNote}
              >
                {saveStatus ? '¡Guardado con Éxito!' : 'Guardar Nota'}
              </HtzButton>
            </HtzCard>
          </View>
        )}

        {activeTab === 'diag' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estado de Ejecución</Text>
            <Text style={styles.sectionDesc}>
              Parámetros de aislamiento e integración dentro de la Super-App.
            </Text>

            <HtzCard style={styles.diagCard}>
              <View style={styles.diagRow}>
                <Text style={styles.diagLabel}>ID de Aplicación:</Text>
                <Text style={styles.diagValue}>demo-tool</Text>
              </View>
              <View style={styles.diagRow}>
                <Text style={styles.diagLabel}>Tipo de Contenedor:</Text>
                <Text style={styles.diagValue}>Sub-App Independiente</Text>
              </View>
              <View style={styles.diagRow}>
                <Text style={styles.diagLabel}>Espacio de Storage:</Text>
                <Text style={styles.diagValue}>@app_demo-tool_*</Text>
              </View>
              <View style={styles.diagRow}>
                <Text style={styles.diagLabel}>Nota Guardada:</Text>
                <Text style={styles.diagValue}>
                  {savedNote ? `"${savedNote.slice(0, 20)}..."` : 'Ninguna'}
                </Text>
              </View>
              <View style={[styles.diagRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.diagLabel}>Estado de Salud:</Text>
                <HtzBadge variant="success" label="100% Operativo" />
              </View>
            </HtzCard>
          </View>
        )}

        {activeTab === 'settings' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gestión de Datos Internos</Text>
            <Text style={styles.sectionDesc}>
              Opciones específicas de configuración para DevLab.
            </Text>

            <HtzCard style={styles.settingsCard}>
              <View style={styles.dangerRow}>
                <Trash2 size={22} color={htzTokens.colors.error} />
                <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                  <Text style={styles.dangerTitle}>Borrar Almacenamiento Local</Text>
                  <Text style={styles.dangerSub}>
                    Reinicia las notas y el contador a sus valores originales
                  </Text>
                </View>
                <HtzButton
                  variant="outline"
                  size="sm"
                  onPress={handleClearData}
                  textStyle={{ color: htzTokens.colors.error }}
                >
                  Limpiar
                </HtzButton>
              </View>
            </HtzCard>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: htzTokens.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: htzTokens.colors.outline,
    backgroundColor: htzTokens.colors.surfaceVariant,
  },
  titleContainer: {
    alignItems: 'center',
  },
  appTitle: {
    color: htzTokens.colors.onSurface,
    fontSize: 16,
    fontWeight: '700',
  },
  appSubtitle: {
    color: htzTokens.colors.outline,
    fontSize: 11,
  },
  tabsWrapper: {
    backgroundColor: htzTokens.colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: htzTokens.colors.outline,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: htzTokens.colors.onSurface,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDesc: {
    color: htzTokens.colors.outline,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  counterCard: {
    padding: 24,
    alignItems: 'center',
  },
  counterValue: {
    color: htzTokens.colors.onSurface,
    fontSize: 52,
    fontWeight: '800',
    marginBottom: 16,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterCircleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteCard: {
    padding: 16,
  },
  diagCard: {
    paddingHorizontal: 16,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: htzTokens.colors.outline,
  },
  diagLabel: {
    color: htzTokens.colors.outline,
    fontSize: 14,
  },
  diagValue: {
    color: htzTokens.colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  settingsCard: {
    padding: 16,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dangerTitle: {
    color: htzTokens.colors.error,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  dangerSub: {
    color: htzTokens.colors.outline,
    fontSize: 12,
  },
});
