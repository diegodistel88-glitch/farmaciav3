# 🏥 Gestión Hospitalaria de Indicaciones Médicas, Insumos y Acciones de Enfermería

Sistema web de una sola página (SPA, HTML/CSS/JS sin servidor) para el trabajo diario de una sala de internación: indicaciones médicas, acciones de enfermería por turno, pedidos a farmacia, control de insumos y trazabilidad.

[![Licencia: MIT](https://img.shields.io/badge/licencia-MIT-blue)](LICENSE)
[![Versión](https://img.shields.io/badge/versi%C3%B3n-v2.0-blue)](#)
[![GitHub Pages](https://img.shields.io/badge/app-GitHub%20Pages-brightgreen)](https://diegodistel88-glitch.github.io/FARMACIA2.0DISTEL/)

**Abrir la aplicación:** <https://diegodistel88-glitch.github.io/FARMACIA2.0DISTEL/>

---

## ✨ Qué hace

| Pestaña | Para quién | Qué hace |
|---|---|---|
| 🩺 Médico | Médicos | Carga indicaciones (tipo, texto, vía, frecuencia, horarios), agrega insumos desde el vademécum y **autoriza**. Finaliza/suspende con trazabilidad. |
| 👩‍⚕️ Enfermería | Enfermería | Indicaciones organizadas **por turno** (Mañana, Tarde, Vespertino, Noche), atenciones por turno, carga de materiales/EPP con historial. |
| 💊 Farmacia | Farmacia | **Resumen agrupado** de todo lo pedido y **detalle por acción** con origen (M / ENF / AISL / MAN), responsable, fecha y hora. |
| 📦 Insumos | Referente de insumos | **Stock de sala** con kardex (ingreso, consumo, devolución, ajuste), punto de pedido, alertas y **pedido sugerido** copiable (texto, tabla para Excel, CSV e impresión). |
| 📜 Finalizadas | Todos | Historial de indicaciones finalizadas y suspendidas. |

Además: 13 tipos de **precauciones de aislamiento** con EPP sugerido y catálogo de **5.174 insumos y medicamentos**.

## 🚀 Cómo usarlo

1. Abrí el link (PC, tablet o celular). No requiere instalación ni login.
2. Elegí **servicio**, **cama**, **paciente** y **aislamiento**.
3. Médico: cargá la indicación y autorizala.
4. Enfermería: ejecutá las acciones del turno y cargá los insumos usados.
5. Farmacia: usá el resumen para armar el pedido.

> ⚠️ **v2.0:** el estado vive en la memoria de la pestaña; al recargar se pierde. La persistencia (localStorage + exportar/importar JSON) llega en la **v3**.

## 🧱 Estructura del repositorio

```
.
├── index.html              # Aplicación completa (una sola página)
├── data/
│   ├── vademecum.csv       # Fuente: código, presentación, nombre
│   └── vademecum.json      # Catálogo que carga la app (generado)
├── scripts/
│   └── build-vademecum.py  # Regenera data/vademecum.json desde el CSV
├── docs/                   # Proceso, modelo de datos e ingeniería inversa
├── README.md
├── LICENSE                 # MIT
└── .nojekyll               # Evita el procesamiento de Jekyll en Pages
```

Regenerar el catálogo:

```bash
python3 scripts/build-vademecum.py
```

## 🌐 Publicación (GitHub Pages)

1. **Settings → Pages → Deploy from a branch**.
2. Branch `main`, carpeta `/ (root)`.
3. El sitio queda en <https://diegodistel88-glitch.github.io/FARMACIA2.0DISTEL/>.

No hay build: es HTML/CSS/JS estático.

## 🧪 Pruebas

Test de humo de la app (carga del vademécum, stock, pedido y respaldo):

```bash
npm install --no-save jsdom
node scripts/test-app.js
```

## 🗺️ Hoja de ruta v3

- [x] Catálogo limpio y título institucional.
- [x] **Control de stock**: kardex por insumo, movimientos (ingreso, consumo, devolución, ajuste) y alertas por punto de pedido.
- [x] **Pedido de farmacia** sugerido por punto de pedido / stock objetivo, con **copiar y pegar** (texto y tabla para Excel), CSV e impresión.
- [x] **Persistencia del stock** en el navegador + exportar/importar respaldo JSON.
- [ ] **Persistencia total de la sesión**: indicaciones, turnos, EPP e historial (hoy solo persiste el stock).
- [ ] **Consumo en sala** automático desde las acciones de enfermería (descuenta stock al ejecutar).
- [ ] **Multi-establecimiento**: configuración por hospital/servicio y catálogo compartible.
- [ ] Trazabilidad de lote / vencimiento (opcional por ítem).

Las fórmulas de reposición usadas son las del modelo en planilla del servicio: consumo diario = anual / 365; consumo real = 60 %; desvío = 1,65 · (0,3 · diario); stock seguridad = diario + desvío; punto de pedido = seguridad + 2 días; stock objetivo = punto de pedido + 2 · real. Ver [`docs/02-modelo-de-datos.md`](docs/02-modelo-de-datos.md).

## 📚 Documentación

- [Proceso de pedido de farmacia, stock y consumo](docs/01-proceso.md)
- [Modelo de datos v3](docs/02-modelo-de-datos.md)
- [Ingeniería inversa: cómo lo hacen los grandes hospitales](docs/03-grandes-hospitales.md)

## ⚖️ Licencia

MIT — ver [`LICENSE`](LICENSE). Libre para usar, copiar y adaptar en cualquier hospital.

## 👤 Créditos

**Diego Distel** ([@diegodistel88-glitch](https://github.com/diegodistel88-glitch)) — app original "FARMACIA 2.0".
