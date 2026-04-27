import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions, ScrollView } from 'react-native';
import { saveWaterLog } from "../../lib/supabaseClient";

const { height } = Dimensions.get('window');

const Water = ({ addPoints, onSaved }) => {
  const [water, setWater] = useState(0);
  const GOAL = 8; // Meta diaria de vasos
  const ML_PER_GLASS = 250;

  const handleSave = async () => {
    if (water <= 0) {
      return Alert.alert("¡Hey!", "Bebe un poco de agua antes de registrar 💧");
    }
    try {
      await saveWaterLog(water * ML_PER_GLASS);
      // Los puntos se asignan automáticamente por el trigger trg_add_points_on_log
      Alert.alert("¡Hidratado!", "Progreso guardado. ¡Sigue así!");
      onSaved?.();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // Calcula el porcentaje de llenado (máximo 100%)
  const fillPercentage = Math.min((water / GOAL) * 100, 100);

  return (
  <View style={{ flex: 1 }}> 
    {/* El fondo de agua se queda fuera del scroll para que sea estático */}
    <View style={[styles.waterBackground, { height: `${fillPercentage}%` }]} />

    <ScrollView 
      contentContainerStyle={{ paddingBottom: 60, alignItems: 'center', paddingTop: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Hidratación</Text>
        <Text style={styles.mlText}>{water * ML_PER_GLASS} ml / {GOAL * ML_PER_GLASS} ml</Text>
      </View>

      <View style={styles.mainCounter}>
        <Text style={styles.waterEmoji}>💧</Text>
        <Text style={styles.countNumber}>{water}</Text>
        <Text style={styles.label}>vasos hoy</Text>
      </View>

      <View style={styles.grid}>
        {[...Array(12)].map((_, i) => (
          <TouchableOpacity 
            key={i} 
            onPress={() => setWater(i + 1)}
            style={[styles.glassIcon, i < water ? styles.glassFull : styles.glassEmpty]}
          >
            <Text style={{ opacity: i < water ? 1 : 0.3 }}>🥛</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* BOTÓN DE REGISTRO INTEGRADO ABAJO */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>REGISTRAR AGUA</Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
);
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  
  waterBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#007AFF', 
    opacity: 0.3,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },

  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  
  title: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  mlText: { fontSize: 18, color: '#60A5FA', fontWeight: '700', marginTop: 5 },

  mainCounter: {
    backgroundColor: '#FFFFFF', 
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#007AFF',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    marginBottom: 30,
    borderWidth: 4,
    borderColor: '#DBEAFE'
  },
  
  countNumber: { fontSize: 80, fontWeight: 'bold', color: '#1E40AF' },
  label: { fontSize: 14, color: '#64748B', fontWeight: 'bold', textTransform: 'uppercase' },

  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: 12, 
    marginBottom: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 2,
    borderRadius: 30,
    width: '95%'
  },

  glassIcon: {
    width: 55,
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
    elevation: 3
  },

  glassFull: { 
    backgroundColor: '#3B82F6', 
    borderWidth: 2, 
    borderColor: '#FFFFFF' 
  },
  glassEmpty: { 
    backgroundColor: '#F1F5F9',
    opacity: 0.9 
  },

  saveBtn: {
    backgroundColor: '#2563EB',
    width: '85%',
    height: 65,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    marginBottom: 20
  },
  saveBtnText: { color: 'white', fontWeight: '900', fontSize: 18, letterSpacing: 1.5 },
});

export default Water;
