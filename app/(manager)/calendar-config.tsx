import {
  View,
  Text,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { useAuth } from '@/providers/AuthProvider';
import type { WeekDay } from '@/types';

interface DayConfig {
  enabled: boolean;
  open: string;
  close: string;
}

const DAYS: { key: WeekDay; label: string; short: string }[] = [
  { key: 'monday',    label: 'Segunda-feira', short: 'Seg' },
  { key: 'tuesday',   label: 'Terça-feira',   short: 'Ter' },
  { key: 'wednesday', label: 'Quarta-feira',  short: 'Qua' },
  { key: 'thursday',  label: 'Quinta-feira',  short: 'Qui' },
  { key: 'friday',    label: 'Sexta-feira',   short: 'Sex' },
  { key: 'saturday',  label: 'Sábado',        short: 'Sáb' },
  { key: 'sunday',    label: 'Domingo',       short: 'Dom' },
];

const DEFAULT_CONFIG: Record<WeekDay, DayConfig> = {
  monday:    { enabled: true,  open: '06:00', close: '22:00' },
  tuesday:   { enabled: true,  open: '06:00', close: '22:00' },
  wednesday: { enabled: true,  open: '06:00', close: '22:00' },
  thursday:  { enabled: true,  open: '06:00', close: '22:00' },
  friday:    { enabled: true,  open: '06:00', close: '22:00' },
  saturday:  { enabled: true,  open: '08:00', close: '18:00' },
  sunday:    { enabled: false, open: '08:00', close: '13:00' },
};

function maskTime(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export default function CalendarConfig() {
  const { gymId } = useAuth();
  const [config, setConfig] = useState<Record<WeekDay, DayConfig>>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!gymId) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'gyms', gymId));
        if (snap.exists() && snap.data().schedule) {
          setConfig(snap.data().schedule as Record<WeekDay, DayConfig>);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [gymId]);

  function updateDay(day: WeekDay, patch: Partial<DayConfig>) {
    setConfig((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  }

  async function handleSave() {
    for (const { key, label } of DAYS) {
      const d = config[key];
      if (!d.enabled) continue;
      const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;
      if (!timeRe.test(d.open) || !timeRe.test(d.close)) {
        Alert.alert('Horário inválido', `Verifique os horários de ${label}. Use o formato HH:MM.`);
        return;
      }
      if (d.open >= d.close) {
        Alert.alert('Horário inválido', `Em ${label}, a abertura deve ser antes do fechamento.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      await setDoc(
        doc(db, 'gyms', gymId!),
        { schedule: config },
        { merge: true }
      );
      Alert.alert('Salvo', 'Calendário atualizado com sucesso!');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-brand-background items-center justify-center">
        <ActivityIndicator color="#FF6B35" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-brand-background" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="px-6 pt-6 pb-4">
        <Text className="text-brand-text-primary text-2xl font-bold">Calendário</Text>
        <Text className="text-brand-text-secondary text-sm mt-1">
          Dias e horários de funcionamento
        </Text>
      </View>

      <View className="px-6 gap-3">
        {DAYS.map(({ key, label, short }) => {
          const d = config[key];
          return (
            <View key={key} className="bg-brand-surface rounded-2xl p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-brand-text-primary font-semibold">{label}</Text>
                <Switch
                  value={d.enabled}
                  onValueChange={(v) => updateDay(key, { enabled: v })}
                  trackColor={{ false: '#2A2A3E', true: '#FF6B35' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {d.enabled && (
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-brand-text-muted text-xs mb-1">Abertura</Text>
                    <TextInput
                      className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-3 py-2 text-center font-semibold"
                      value={d.open}
                      onChangeText={(v) => updateDay(key, { open: maskTime(v) })}
                      keyboardType="numeric"
                      maxLength={5}
                      placeholder="06:00"
                      placeholderTextColor="#606078"
                    />
                  </View>
                  <View className="justify-center pt-5">
                    <Text className="text-brand-text-muted">→</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-brand-text-muted text-xs mb-1">Fechamento</Text>
                    <TextInput
                      className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-3 py-2 text-center font-semibold"
                      value={d.close}
                      onChangeText={(v) => updateDay(key, { close: maskTime(v) })}
                      keyboardType="numeric"
                      maxLength={5}
                      placeholder="22:00"
                      placeholderTextColor="#606078"
                    />
                  </View>
                </View>
              )}

              {!d.enabled && (
                <Text className="text-brand-text-muted text-sm">Fechado</Text>
              )}
            </View>
          );
        })}
      </View>

      <View className="px-6 mt-6">
        <TouchableOpacity
          className="bg-brand-primary rounded-2xl py-4 items-center"
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">Salvar Calendário</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
