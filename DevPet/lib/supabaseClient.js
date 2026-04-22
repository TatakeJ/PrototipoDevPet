import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://shjdaneajcmwbjszdibx.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoamRhbmVhamNtd2Jqc3pkaWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTQ3MjcsImV4cCI6MjA5MTg3MDcyN30.TdCQMZmNrPyQPyjQqs5AQofPRHffQQk-Qsmvk30XXNk'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Guardar hábitos
export const saveHabits = async (data) => {
  const today = new Date().toISOString().split('T')[0]

  const { data: existing, error: fetchError } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', 'demo-user')
    .eq('date', today)
    .maybeSingle()

  if (fetchError) throw fetchError

  if (existing) {
    const { error } = await supabase
      .from('habits')
      .update(data)
      .eq('user_id', 'demo-user')
      .eq('date', today)

    if (error) throw error

  } else {
    const { error } = await supabase
      .from('habits')
      .insert([{
        user_id: 'demo-user',
        date: today,
        ...data
      }])

    if (error) throw error
  }
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

// Obtener hábitos del día
export const getTodayHabits = async () => {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', 'demo-user')
    .eq('date', today)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  return data
}

// Obtener breaks de hoy
export const getTodayBreaks = async () => {
  try {
    const { data, error } = await supabase
      .from('breaks')
      .select('*');
    
    if (error) {
        console.error("Error de Supabase:", error);
        return [];
    }

    return data || [];
  } catch (e) {
    return [];
  }
};

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
  const localDate = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD local
  
  console.log(" Buscando hábitos para:", {
    date: localDate,
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
    .eq('log_date', localDate)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(" Error de Supabase:", error)
    throw new Error(`Error al conectar con Supabase: ${error.message}`)
  }

  if (!data || data.length === 0) {
    console.warn("No se encontraron hábitos para hoy")
    return []
  }

  console.log("Datos obtenidos:", data.length, "registros")
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
