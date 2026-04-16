import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  TextInput, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity 
} from 'react-native';
import { saveHabits } from "../lib/supabaseClient";

const Habits = ({ addPoints, onSaved }) => {
  const [water, setWater] = useState(0);
  const [sleepTime, setSleepTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [message, setMessage] = useState('');

  // calcular horas de sueño. me pashe
  const calculateSleepHours = () => {
    if (!sleepTime || !wakeTime) return 0;

    const [hSleep, mSleep] = sleepTime.split(':').map(Number);
    const [hWake, mWake] = wakeTime.split(':').map(Number);

    const sleepDate = new Date(2000, 0, 1, hSleep, mSleep);
    const wakeDate = new Date(2000, 0, 1, hWake, mWake);

    let diff = (wakeDate - sleepDate) / (1000 * 60 * 60);
    if (diff < 0) diff += 24; // Manejo de cambio de día (lo ví en un tutorial)

    return diff.toFixed(1);
  };

  // Guardar en Supabase
  const handleSave = async ({ addPoints }) => {
    try {
      const data = {
        user_id: 'demo-user', // vincular ID real de Supabase Auth (para mi futuro yo)
        date: new Date().toISOString().split('T')[0],
        water: water,
        sleep_hours: Number(calculateSleepHours())
      };

      await saveHabits(data);

      addPoints(prev => prev + 10)

      setMessage('Guardado correctamente');
      onSaved()
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
    
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Registro de Hábitos</Text>

        {/* Sección Agua */}
        <View style={styles.section}>
          <Text style={styles.label}>Vasos de agua: {water}</Text>
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.btnCounter, { backgroundColor: '#ef4444' }]} 
              onPress={() => setWater(Math.max(0, water - 1))}
            >
              <Text style={styles.btnText}>-</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.btnCounter, { backgroundColor: '#3b82f6' }]} 
              onPress={() => setWater(water + 1)}
            >
              <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección Sueño */}
        <View style={styles.section}>
          <Text style={styles.label}>Horas de Sueño</Text>
          <TextInput
            placeholder="Dormir (Ej: 22:00)"
            value={sleepTime}
            onChangeText={setSleepTime}
            keyboardType="numbers-and-punctuation"
            style={styles.input}
          />
          <TextInput
            placeholder="Despertar (Ej: 06:00)"
            value={wakeTime}
            onChangeText={setWakeTime}
            keyboardType="numbers-and-punctuation"
            style={styles.input}
          />
          <Text style={styles.resultText}>Total: {calculateSleepHours()} hrs</Text> {/* Posible cambio */}
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar en Supabase</Text>
        </TouchableOpacity>

        {message ? <Text style={styles.feedback}>{message}</Text> : null}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f3f4f6'
  },
  card: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1f2937'
  },
  section: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#374151'
  },
  row: {
    flexDirection: 'row',
    gap: 15
  },
  btnCounter: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  btnText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    marginVertical: 5,
    borderRadius: 10,
    fontSize: 16
  },
  resultText: {
    marginTop: 5,
    color: '#6b7280',
    fontStyle: 'italic'
  },
  saveButton: {
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  feedback: {
    marginTop: 15,
    textAlign: 'center',
    fontWeight: '500'
  }
});

export default Habits;
