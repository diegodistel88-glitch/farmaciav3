// ============================================================
// FARMACIA - Consolidado por servicio y por paciente + semáforo
// ============================================================
function renderFarmacia(servicioKey) {
  const cont = document.getElementById('tab-farmacia');
  const serv = servicioKey || window.servicioActual || 'ucia';
  window.servicioActual = serv;
  const s = DB.servicios[serv] || { nombre: serv, vademecum: [] };
  const modo = window.farmaciaModo || 'servicio';

  cont.innerHTML = `
    <div class="card">
      <h2>💊 Farmacia - ${s.nombre}</h2>
      <div class="tabs-inner">
        <button class="${modo==='servicio'?'active':''}" onclick="setModoFarmacia('servicio','${serv}')">Por servicio</button>
        <button class="${modo==='paciente'?'active':''}" onclick="setModoFarmacia('paciente','${serv}')">Por paciente</button>
      </div>
      ${modo==='servicio' ? renderConsolidadoServicio(serv) : renderConsolidadoPaciente(serv)}
    </div>
  `;
}

function setModoFarmacia(m, serv) {
  window.farmaciaModo = m;
  renderFarmacia(serv);
}

function renderConsolidadoServicio(serv) {
  const consumo = calcularConsumoRealServicio(serv);
  const filas = Object.entries(consumo).map(([cod, cant]) => {
    const ins = insumoPorCodigo(cod);
    const stock = calcularStockInsumo(DB.stock[serv]?.[cod] || {}, cant);
    return { cod, nombre: ins?.nombre || cod, cant, ...stock };
  });
  const orden = { rojo: 0, amarillo: 1, verde: 2 };
  filas.sort((a,b) => orden[a.semaforo.nivel] - orden[b.semaforo.nivel]);

  return `
    <table>
      <thead><tr>
        <th>Insumo</th><th>Consumo real</th><th>Stock actual</th>
        <th>Objetivo</th><th>% Stock</th><th>Semáforo</th>
      </tr></thead>
      <tbody>
        ${filas.map(f => `
          <tr class="fila-${f.semaforo.nivel}">
            <td>${f.nombre}</td>
            <td>${f.cant}</td>
            <td>${f.stockActual}</td>
            <td>${f.objetivoFinal}</td>
            <td>${f.semaforo.pct.toFixed(1)}%</td>
            <td><span class="badge badge-${f.semaforo.nivel}">${f.semaforo.msg}</span></td>
          </tr>
        `).join('') || '<tr><td colspan="6">Sin consumo registrado</td></tr>'}
      </tbody>
    </table>
  `;
}

function renderConsolidadoPaciente(serv) {
  const pacientes = DB.pacientes.filter(p => p.servicio === serv);
  if (pacientes.length === 0) return '<p>No hay pacientes en este servicio.</p>';
  const pacId = window.pacienteFarmacia || pacientes[0].id;
  const pac = pacientes.find(p => p.id === pacId);
  const consumo = calcularConsumoRealPaciente(pacId);

  return `
    <div style="margin-bottom:12px;">
      <label>Paciente:</label>
      <select onchange="window.pacienteFarmacia=this.value; renderFarmacia('${serv}')">
        ${pacientes.map(p => `<option value="${p.id}" ${p.id===pacId?'selected':''}>${p.nombre} - Cama ${p.cama}</option>`).join('')}
      </select>
    </div>
    <table>
      <thead><tr><th>Insumo</th><th>Consumido por el paciente</th></tr></thead>
      <tbody>
        ${Object.entries(consumo).map(([cod,cant]) => `
          <tr><td>${insumoPorCodigo(cod)?.nombre||cod}</td><td>${cant}</td></tr>
        `).join('') || '<tr><td colspan="2">Sin consumo registrado para este paciente</td></tr>'}
      </tbody>
    </table>
  `;
}