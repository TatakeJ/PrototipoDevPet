import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Vibration,
  Dimensions,
} from "react-native";
import { saveBreak } from "../lib/supabaseClient";

const { width } = Dimensions.get("window");

const Break = ({ addPoints, onSaved }) => {
  // Configuración de tiempos
  const TIMES = {
    FOCUS: 7, // 10 segundos para pruebas
    BREAK: 7, // 5 minutos de descanso
  };

  const [mode, setMode] = useState("FOCUS"); // FOCUS o BREAK
  const [time, setTime] = useState(TIMES.FOCUS);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let interval = null;

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      setIsRunning(false);
      CycleComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, time]);

  const handleCycleComplete = async () => {
    Vibration.vibrate([500, 500, 500]);

    if (mode === "FOCUS") {
      Alert.alert("¡Tiempo de enfoque terminado!", "Iniciando descanso.");
      setMode("BREAK");
      setTime(TIMES.BREAK);
      setIsRunning(true);
    } else {
      setMode("BREAK");
      setTime(TIMES.BREAK);
      setIsRunning(false);

      if (onSaved) onSaved();
    }
  };

  const handleStartPause = () => setIsRunning(!isRunning);

  const handleReset = () => {
    setIsRunning(false);
    setMode("FOCUS");
    setTime(TIMES.FOCUS);
    setMessage("");
  };

  const formatTime = () => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleFinish = () => {
    setIsRunning(false);
    onFinish();
  };

  // Colores dinámicos según el modo
  const themeColor = mode === "FOCUS" ? "#EF4444" : "#3B82F6";

  return (
    <View style={styles.container}>
      <Text style={[styles.modeTitle, { color: themeColor }]}>
        {mode === "FOCUS" ? "MODO ENFOQUE" : "MODO DESCANSO"}
      </Text>

      <View style={[styles.timerCircle, { borderColor: themeColor }]}>
        <Text style={styles.timerText}>{formatTime()}</Text>
        <Text style={styles.statusText}>
          {isRunning ? "EJECUTANDO" : "PAUSADO"}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.mainButton,
            { backgroundColor: isRunning ? "#64748B" : themeColor },
          ]}
          onPress={handleStartPause}
        >
          <Text style={styles.buttonText}>
            {isRunning ? "Pausar" : "Iniciar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>Reiniciar Ciclo</Text>
        </TouchableOpacity>
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    padding: 20,
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 30,
    letterSpacing: 1.5,
  },
  timerCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    borderWidth: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    marginBottom: 50,
    // Sombra para iOS/Android
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
  },
  timerText: {
    fontSize: 70,
    fontWeight: "bold",
    color: "#1E293B",
    fontVariant: ["tabular-nums"],
  },
  statusText: {
    fontSize: 12,
    color: "#94A3B8",
    letterSpacing: 3,
    fontWeight: "700",
    marginTop: -5,
  },
  controls: {
    alignItems: "center",
    width: "100%",
  },
  mainButton: {
    width: "80%",
    paddingVertical: 18,
    borderRadius: 35,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  resetButton: {
    padding: 10,
  },
  resetText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
  },
  message: {
    marginTop: 30,
    color: "#334155",
    fontWeight: "500",
    textAlign: "center",
  },
});

export default Break;
