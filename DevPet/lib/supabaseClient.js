import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://shjdaneajcmwbjszdibx.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoamRhbmVhamNtd2Jqc3pkaWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTQ3MjcsImV4cCI6MjA5MTg3MDcyN30.TdCQMZmNrPyQPyjQqs5AQofPRHffQQk-Qsmvk30XXNk'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Guardar hábitos
export const saveHabits = async (data) => {
  try {
    const { error } = await supabase
      .from('habits')
      .insert([data])

/*     if (error) {
      if (error.code === '23505') {
        throw new Error('chiquitín ya registraste hoy')
      }
      throw error
    } */

    return true
  } catch (err) {
    throw err
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
