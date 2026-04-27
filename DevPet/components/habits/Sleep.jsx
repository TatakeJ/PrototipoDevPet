import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { saveSleepLog, getDayHabits } from "../../lib/supabaseClient";
import { BrainCog } from "lucide-react-native";

const Sleep = ({ addPoints, onSaved }) => {
  const [sleepTime, setSleepTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [hasSleepRecord, setHasSleepRecord] = useState(false);
  const [sleepRecord, setSleepRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si ya existe registro de sueño hoy
  useEffect(() => {
    checkSleepRecord();
  }, []);

  const checkSleepRecord = async () => {
    try {
      const dayHabits = await getDayHabits();
      const sleepLog = dayHabits.find(log => log.healthy_habits?.type === 'sleep');
      
      if (sleepLog) {
        setHasSleepRecord(true);
        setSleepRecord(sleepLog);
      }
    } catch (error) {
      console.error('Error verificando registro de sueño:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSleepHours = () => {
    if (!sleepTime || !wakeTime) return 0

    const [hSleep, mSleep] = sleepTime.split(':').map(Number)
    const [hWake, mWake] = wakeTime.split(':').map(Number)

    const sleepDate = new Date(2000, 0, 1, hSleep, mSleep)
    const wakeDate = new Date(2000, 0, 1, hWake, mWake)

    let diff = (wakeDate - sleepDate) / (1000 * 60 * 60)
    if (diff < 0) diff += 24

    return diff.toFixed(1)
  }

  const handleSave = async () => {
  const hours = Number(calculateSleepHours());

  if (hours <= 0) {
    return Alert.alert("Aviso", "Ingresa horas válidas (Ej: 22:00)");
  }

  try {
    await saveSleepLog(hours);
    // Los puntos se asignan automáticamente por el trigger trg_add_points_on_log
    Alert.alert("¡Buen descanso!", "Horas de sueño guardadas.");
    
    // Actualizar estado para mostrar mensaje de completado
    await checkSleepRecord();
    
    onSaved();

  } catch (err) {
    Alert.alert("Error", err.message);
  }
};

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.loadingText}>Verificando registros...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {hasSleepRecord ? (
          // Mensaje motivacional si ya se registró sueño hoy
          <View style={styles.completedContainer}>
            <Text style={styles.icon}>😴</Text>
            <Text style={styles.completedTitle}>¡Excelente descanso!</Text>
            <Text style={styles.completedMessage}>
              Ya has registrado tu sueño de hoy: {sleepRecord?.value || 0} horas
            </Text>
            <Text style={styles.completedSubMessage}>
              {"\n"}Un buen descanso es fundamental para tu salud y productividad.
              {"\n"}Sigue manteniendo tus hábitos de sueño saludables.
            </Text>
            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>💡 Consejo del día</Text>
              <Text style={styles.tipText}>
                Puedes verificar todos tus registros del día en el icono del cerebro <BrainCog size={20} color="#0C4A6E"/> en la pantalla principal.
              </Text>
            </View>
          </View>
        ) : (
          // Formulario normal si no se ha registrado sueño hoy
          <>
            <Text style={styles.icon}>😴</Text>
            <Text style={styles.title}>¿Cuánto dormiste?</Text>
            
            <TextInput 
              placeholder="Dormir (22:00)" 
              style={styles.input} 
              onChangeText={setSleepTime} 
              keyboardType="numbers-and-punctuation" 
            />
            <TextInput 
              placeholder="Despertar (06:00)" 
              style={styles.input} 
              onChangeText={setWakeTime} 
              keyboardType="numbers-and-punctuation" 
            />
            
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Total calculado:</Text>
              <Text style={styles.resultText}>{calculateSleepHours()} hrs</Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Guardar sueño</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  card: { backgroundColor: 'white', padding: 30, borderRadius: 30, width: '85%', elevation: 5 },
  icon: { fontSize: 40, textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1E293B', marginBottom: 20 },
  input: { backgroundColor: '#F1F5F9', padding: 15, borderRadius: 15, marginBottom: 12, fontSize: 16 },
  resultBox: { marginVertical: 15, alignItems: 'center', backgroundColor: '#EEF2FF', padding: 10, borderRadius: 15 },
  resultLabel: { color: '#6366F1', fontSize: 12, fontWeight: 'bold' },
  resultText: { fontSize: 24, fontWeight: 'bold', color: '#4338CA' },
  saveBtn: { backgroundColor: '#6366F1', paddingVertical: 15, borderRadius: 20, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  
  // Estilos para mensaje de completado
  completedContainer: { alignItems: 'center', padding: 10 },
  completedTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#10B981', marginBottom: 15 },
  completedMessage: { fontSize: 18, textAlign: 'center', color: '#1E293B', fontWeight: '600', marginBottom: 10 },
  completedSubMessage: { fontSize: 14, textAlign: 'center', color: '#64748B', lineHeight: 20, marginBottom: 20 },
  tipBox: { backgroundColor: '#F0F9FF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#BAE6FD' },
  tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#0369A1', marginBottom: 5 },
  tipText: { fontSize: 13, color: '#0C4A6E', textAlign: 'center', lineHeight: 18 },
  loadingText: { fontSize: 16, color: '#64748B', textAlign: 'center', fontStyle: 'italic' }
});

export default Sleep;
