import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useLocation } from '@/hooks/useLocation';
import { useHaptics } from '@/hooks/useHaptics';
import { useStreak } from '@/hooks/useStreak';
import { getGymById } from '@/services/firebase/gyms.service';
import { hasCheckedInToday, createCheckIn } from '@/services/firebase/checkins.service';
import {
  getStudentProfile,
  updateStudentProfile,
} from '@/services/firebase/studentProfiles.service';
import { getWorkoutsByStudent } from '@/services/firebase/workouts.service';
import { subscribeToProgressForToday } from '@/services/firebase/workoutProgress.service';
import { isWithinGeofence } from '@/utils/geofenceUtils';
import { evaluateStreak } from '@/utils/streakUtils';
import { FREEZES_PER_MONTH } from '@/utils/constants';
import {
  Flame,
  Snowflake,
  MapPin,
  Dumbbell,
  ChevronRight,
  CheckCheck,
  Clock,
  AlertTriangle,
} from 'lucide-react-native';
import type { Gym, StudentProfile, Workout } from '@/types';
import type { WeekDay } from '@/types';
import type { SetChecklist } from '@/services/firebase/workoutProgress.service';

const JS_DAY_TO_WEEKDAY: WeekDay[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

const WEEK_ORDER: { key: WeekDay; label: string }[] = [
  { key: 'monday',    label: 'Seg' },
  { key: 'tuesday',   label: 'Ter' },
  { key: 'wednesday', label: 'Qua' },
  { key: 'thursday',  label: 'Qui' },
  { key: 'friday',    label: 'Sex' },
  { key: 'saturday',  label: 'Sáb' },
  { key: 'sunday',    label: 'Dom' },
];

function todayWeekDay(): WeekDay {
  return JS_DAY_TO_WEEKDAY[new Date().getDay()];
}

function nextWorkout(workouts: Workout[], currentId: string): Workout {
  const idx = workouts.findIndex((w) => w.id === currentId);
  return workouts[(idx + 1) % workouts.length];
}

function calcProgress(checklist: SetChecklist, workout: Workout): number {
  const total = workout.exercises.reduce((a, ex) => a + ex.sets, 0);
  if (total === 0) return 0;
  const done = workout.exercises.reduce(
    (a, ex) => a + (checklist[ex.id]?.filter(Boolean).length ?? 0),
    0,
  );
  return done / total;
}

function isWorkoutComplete(checklist: SetChecklist, workout: Workout): boolean {
  if (workout.exercises.length === 0) return false;
  return workout.exercises.every((ex) => {
    if (ex.sets === 0) return true;
    return (checklist[ex.id]?.filter(Boolean).length ?? 0) === ex.sets;
  });
}

function StreakCard({
  streak,
  freezesRemaining,
  plannedDays,
  checkedInToday,
}: {
  streak: number;
  freezesRemaining: number;
  plannedDays: WeekDay[];
  checkedInToday: boolean;
}) {
  const todayKey = todayWeekDay();
  const isTodayPlanned = plannedDays.includes(todayKey);
  const isAtRisk = isTodayPlanned && !checkedInToday;
  const willLoseStreak = isAtRisk && freezesRemaining === 0 && streak > 0;

  return (
    <View className="mx-6 mb-4 bg-brand-surface rounded-2xl p-5">

      <Text className="text-brand-text-secondary text-sm mb-3">Ofensiva</Text>


      <View className="flex-row items-end gap-2 mb-4">
        <Text
          className="text-brand-primary font-bold"
          style={{ fontSize: 56, lineHeight: 60 }}
        >
          {streak}
        </Text>
        <Text style={{ fontSize: 36, lineHeight: 48 }}>🔥</Text>
        <Text className="text-brand-text-secondary text-lg mb-2">
          dia{streak !== 1 ? 's' : ''}
        </Text>
      </View>


      {willLoseStreak && (
        <View className="bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5 mb-4 flex-row items-center gap-2">
          <AlertTriangle color="#EF4444" size={15} />
          <Text className="text-red-400 text-xs flex-1">
            Sua ofensiva será resetada se você não fizer check-in hoje!
          </Text>
        </View>
      )}
      {isAtRisk && !willLoseStreak && (
        <View className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2.5 mb-4 flex-row items-center gap-2">
          <AlertTriangle color="#F59E0B" size={15} />
          <Text className="text-amber-400 text-xs flex-1">
            Faça check-in hoje para manter sua ofensiva. Um freeze será usado se não vier.
          </Text>
        </View>
      )}


      {plannedDays.length > 0 && (
        <>
          <Text className="text-brand-text-muted text-xs mb-2">Dias de treino</Text>
          <View className="flex-row gap-1 mb-4">
            {WEEK_ORDER.map(({ key, label }) => {
              const isPlanned = plannedDays.includes(key);
              const isToday = key === todayKey;
              return (
                <View
                  key={key}
                  className={`flex-1 items-center py-2 rounded-lg ${
                    isPlanned && isToday
                      ? 'bg-brand-primary'
                      : isPlanned
                      ? 'bg-brand-primary/20'
                      : isToday
                      ? 'bg-brand-surface-2 border border-white/10'
                      : 'bg-brand-surface-2'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isPlanned && isToday
                        ? 'text-white'
                        : isPlanned
                        ? 'text-brand-primary'
                        : isToday
                        ? 'text-brand-text-secondary'
                        : 'text-brand-text-muted'
                    }`}
                  >
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      )}


      <View className="flex-row items-center gap-2">
        {Array.from({ length: FREEZES_PER_MONTH }).map((_, i) => {
          const available = i < freezesRemaining;
          return (
            <View
              key={i}
              className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
                available ? 'bg-blue-500/15' : 'bg-brand-surface-2'
              }`}
            >
              <Snowflake color={available ? '#60BFFF' : '#404058'} size={13} />
              <Text
                className={`text-xs ${available ? 'text-blue-300' : 'text-brand-text-muted'}`}
              >
                Freeze
              </Text>
            </View>
          );
        })}
        <Text className="text-brand-text-muted text-xs ml-0.5">
          {freezesRemaining}/{FREEZES_PER_MONTH} disponíve
          {freezesRemaining !== 1 ? 'is' : 'l'}
        </Text>
      </View>
    </View>
  );
}

function WorkoutPickerCard({
  workouts,
  onPick,
}: {
  workouts: Workout[];
  onPick: (w: Workout) => void;
}) {
  return (
    <View className="mx-6 mb-4 bg-brand-surface rounded-2xl p-5">
      <View className="flex-row items-center gap-2 mb-3">
        <Dumbbell color="#FF6B35" size={18} />
        <Text className="text-brand-text-primary font-semibold text-base">
          Escolha seu primeiro treino
        </Text>
      </View>
      <Text className="text-brand-text-secondary text-sm mb-4">
        Selecione com qual treino quer começar. Os próximos dias seguirão a sequência.
      </Text>
      {workouts.map((w) => (
        <TouchableOpacity
          key={w.id}
          onPress={() => onPick(w)}
          activeOpacity={0.8}
          className="bg-brand-surface-2 rounded-xl px-4 py-3 mb-2 flex-row items-center justify-between"
        >
          <View className="flex-1">
            <Text className="text-brand-text-primary font-semibold">{w.name}</Text>
            {w.description ? (
              <Text className="text-brand-text-muted text-xs mt-0.5" numberOfLines={1}>
                {w.description}
              </Text>
            ) : null}
            <Text className="text-brand-text-muted text-xs mt-0.5">
              {w.exercises.length} exercício{w.exercises.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <ChevronRight color="#606078" size={18} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function WorkoutTodayCard({
  workout,
  ratio,
  isComplete,
  onPress,
}: {
  workout: Workout;
  ratio: number;
  isComplete: boolean;
  onPress: () => void;
}) {
  if (isComplete) {
    return (
      <View className="mx-6 mb-4 bg-green-500/10 border border-green-500/30 rounded-2xl p-5">
        <View className="flex-row items-center gap-2 mb-2">
          <CheckCheck color="#4CAF50" size={18} />
          <Text className="text-green-400 font-semibold text-base">Treino concluído! 🎉</Text>
        </View>
        <Text className="text-brand-text-primary font-semibold mb-1">{workout.name}</Text>
        <Text className="text-brand-text-muted text-xs">
          Todos os exercícios foram marcados. Ótimo trabalho!
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="mx-6 mb-4 bg-brand-surface rounded-2xl p-5"
    >
      <View className="flex-row items-center gap-2 mb-3">
        <Dumbbell color="#FF6B35" size={18} />
        <Text className="text-brand-text-primary font-semibold text-base">Treino de hoje</Text>
      </View>
      <Text className="text-brand-text-primary font-semibold text-base mb-1">{workout.name}</Text>
      {workout.description ? (
        <Text className="text-brand-text-muted text-xs mb-2" numberOfLines={2}>
          {workout.description}
        </Text>
      ) : null}

      <View className="h-2 bg-brand-surface-2 rounded-full overflow-hidden mb-2">
        <View
          className="h-full rounded-full bg-brand-primary"
          style={{ width: `${ratio * 100}%` }}
        />
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-brand-text-muted text-xs">
          {Math.round(ratio * 100)}% concluído
        </Text>
        <View className="flex-row items-center gap-1">
          <Text className="text-brand-primary text-xs font-semibold">Ver treino</Text>
          <ChevronRight color="#FF6B35" size={14} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function StudentDashboard() {
  const { user, gymId } = useAuth();
  const router = useRouter();
  const { getCurrentLocation, isLoading: isLocating } = useLocation();
  const haptics = useHaptics();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [gym, setGym] = useState<Gym | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [checklist, setChecklist] = useState<SetChecklist>({});
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const progressUnsubRef = useRef<(() => void) | null>(null);

  function subscribeProgress(uid: string, workoutId: string) {
    progressUnsubRef.current?.();
    progressUnsubRef.current = subscribeToProgressForToday(uid, workoutId, setChecklist);
  }

  const fetchData = useCallback(async () => {
    if (!user || !gymId) return;
    setIsLoading(true);
    try {
      const [rawProfile, gymData, alreadyCheckedIn, workoutList] = await Promise.all([
        getStudentProfile(user.uid).catch(() => null),
        getGymById(gymId).catch(() => null),
        hasCheckedInToday(user.uid).catch(() => false),
        getWorkoutsByStudent(user.uid).catch(() => [] as Workout[]),
      ]);


      let profileData = rawProfile;
      if (rawProfile) {
        const streakUpdate = evaluateStreak(rawProfile);
        if (streakUpdate) {
          updateStudentProfile(user.uid, streakUpdate).catch(() => {});
          profileData = {
            ...rawProfile,
            streak: streakUpdate.streak ?? rawProfile.streak,
            streakConfig: {
              ...rawProfile.streakConfig,
              ...streakUpdate.streakConfig,
            },
          };
        }
      }

      const sorted = [...workoutList].sort((a, b) =>
        (a.createdAt ?? '').localeCompare(b.createdAt ?? ''),
      );

      setProfile(profileData);
      setGym(gymData);
      setCheckedInToday(alreadyCheckedIn);
      setWorkouts(sorted);

      if (profileData?.lastWorkoutId) {
        subscribeProgress(user.uid, profileData.lastWorkoutId);
      } else {
        progressUnsubRef.current?.();
        progressUnsubRef.current = null;
        setChecklist({});
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, gymId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      return () => {
        progressUnsubRef.current?.();
        progressUnsubRef.current = null;
      };
    }, [fetchData])
  );

  async function handlePickStartingWorkout(picked: Workout) {
    if (!user) return;
    await updateStudentProfile(user.uid, { lastWorkoutId: picked.id });
    setProfile((prev) => prev ? { ...prev, lastWorkoutId: picked.id } : prev);
    subscribeProgress(user.uid, picked.id);
    router.push(`/(student)/workouts/${picked.id}`);
  }

  async function handleAdvanceWorkout() {
    if (!user || !activeWorkout || workouts.length === 0) return;
    const next = nextWorkout(workouts, activeWorkout.id);
    await updateStudentProfile(user.uid, { lastWorkoutId: next.id });
    setProfile((prev) => prev ? { ...prev, lastWorkoutId: next.id } : prev);
    subscribeProgress(user.uid, next.id);
    router.push(`/(student)/workouts/${next.id}`);
  }

  async function handleCheckIn() {
    if (!user || !gymId || !gym || checkedInToday) return;

    setIsCheckingIn(true);
    try {
      const coords = await getCurrentLocation();
      if (!coords) {
        Alert.alert(
          'Localização indisponível',
          'Não foi possível obter sua localização. Verifique as permissões do app.',
        );
        return;
      }

      if (gym.latitude && gym.longitude) {
        if (!isWithinGeofence(coords.latitude, coords.longitude, gym.latitude, gym.longitude)) {
          Alert.alert(
            'Fora da academia',
            'Você precisa estar dentro da academia para confirmar presença.',
          );
          return;
        }
      }

      await createCheckIn(user.uid, gymId);

      const newStreak = (profile?.streak ?? 0) + 1;
      const now = new Date().toISOString();
      await updateStudentProfile(user.uid, { streak: newStreak, lastCheckInDate: now });

      setCheckedInToday(true);
      setProfile((prev) =>
        prev ? { ...prev, streak: newStreak, lastCheckInDate: now } : prev,
      );
      haptics.success();
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Erro ao fazer check-in. Tente novamente.');
    } finally {
      setIsCheckingIn(false);
    }
  }

  const buttonBusy = isCheckingIn || isLocating;
  const hasWorkouts = workouts.length > 0;

  const activeWorkout: Workout | null = profile?.lastWorkoutId
    ? (workouts.find((w) => w.id === profile.lastWorkoutId) ?? null)
    : null;

  const ratio = activeWorkout ? calcProgress(checklist, activeWorkout) : 0;
  const complete = activeWorkout ? isWorkoutComplete(checklist, activeWorkout) : false;

  const showPicker = hasWorkouts && !profile?.lastWorkoutId;

  const { streak, plannedDays, freezesRemaining } = useStreak(profile ?? undefined, checkedInToday);

  return (
    <ScrollView
      className="flex-1 bg-brand-background"
      contentContainerStyle={{ paddingBottom: 32 }}
    >

      <View className="px-6 pt-14 pb-6">
        <Text className="text-brand-text-secondary text-base">Olá,</Text>
        <Text className="text-brand-text-primary text-2xl font-bold">
          {user?.displayName ?? 'Aluno'}
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#FF6B35" className="mt-8" />
      ) : (
        <>

          <StreakCard
            streak={streak}
            freezesRemaining={freezesRemaining}
            plannedDays={plannedDays}
            checkedInToday={checkedInToday}
          />


          {showPicker ? (
            <WorkoutPickerCard workouts={workouts} onPick={handlePickStartingWorkout} />
          ) : activeWorkout ? (
            <WorkoutTodayCard
              workout={activeWorkout}
              ratio={ratio}
              isComplete={complete}
              onPress={() => router.push(`/(student)/workouts/${activeWorkout.id}`)}
            />
          ) : null}


          {!checkedInToday && (
            <View className="mx-6 mb-4 bg-brand-surface rounded-2xl p-5">
              <View className="flex-row items-center gap-2 mb-3">
                <MapPin color="#FF6B35" size={18} />
                <Text className="text-brand-text-primary font-semibold text-base">
                  Check-in de hoje
                </Text>
              </View>
              <Text className="text-brand-text-secondary text-sm mb-4">
                Confirme sua presença na academia para manter sua ofensiva.
              </Text>
              <TouchableOpacity
                className={`bg-brand-primary rounded-xl py-4 flex-row items-center justify-center gap-2 ${
                  buttonBusy ? 'opacity-60' : ''
                }`}
                onPress={handleCheckIn}
                disabled={buttonBusy}
                activeOpacity={0.8}
              >
                {buttonBusy ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Flame color="#fff" size={18} />
                    <Text className="text-white font-bold text-base">Confirmar presença</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}


          {gym ? (
            <View className="mx-6 bg-brand-surface rounded-2xl px-4 py-3 gap-2">
              {gym.name ? (
                <View className="flex-row items-center gap-2">
                  <MapPin color="#606078" size={14} />
                  <Text className="text-brand-text-muted text-sm">{gym.name}</Text>
                </View>
              ) : null}
              <Text className="text-brand-text-secondary text-sm font-semibold">
                Horário de funcionamento da academia
              </Text>
              {(() => {
                const day = todayWeekDay();
                const slot = gym.schedule?.[day];
                if (!slot || !slot.enabled) {
                  return (
                    <View className="flex-row items-center gap-2">
                      <Clock color="#606078" size={14} />
                      <Text className="text-brand-text-muted text-sm">Academia fechada hoje</Text>
                    </View>
                  );
                }
                return (
                  <View className="flex-row items-center gap-2">
                    <Clock color="#FF6B35" size={14} />
                    <Text className="text-brand-text-muted text-sm">
                      Hoje:{' '}
                      <Text className="text-brand-text-secondary font-semibold">
                        {slot.open} às {slot.close}
                      </Text>
                    </Text>
                  </View>
                );
              })()}
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}
