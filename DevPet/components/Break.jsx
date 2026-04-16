import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Vibration 
} from 'react-native';
import { saveBreak } from "../lib/supabaseClient";

const Break = ( { addPoints, onSaved  } ) => {
  const FOCUS_TIME = 10; // tiempo de pomodoro 
  const [time, setTime] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let interval = null;

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      setIsRunning(false);
      handleFinish();
    }

    return () => clearInterval(interval);
  }, [isRunning, time]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
    setMessage('');
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(FOCUS_TIME);
    setMessage('');
  };

  const handleFinish = async () => {
    Vibration.vibrate([500, 500, 500]); // Notificar al usuario goty
    try {
      await saveBreak({
        user_id: 'demo-user',
        completed_at: new Date().toISOString()
      });

      addPoints(prev => prev + 5)
      
      setMessage('¡Break registrado con éxito!');
      Alert.alert("¡Buen trabajo!", "Has completado tu tiempo de descanso.");
      onSaved()
      
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const validateStretch = () => {
    Alert.alert(
      'Estiramiento', 
      '¿Confirmas que realizaste tus ejercicios de estiramiento chiquitín?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, lo hice', onPress: () => setMessage('Estiramiento validado') }
      ]
    );
  };

  const formatTime = () => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{formatTime()}</Text>
        <Text style={styles.statusText}>{isRunning ? 'EN MARCHA' : 'PAUSADO'}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.mainButton, isRunning ? styles.pauseBtn : styles.startBtn]} 
          onPress={handleStartPause}
        >
          <Text style={styles.buttonText}>{isRunning ? 'Pausar' : 'Iniciar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>Reiniciar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.stretchBtn} onPress={validateStretch}>
        <Text style={styles.stretchText}>Validar Estiramiento</Text>
      </TouchableOpacity>

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  timerCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 8,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginBottom: 40,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
  },
  timerText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statusText: {
    fontSize: 14,
    color: '#94A3B8',
    letterSpacing: 2,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 30,
  },
  mainButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 2,
  },
  startBtn: { backgroundColor: '#22C55E' },
  pauseBtn: { backgroundColor: '#F59E0B' },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    padding: 10,
  },
  resetText: {
    color: '#64748B',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  stretchBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 15,
  },
  stretchText: {
    color: 'white',
    fontWeight: '600',
  },
  message: {
    marginTop: 20,
    color: '#475569',
    fontSize: 16,
  },
});

export default Break;
