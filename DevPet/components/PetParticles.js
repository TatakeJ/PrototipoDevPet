import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Define los emojis por estado
const EMOJI_SETS = {
  happy: [
    require('../assets/emojis/happy.png'),
  ],
  sad: [
    require('../assets/emojis/sad.png'),
  ],
};

// Cuántas partículas simultáneas por estado
const PARTICLE_COUNT = {
  happy: 10,
  sad: 10,
};

// Una sola partícula animada
function Particle({ emoji, petAreaWidth, petAreaHeight, delay }) {
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity    = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = () => {
        // Posición inicial aleatoria alrededor del gato
        const currentStartX = (Math.random() - 0.5) * petAreaWidth * 0.8;
        const currentStartY = -(Math.random() * 0.5 + 0.1) * petAreaHeight * 0.8; // entre 10% y 60% de altura

        translateX.setValue(currentStartX);
        translateY.setValue(currentStartY);
        opacity.setValue(0);

        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
            // Sube entre 80 y 140px
            Animated.timing(translateY, {
                toValue: currentStartY - (80 + Math.random() * 60),
                duration: 2200 + Math.random() * 800,
                useNativeDriver: true,
            }),
            // Leve deriva horizontal
            Animated.timing(translateX, {
                toValue: currentStartX + (Math.random() - 0.5) * 30,
                duration: 2200 + Math.random() * 800,
                useNativeDriver: true,
            }),
            // Aparece rápido, desaparece al final
            Animated.sequence([
                Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
                }),
                Animated.delay(1400),
                Animated.timing(opacity, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
                }),
            ]),
            ]),
        ]).start(() => animate()); // loop infinito
        };

        animate();
    }, []);

    return (
        <Animated.Image
        source={emoji}
        style={[
            styles.particle,
            {
            opacity,
            transform: [{ translateY }, { translateX }],
            },
        ]}
        />
    );
    }

    // Componente principal
    export default function PetParticles({ petState, petAreaWidth, petAreaHeight }) {
    const emojis = EMOJI_SETS[petState] || EMOJI_SETS.neutral;
    const count  = PARTICLE_COUNT[petState] || 3;

    // Genera las partículas con delay escalonado
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: emojis[i % emojis.length],
        delay: (i / count) * 2000, // distribuye los delays en 2 segundos
    }));

    return (
        <View
        style={[styles.container, { width: petAreaWidth, height: petAreaHeight }]}
        pointerEvents="none" // no bloquea toques al gato
        >
        {particles.map(p => (
            <Particle
            key={p.id}
            emoji={p.emoji}
            delay={p.delay}
            petAreaWidth={petAreaWidth}
            petAreaHeight={petAreaHeight}
            />
        ))}
        </View>
    );
    }

    const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        alignSelf: "center",
    },
    particle: {
        position: 'absolute',
        width: 40,
        height: 40,
        resizeMode: 'contain',
        left: "50%",
        bottom: 0,
    },
});