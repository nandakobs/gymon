import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { useAuth } from '@/providers/AuthProvider';
import { getUsersByGym, updateUser, deleteUser } from '@/services/firebase/users.service';
import { UserPlus, X, Pencil, Trash2 } from 'lucide-react-native';

type UserRole = 'student' | 'coach' | 'manager';

interface GymUser {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  height?: number;
  weight?: number;
  goal?: string;
  medical_conditions?: string;
  memberSince?: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Aluno',
  coach: 'Coach',
  manager: 'Gerente',
};

const ROLE_ORDER: ReadonlyArray<UserRole> = ['manager', 'coach', 'student'];

const ROLE_SECTION_LABELS: Record<UserRole, string> = {
  manager: 'Gerentes',
  coach: 'Coaches',
  student: 'Alunos',
};

type RoleGroup = { role: UserRole; users: GymUser[] };

function buildGroupedList(users: GymUser[]): RoleGroup[] {
  const buckets: Record<UserRole, GymUser[]> = { manager: [], coach: [], student: [] };
  for (const u of users) buckets[u.role].push(u);
  for (const role of ROLE_ORDER) {
    buckets[role].sort((a, b) =>
      a.displayName.localeCompare(b.displayName, 'pt-BR', { sensitivity: 'base' }),
    );
  }
  return ROLE_ORDER.filter((role) => buckets[role].length > 0).map((role) => ({
    role,
    users: buckets[role],
  }));
}

function buildCreatePayload(params: {
  name: string; email: string; role: UserRole; gymId: string; now: string;
  height: string; weight: string; goal: string; medicalConditions: string; memberSince: string;
}) {
  const base = {
    displayName: params.name.trim(),
    email: params.email.trim().toLowerCase(),
    role: params.role,
    gymId: params.gymId,
    createdAt: params.now,
    memberSince: params.memberSince.trim() || params.now,
  };
  if (params.role !== 'student') return base;
  return {
    ...base,
    ...(params.height.trim() ? { height: parseFloat(params.height.trim()) } : {}),
    ...(params.weight.trim() ? { weight: parseFloat(params.weight.trim()) } : {}),
    ...(params.goal.trim() ? { goal: params.goal.trim() } : {}),
    ...(params.medicalConditions.trim() ? { medical_conditions: params.medicalConditions.trim() } : {}),
  };
}

export default function UserManagement() {
  const { gymId, user } = useAuth();
  const [users, setUsers] = useState<GymUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [createVisible, setCreateVisible] = useState(false);
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [cRole, setCRole] = useState<UserRole>('student');
  const [cHeight, setCHeight] = useState('');
  const [cWeight, setCWeight] = useState('');
  const [cGoal, setCGoal] = useState('');
  const [cMedical, setCMedical] = useState('');
  const [cMemberSince, setCMemberSince] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<GymUser | null>(null);
  const [eName, setEName] = useState('');
  const [eRole, setERole] = useState<UserRole>('student');
  const [eHeight, setEHeight] = useState('');
  const [eWeight, setEWeight] = useState('');
  const [eGoal, setEGoal] = useState('');
  const [eMedical, setEMedical] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!gymId) return;
    setIsLoading(true);
    try {
      const list = await getUsersByGym(gymId);
      setUsers(list as GymUser[]);
    } finally {
      setIsLoading(false);
    }
  }, [gymId]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function resetCreate() {
    setCName(''); setCEmail(''); setCPassword(''); setCRole('student');
    setCHeight(''); setCWeight(''); setCGoal(''); setCMedical(''); setCMemberSince('');
  }

  async function handleCreate() {
    if (!cName.trim() || !cEmail.trim() || !cPassword.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }
    if (cPassword.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (!gymId) return;

    setIsCreating(true);
    const now = new Date().toISOString();
    const payload = buildCreatePayload({
      name: cName, email: cEmail, role: cRole, gymId, now,
      height: cHeight, weight: cWeight, goal: cGoal,
      medicalConditions: cMedical, memberSince: cMemberSince,
    });

    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cEmail, password: cPassword, returnSecureToken: true }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      await setDoc(doc(db, 'users', data.localId), payload);
      resetCreate();
      setCreateVisible(false);
      fetchUsers();
    } catch (e: any) {
      if (e.message === 'EMAIL_EXISTS') {
        try {
          const recoveryRes = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: cEmail, password: cPassword, returnSecureToken: true }),
            }
          );
          const recoveryData = await recoveryRes.json();
          if (!recoveryData.error && recoveryData.localId) {
            const existingDoc = await getDoc(doc(db, 'users', recoveryData.localId));
            if (!existingDoc.exists()) {
              await setDoc(doc(db, 'users', recoveryData.localId), payload);
              resetCreate();
              setCreateVisible(false);
              fetchUsers();
              return;
            }
          }
        } catch {}
        Alert.alert('Erro', 'Este e-mail já está cadastrado.');
      } else {
        Alert.alert('Erro', e.message ?? 'Erro ao criar usuário.');
      }
    } finally {
      setIsCreating(false);
    }
  }

  function openEdit(u: GymUser) {
    setEditingUser(u);
    setEName(u.displayName);
    setERole(u.role);
    setEHeight(u.height != null ? String(u.height) : '');
    setEWeight(u.weight != null ? String(u.weight) : '');
    setEGoal(u.goal ?? '');
    setEMedical(u.medical_conditions ?? '');
    setEditVisible(true);
  }

  async function handleSaveEdit() {
    if (!editingUser || !eName.trim()) {
      Alert.alert('Erro', 'O nome não pode ficar em branco.');
      return;
    }
    setIsSaving(true);
    try {
      const updates: Record<string, unknown> = {
        displayName: eName.trim(),
        role: eRole,
      };
      if (eRole === 'student') {
        updates.height = eHeight.trim() ? parseFloat(eHeight.trim()) : null;
        updates.weight = eWeight.trim() ? parseFloat(eWeight.trim()) : null;
        updates.goal = eGoal.trim() || null;
        updates.medical_conditions = eMedical.trim() || null;
      }
      await updateUser(editingUser.id, updates as any);
      setEditVisible(false);
      fetchUsers();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }

  function confirmDelete(u: GymUser) {
    Alert.alert(
      'Remover usuário',
      `Tem certeza que deseja remover "${u.displayName}"? Esta ação remove o acesso do usuário à academia.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(u.id);
              setUsers((prev) => prev.filter((x) => x.id !== u.id));
            } catch {
              Alert.alert('Erro', 'Não foi possível remover o usuário. Tente novamente.');
            }
          },
        },
      ],
    );
  }

  const groups = buildGroupedList(users);

  return (
    <View className="flex-1 bg-brand-background">
      <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
        <Text className="text-brand-text-primary text-2xl font-bold">Usuários</Text>
        <TouchableOpacity
          className="bg-brand-primary rounded-xl px-4 py-2 flex-row items-center gap-2"
          onPress={() => setCreateVisible(true)}
        >
          <UserPlus color="#fff" size={16} />
          <Text className="text-white font-semibold text-sm">Novo</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#FF6B35" className="mt-8" />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 80 }}>
          {groups.length === 0 ? (
            <View className="bg-brand-surface rounded-2xl p-6 items-center">
              <Text className="text-brand-text-muted text-sm">Nenhum usuário cadastrado.</Text>
            </View>
          ) : (
            groups.map((group, groupIdx) => (
              <View key={group.role} style={{ marginTop: groupIdx === 0 ? 0 : 24 }}>
                <Text className="text-brand-text-secondary text-xs font-semibold mb-3">
                  {ROLE_SECTION_LABELS[group.role].toUpperCase()}
                </Text>

                <View className="bg-brand-surface rounded-2xl overflow-hidden">
                  {group.users.map((u, userIdx) => (
                    <View key={u.id}>
                      <View className="px-4 py-3 flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-full bg-brand-surface-2 items-center justify-center">
                          <Text className="text-brand-text-primary font-bold text-base">
                            {u.displayName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-brand-text-primary font-semibold" numberOfLines={1}>
                            {u.displayName}
                          </Text>
                          <Text className="text-brand-text-secondary text-xs mt-0.5" numberOfLines={1}>
                            {u.email}
                          </Text>
                        </View>
                        <View className="flex-row gap-3">
                          <TouchableOpacity onPress={() => openEdit(u)} hitSlop={8}>
                            <Pencil color="#A0A0B8" size={17} />
                          </TouchableOpacity>
                          {u.id !== user?.uid && (
                            <TouchableOpacity onPress={() => confirmDelete(u)} hitSlop={8}>
                              <Trash2 color="#F44336" size={17} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>

                      {userIdx < group.users.length - 1 && (
                        <View className="h-px bg-brand-surface-2 mx-4" />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={createVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-brand-surface rounded-t-3xl" style={{ maxHeight: '92%' }}>
            <View className="px-6 pt-6 pb-4 flex-row items-center justify-between border-b border-brand-surface-2">
              <Text className="text-brand-text-primary text-xl font-bold">Novo Usuário</Text>
              <TouchableOpacity onPress={() => { resetCreate(); setCreateVisible(false); }}>
                <X color="#A0A0B8" size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView
              contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text className="text-brand-text-secondary text-sm mb-2">Perfil</Text>
              <View className="flex-row gap-2 mb-5">
                {(['student', 'coach', 'manager'] as UserRole[]).map((r) => (
                  <TouchableOpacity
                    key={r}
                    className={`flex-1 py-2 rounded-xl items-center border ${cRole === r ? 'bg-brand-primary border-brand-primary' : 'bg-brand-surface-2 border-brand-surface-2'}`}
                    onPress={() => setCRole(r)}
                  >
                    <Text className={`text-sm font-semibold ${cRole === r ? 'text-white' : 'text-brand-text-secondary'}`}>
                      {ROLE_LABELS[r]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-brand-text-secondary text-sm mb-1">Nome completo *</Text>
              <TextInput className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-4 py-3 mb-4" placeholder="Ex: João Silva" placeholderTextColor="#606078" value={cName} onChangeText={setCName} />

              <Text className="text-brand-text-secondary text-sm mb-1">E-mail *</Text>
              <TextInput className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-4 py-3 mb-4" placeholder="joao@email.com" placeholderTextColor="#606078" value={cEmail} onChangeText={setCEmail} keyboardType="email-address" autoCapitalize="none" />

              <Text className="text-brand-text-secondary text-sm mb-1">Senha provisória *</Text>
              <TextInput className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-4 py-3 mb-4" placeholder="Mínimo 6 caracteres" placeholderTextColor="#606078" value={cPassword} onChangeText={setCPassword} secureTextEntry />

              <Text className="text-brand-text-secondary text-sm mb-1">Membro desde</Text>
              <TextInput className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-4 py-3 mb-5" placeholder="AAAA-MM-DD (opcional — padrão: hoje)" placeholderTextColor="#606078" value={cMemberSince} onChangeText={setCMemberSince} keyboardType="numbers-and-punctuation" />

              {cRole === 'student' && (
                <>
                  <View className="flex-row gap-3 mb-4">
                    <View className="flex-1">
                      <Text className="text-brand-text-secondary text-sm mb-1">Altura (cm)</Text>
                      <TextInput className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-4 py-3" placeholder="175" placeholderTextColor="#606078" value={cHeight} onChangeText={setCHeight} keyboardType="numeric" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-brand-text-secondary text-sm mb-1">Peso (kg)</Text>
                      <TextInput className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-4 py-3" placeholder="70" placeholderTextColor="#606078" value={cWeight} onChangeText={setCWeight} keyboardType="numeric" />
                    </View>
                  </View>
                  <Text className="text-brand-text-secondary text-sm mb-1">Objetivo</Text>
                  <TextInput className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-4 py-3 mb-4" placeholder="Ex: Hipertrofia, Emagrecimento..." placeholderTextColor="#606078" value={cGoal} onChangeText={setCGoal} />
                  <Text className="text-brand-text-secondary text-sm mb-1">Condições médicas</Text>
                  <TextInput className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-4 py-3 mb-5" placeholder="Ex: Hipertensão, problema no joelho..." placeholderTextColor="#606078" value={cMedical} onChangeText={setCMedical} multiline numberOfLines={3} textAlignVertical="top" style={{ minHeight: 80 }} />
                </>
              )}

              <TouchableOpacity className={`bg-brand-primary rounded-xl py-4 items-center ${isCreating ? 'opacity-60' : ''}`} onPress={handleCreate} disabled={isCreating}>
                {isCreating ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold text-base">Cadastrar</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={editVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-brand-surface rounded-t-3xl" style={{ maxHeight: '85%' }}>
            <View className="px-6 pt-6 pb-4 flex-row items-center justify-between border-b border-brand-surface-2">
              <Text className="text-brand-text-primary text-xl font-bold">Editar Usuário</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <X color="#A0A0B8" size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView
              contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text className="text-brand-text-secondary text-sm mb-2">Perfil</Text>
              <View className="flex-row gap-2 mb-5">
                {(['student', 'coach', 'manager'] as UserRole[]).map((r) => (
                  <TouchableOpacity
                    key={r}
                    className={`flex-1 py-2 rounded-xl items-center border ${eRole === r ? 'bg-brand-primary border-brand-primary' : 'bg-brand-surface-2 border-brand-surface-2'}`}
                    onPress={() => setERole(r)}
                  >
                    <Text className={`text-sm font-semibold ${eRole === r ? 'text-white' : 'text-brand-text-secondary'}`}>
                      {ROLE_LABELS[r]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-brand-text-secondary text-sm mb-1">Nome completo</Text>
              <TextInput className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-4 py-3 mb-4" placeholderTextColor="#606078" value={eName} onChangeText={setEName} />

              {eRole === 'student' && (
                <>
                  <View className="flex-row gap-3 mb-4">
                    <View className="flex-1">
                      <Text className="text-brand-text-secondary text-sm mb-1">Altura (cm)</Text>
                      <TextInput className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-4 py-3" placeholder="175" placeholderTextColor="#606078" value={eHeight} onChangeText={setEHeight} keyboardType="numeric" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-brand-text-secondary text-sm mb-1">Peso (kg)</Text>
                      <TextInput className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-4 py-3" placeholder="70" placeholderTextColor="#606078" value={eWeight} onChangeText={setEWeight} keyboardType="numeric" />
                    </View>
                  </View>
                  <Text className="text-brand-text-secondary text-sm mb-1">Objetivo</Text>
                  <TextInput className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-4 py-3 mb-4" placeholder="Ex: Hipertrofia..." placeholderTextColor="#606078" value={eGoal} onChangeText={setEGoal} />
                  <Text className="text-brand-text-secondary text-sm mb-1">Condições médicas</Text>
                  <TextInput className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-4 py-3 mb-5" placeholder="Ex: Hipertensão..." placeholderTextColor="#606078" value={eMedical} onChangeText={setEMedical} multiline numberOfLines={3} textAlignVertical="top" style={{ minHeight: 80 }} />
                </>
              )}

              <TouchableOpacity className={`bg-brand-primary rounded-xl py-4 items-center ${isSaving ? 'opacity-60' : ''}`} onPress={handleSaveEdit} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold text-base">Salvar alterações</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
