import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import AnimatedPressable from './AnimatedPressable';
import { useThemeColors } from '../../../theme/useThemeColors';

interface WeekSelectorProps {
  weeks: number[];
  onChange: (weeks: number[]) => void;
  disabled?: boolean;
}

type WeekMode = 'all' | 'range' | 'even' | 'odd';

function detectMode(w: number[]): WeekMode {
  if (!w || w.length === 0) return 'all';
  if (w.length === 1) return 'range';
  const allEven = w.every(n => n % 2 === 0);
  if (allEven) return 'even';
  const allOdd = w.every(n => n % 2 === 1);
  if (allOdd) return 'odd';
  return 'range';
}

const MODES: { key: WeekMode; label: string }[] = [
  { key: 'all', label: '每周' },
  { key: 'range', label: '范围' },
  { key: 'even', label: '双周' },
  { key: 'odd', label: '单周' },
];

export default function WeekSelector({ weeks, onChange, disabled }: WeekSelectorProps) {
  const theme = useThemeColors();
  const [mode, setMode] = useState<WeekMode>(detectMode(weeks));
  const [rangeStart, setRangeStart] = useState(weeks.length > 0 ? String(weeks[0]) : '1');
  const [rangeEnd, setRangeEnd] = useState(weeks.length > 0 ? String(weeks[weeks.length - 1]) : '16');

  const displayWeeks = useMemo(() => {
    const s = parseInt(rangeStart, 10);
    const e = parseInt(rangeEnd, 10);
    if (isNaN(s) || isNaN(e) || s < 1 || e > 20 || s > e) return [];
    const arr: number[] = [];
    for (let i = s; i <= e; i++) {
      if (mode === 'even' && i % 2 !== 0) continue;
      if (mode === 'odd' && i % 2 !== 1) continue;
      arr.push(i);
    }
    return arr;
  }, [mode, rangeStart, rangeEnd]);

  const handleModeChange = (newMode: WeekMode) => {
    setMode(newMode);
    if (newMode === 'all') {
      onChange([]);
    } else {
      const s = parseInt(rangeStart, 10) || 1;
      const e = parseInt(rangeEnd, 10) || 16;
      const arr: number[] = [];
      for (let i = s; i <= e; i++) {
        if (newMode === 'even' && i % 2 !== 0) continue;
        if (newMode === 'odd' && i % 2 !== 1) continue;
        arr.push(i);
      }
      onChange(arr);
    }
  };

  const handleRangeChange = (start: string, end: string) => {
    setRangeStart(start);
    setRangeEnd(end);
    const s = parseInt(start, 10);
    const e = parseInt(end, 10);
    if (!isNaN(s) && !isNaN(e) && s >= 1 && e <= 20 && s <= e) {
      const arr: number[] = [];
      for (let i = s; i <= e; i++) {
        if (mode === 'even' && i % 2 !== 0) continue;
        if (mode === 'odd' && i % 2 !== 1) continue;
        arr.push(i);
      }
      onChange(arr);
    }
  };

  const isCustom = mode !== 'all';

  return (
    <View style={styles.container}>
      {/* Mode pills */}
      <View style={styles.modeRow}>
        {MODES.map(m => {
          const active = mode === m.key;
          return (
            <AnimatedPressable
              key={m.key}
              onPress={disabled ? undefined : () => handleModeChange(m.key)}
              style={[
                styles.modePill,
                { backgroundColor: theme.fgRgba04, borderColor: theme.border },
                active && { backgroundColor: theme.accentBg, borderColor: `${theme.accent}50` },
              ]}
            >
              <Text style={[styles.modeText, { color: active ? theme.accent : theme.textSecondary }]}>{m.label}</Text>
            </AnimatedPressable>
          );
        })}
      </View>

      {/* Range inputs */}
      {isCustom && (
        <View style={[styles.rangeRow, { backgroundColor: theme.fgRgba04, borderColor: theme.border }]}>
          <Text style={[styles.rangeLabel, { color: theme.textTertiary }]}>从第</Text>
          <TextInput
            style={[styles.rangeInput, { backgroundColor: theme.bgPrimary, borderColor: theme.border, color: theme.textPrimary }]}
            value={rangeStart}
            onChangeText={v => handleRangeChange(v, rangeEnd)}
            keyboardType="number-pad"
            maxLength={2}
            editable={!disabled}
          />
          <Text style={[styles.rangeLabel, { color: theme.textTertiary }]}>周到第</Text>
          <TextInput
            style={[styles.rangeInput, { backgroundColor: theme.bgPrimary, borderColor: theme.border, color: theme.textPrimary }]}
            value={rangeEnd}
            onChangeText={v => handleRangeChange(rangeStart, v)}
            keyboardType="number-pad"
            maxLength={2}
            editable={!disabled}
          />
          <Text style={[styles.rangeLabel, { color: theme.textTertiary }]}>周</Text>
          {displayWeeks.length > 0 && (
            <Text style={[styles.preview, { color: theme.accent }]}>{displayWeeks.length}周</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  modeRow: { flexDirection: 'row', gap: 8 },
  modePill: { flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center', borderWidth: 1 },
  modeText: { fontSize: 13, fontWeight: '600' },
  rangeRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 10, gap: 6, borderWidth: 1 },
  rangeLabel: { fontSize: 12, fontWeight: '500' },
  rangeInput: { width: 44, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 8, textAlign: 'center', fontSize: 14, fontWeight: '600', borderWidth: 1 },
  preview: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
});
