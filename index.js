import { Transaccion } from './classes/Transaccion.js'

const formulario = document.querySelector("#formTransaccion")
const tablaTransacciones = document.querySelector("#tablaTransacciones")
const resumenCategorias = document.querySelector("#resumenCategorias")

const totalIngresosEl = document.querySelector("#totalIngresos")
const totalGastosEl = document.querySelector("#totalGastos")
const balanceNetoEl = document.querySelector("#balanceNeto")


Transaccion.cargar()

Transaccion.obtenerHistorial().forEach(function (transaccion) {
    mostrarTransaccion(transaccion)
})

actualizarBalance()
actualizarResumen()

formulario.addEventListener("submit", function (event) {
    event.preventDefault()

    const descripcion = document.querySelector("#descripcion").value
    const monto = document.querySelector("#monto").value
    const tipo = document.querySelector("#tipo").value
    const categoria = document.querySelector("#categoria").value

    const nuevaTransaccion = new Transaccion(
        tipo,
        descripcion,
        monto,
        categoria
    )
    Transaccion.guardar()

    mostrarTransaccion(nuevaTransaccion)
    actualizarBalance()
    actualizarResumen()

    formulario.reset()
})

function mostrarTransaccion(transaccion) {
    const fila = document.createElement("tr") 
    fila.className = "hover:bg-gray-50"


    const colorMonto = transaccion.tipo === "egreso" ? "red" : "green"

    fila.innerHTML = `
        <td>${transaccion.tipo}</td>
        <td>${transaccion.descripcion}</td>
        <td style="color: ${colorMonto}">$${Number(transaccion.monto).toFixed(2)}</td>
        <td>${transaccion.categoria}</td>
        <td>
          <button type="button" class="btn-eliminar bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700">
    Eliminar
</button>
        </td>
    `

    const botonEliminar = fila.querySelector(".btn-eliminar")

    botonEliminar.addEventListener("click", function () {
        Transaccion.eliminar(transaccion.id)
        fila.remove()
        actualizarBalance()
        actualizarResumen()
    })

    tablaTransacciones.appendChild(fila)
}

function actualizarBalance() {
    totalIngresosEl.textContent = "$" + Transaccion.totalIngresos().toFixed(2)
    totalGastosEl.textContent = "$" + Transaccion.totalGastos().toFixed(2)
    balanceNetoEl.textContent = "$" + Transaccion.balanceNeto().toFixed(2)
}

function actualizarResumen() {
    const resumen = Transaccion.resumenPorCategoria()

    resumenCategorias.innerHTML = ""

    Object.keys(resumen).forEach(function (categoria) {
        const item = document.createElement("li")
        item.innerHTML = `${categoria}: $${resumen[categoria].toFixed(2)}`
        resumenCategorias.appendChild(item)
    })

    if (Object.keys(resumen).length === 0) {
        resumenCategorias.innerHTML = `<li>Todavía no hay movimientos.</li>`
    }
}