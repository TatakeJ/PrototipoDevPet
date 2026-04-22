/* import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-react-native'
import { bundleResourceIO } from '@tensorflow/tfjs-react-native'

export const loadModel = async () => {
  const modelJson = require('../assets/model/model.json')
  const modelWeights = require('../assets/model/weights.bin')

  const model = await tf.loadLayersModel(
    bundleResourceIO(modelJson, modelWeights)
  )

  console.log("MODEL LOADED")
  return model
} */