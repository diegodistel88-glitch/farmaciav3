// ============================================================
// VADEMÉCUM - Carga el JSON grande (no lo procesa, lo consume)
// ============================================================
let VADEMECUM = [];

async function cargarVademecum() {
  try {
    const res = await fetch('data/vademecum.json');
    if (!res.ok) throw new Error('No se encontró data/vademecum.json');
    VADEMECUM = await res.json();
    console.log('Vademécum cargado:', VADEMECUM.length);
  } catch (e) {
    console.warn('No se pudo cargar el vademécum:', e.message);
    VADEMECUM = [];
  }
}

function insumoPorCodigo(codigo) {
  return VADEMECUM.find(i => i.codigo == codigo);
}
