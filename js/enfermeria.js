// ============================================================
// ENFERMERÍA - Ve por paciente, ejecuta y registra acciones
// ============================================================
function renderEnfermeria(servicioKey) {
  const cont = document.getElementById('tab-enfermeria');
  const serv = servicioKey || window.servicioActual || 'ucia';
  window.servicioActual = serv;
  const s = DB.servicios[serv] || { nombre: serv, vademecum: [] };
  const pacientes = DB.pacientes.filter(p => p.servicio === serv);
  const pacId = window.pacienteEnfermeria || pacientes[0]?.id;
  const pac = pacientes.find(p => p.id === pacId);

  cont.innerHTML = `
    <div class="card">
      <h2>🩺 Enfermería - ${s.nombre}</h2>
      <label>Paciente:</label>
      <select onchange="window.pacienteEnfermeria=this.value; renderEnfermeria('${serv}')">
        ${pacientes.map(p => `<option value="${p.id}" ${p.id===pacId?'selected':''}>${p.nombre} - Cama ${p.cama}</option>`).join('') || '<option value="">(Sin pacientes)</option>'}
      </select>
    </div>

    ${pac ? `
    <div class="card">
      <h3>📋 Indicaciones de ${pac.nombre}</h3>
      <table>
        <thead><tr><th>Insumo</th><th>Dosis</th><th>Horario</th><th>Acción</th></tr></thead>
        <tbody>
          ${DB.indicaciones.filter(i => i.estado==='activa' && i.pacienteId===pacId)
            .flatMap(i => i.horarios.map(h => {
              const ya = DB.ejecuciones.find(e => e.indicacionId===i.id && e.horarioProgramado===h);
              const ins = insumoPorCodigo(i.codigoInsumo);
              return `<tr>
                <td>${ins?.nombre||'-'}</td>
                <td>${i.dosis}</td>
                <td>${h}</td>
                <td>${ya
                  ? `<span class="badge badge-verde">${ya.estado}</span>`
                  : `<button class="btn-primary btn-sm" onclick="ejecutar('${i.id}','${h}','${pacId}','${serv}')">Administrar</button>
                     <button class="btn-secondary btn-sm" onclick="omitir('${i.id}','${h}','${pacId}','${serv}')">Omitir</button>`}</td>
              </tr>`;
            })).join('') || '<tr><td colspan="4">Sin indicaciones pendientes</td></tr>'}
        </tbody>
      </table>
    </div>

    <div class="card">
      <h3>➕ Acción independiente de enfermería</h3>
      <label>Insumo (vademécum del servicio)</label>
      <select id="accInsumo">
        ${s.vademecum.map(cod => {
          const i = insumoPorCodigo(cod);
          return i ? `<option value="${i.codigo}">${i.nombre}</option>` : '';
        }).join('') || '<option value="">(Sin insumos configurados)</option>'}
      </select>
      <label>Cantidad</label>
      <input id="accCantidad" type="number" value="1" min="1">
      <label>Motivo</label>
      <input id="accMotivo" placeholder="Ej: curación, higiene, control">
      <button class="btn-success" onclick="registrarAccion('${pacId}','${serv}')">Registrar consumo</button>
    </div>

    <div class="card">
      <h3>📦 Consumo acumulado del paciente</h3>
      <table>
        <thead><tr><th>Insumo</th><th>Consumido</th></tr></thead>
        <tbody>
          ${Object.entries(calcularConsumoRealPaciente(pacId)).map(([cod,cant]) => `
            <tr><td>${insumoPorCodigo(cod)?.nombre||cod}</td><td>${cant}</td></tr>
          `).join('') || '<tr><td colspan="2">Sin consumo registrado</td></tr>'}
        </tbody>
      </table>
    </div>
    ` : '<div class="card"><p>No hay pacientes en este servicio.</p></div>'}
  `;
}

function ejecutar(indicacionId, horario, pacienteId, serv) {
  DB.ejecuciones.push({
    id: 'EJE'+Date.now(),
    indicacionId, pacienteId, horarioProgramado: horario,
    enfermero: 'Enf. Demo',
    fechaHoraEjecucion: new Date().toISOString(),
    estado: 'administrado', observacion: ''
  });
  guardar();
  renderEnfermeria(serv);
}

function omitir(indicacionId, horario, pacienteId, serv) {
  DB.ejecuciones.push({
    id: 'EJE'+Date.now(),
    indicacionId, pacienteId, horarioProgramado: horario,
    enfermero: 'Enf. Demo',
    fechaHoraEjecucion: new Date().toISOString(),
    estado: 'omitido',
    observacion: prompt('Motivo de omisión:') || ''
  });
  guardar();
  renderEnfermeria(serv);
}

function registrarAccion(pacienteId, serv) {
  const codigoInsumo = document.getElementById('accInsumo').value;
  const cantidad = parseInt(document.getElementById('accCantidad').value) || 1;
  const motivo = document.getElementById('accMotivo').value || '';
  if (!codigoInsumo) return alert('Seleccioná un insumo');
  DB.accionesEnfermeria.push({
    id: 'ACC'+Date.now(), pacienteId, codigoInsumo, cantidad, motivo,
    enfermero: 'Enf. Demo', fechaHora: new Date().toISOString()
  });
  guardar();
  renderEnfermeria(serv);
}