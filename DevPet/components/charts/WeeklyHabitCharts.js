import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { getWeekHabits } from '../../lib/supabaseClient';

const { width } = Dimensions.get('window');

export default function WeeklyHabitCharts({ selectedHabit, userId }) {
    const [weeklyData, setWeeklyData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWeeklyData();
    }, [selectedHabit, userId]);

    const loadWeeklyData = async () => {
        try {
            setLoading(true);
            const data = await getWeekHabits(userId);
            
            // Procesar datos según el hábito seleccionado
            const processedData = processWeeklyData(data, selectedHabit);
            setWeeklyData(processedData);
        } catch (error) {
            console.error('Error cargando datos semanales:', error);
        } finally {
            setLoading(false);
        }
    };

    const processWeeklyData = (data, habitType) => {
        // Filtrar datos por tipo de hábito
        const filteredData = data.filter(log => 
            log.healthy_habits?.type === habitType
        );

        // Agrupar por día y sumar valores
        const dailyData = {};
        filteredData.forEach(log => {
            const date = log.log_date;
            if (!dailyData[date]) {
                dailyData[date] = 0;
            }
            dailyData[date] += log.value || 0;
        });

        // Crear array para los últimos 7 días
        const result = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toLocaleDateString('en-CA');
            
            result.push({
                date: dateStr,
                value: dailyData[dateStr] || 0,
                label: date.toLocaleDateString('es-ES', { weekday: 'short' }) // Lun, Mar, etc.
            });
        }

        return result;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando datos semanales...</Text>
            </View>
        );
    }

    if (!weeklyData || weeklyData.length === 0) {
        return (
            <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No hay datos esta semana</Text>
            </View>
        );
    }

    // Preparar datos para el gráfico
    const chartData = weeklyData.map(day => ({
        value: day.value,
        dataPointColor: getChartColor(selectedHabit)
    }));

    const labels = weeklyData.map(day => day.label);

    // Calcular el máximo para el eje Y dinámico
    const maxValue = Math.max(...weeklyData.map(day => day.value));
    const dynamicMaxY = getDynamicMaxY(selectedHabit, maxValue);

    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartSubtitle}>
                {getChartTitle(selectedHabit)} (últimos 7 días)
            </Text>
            
            <LineChart
                data={chartData}
                width={width - 80}
                height={200}
                spacing={Math.floor((width - 80) / chartData.length)}
                
                color1={getChartColor(selectedHabit)}
                thickness={2}
                hideDataPoints={false}
                dataPointsRadius={3}
                
                xAxisLabelTexts={labels}
                xAxisLabelTextStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                yAxisTextStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                yAxisLabelSuffix={getUnitSuffix(selectedHabit)}
                maxValue={dynamicMaxY}
                noOfSections={selectedHabit === 'active_break' ? 7 : 4}
                
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

function getChartTitle(habitType) {
    switch (habitType) {
        case 'sleep':
            return 'Sueño Semanal';
        case 'hydration':
            return 'Hidratación Semanal';
        case 'active_break':
            return 'Pausas Activas Semanales';
        default:
            return 'Gráfico Semanal';
    }
}

function getChartColor(habitType) {
    switch (habitType) {
        case 'sleep':
            return '#7C6FCD';
        case 'hydration':
            return '#4B9FE1';
        case 'active_break':
            return '#4BC98A';
        default:
            return '#4B9FE1';
    }
}

function getUnitSuffix(habitType) {
    switch (habitType) {
        case 'sleep':
            return 'h';
        case 'hydration':
            return 'ml';
        case 'active_break':
            return '';
        default:
            return '';
    }
}

function getDecimalPlaces(habitType) {
    switch (habitType) {
        case 'sleep':
            return 1; // 1 decimal para horas
        case 'hydration':
            return 0; // Sin decimales para ml
        case 'active_break':
            return 0; // Sin decimales para contador
        default:
            return 0;
    }
}

function getDynamicMaxY(habitType, maxValue) {
    switch (habitType) {
        case 'sleep':
            return Math.max(maxValue, 12); // Mínimo 12 horas para sueño
        case 'hydration':
            return Math.max(maxValue, 2500); // Mínimo 2500ml para hidratación
        case 'active_break':
            return Math.max(maxValue, 7); // Mínimo 7 pausas
        default:
            return maxValue;
    }
}

const styles = StyleSheet.create({
    chartContainer: {
        marginBottom: 16,
    },
    chartSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        marginBottom: 16,
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
});
