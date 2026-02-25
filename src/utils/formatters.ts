export function formatWeight(kg: number): string {
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)} t` : `${kg} kg`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatReps(reps: number | string): string {
  if (typeof reps === 'string') return reps;
  return `${reps} rep${reps !== 1 ? 's' : ''}`;
}

export function formatStreak(count: number): string {
  return `${count} dia${count !== 1 ? 's' : ''}`;
}
