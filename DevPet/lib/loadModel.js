import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

export const loadModel = async () => {
  try {
    await tf.ready();
    
    const URL = "https://teachablemachine.withgoogle.com/models/UTWlA7v3H/";
    
    const model = await tf.loadLayersModel(`${URL}model.json`);

    console.log("✅ MODELO CARGADO DESDE LA NUBE");
    return model;
  } catch (error) {
    console.error("❌ ERROR CARGANDO DESDE URL:", error);
    return null;
  }
};
