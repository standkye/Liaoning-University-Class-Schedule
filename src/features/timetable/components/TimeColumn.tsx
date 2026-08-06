import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TOTAL_PERIODS_CONST } from '../../../core/constants/layout';
import { periodToTime } from '../../../core/services/tsvParserService';

interface TimeColumnProps {
  periodHeight: number;
  width?: number;
}

const BIG_PERIOD_LABELS = ['上午', '上午', '下午', '下午', '晚上', '晚上'];

export default function TimeColumn({ periodHeight, width = 52 }: TimeColumnProps) {
  return (
    <View style={[styles.container, { width }]}>
      {Array.from({ length: TOTAL_PERIODS_CONST }, (_, i) => {
        const period = i + 1;
        const isOdd = period % 2 === 1;
        const bigIdx = Math.floor((period - 1) / 2);
        const startTime = periodToTime(period);

        return (
          <View
            key={i}
            style={[
              styles.cell,
              { height: periodHeight },
              isOdd && styles.oddCell,
            ]}
          >
            {isOdd && (
              <Text style={styles.bigLabel}>{BIG_PERIOD_LABELS[bigIdx]}</Text>
            )}
            <Text style={[styles.periodNum, isOdd && styles.oddPeriodNum]}>{period}</Text>
            <Text style={styles.timeText}>{startTime}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // background inherits from parent
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 2,
  },
  oddCell: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
  },
  bigLabel: {
    color: 'rgba(255, 255, 255, 0.15)',
    fontSize: 7,
    fontWeight: '600',
    position: 'absolute',
    top: 2,
    left: 3,
  },
  periodNum: {
    color: '#888',
    fontSize: 10,
    fontWeight: '600',
  },
  oddPeriodNum: {
    color: '#AAA',
  },
  timeText: {
    color: '#666',
    fontSize: 8,
    lineHeight: 11,
  },
});
