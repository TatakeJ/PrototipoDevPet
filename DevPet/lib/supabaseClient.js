import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://shjdaneajcmwbjszdibx.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoamRhbmVhamNtd2Jqc3pkaWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTQ3MjcsImV4cCI6MjA5MTg3MDcyN30.TdCQMZmNrPyQPyjQqs5AQofPRHffQQk-Qsmvk30XXNk'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const getLocalDate = () => {
    return new Date().toLocaleDateString('en-CA');
}

const getLocalTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

export const saveWaterLog = async (waterAmount) => {
    try {
        const { error } = await supabase
            .from('habit_logs')
            .insert([{
                user_id: 19,
                habit_id: 1,
                value: waterAmount,
                log_date: getLocalDate(),
                log_hour: getLocalTime(),
            }])

        if (error) throw error
        return { success: true }
    } catch (error) {
        console.error('Error guardando registro de agua:', error)
        throw error
    }
}

export const saveSleepLog = async (sleepHours) => {
    try {
        const { error } = await supabase
            .from('habit_logs')
            .insert([{
                user_id: 19,
                habit_id: 2,
                value: sleepHours,
                log_date: getLocalDate(),
                log_hour: getLocalTime(),
            }])

        if (error) throw error
        return { success: true }
    } catch (error) {
        console.error('Error guardando registro de sueño:', error)
        throw error
    }
}

export const saveActiveBreakLog = async () => {
    try {
        const { error } = await supabase
            .from('habit_logs')
            .insert([{
                user_id: 19,
                habit_id: 3,
                value: 1,
                log_date: getLocalDate(),
                log_hour: getLocalTime(),
            }])

        if (error) throw error
        return { success: true }
    } catch (error) {
        console.error('Error guardando registro de pausa activa:', error)
        throw error
    }
}

// Guardar sesión de pausa activa en active_break_sessions
export const saveBreakSession = async (sessionData) => {
  try {
    const { error } = await supabase
      .from('active_break_sessions')
      .insert([{
        user_id: 19,
        start_time: sessionData.startTime,
        end_time: sessionData.endTime,
        duration_seconds: sessionData.duration,
        completed_at: getLocalTime()
      }])

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error guardando sesión de pausa activa:', error)
    throw error
  }
}

// Mantener compatibilidad temporal con saveHabits para componentes que aún lo usan
export const saveHabits = async (data) => {
  // Esta función ahora delega a las funciones específicas
  if (data.water) {
    return await saveWaterLog(data.water);
  } else if (data.sleep_hours) {
    return await saveSleepLog(data.sleep_hours);
  }
  
  throw new Error('Tipo de hábito no soportado en saveHabits');
}

export const saveBreak = async (data) => {
  try {
    const { error } = await supabase
      .from('breaks')
      .insert([data])

    if (error) throw error

    return true
  } catch (err) {
    throw err
  }
}

// consultas con la estructura de la base de datos
// Obtener hábitos base (healthy_habits)
export const getHealthyHabits = async () => {
  console.log(" Buscando hábitos base para user_id: 19");

  const { data, error } = await supabase
    .from('healthy_habits')
    .select(`
      id,
      name,
      type,
      unit,
      daily_goal,
      points_per_log
    `)

  if (error) {
    console.error(" Error obteniendo hábitos base:", error)
    throw new Error(`Error al conectar con Supabase: ${error.message}`)
  }

  if (!data || data.length === 0) {
    console.warn("No se encontraron hábitos base")
    return []
  }

  console.log(" Hábitos base obtenidos:", data.length, "registros")
  return data
}

// Obtener todos los hábitos del día para la gráfica
export const getDayHabits = async () => {
  const localDate = getLocalDate(); // YYYY-MM-DD local

  const { data, error } = await supabase
    .from('habit_logs')
    .select(`
      *,
      healthy_habits (
        name,
        type,
        unit,
        daily_goal
      )
    `)
    .eq('user_id', 19)
    .eq('log_date', localDate)
    .order('log_date', { ascending: false })

  if (error) {
    console.error(" Error de Supabase:", error)
    throw new Error(`Error al conectar con Supabase: ${error.message}`)
  }

  if (!data || data.length === 0) {
    console.warn("No se encontraron hábitos para hoy")
    return []
  }

  return data
}

// Obtener hábitos de la semana
export const getWeekHabits = async () => {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6); // Últimos 7 días incluyendo hoy
  
  const startDate = weekAgo.toLocaleDateString('en-CA');
  const endDate = today.toLocaleDateString('en-CA');
  
  console.log("Buscando hábitos de la semana:", {
    start_date: startDate,
    end_date: endDate,
    user_id: 19
  });

  const { data, error } = await supabase
    .from('habit_logs')
    .select(`
      *,
      healthy_habits (
        name,
        type,
        unit
      )
    `)
    .eq('user_id', 19)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: true })

  if (error) {
    console.error("Error obteniendo hábitos semanales:", error)
    throw new Error(`Error al conectar con Supabase: ${error.message}`)
  }

  if (!data || data.length === 0) {
    console.warn("No se encontraron hábitos para la semana")
    return []
  }

  console.log("Datos semanales obtenidos:", data.length, "registros")
  return data
}

// Obtener hábitos del mes
export const getMonthHabits = async () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 29); // Últimos 30 días incluyendo hoy
  
  const startDate = thirtyDaysAgo.toLocaleDateString('en-CA');
  const endDate = today.toLocaleDateString('en-CA');
  
  console.log("Buscando hábitos del mes:", {
    start_date: startDate,
    end_date: endDate,
    user_id: 19
  });

  const { data, error } = await supabase
    .from('habit_logs')
    .select(`
      *,
      healthy_habits (
        name,
        type,
        unit
      )
    `)
    .eq('user_id', 19)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: true })

  if (error) {
    console.error("Error obteniendo hábitos mensuales:", error)
    throw new Error(`Error al conectar con Supabase: ${error.message}`)
  }

  if (!data || data.length === 0) {
    console.warn("No se encontraron hábitos para el mes")
    return []
  }

  console.log("Datos mensuales obtenidos:", data.length, "registros")
  return data
}

// Obtener información de un usuario específico
export const getUserInfo = async (userId = 19) => {
  try {
    console.log(` Buscando información del usuario: ${userId}`);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error(" Error obteniendo información del usuario:", error);
      throw new Error(`Error al conectar con Supabase: ${error.message}`);
    }

    if (!data) {
      console.warn("No se encontró información del usuario");
      return null;
    }

    console.log(" Información del usuario obtenida:", data.user_id);
    return data;
  } catch (error) {
    console.error('Error en getUserInfo:', error);
    throw error;
  }
};

// Consultar estado de la mascota
export const getPetStatus = async () => {
  const { data, error } = await supabase
    .from('pet_states')
    .select(`
      *
    `)
    .eq('user_id', 19)
    .single()

  if (error) {
    console.error("Error obteniendo estado de la mascota:", error)
    throw new Error(`Error al conectar con Supabase: ${error.message}`)
  }

  if (!data) {
    console.warn("No se encontró estado de la mascota")
    return null
  }

  console.log("Estado de la mascota obtenido:", data)
  return data
}

// Actualizar estado de la mascota (mood)
export const updatePetMood = async (mood, userId = 19) => {
  try {
    console.log(`Actualizando mood de la mascota para usuario ${userId} a: ${mood}`);

    const { error } = await supabase
      .from('pet_states')
      .update({ mood: mood })
      .eq('user_id', userId);

    if (error) {
      console.error("Error actualizando mood de la mascota:", error);
      throw new Error(`Error al conectar con Supabase: ${error.message}`);
    }

    console.log("Mood de la mascota actualizado exitosamente");
    return { success: true };
  } catch (error) {
    console.error('Error en updatePetMood:', error);
    throw error;
  }
};

// Actualizar nivel de energía de la mascota
export const updatePetEnergy = async (energyLevel, userId = 19) => {
  try {
    console.log(`Actualizando energy_level de la mascota para usuario ${userId} a: ${energyLevel}`);

    const { error } = await supabase
      .from('pet_states')
      .update({ energy_level: energyLevel })
      .eq('user_id', userId);

    if (error) {
      console.error("Error actualizando energy_level de la mascota:", error);
      throw new Error(`Error al conectar con Supabase: ${error.message}`);
    }

    console.log("Energy_level de la mascota actualizado exitosamente");
    return { success: true };
  } catch (error) {
    console.error('Error en updatePetEnergy:', error);
    throw error;
  }
};

// Obtener el último registro de agua del día
const getLastWaterLog = async () => {
  try {
    const dayHabits = await getDayHabits();
    const waterLogs = dayHabits.filter(log => log.healthy_habits?.type === 'hydration');

    if (waterLogs.length === 0) return null;

    // Ordenar por log_hour descendente para obtener el más reciente
    return waterLogs.sort((a, b) => b.log_hour.localeCompare(a.log_hour))[0];
  } catch (error) {
    console.error('Error obteniendo último registro de agua:', error);
    return null;
  }
};

// Calcular tiempo transcurrido desde la última toma de agua (en horas)
const getTimeSinceLastWater = (lastLog) => {
  if (!lastLog) return Infinity; // Sin tomas de agua

  try {
    const currentDate = getLocalDate();
    const currentTime = getLocalTime();
    const now = new Date(`${currentDate}T${currentTime}`);
    const logTime = new Date(`${lastLog.log_date}T${lastLog.log_hour}`);
    const diffMs = now - logTime;
    return diffMs / (1000 * 60 * 60); // Convertir a horas
  } catch (error) {
    console.error('Error calculando tiempo desde última toma:', error);
    return Infinity;
  }
};

// Verificar si thirsty debe activarse (estado dinámico, no se guarda en DB)
export const checkThirstyState = async () => {
  try {
    const lastWaterLog = await getLastWaterLog();
    const timeSinceLastWater = getTimeSinceLastWater(lastWaterLog);
    const waterInterval = 2.4; // 2.4 horas entre tomas (24h / 10 vasos)

    // Obtener hábitos del día para calcular rates
    const dayHabits = await getDayHabits();
    const totals = { hydration: 0, sleep: 0, active_break: 0 };
    const goals = { hydration: 2500, sleep: 8, active_break: 3 };

    dayHabits.forEach(log => {
      const type = log.healthy_habits?.type;
      const goal = log.healthy_habits?.daily_goal;
      const value = log.value ?? 0;

      if (type && totals.hasOwnProperty(type)) {
        totals[type] += value;
        if (goal) goals[type] = goal;
      }
    });

    const rates = {
      hydration: totals.hydration / goals.hydration,
      sleep: totals.sleep / goals.sleep,
      active_break: totals.active_break / goals.active_break,
    };

    // Thirsty se activa SOLO si: tiempo >= 2.4h Y (agua < 80% O (agua < 30% Y sueño >= 60%))
    // El intervalo de tiempo es obligatorio, sin importar el porcentaje de hidratación
    const isThirsty = timeSinceLastWater >= waterInterval && 
      (rates.hydration < 0.8 || (rates.hydration < 0.3 && rates.sleep >= 0.6));

    console.log("Thirsty check:", {
      timeSinceLastWater: `${timeSinceLastWater.toFixed(2)} horas`,
      isThirsty,
      rates: {
        hydration: `${Math.round(rates.hydration * 100)}%`,
        sleep: `${Math.round(rates.sleep * 100)}%`,
      }
    });

    return { isThirsty, timeSinceLastWater };
  } catch (error) {
    console.error('Error verificando thirsty state:', error);
    return { isThirsty: false, timeSinceLastWater: Infinity };
  }
};

// Calcular y actualizar estado de la mascota basado en hábitos del día
export const calculateAndUpdatePetState = async (userId = 19) => {
  try {
    console.log("Calculando estado de la mascota...");

    // Obtener hábitos del día con sus goals
    const dayHabits = await getDayHabits();

    // Obtener energy_level actual como respaldo
    const currentPetState = await getPetStatus();
    const currentEnergy = currentPetState?.energy_level ?? 50;

    // ── PASO 1: Agrupar valores por tipo de hábito ──
    const totals = { hydration: 0, sleep: 0, active_break: 0 };
    const goals  = { hydration: 2500, sleep: 8, active_break: 3 }; // fallback si no viene de DB

    dayHabits.forEach(log => {
      const type = log.healthy_habits?.type;
      const goal = log.healthy_habits?.daily_goal;
      const value = log.value ?? 0;

      if (type && totals.hasOwnProperty(type)) {
        totals[type] += value;
        // Usar el goal de la DB si está disponible
        if (goal) goals[type] = goal;
      }
    });

    console.log("Totales del día:", totals);
    console.log("Goals:", goals);

    // ── PASO 2: Calcular tiempo desde última toma de agua ──
    const lastWaterLog = await getLastWaterLog();
    const timeSinceLastWater = getTimeSinceLastWater(lastWaterLog);
    const waterInterval = 2.4; // 2.4 horas entre tomas (24h / 10 vasos)
    const minInterval = 1; // Mínimo 1 hora entre tomas

    console.log("Última toma de agua:", lastWaterLog ? `${lastWaterLog.log_hour}` : "Sin tomas");
    console.log("Tiempo desde última toma:", `${timeSinceLastWater.toFixed(2)} horas`);

    // ── PASO 3: Calcular porcentaje de cumplimiento por hábito ──
    const rates = {
      hydration:    totals.hydration    / goals.hydration,
      sleep:        totals.sleep        / goals.sleep,
      active_break: totals.active_break / goals.active_break,
    };

    console.log("Tasas de cumplimiento:", {
      hydration:    `${Math.round(rates.hydration * 100)}%`,
      sleep:        `${Math.round(rates.sleep * 100)}%`,
      active_break: `${Math.round(rates.active_break * 100)}%`,
    });

    // ── PASO 3: Calcular energy_level nuevo (Opción 4 como respaldo) ──
    let energyChange = 0;
    Object.values(rates).forEach(rate => {
      if (rate >= 1)        energyChange += 15;
      else if (rate >= 0.7) energyChange += 10;
      else if (rate >= 0.5) energyChange += 5;
      else if (rate >= 0.3) energyChange -= 5;
      else                  energyChange -= 10;
    });

    const newEnergy = Math.max(0, Math.min(100, currentEnergy + energyChange));

    // ── PASO 4: Determinar mood base (sad/neutral/happy) basado en habit_logs ──
    let newMood;

    // Prioridad 1 — Sueño crítico (< 5h registradas, pero algo hay)
    if (totals.sleep > 0 && totals.sleep < 5) {
      newMood = 'sleepy';
    }
    // Prioridad 2 — Promedio global >= 80% → happy
    else if (
      rates.hydration >= 0.8 &&
      rates.sleep >= 0.8 &&
      rates.active_break >= 0.8
    ) {
      newMood = 'happy';
    }
    // Prioridad 3 — Al menos 2 hábitos >= 50% → neutral
    else if (
      [rates.hydration, rates.sleep, rates.active_break]
        .filter(r => r >= 0.5).length >= 2
    ) {
      newMood = 'neutral';
    }
    // Prioridad 4 — Menos de 1 hábito cumple el 50% → sad
    else if (
      [rates.hydration, rates.sleep, rates.active_break]
        .filter(r => r >= 0.5).length < 1
    ) {
      newMood = 'sad';
    }
    // Respaldo — energy_level como desempate
    else {
      if (newEnergy >= 70)      newMood = 'happy';
      else if (newEnergy >= 40) newMood = 'neutral';
      else                      newMood = 'sad';
    }

    console.log(`Mood calculado: ${newMood} | Energy: ${newEnergy}`);

    // ── PASO 5: Guardar en Supabase ──
    await updatePetMood(newMood, userId);
    await updatePetEnergy(newEnergy, userId);

    return { mood: newMood, energy_level: newEnergy };

  } catch (error) {
    console.error('Error en calculateAndUpdatePetState:', error);
    throw error;
  }
};

// Actualizar puntos totales del usuario
export const updateUserPoints = async (points, userId = 19) => {
  try {
    console.log(`Actualizando total_points del usuario ${userId} a: ${points}`);

    const { error } = await supabase
      .from('users')
      .update({ total_points: points })
      .eq('user_id', userId);

    if (error) {
      console.error("Error actualizando puntos del usuario:", error);
      throw new Error(`Error al conectar con Supabase: ${error.message}`);
    }

    console.log("Puntos del usuario actualizados exitosamente");
    return { success: true };
  } catch (error) {
    console.error('Error en updateUserPoints:', error);
    throw error;
  }
};

// ── LÓGICA DE ESTADOS DE LA MASCOTA ──

// Obtener acumulado de hidratación del día
export const getTodayWaterTotal = async (userId = 19) => {
    const today = getLocalDate();
    const { data, error } = await supabase
        .from('habit_logs')
        .select('value')
        .eq('user_id', userId)
        .eq('habit_id', 1) // hidratación
        .eq('log_date', today);

    if (error) return 0;
    return (data || []).reduce((sum, log) => sum + (log.value || 0), 0);
};

// Obtener horas de sueño del día
export const getTodaySleepHours = async (userId = 19) => {
    const today = getLocalDate();
    const { data, error } = await supabase
        .from('habit_logs')
        .select('value')
        .eq('user_id', userId)
        .eq('habit_id', 2) // sueño
        .eq('log_date', today);

    if (error) return null; // null = sin registro
    if (!data || data.length === 0) return null;
    return data.reduce((sum, log) => sum + (log.value || 0), 0);
};

// Restar puntos por penalización sleepy
export const deductSleepyPoints = async (userId = 19) => {
    try {
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('total_points')
            .eq('user_id', userId)
            .single();

        if (fetchError) throw fetchError;

        const newPoints = Math.max(0, (user.total_points || 0) - 15);

        const { error: updateError } = await supabase
            .from('users')
            .update({ total_points: newPoints })
            .eq('user_id', userId);

        if (updateError) throw updateError;

        return newPoints;
    } catch (err) {
        console.error('Error restando puntos sleepy:', err);
        throw err;
    }
};

// Calcular energy_level y actualizar pet_states según los 3 hábitos
export const calculateEnergyLevel = async (userId = 19) => {
    try {
        const today = getLocalDate();

        const { data: logs, error } = await supabase
            .from('habit_logs')
            .select(`value, healthy_habits(type, daily_goal)`)
            .eq('user_id', userId)
            .eq('log_date', today);

        if (error) throw error;

        // Agrupar totales por tipo
        const totals = { hydration: 0, sleep: 0, active_break: 0 };
        const goals  = { hydration: 2500, sleep: 8, active_break: 3 };

        (logs || []).forEach(log => {
            const type = log.healthy_habits?.type;
            const goal = log.healthy_habits?.daily_goal;
            if (type && totals.hasOwnProperty(type)) {
                totals[type] += log.value || 0;
                if (goal) goals[type] = goal;
            }
        });

        // Calcular tasa de cumplimiento por hábito (máximo 100%)
        const rates = {
            hydration:    Math.min(totals.hydration    / goals.hydration,    1),
            sleep:        Math.min(totals.sleep        / goals.sleep,        1),
            active_break: Math.min(totals.active_break / goals.active_break, 1),
        };

        // Promedio general = energy_level
        const energyLevel = Math.round(
            ((rates.hydration + rates.sleep + rates.active_break) / 3) * 100
        );

        // Determinar mood según energy_level
        let mood;
        if (energyLevel >= 70)      mood = 'happy';
        else if (energyLevel >= 40) mood = 'neutral';
        else                        mood = 'sad';

        // Guardar en pet_states
        await supabase
            .from('pet_states')
            .update({ mood, energy_level: energyLevel })
            .eq('user_id', userId);

        return { mood, energy_level: energyLevel };
    } catch (err) {
        console.error('Error calculando energy_level:', err);
        throw err;
    }
};