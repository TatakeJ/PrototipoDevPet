import React from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'

const MLView = ({ onDetected }) => {

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/pose@latest"></script>
  </head>
  <body>
    <video id="webcam" autoplay playsinline width="300" height="300"></video>

    <script>
      const URL = "https://teachablemachine.withgoogle.com/models/UTWlA7v3H/";

      let model, webcam;

      async function init() {
        model = await tmPose.load(URL + "model.json", URL + "metadata.json");

        webcam = new tmPose.Webcam(300, 300, true);
        await webcam.setup();
        await webcam.play();

        document.getElementById("webcam").srcObject = webcam.webcam;

        window.requestAnimationFrame(loop);
      }

      async function loop() {
        webcam.update();
        await predict();
        window.requestAnimationFrame(loop);
      }

      async function predict() {
        const { posenetOutput } = await model.estimatePose(webcam.canvas);
        const prediction = await model.predict(posenetOutput);

        let best = prediction.reduce((a, b) => a.probability > b.probability ? a : b);

        if (best.probability > 0.8) {
          window.ReactNativeWebView.postMessage(best.className);
        }
      }

      init();
    </script>
  </body>
  </html>
  `

  const handleMLResult = () => {
  Alert.alert("IA", "Postura validada correctamente ✅")

  saveBreak({
    user_id: 'demo-user',
    completed_at: new Date().toISOString()
  })

  addPoints(prev => prev + 5)
}

  return (
    <View style={{ flex: 1 }}>
      <WebView
        style={{ flex: 1 }}
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={(event) => {
          const result = event.nativeEvent.data

          console.log("ML:", result)

          if (result === "Correcto") {
            onDetected(true)
          }
        }}
      />
    </View>
  )
}

export default MLView