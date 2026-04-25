import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

const MLCamera = ({ onDetected }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("idle");

  // 1. Manejo de permisos
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Necesitamos permiso para usar la cámara</Text>
        <Button title="Conceder Permiso" onPress={requestPermission} />
      </View>
    );
  }

  // 2. Lógica de envío a ML (Simulada)
  const sendToML = (uri) => {
    return new Promise((resolve) => {
      setStatus("processing");
      console.log("Enviando a ML... { Model: @teachablemachine/image }");

      setTimeout(() => {
        const isCorrect = Math.random() > 0.3;
        const result = { pose: isCorrect ? "correcta" : "incorrecta" };

        console.log("Resultado:", result);

        if (result.pose === "correcta") {
          setStatus("success");
          onDetected();
        } else {
          setStatus("error");
          Alert.alert(
            "Postura incorrecta",
            "Asegúrate de estar completamente visible y estirado"
          );
        }
        resolve();
      }, 1500);
    });
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
      });

      await sendToML(photo.uri);
    } catch (error) {
      Alert.alert("Error", "No se pudo capturar la fotografía");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="front" />

      <View style={styles.overlay}>
        <Text style={styles.text}>Apunta a tu cuerpo</Text>
        
        <View style={{ opacity: isProcessing ? 0.5 : 1, width: '100%' }}>
          <Button
            title={isProcessing ? "Procesando..." : "Validar estiramiento"}
            onPress={handleCapture}
            disabled={isProcessing}
          />
        </View>

        {/* Feedback visual según el estado */}
        {status === "processing" && (
          <Text style={styles.feedbackText}>🔍 Analizando postura...</Text>
        )}

        {status === "error" && (
          <Text style={[styles.feedbackText, { color: "#ff4444" }]}>❌ Postura incorrecta</Text>
        )}

        {status === "success" && (
          <Text style={[styles.feedbackText, { color: "#00C851" }]}>✅ ¡Excelente!</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 20,
    borderRadius: 15,
    width: "85%",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 16,
    marginBottom: 12,
    fontWeight: "bold",
  },
  feedbackText: {
    color: "white",
    marginTop: 10,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
});

export default MLCamera;
