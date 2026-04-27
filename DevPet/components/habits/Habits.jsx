import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  Alert, 
  ScrollView 
} from 'react-native';
import { saveHabits } from "../../lib/supabaseClient";

const Habits = ({ addPoints, onSaved }) => {
  const [view, setView] = useState('menu'); // 'menu', 'water', 'sleep'
  const [water, setWater] = useState(0);
  const [sleepTime, setSleepTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');

  const calculateSleepHours = () => {
    if (!sleepTime || !wakeTime) return 0;
    const [hS, mS] = sleepTime.split(':').map(Number);
    const [hW, mW] = wakeTime.split(':').map(Number);
    let diff = (new Date(0,0,0,hW,mW) - new Date(0,0,0,hS,mS)) / 1000 / 60 / 60;
    return diff < 0 ? (diff + 24).toFixed(1) : diff.toFixed(1);
  };

  const handleSave = async () => {
    try {
      const data = {
        user_id: 'demo-user',
        date: new Date().toISOString().split('T')[0],
        water: water,
        sleep_hours: Number(calculateSleepHours())
      };

      await saveHabits(data);
      if (addPoints) addPoints(prev => prev + 10);
      if (onSaved) onSaved();
      
      Alert.alert("¡Genial!", "Tus hábitos han sido actualizados.");
      setView('menu'); // Regresa al menú después de guardar
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // --- VISTA: MENÚ PRINCIPAL ---
  if (view === 'menu') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Panel de Hábitos</Text>
        <Text style={styles.subtitle}>¿Qué quieres registrar hoy?</Text>
        <View style={styles.menuGrid}>
          <TouchableOpacity style={[styles.card, styles.waterCard]} onPress={() => setView('water')}>
            <View style={styles.iconCircle}><Text style={styles.emoji}>💧</Text></View>
            <Text style={styles.cardText}>Agua</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.card, styles.sleepCard]} onPress={() => setView('sleep')}>
            <View style={styles.iconCircle}><Text style={styles.emoji}>😴</Text></View>
            <Text style={styles.cardText}>Sueño</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- VISTA: FORMULARIO ---
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => setView('menu')} style={styles.backBtn}>
        <Text style={{color: '#64748b'}}>← Volver al menú</Text>
      </TouchableOpacity>

      {view === 'water' ? (
        <View style={styles.formBlock}>
          <Text style={styles.title}>💧 Hidratación</Text>
          <Text style={styles.countText}>{water} vasos</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.btnRound} onPress={() => setWater(Math.max(0, water - 1))}><Text style={styles.btnText}>-</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnRound} onPress={() => setWater(water + 1)}><Text style={styles.btnText}>+</Text></TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.formBlock}>
          <Text style={styles.title}>😴 Sueño</Text>
          <TextInput placeholder="Dormir (22:00)" style={styles.input} onChangeText={setSleepTime} value={sleepTime} />
          <TextInput placeholder="Despertar (06:00)" style={styles.input} onChangeText={setWakeTime} value={wakeTime} />
          <Text style={styles.resultText}>Total: {calculateSleepHours()} hrs</Text>
        </View>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Guardar Todo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', backgroundColor: 'white' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  menuGrid: { flexDirection: 'row', gap: 15 },
  card: { flex: 1, padding: 20, borderRadius: 20, alignItems: 'center', elevation: 3 },
  waterCard: { backgroundColor: '#eff6ff' },
  sleepCard: { backgroundColor: '#faf5ff' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  emoji: { fontSize: 24 },
  cardText: { fontWeight: 'bold', color: '#334155' },
  formBlock: { width: '100%', alignItems: 'center', marginVertical: 20 },
  countText: { fontSize: 40, fontWeight: 'bold', color: '#3b82f6', marginVertical: 10 },
  row: { flexDirection: 'row', gap: 20 },
  btnRound: { backgroundColor: '#3b82f6', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  input: { backgroundColor: '#f1f5f9', width: '100%', padding: 15, borderRadius: 10, marginBottom: 10 },
  resultText: { fontStyle: 'italic', color: '#64748b' },
  saveBtn: { backgroundColor: '#10b981', width: '100%', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: 'white', fontWeight: 'bold' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 10 }
});

export default Habits;
