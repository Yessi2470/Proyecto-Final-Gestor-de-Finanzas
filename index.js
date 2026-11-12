import { Transaccion } from './classes/Transaccion.js'

const formulario = document.querySelector("#formTransaccion")
const tablaTransacciones = document.querySelector("#tablaTransacciones")

const canvasCategorias = document.querySelector("#graficoCategorias")
const canvasGrafico = document.querySelector("#graficoFinanzas")

const totalIngresosEl = document.querySelector("#totalIngresos")
const totalGastosEl = document.querySelector("#totalGastos")
const balanceNetoEl = document.querySelector("#balanceNeto")

let graficoCategorias
let graficoFinanzas

Transaccion.cargar()

Transaccion.obtenerHistorial().forEach(function (transaccion) {
    mostrarTransaccion(transaccion)
})

actualizarBalance()
actualizarGrafico()
actualizarGraficoCategorias()

formulario.addEventListener("submit", function (event) {
    event.preventDefault()

    const fecha = document.querySelector("#fecha").value
    const descripcion = document.querySelector("#descripcion").value
    const monto = document.querySelector("#monto").value
    const tipo = document.querySelector("#tipo").value
    const categoria = document.querySelector("#categoria").value

    const nuevaTransaccion = new Transaccion(
        fecha,
        tipo,
        descripcion,
        monto,
        categoria
    )

    Transaccion.guardar()

    mostrarTransaccion(nuevaTransaccion)
    actualizarBalance()
    actualizarGrafico()
    actualizarGraficoCategorias()

    formulario.reset()
})

function mostrarTransaccion(transaccion) {
    const fila = document.createElement("tr")
    fila.className = "hover:bg-gray-50"

    const colorMonto = transaccion.tipo === "egreso" ? "red" : "green"

    fila.innerHTML = `
        <td>${transaccion.fecha || "-"}</td>
        <td>${transaccion.tipo}</td>
        <td>${transaccion.descripcion}</td>
        <td style="color: ${colorMonto}">$${Number(transaccion.monto).toFixed(2)}</td>
        <td>${transaccion.categoria}</td>
        <td>
<button type="button" class="btn-eliminar bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-md hover:bg-blue-600 hover:text-white transition-colors">
    Eliminar
</button>
        </td>
    `

    const botonEliminar = fila.querySelector(".btn-eliminar")

    botonEliminar.addEventListener("click", function () {
        Transaccion.eliminar(transaccion.id)
        fila.remove()
        actualizarBalance()
        actualizarGrafico()
        actualizarGraficoCategorias()
    })

    tablaTransacciones.appendChild(fila)
}

function actualizarBalance() {
    totalIngresosEl.textContent = "$" + Transaccion.totalIngresos().toFixed(2)
    totalGastosEl.textContent = "$" + Transaccion.totalGastos().toFixed(2)
    balanceNetoEl.textContent = "$" + Transaccion.balanceNeto().toFixed(2)
}



function actualizarGrafico() {
    const historial = Transaccion.obtenerHistorial()

    const movimientos = historial
        .filter(transaccion => transaccion.fecha)
        .sort((a, b) => a.fecha.localeCompare(b.fecha))

    const fechas = [...new Set(
        movimientos.map(transaccion => transaccion.fecha)
    )]

    let balanceAcumulado = 0

    const ingresos = []
    const egresos = []
    const balances = []

    fechas.forEach(function (fecha) {
        const movimientosDelDia = movimientos.filter(
            transaccion => transaccion.fecha === fecha
        )

        let totalIngresos = 0
        let totalEgresos = 0

        movimientosDelDia.forEach(function (transaccion) {
            if (transaccion.tipo === "ingreso") {
                totalIngresos += transaccion.monto
            } else {
                totalEgresos += transaccion.monto
            }
        })

        balanceAcumulado += totalIngresos - totalEgresos

        ingresos.push(totalIngresos)
        egresos.push(totalEgresos)
        balances.push(balanceAcumulado)
    })

    const etiquetas = fechas.map(function (fecha) {
        const [anio, mes, dia] = fecha.split("-")
        return `${dia}/${mes}/${anio}`
    })

    if (graficoFinanzas) {
        graficoFinanzas.destroy()
    }

    graficoFinanzas = new Chart(canvasGrafico, {
        type: "line",
        data: {
            labels: etiquetas,
            datasets: [
                {
                    label: "Ingresos",
                    data: ingresos,
                    borderColor: "green",
                    tension: 0.4,
                    cubicInterpolationMode: "default",
                    pointRadius: 3,
                    pointHoverRadius: 6
                },
                {
                    label: "Egresos",
                    data: egresos,
                    borderColor: "#F97316",
                    tension: 0.4,
                    cubicInterpolationMode: "default",
                    pointRadius: 3,
                    pointHoverRadius: 6
                },
                {
                    label: "Balance neto",
                    data: balances,
                    borderColor: "#2563EB",
                    tension: 0.4,
                    cubicInterpolationMode: "default",
                    pointRadius: 3,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    })
}


function actualizarGraficoCategorias() {
     const categorias = Transaccion.resumenPorCategoria()

    if (graficoCategorias) {
        graficoCategorias.destroy()
    }

    graficoCategorias = new Chart(canvasCategorias, {
        type: "bar",
        data: {
            labels: Object.keys(categorias),
            datasets: [
                {
                    label: "Monto por categoría",
                    data: Object.values(categorias),
                    backgroundColor: [
                        "#60A5FA",
                        "#34D399",
                        "#FBBF24",
                        "#A78BFA",
                        "#F472B6"
                    ],
                    borderRadius: 6,
                    barPercentage: 0.5,
                    categoryPercentage: 0.6
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    })
}