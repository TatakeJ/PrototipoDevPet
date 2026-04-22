import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { getHealthyHabits } from '../../lib/supabaseClient';

const { width } = Dimensions.get('window');

export default function DailyHabitCharts({ selectedHabit, habitLogs }) {
    const [healthyHabits, setHealthyHabits] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHealthyHabits();
    }, []);

    const loadHealthyHabits = async () => {
        try {
            setLoading(true);
            const habitsData = await getHealthyHabits();
            setHealthyHabits(habitsData);
        } catch (error) {
            console.error('Error cargando hábitos base:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando hábitos...</Text>
            </View>
        );
    }

    if (!selectedHabit || !healthyHabits) {
        return null;
    }

    // Find the selected habit data
    const habitData = healthyHabits.find(habit => habit.type === selectedHabit);
    if (!habitData) {
        return (
            <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No hay datos disponibles</Text>
            </View>
        );
    }

    // Filter logs for the selected habit
    const selectedHabitLogs = habitLogs ? habitLogs.filter(log => 
        log.healthy_habits?.type === selectedHabit
    ) : [];

    switch (selectedHabit) {
        case 'hydration':
            return <HydrationChart habitLogs={selectedHabitLogs} dailyGoal={habitData.daily_goal} />;
        case 'sleep':
            return <SleepCard habitLogs={selectedHabitLogs} />;
        case 'active_break':
            return <ActiveBreaksCard habitLogs={selectedHabitLogs} dailyGoal={habitData.daily_goal} />;
        default:
            return null;
    }
}

function HydrationChart({ habitLogs, dailyGoal }) {
    // Sort logs by created_at timestamp
    const sortedLogs = [...habitLogs].sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
    );

    // Calculate cumulative sum and create chart data points
    const chartData = [];
    const labels = [];
    let cumulativeSum = 0;

    sortedLogs.forEach(log => {
        cumulativeSum += log.value || 0;
        const hour = new Date(log.created_at).getUTCHours();
        const minutes = new Date(log.created_at).getUTCMinutes();
        
        chartData.push({
            value: cumulativeSum,
            dataPointColor: '#4B9FE1'
        });
        labels.push(`${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    });

    // Calculate dynamic max value for y-axis
    const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : dailyGoal;

    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Hidratación Diaria</Text>
            <Text style={styles.chartSubtitle}>Meta: {dailyGoal} ml</Text>
            
            <LineChart
                data={chartData}
                width={width - 80}
                height={200}
                spacing={Math.floor((width - 80) / chartData.length)}
                
                color1="#4B9FE1"
                thickness={2}
                hideDataPoints={false}
                dataPointsRadius={3}
                
                xAxisLabelTexts={labels}
                xAxisLabelTextStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                yAxisTextStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                yAxisLabelSuffix="ml"
                maxValue={maxValue}
                noOfSections={4}
                
                xAxisColor="rgba(255,255,255,0.1)"
                yAxisColor="rgba(255,255,255,0.1)"
                rulesColor="rgba(255,255,255,0.08)"
                rulesType="solid"
                backgroundColor="transparent"
                
                curved
                curvature={0.2}
                areaChart={false}
                hideRules={false}
            />
        </View>
    );
}

function SleepCard({ habitLogs }) {
    const totalSleep = habitLogs.reduce((sum, log) => sum + (log.value || 0), 0);
    
    return (
        <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Sueño Diario</Text>
            <View style={styles.cardContent}>
                <Text style={styles.cardValue}>{totalSleep.toFixed(1)}</Text>
                <Text style={styles.cardUnit}>horas</Text>
            </View>
            <Text style={styles.cardDescription}>Total de sueño hoy</Text>
        </View>
    );
}

function ActiveBreaksCard({ habitLogs, dailyGoal }) {
    const completedBreaks = habitLogs.length;
    
    return (
        <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Pausas Activas</Text>
            <View style={styles.cardContent}>
                <Text style={styles.cardValue}>{completedBreaks}</Text>
                <Text style={styles.cardUnit}>de {dailyGoal}</Text>
            </View>
            <Text style={styles.cardDescription}>Pausas completadas hoy</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    chartContainer: {
        marginBottom: 16,
    },
    chartTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    chartSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        marginBottom: 16,
    },
    cardContainer: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    cardValue: {
        color: '#FF6500',
        fontSize: 32,
        fontWeight: 'bold',
        marginRight: 4,
    },
    cardUnit: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
    },
    cardDescription: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        textAlign: 'center',
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    noDataText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontStyle: 'italic',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontStyle: 'italic',
    },
});
