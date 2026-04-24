import { supabase } from "./supabase";

export type PaymentStatus = "Pagado" | "Pendiente" | "Vencido";

export type PaymentRecord = {
  id: string;
  id_alumna: string;
  fecha: string;
  monto: number;
  metodo: string;
  estado: PaymentStatus;
  mes: string;
  created_at: string;
};

export async function getPagos(): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error fetching pagos:', error);
    return [];
  }

  return data.map(row => ({
    id: row.id.toString(),
    id_alumna: row.id_alumna,
    fecha: row.fecha,
    monto: row.monto,
    metodo: row.metodo || 'Transferencia',
    estado: row.estado,
    mes: row.mes,
    created_at: row.created_at,
  }));
}

export async function getPagosByAlumna(id_alumna: string): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .eq('id_alumna', id_alumna)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error fetching pagos by alumna:', error);
    return [];
  }

  return data.map(row => ({
    id: row.id.toString(),
    id_alumna: row.id_alumna,
    fecha: row.fecha,
    monto: row.monto,
    metodo: row.metodo || 'Transferencia',
    estado: row.estado,
    mes: row.mes,
    created_at: row.created_at,
  }));
}

export async function createPago(pago: Omit<PaymentRecord, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('pagos')
    .insert({
      id_alumna: pago.id_alumna,
      fecha: pago.fecha,
      monto: pago.monto,
      metodo: pago.metodo,
      estado: pago.estado,
      mes: pago.mes,
    });

  if (error) {
    console.error('Error creating pago:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updatePagoStatus(id: string, estado: PaymentStatus): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('pagos')
    .update({ estado })
    .eq('id', parseInt(id));

  if (error) {
    console.error('Error updating pago status:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}