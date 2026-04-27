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
    // Si no hay datos de hidratación hoy, mostrar mensaje motivacional
    if (!habitLogs || habitLogs.length === 0) {
        return (
            <View style={styles.noDataContainer}>
                <Text style={styles.noDataTitle}>¡A hidratarse! 💧</Text>
                <Text style={styles.noDataSubtitle}>
                    No has registrado agua hoy. 
                    {"\n"}Tu meta es de {dailyGoal} ml diarios.
                </Text>
                <Text style={styles.noDataTip}>
                    💡 Bebe un vaso de agua ahora y registra tu progreso
                </Text>
            </View>
        );
    }

    // Sort logs by log_hour to show hours from smallest to largest
    const sortedLogs = [...habitLogs].sort((a, b) => {
        return a.log_hour.localeCompare(b.log_hour);
    });

    // Calculate cumulative sum and create chart data points
    const chartData = [];
    const labels = [];
    let cumulativeSum = 0;

    sortedLogs.forEach(log => {
        cumulativeSum += log.value || 0;
        
        // Usar directamente log_hour de la consulta de Supabase
        // log_hour ya viene en formato HH:MM desde getLocalTime()
        const timeLabel = log.log_hour || '00:00';
        
        chartData.push({
            value: cumulativeSum,
            dataPointColor: '#4B9FE1'
        });
        labels.push(timeLabel);
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
    // Si no hay datos de sueño hoy, mostrar mensaje motivacional
    if (!habitLogs || habitLogs.length === 0) {
        return (
            <View style={styles.noDataContainerSleep}>
                <Text style={[styles.noDataTitle, {color: '#8B5CF6'}]}>¡Hora de descansar! 😴</Text>
                <Text style={styles.noDataSubtitle}>
                    No has registrado tu sueño hoy. 
                    {"\n"}Recuerda dormir entre 7-9 horas para un buen descanso.
                </Text>
                <Text style={[styles.noDataTip, {backgroundColor: 'rgba(139, 92, 246, 0.2)'}]}>
                    💡 Establece una rutina nocturna y mejora tu calidad de sueño
                </Text>
            </View>
        );
    }

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
    // Si no hay datos de pausas activas hoy, mostrar mensaje motivacional
    if (!habitLogs || habitLogs.length === 0) {
        return (
            <View style={styles.noDataContainerBreaks}>
                <Text style={[styles.noDataTitle, {color: '#10B981'}]}>¡Muévete y descansa! 🤸</Text>
                <Text style={styles.noDataSubtitle}>
                    No has hecho pausas activas hoy. 
                    {"\n"}Tu meta es de {dailyGoal} pausas para mantenerte energético.
                </Text>
                <Text style={[styles.noDataTip, {backgroundColor: 'rgba(16, 185, 129, 0.2)'}]}>
                    💡 Levántate, estira y muévete cada hora para mejorar tu salud
                </Text>
            </View>
        );
    }

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
        backgroundColor: 'rgba(75, 159, 225, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(75, 159, 225, 0.3)',
        margin: 20,
    },
    noDataContainerSleep: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)',
        margin: 20,
    },
    noDataContainerBreaks: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        margin: 20,
    },
    noDataTitle: {
        color: '#4B9FE1',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    noDataSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 16,
    },
    noDataTip: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic',
        backgroundColor: 'rgba(75, 159, 225, 0.2)',
        padding: 12,
        borderRadius: 8,
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
