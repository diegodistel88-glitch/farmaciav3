// ============================================================
// MÉDICO - Indica por paciente
// ============================================================
function renderMedico(servicioKey) {
  const cont = document.getElementById('tab-medico');
  const serv = servicioKey || window.servicioActual || 'ucia';
  window.servicioActual = serv;
  const s = DB.servicios[serv] || { nombre: serv, vademecum: [] };
  const pacientes = DB.pacientes.filter(p => p.servicio === serv);

  cont.innerHTML = `
    <div class="card">
      <h2>👨‍⚕️ Indicaciones Médicas - ${s.nombre}</h2>
      <div class="grid2">
        <div>
          <label>Paciente</label>
          <select id="medPaciente">
            ${pacientes.map(p => `<option value="${p.id}">${p.nombre} - Cama ${p.cama}</option>`).join('') || '<option value="">(Sin pacientes)</option>'}
          </select>
          <button class="btn-primary btn-sm" onclick="nuevoPaciente('${serv}')">+ Nuevo paciente</button>
        </div>
        <div>
          <label>Insumo del vademécum del servicio</label>
          <select id="medInsumo">
            ${s.vademecum.map(cod => {
              const i = insumoPorCodigo(cod);
              return i ? `<option value="${i.codigo}">${i.nombre}</option>` : '';
            }).join('') || '<option value="">(Sin insumos configurados)</option>'}
          </select>
          <label>Dosis</label>
          <input id="medDosis" placeholder="Ej: 1 ampolla">
          <label>Frecuencia (horas)</label>
          <input id="medFrecuencia" type="number" value="8" onchange="previewHorarios()">
          <div id="medHorariosPreview" style="font-size:.85em;color:#4a5568;margin:6px 0;"></div>
          <button class="btn-success btn-sm" onclick="agregarIndicacion()">+ Agregar indicación</button>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Indicaciones activas del servicio</h3>
      <table>
        <thead><tr><th>Paciente</th><th>Insumo</th><th>Dosis</th><th>Frecuencia</th><th>Horarios</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          ${DB.indicaciones
            .filter(i => i.estado === 'activa' &&
              DB.pacientes.find(p => p.id === i.pacienteId)?.servicio === serv)
            .map(i => {
              const ins = insumoPorCodigo(i.codigoInsumo);
              const pac = DB.pacientes.find(p => p.id === i.pacienteId);
              return `<tr>
                <td>${pac?.nombre || '-'}</td>
                <td>${ins?.nombre || '-'}</td>
                <td>${i.dosis}</td>
                <td>c/${i.frecuenciaHoras}h</td>
                <td>${i.horarios.join(', ')}</td>
                <td><span class="badge badge-verde">${i.estado}</span></td>
                <td><button class="btn-secondary btn-sm" onclick="suspenderIndicacion('${i.id}')">Suspender</button></td>
              </tr>`;
            }).join('') || '<tr><td colspan="7">Sin indicaciones</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
  previewHorarios();
}

function previewHorarios() {
  const f = parseInt(document.getElementById('medFrecuencia')?.value) || 8;
  const horas = [];
  for (let h = 0; h < 24; h += f) horas.push(String(h).padStart(2,'0') + ':00');
  const el = document.getElementById('medHorariosPreview');
  if (el) el.textContent = 'Horarios: ' + horas.join(', ');
  return horas;
}

function agregarIndicacion() {
  const pacienteId = document.getElementById('medPaciente').value;
  const codigoInsumo = document.getElementById('medInsumo').value;
  const dosis = document.getElementById('medDosis').value || '1';
  const frecuenciaHoras = parseInt(document.getElementById('medFrecuencia').value) || 8;
  if (!pacienteId || !codigoInsumo) return alert('Completá paciente e insumo');
  const horarios = previewHorarios();
  DB.indicaciones.push({
    id: 'IND' + Date.now(),
    pacienteId, codigoInsumo, dosis, frecuenciaHoras, horarios,
    medico: 'Dr. Demo',
    estado: 'activa',
    fechaInicio: new Date().toISOString()
  });
  guardar();
  renderMedico(window.servicioActual);
}

function suspenderIndicacion(id) {
  const i = DB.indicaciones.find(x => x.id === id);
  if (i) i.estado = 'suspendida';
  guardar();
  renderMedico(window.servicioActual);
}

function nuevoPaciente(servicio) {
  const nombre = prompt('Nombre del paciente:');
  if (!nombre) return;
  const cama = prompt('Cama:') || '-';
  DB.pacientes.push({
    id: 'P' + Date.now(),
    servicio, nombre, cama, edad: null
  });
  guardar();
  renderMedico(servicio);
}