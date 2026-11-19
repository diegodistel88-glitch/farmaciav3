// ============================================================
// STOCK - Modelo UCIA (SS + ROP + Target) + semáforo
// ============================================================

function calcularStockInsumo(row, consumoRealDia) {
  const cantidadAnual = Number(row.cantidad_anual) || 0;
  const consumoDiaProyectado = cantidadAnual / 365;
  const consumoDia = consumoRealDia > 0 ? consumoRealDia : consumoDiaProyectado;

  const leadTime = Number(row.lead_time_dias) || 2;
  const z = Number(row.nivel_servicio) || 1.65;
  const desvio = 1.65 * (0.3 * consumoDia) * Math.sqrt(1);
  const stockSeguridad = (consumoDia * 1) + desvio;
  const puntoPedido = stockSeguridad + (consumoDia * leadTime);
  const consumoReal60 = consumoDia * 0.6;
  const stockObjetivo = puntoPedido + (consumoReal60 * 2);
  const targetRedondeado = Math.ceil(stockObjetivo);
  const multiplo = Number(row.multiplo_pedido) || 1;
  const objetivoFinal = Math.ceil(targetRedondeado / multiplo) * multiplo;

  const stockActual = Number(row.stock_actual) || 0;
  const semaforo = calcularSemaforo(stockActual, objetivoFinal, puntoPedido);

  return {
    consumoDiaProyectado, consumoDia, desvio, stockSeguridad,
    puntoPedido, stockObjetivo, objetivoFinal,
    stockActual, semaforo
  };
}

function calcularSemaforo(stockActual, objetivo, puntoPedido) {
  const pct = objetivo > 0 ? (stockActual / objetivo) * 100 : 0;
  if (pct < 25) return { nivel: 'rojo', pct, msg: 'Crítico (<25%)' };
  if (stockActual < puntoPedido) return { nivel: 'amarillo', pct, msg: 'Bajo - Tocar pedido' };
  return { nivel: 'verde', pct, msg: 'OK' };
}

// Consumo real por servicio = ejecuciones administradas + acciones independientes
function calcularConsumoRealServicio(servicio) {
  const consumo = {};
  DB.ejecuciones
    .filter(e => e.estado === 'administrado')
    .forEach(e => {
      const ind = DB.indicaciones.find(i => i.id === e.indicacionId);
      if (!ind) return;
      const pac = DB.pacientes.find(p => p.id === ind.pacienteId);
      if (!pac || pac.servicio !== servicio) return;
      consumo[ind.codigoInsumo] = (consumo[ind.codigoInsumo] || 0) + 1;
    });
  DB.accionesEnfermeria
    .forEach(a => {
      const pac = DB.pacientes.find(p => p.id === a.pacienteId);
      if (!pac || pac.servicio !== servicio) return;
      consumo[a.codigoInsumo] = (consumo[a.codigoInsumo] || 0) + a.cantidad;
    });
  return consumo;
}

// Consumo real de un paciente puntual
function calcularConsumoRealPaciente(pacienteId) {
  const consumo = {};
  DB.ejecuciones
    .filter(e => e.estado === 'administrado')
    .forEach(e => {
      const ind = DB.indicaciones.find(i => i.id === e.indicacionId);
      if (!ind || ind.pacienteId !== pacienteId) return;
      consumo[ind.codigoInsumo] = (consumo[ind.codigoInsumo] || 0) + 1;
    });
  DB.accionesEnfermeria
    .filter(a => a.pacienteId === pacienteId)
    .forEach(a => consumo[a.codigoInsumo] = (consumo[a.codigoInsumo] || 0) + a.cantidad);
  return consumo;
}