// ============================================================
// CONFIGURACIÓN - Vademécum por servicio + import Excel stock
// ============================================================
function renderConfig() {
  const cont = document.getElementById('tab-config');
  cont.innerHTML = `
    <div class="card">
      <h2>⚙️ Vademécum por servicio</h2>
      <p style="font-size:.85em;color:#718096;margin-bottom:12px;">
        Asigná qué códigos del vademécum global usa cada servicio (separados por coma).
      </p>
      ${Object.entries(DB.servicios).map(([k,s]) => `
        <div style="margin-bottom:16px;">
          <h4>${s.nombre}</h4>
          <input id="cfg-${k}" placeholder="Códigos: 815,816,817" value="${s.vademecum.join(',')}" style="width:100%;padding:8px;border:2px solid #e2e8f0;border-radius:8px;">
          <button class="btn-primary btn-sm" onclick="guardarVademecumServicio('${k}')">Guardar</button>
        </div>
      `).join('')}
    </div>

    <div class="card">
      <h2>📥 Importar stock desde Excel (formato UCIA)</h2>
      <p style="font-size:.85em;color:#718096;">
        Columnas esperadas: <code>Codigo</code>, <code>Cantidad por año</code>, <code>Lead time</code> (opcional), <code>Nivel servicio</code> (opcional), <code>Múltiplo</code> (opcional), <code>Stock actual</code> (opcional).
      </p>
      <label>Servicio destino:</label>
      <select id="importServicio">
        ${Object.entries(DB.servicios).map(([k,s]) => `<option value="${k}">${s.nombre}</option>`).join('')}
      </select>
      <input type="file" id="importFile" accept=".xlsx,.xls,.csv" onchange="importarStockExcel(event)">
    </div>

    <div class="card">
      <h2>📦 Stock cargado por servicio</h2>
      ${Object.entries(DB.servicios).map(([k,s]) => `
        <div style="margin-bottom:16px;">
          <h4>${s.nombre}</h4>
          <table>
            <thead><tr><th>Código</th><th>Insumo</th><th>Cant. anual</th><th>Lead time</th><th>Stock actual</th><th>Objetivo calc.</th><th>Semáforo</th></tr></thead>
            <tbody>
              ${Object.entries(DB.stock[k] || {}).map(([cod, row]) => {
                const ins = insumoPorCodigo(cod);
                const calc = calcularStockInsumo(row, 0);
                return `<tr class="fila-${calc.semaforo.nivel}">
                  <td>${cod}</td>
                  <td>${ins?.nombre || '-'}</td>
                  <td>${row.cantidad_anual || 0}</td>
                  <td>${row.lead_time_dias || 2}d</td>
                  <td><input type="number" value="${row.stock_actual || 0}" onchange="setStockActual('${k}','${cod}',this.value)" style="width:80px;"></td>
                  <td>${calc.objetivoFinal}</td>
                  <td><span class="badge badge-${calc.semaforo.nivel}">${calc.semaforo.msg}</span></td>
                </tr>`;
              }).join('') || '<tr><td colspan="7">Sin stock cargado</td></tr>'}
            </tbody>
          </table>
        </div>
      `).join('')}
    </div>
  `;
}

function guardarVademecumServicio(k) {
  const val = document.getElementById('cfg-'+k).value;
  DB.servicios[k].vademecum = val.split(',').map(x => x.trim()).filter(Boolean);
  guardar();
  renderConfig();
  alert('Vademécum actualizado');
}

function setStockActual(serv, cod, val) {
  if (!DB.stock[serv]) DB.stock[serv] = {};
  if (!DB.stock[serv][cod]) DB.stock[serv][cod] = {};
  DB.stock[serv][cod].stock_actual = parseInt(val) || 0;
  guardar();
  renderConfig();
}

async function importarStockExcel(event) {
  const file = event.target.files[0];
  if (!file) return;
  const serv = document.getElementById('importServicio').value;
  const data = await file.arrayBuffer();
  let rows = [];

  if (file.name.endsWith('.csv')) {
    const text = new TextDecoder().decode(data);
    rows = text.split('\n').map(l => l.split(',')).filter(r => r.length > 1);
    rows = rows.slice(1).map(r => ({
      Codigo: r[0], 'Cantidad por año': r[1],
      'Lead time': r[2], 'Nivel servicio': r[3],
      'Múltiplo': r[4], 'Stock actual': r[5]
    }));
  } else {
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws);
  }

  DB.stock[serv] = DB.stock[serv] || {};
  let cargados = 0;
  rows.forEach(r => {
    const cod = r.Codigo || r.codigo || r.CODIGO;
    if (!cod) return;
    DB.stock[serv][cod] = {
      cantidad_anual: Number(r['Cantidad por año'] || r.cantidad_anual || 0),
      lead_time_dias: Number(r['Lead time'] || 2),
      nivel_servicio: Number(r['Nivel servicio'] || 1.65),
      multiplo_pedido: Number(r['Múltiplo'] || 1),
      stock_actual: Number(r['Stock actual'] || 0)
    };
    cargados++;
  });
  guardar();
  renderConfig();
  alert(`Stock importado para ${serv}: ${cargados} insumos`);
}