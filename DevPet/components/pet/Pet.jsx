import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    useImperativeHandle,
    forwardRef,
} from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import PetParticles from './PetParticles';
import {
    getPetStatus,
    calculateEnergyLevel,
    getTodayWaterTotal,
    getTodaySleepHours,
    deductSleepyPoints,
} from '../../lib/supabaseClient';

const OptimizedParticles = React.memo(PetParticles);
const { width } = Dimensions.get('window');
const WATER_GOAL = 2500; // ml — debe coincidir con daily_goal en healthy_habits

const Pet = forwardRef(({ userId, points, onPointsChange }, ref) => {

    // ── Estado base (fijo) desde pet_states ──
    const [baseMood, setBaseMood]       = useState('neutral'); // happy | neutral | sad
    const [energyLevel, setEnergyLevel] = useState(50);

    // ── Estado dinámico sleepy ──
    const [isSleepy, setIsSleepy]               = useState(false);
    const [sleepyActive, setSleepyActive]        = useState(false); // condición activa
    const [sleepyPenaltyDone, setSleepyPenaltyDone] = useState(false);
    const sleepyTimerRef                         = useRef(null);
    const sleepyIntervalRef                      = useRef(null);

    // ── Estado dinámico thirsty ──
    const [isThirsty, setIsThirsty]         = useState(false);
    const [waterAccum, setWaterAccum]       = useState(0);   // ml acumulados hoy
    const [nextThirstyAt, setNextThirstyAt] = useState(null); // timestamp ms cuando se reactiva
    const thirstyTimerRef                   = useRef(null);

    // ── Área de la mascota para partículas ──
    const [petArea, setPetArea] = useState({ width: 0, height: 0 });
    const [bounce, setBounce]   = useState(false);

    // ── Efecto de rebote cuando suben los puntos ──
    useEffect(() => {
        if (points > 0) {
            setBounce(true);
            const t = setTimeout(() => setBounce(false), 150);
            return () => clearTimeout(t);
        }
    }, [points]);

    // ────────────────────────────────────────────
    // LÓGICA SLEEPY
    // ────────────────────────────────────────────
    const checkSleepy = async () => {
        const hours = await getTodaySleepHours(userId);

        // Sin registro de sueño = no activar sleepy aún
        if (hours === null) {
            setSleepyActive(false);
            return;
        }

        if (hours < 5) {
            setSleepyActive(true);

            // Penalización solo una vez por día (se debe revisar el sitema de penalizaciones)
            // if (!sleepyPenaltyDone) {
            //     try {
            //         const newPoints = await deductSleepyPoints(userId);
            //         if (onPointsChange) onPointsChange(newPoints);
            //         setSleepyPenaltyDone(true);
            //     } catch (err) {
            //         console.error('Error penalización sleepy:', err);
            //     }
            // }
        } else {
            // Sueño suficiente — desactivar todo
            setSleepyActive(false);
            setIsSleepy(false);
            if (sleepyTimerRef.current)    clearTimeout(sleepyTimerRef.current);
            if (sleepyIntervalRef.current) clearTimeout(sleepyIntervalRef.current);
        }
    };

    // Programa la próxima "dormida" aleatoria
    const scheduleSleepyNap = useCallback(() => {
        if (sleepyIntervalRef.current) clearTimeout(sleepyIntervalRef.current);

        // Intervalo aleatorio entre 8 y 20 segundos antes de dormirse
        const waitMs = Math.random() * 12000 + 8000;

        sleepyIntervalRef.current = setTimeout(() => {
            setIsSleepy(true);

            // Duración de la dormida: 3 a 10 segundos
            const napMs = Math.random() * 7000 + 3000;
            sleepyTimerRef.current = setTimeout(() => {
                setIsSleepy(false);
                // Programa la siguiente dormida
                scheduleSleepyNap();
            }, napMs);
        }, waitMs);
    }, []);

    // Arrancar/detener el ciclo sleepy cuando cambia sleepyActive
    useEffect(() => {
        if (sleepyActive) {
            scheduleSleepyNap();
        } else {
            if (sleepyTimerRef.current)    clearTimeout(sleepyTimerRef.current);
            if (sleepyIntervalRef.current) clearTimeout(sleepyIntervalRef.current);
            setIsSleepy(false);
        }

        return () => {
            if (sleepyTimerRef.current)    clearTimeout(sleepyTimerRef.current);
            if (sleepyIntervalRef.current) clearTimeout(sleepyIntervalRef.current);
        };
    }, [sleepyActive, scheduleSleepyNap]);

    // ────────────────────────────────────────────
    // LÓGICA THIRSTY
    // ────────────────────────────────────────────

    // Calcula el intervalo de descanso entre tomas según lo que falta
    const calcThirstyInterval = (accumMl) => {
        const remaining = Math.max(0, WATER_GOAL - accumMl);

        // Si ya cumplió el goal, no hay thirsty
        if (remaining <= 0) return null;

        const now      = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 0);
        const hoursLeft = Math.max(1, (endOfDay - now) / (1000 * 60 * 60));

        // Cuántos vasos de 250ml faltan
        const glassesLeft = Math.ceil(remaining / 250);

        // Intervalo = horas restantes / vasos que faltan (mínimo 1 hora)
        const intervalHours = Math.max(1, hoursLeft / glassesLeft);
        const intervalMs    = intervalHours * 60 * 60 * 1000;

        return intervalMs;
    };

    const scheduleThirsty = useCallback((accumMl) => {
        if (thirstyTimerRef.current) clearTimeout(thirstyTimerRef.current);

        const intervalMs = calcThirstyInterval(accumMl);

        // Goal cumplido
        if (intervalMs === null) {
            setIsThirsty(false);
            setNextThirstyAt(null);
            return;
        }

        const nextTime = Date.now() + intervalMs;
        setNextThirstyAt(nextTime);

        thirstyTimerRef.current = setTimeout(() => {
            setIsThirsty(true);
        }, intervalMs);
    }, []);

    const checkThirsty = async () => {
    const accum = await getTodayWaterTotal(userId);
        setWaterAccum(accum);

        if (accum === 0) {
            setIsThirsty(true);
            setNextThirstyAt(null);
            return;
        }

        if (accum >= WATER_GOAL) {
            setIsThirsty(false);
            if (thirstyTimerRef.current) clearTimeout(thirstyTimerRef.current);
            return;
        }

        // ← siempre recalcula el intervalo con el acumulado actual
        setIsThirsty(false);
        scheduleThirsty(accum);
    };

    // Cuando el usuario registra agua → recalcular thirsty
    const refreshThirsty = async () => {
        // Siempre cancela el timer anterior y recalcula desde cero
        if (thirstyTimerRef.current) clearTimeout(thirstyTimerRef.current);
        setNextThirstyAt(null);  // ← fuerza recálculo en checkThirsty
        setIsThirsty(false);     // ← quita el estado si estaba activo
        await checkThirsty();    // ← recalcula con el nuevo acumulado
    };

    // ────────────────────────────────────────────
    // ESTADOS FIJOS (happy / neutral / sad)
    // ────────────────────────────────────────────
    const loadBaseMood = async () => {
        try {
            const result = await calculateEnergyLevel(userId);
            setBaseMood(result.mood);
            setEnergyLevel(result.energy_level);
        } catch (err) {
            console.error('Error cargando mood base:', err);
        }
    };

    // ────────────────────────────────────────────
    // INICIALIZACIÓN Y REFRESCO
    // ────────────────────────────────────────────
    const refresh = async () => {
        await Promise.all([
            loadBaseMood(),
            checkSleepy(),
            checkThirsty(),
        ]);
    };

    useEffect(() => {
        refresh();
        return () => {
            if (sleepyTimerRef.current)    clearTimeout(sleepyTimerRef.current);
            if (sleepyIntervalRef.current) clearTimeout(sleepyIntervalRef.current);
            if (thirstyTimerRef.current)   clearTimeout(thirstyTimerRef.current);
        };
    }, []);

    // Exponer refresh al padre
    useImperativeHandle(ref, () => ({ refreshPetState: refresh }));

    // ────────────────────────────────────────────
    // EMOJIS
    // ────────────────────────────────────────────

    // Emoji principal — sleepy tiene prioridad absoluta
    const getMainEmoji = () => {
        if (isSleepy) return '😴';
        switch (baseMood) {
            case 'happy':   return '😸';
            case 'sad':     return '😿';
            default:        return '🙂';
        }
    };

    // Emoji secundario — thirsty se muestra junto al estado base (no junto a sleepy)
    const getSecondaryEmoji = () => {
        if (!isThirsty || isSleepy) return null;
        return '😵';
    };

    const getParticleState = () => {
        if (isSleepy) return 'neutral';
        return baseMood === 'happy' ? 'happy' : 'neutral';
    };

    const handlePetLayout = useCallback((e) =>
        setPetArea({
            width:  e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
        }), []);

    return (
        <>
            <View style={styles.petBox}>

                {/* Emojis de estado */}
                <View style={styles.emojiRow}>
                    <Text style={[styles.moodEmoji, { fontSize: bounce ? 55 : 45 }]}>
                        {getMainEmoji()}
                    </Text>
                    {getSecondaryEmoji() && (
                        <Text style={[styles.moodEmoji, styles.secondaryEmoji, { fontSize: bounce ? 45 : 35 }]}>
                            {getSecondaryEmoji()}
                        </Text>
                    )}
                </View>

                <Image
                    source={require('../../assets/DevPet_neutral.png')}
                    style={styles.petImage}
                    onLayout={handlePetLayout}
                />
            </View>

            {petArea.width > 0 && (
                <OptimizedParticles
                    petState={getParticleState()}
                    petAreaWidth={petArea.width}
                    petAreaHeight={petArea.height}
                />
            )}
        </>
    );
});

Pet.displayName = 'Pet';

const styles = StyleSheet.create({
    petBox: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    emojiRow: {
        flexDirection: 'row',
        position: 'absolute',
        top: -50,
        zIndex: 10,
        gap: 6,
    },
    moodEmoji: {
        fontSize: 45,
    },
    secondaryEmoji: {
        opacity: 0.85,
    },
    petImage: {
        width:       width * 0.48,
        height:      width * 0.48 * (208 / 187),
        resizeMode: 'contain',
    },
});

export default Pet;