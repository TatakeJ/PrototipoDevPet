import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { saveHabits } from "../lib/supabaseClient";

const Sleep = ({ addPoints, onSaved }) => {
  const [sleepTime, setSleepTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');

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
    await saveHabits({
      sleep_hours: hours
    });

    addPoints(prev => prev + 10);
    Alert.alert("¡Buen descanso!", "Horas de sueño guardadas.");
    onSaved();

  } catch (err) {
    Alert.alert("Error", err.message);
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>😴</Text>
        <Text style={styles.title}>¿Cuánto dormiste?</Text>
        
        <TextInput placeholder="Dormir (22:00)" style={styles.input} onChangeText={setSleepTime} keyboardType="numbers-and-punctuation" />
        <TextInput placeholder="Despertar (06:00)" style={styles.input} onChangeText={setWakeTime} keyboardType="numbers-and-punctuation" />
        
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Total calculado:</Text>
          <Text style={styles.resultText}>{calculateSleepHours()} hrs</Text>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Registrar Sueño</Text>
        </TouchableOpacity>
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
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});

export default Sleep;
