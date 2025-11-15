// src/components/charts/FunnelBarChart.tsx
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { ThemedText } from '../ThemedText';

export type FunnelPoint = {
    stageLabel: string; // Ex: "Novo", "Qualificado"
    value: number;      // Quantidade de negócios nesse estágio
};

type Props = {
    data: FunnelPoint[];
};

export const FunnelBarChart: React.FC<Props> = ({ data }) => {
    const { theme } = useTheme();

    const prepared = useMemo(() => {
        if (!data || data.length === 0) return [];
        // garante números
        return data.map((d) => ({
            stageLabel: d.stageLabel,
            value: Number.isFinite(d.value) ? d.value : 0,
        }));
    }, [data]);

    const maxValue = useMemo(() => {
        if (prepared.length === 0) return 0;
        return Math.max(...prepared.map((d) => d.value));
    }, [prepared]);

    if (!prepared.length || maxValue === 0) {
        return (
            <View style={styles.emptyWrapper}>
                <ThemedText variant="caption">
                    Ainda não há dados suficientes para montar o funil.
                </ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {prepared.map((point) => {
                const percentage = (point.value / maxValue) * 100;

                return (
                    <View key={point.stageLabel} style={styles.row}>
                        {/* Label do estágio */}
                        <View style={styles.labelCol}>
                            <ThemedText variant="caption" style={{ color: theme.textSoft }}>
                                {point.stageLabel}
                            </ThemedText>
                        </View>

                        {/* Barra */}
                        <View style={styles.barCol}>
                            <View
                                style={[
                                    styles.barTrack,
                                    { backgroundColor: theme.surfaceAlt },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.barFill,
                                        {
                                            backgroundColor: theme.primary,
                                            width: `${percentage}%`,
                                        },
                                    ]}
                                />
                            </View>
                        </View>

                        {/* Valor numérico */}
                        <View style={styles.valueCol}>
                            <ThemedText
                                variant="caption"
                                style={{ color: theme.textSoft }}
                            >
                                {point.value}
                            </ThemedText>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 8,
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelCol: {
        width: 90,
        paddingRight: 6,
    },
    barCol: {
        flex: 1,
    },
    valueCol: {
        width: 32,
        alignItems: 'flex-end',
        marginLeft: 6,
    },
    barTrack: {
        height: 10,
        borderRadius: 999,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 999,
    },
    emptyWrapper: {
        paddingVertical: 12,
    },
});
