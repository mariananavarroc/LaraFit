import { supabase } from "./supabase";

export type AttendanceStatus = "Presente" | "Ausente" | "Justificado";

export type AttendanceRecord = {
  id: string;
  id_alumna: string;
  fecha: string;
  estado?: AttendanceStatus; // Hacer opcional
  created_at: string;
  clase?: string; // Opcional por si no existe en la tabla
};

export async function getAsistencia(fecha?: string): Promise<AttendanceRecord[]> {
  let query = supabase
    .from('asistencia')
    .select('*')
    .order('created_at', { ascending: false });

  if (fecha) {
    query = query.eq('fecha', fecha);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching asistencia:', error);
    return [];
  }

  return data.map(row => ({
    id: row.id.toString(),
    id_alumna: row.id_alumna,
    fecha: row.fecha,
    clase: row.clase || 'General', // Valor por defecto si no existe
    estado: row.estado || 'Presente', // Valor por defecto si no existe
    created_at: row.created_at,
  }));
}

export async function getAsistenciaByAlumna(id_alumna: string): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('asistencia')
    .select('*')
    .eq('id_alumna', id_alumna)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error fetching asistencia by alumna:', error);
    return [];
  }

  return data.map(row => ({
    id: row.id.toString(),
    id_alumna: row.id_alumna,
    fecha: row.fecha,
    clase: row.clase || 'General', // Valor por defecto si no existe
    estado: row.estado || 'Presente', // Valor por defecto si no existe
    created_at: row.created_at,
  }));
}

export async function createAsistencia(asistencia: Omit<AttendanceRecord, 'id' | 'created_at' | 'estado'>): Promise<{ success: boolean; error?: string }> {
  const dataToInsert: any = {
    id_alumna: asistencia.id_alumna,
    fecha: asistencia.fecha,
  };

  // Solo incluir clase si existe en el objeto
  if (asistencia.clase) {
    dataToInsert.clase = asistencia.clase;
  }

  const { error } = await supabase
    .from('asistencia')
    .insert(dataToInsert);

  if (error) {
    console.error('Error creating asistencia:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateAsistencia(id: string, estado: AttendanceStatus): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('asistencia')
    .update({ estado })
    .eq('id', parseInt(id));

  if (error) {
    console.error('Error updating asistencia:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function createMultipleAsistencia(asistencias: Omit<AttendanceRecord, 'id' | 'created_at' | 'estado'>[]): Promise<{ success: boolean; error?: string }> {
  const dataToInsert = asistencias.map(a => {
    const record: any = {
      id_alumna: a.id_alumna,
      fecha: a.fecha,
    };

    // Solo incluir clase si existe
    if (a.clase) {
      record.clase = a.clase;
    }

    return record;
  });

  const { error } = await supabase
    .from('asistencia')
    .insert(dataToInsert);

  if (error) {
    console.error('Error creating multiple asistencia:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}