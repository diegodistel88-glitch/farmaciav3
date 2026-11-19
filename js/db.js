// ============================================================
// DB - Persistencia central (localStorage hoy, API después)
// ============================================================
const DB_KEY = 'farmacia2pro_db';

let DB = {
  servicios: {},          // { ucia: {nombre, vademecum:[codigos]} }
  pacientes: [],          // [{id, servicio, nombre, cama, edad}]
  indicaciones: [],       // [{id, pacienteId, medico, codigoInsumo, dosis, frecuenciaHoras, horarios, estado, fechaInicio}]
  ejecuciones: [],        // [{id, indicacionId, pacienteId, enfermero, horarioProgramado, fechaHoraEjecucion, estado, observacion}]
  accionesEnfermeria: [], // [{id, pacienteId, enfermero, codigoInsumo, cantidad, motivo, fechaHora}]
  stock: {},              // { servicio: { codigo: {cantidad_anual, lead_time_dias, nivel_servicio, multiplo_pedido, stock_actual} } }
  consumoReal: {}         // { servicio: { codigo: cantidad } }  (se recalcula)
};

function guardar() {
  localStorage.setItem(DB_KEY, JSON.stringify(DB));
}

function cargar() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try { DB = JSON.parse(raw); } catch(e) { console.warn('DB corrupta, se reinicia'); }
  }
  if (!DB.servicios || Object.keys(DB.servicios).length === 0) {
    DB.servicios = {
      ucia: { nombre: 'UCIA', vademecum: [815] },
      clinica: { nombre: 'Clínica Médica', vademecum: [] },
      cirugia: { nombre: 'Cirugía', vademecum: [] },
      guardia: { nombre: 'Guardia', vademecum: [] }
    };
  }
  if (!DB.pacientes) DB.pacientes = [];
  if (!DB.indicaciones) DB.indicaciones = [];
  if (!DB.ejecuciones) DB.ejecuciones = [];
  if (!DB.accionesEnfermeria) DB.accionesEnfermeria = [];
  if (!DB.stock) DB.stock = {};
}