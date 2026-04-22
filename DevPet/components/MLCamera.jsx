import React from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'

const MLCamera = ({ onDetected }) => {
  const [permission, requestPermission] = useCameraPermissions()

  if (!permission) {
    return <View />
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Necesitamos permiso para la cámara</Text>
        <Button title="Permitir" onPress={requestPermission} />
      </View>
    )
  }

 const simulateML = () => {
  console.log("CLICK");

  setTimeout(() => {
    console.log("DETECTED");
    onDetected();
  }, 2000);
};


  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }} />

      <View style={styles.overlay}>
        <Text style={styles.text}>Apunta a tu cuerpo</Text>
        <Button title="Validar estiramiento" onPress={simulateML} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 10
  },
  text: {
    color: 'white',
    marginBottom: 10
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default MLCamera