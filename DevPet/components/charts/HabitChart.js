import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { getDayHabits, getWeekHabits, getMonthHabits } from '../../lib/supabaseClient';
import DailyHabitCharts from './DailyHabitCharts';
import WeeklyHabitCharts from './WeeklyHabitCharts';
import MonthlyHabitCharts from './MonthlyHabitCharts';

const { width } = Dimensions.get('window');

const TABS = [
    { key: 'day',   label: 'Día' },
    { key: 'week',  label: 'Semana' },
    { key: 'month', label: 'Mes' },
];

const PERIOD_TITLE = {
    day:   'Diario',
    week:  'Semanal',
    month: 'Mensual',
};

export default function HabitChart({ userId }) {
    const [activeTab, setActiveTab] = useState('day');
    const [selectedHabit, setSelectedHabit] = useState('hydration');
    const [habitLogs, setHabitLogs] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, [activeTab, userId]);
    
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            let habitLogs;
            if (activeTab === 'day') {
                habitLogs = await getDayHabits(userId);
                setHabitLogs(habitLogs);
            } else if (activeTab === 'week') {
                habitLogs = await getWeekHabits(userId);
            } else if (activeTab === 'month') {
                habitLogs = await getMonthHabits(userId);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>⚠️ Error de Conexión</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity 
                        style={styles.retryButton} 
                        onPress={loadData}
                    >
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>
                        Cargando datos {PERIOD_TITLE[activeTab].toLowerCase()}...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Leyenda */}
            <View style={styles.legend}>
                <TouchableOpacity 
                    style={[styles.legendItem, selectedHabit === 'sleep' && styles.legendItemActive]}
                    onPress={() => setSelectedHabit('sleep')}
                >
                    <View style={[styles.legendDot, { backgroundColor: '#7C6FCD' }]} />
                    <Text style={[styles.legendText, selectedHabit === 'sleep' && styles.legendTextActive]}>Sueño</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.legendItem, selectedHabit === 'hydration' && styles.legendItemActive]}
                    onPress={() => setSelectedHabit('hydration')}
                >
                    <View style={[styles.legendDot, { backgroundColor: '#4B9FE1' }]} />
                    <Text style={[styles.legendText, selectedHabit === 'hydration' && styles.legendTextActive]}>Hidratación</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.legendItem, selectedHabit === 'active_break' && styles.legendItemActive]}
                    onPress={() => setSelectedHabit('active_break')}
                >
                    <View style={[styles.legendDot, { backgroundColor: '#4BC98A' }]} />
                    <Text style={[styles.legendText, selectedHabit === 'active_break' && styles.legendTextActive]}>Pausas activas</Text>
                </TouchableOpacity>
            </View>

            {/* Título */}
            <View style={styles.titleRow}>
                <Text style={styles.periodTitle}>
                    {PERIOD_TITLE[activeTab]}
                </Text>
            </View>

            {/* Gráfica */}
            {activeTab === 'day' ? (
                <DailyHabitCharts 
                    selectedHabit={selectedHabit} 
                    habitLogs={habitLogs} 
                />
            ) : activeTab === 'week' ? (
                <WeeklyHabitCharts 
                    selectedHabit={selectedHabit}
                    userId={userId}
                />
            ) : (
                <MonthlyHabitCharts 
                    selectedHabit={selectedHabit}
                    userId={userId}
                />
            )}

            {/* Tabs */}
            <View style={styles.tabs}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 8,
    },
    legend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    legendItemActive: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
    },
    legendTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontStyle: 'italic',
    },
    periodTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginTop: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: '#FF6500',
    },
    tabText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        fontWeight: '600',
    },
    tabTextActive: {
        color: '#fff',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorTitle: {
        color: '#ef4444',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    errorMessage: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        color: 'white',
        fontWeight: '600',
    },
});