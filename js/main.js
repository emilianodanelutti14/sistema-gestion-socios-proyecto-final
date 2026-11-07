const CLAVE_STORAGE = "padronSocios";
const URL_SOCIOS = "./data/socios_iniciales.json";

let padronSocios = [];

const elementos = {
    contenedor: document.querySelector("#contenedor-socios"),
    filtro: document.querySelector("#filtro-categoria"),
    ingresos: document.querySelector("#ingresos-totales"),
    cantidad: document.querySelector("#cantidad-socios"),
    estado: document.querySelector("#estado-conexion"),
    formulario: document.querySelector("#form-socio"),
    nombre: document.querySelector("#reg-nombre"),
    edad: document.querySelector("#reg-edad"),
    categoria: document.querySelector("#reg-categoria"),
    cuota: document.querySelector("#reg-cuota"),
    botonVaciar: document.querySelector("#btn-vaciar")
};

const preciosPorCategoria = {
    "Musculación": 15000,
    "Pase Libre": 22000,
    "Crossfit": 18000,
    "VIP Premium": 30000
};

const formatoMoneda = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
});

function notificar(mensaje, tipo = "exito") {
    const colores = {
        exito: "linear-gradient(to right, #218c54, #35b779)",
        error: "linear-gradient(to right, #c0392b, #e74c3c)",
        aviso: "linear-gradient(to right, #d68910, #f5b041)"
    };

    Toastify({
        text: mensaje,
        duration: 3200,
        close: true,
        gravity: "top",
        position: "right",
        style: { background: colores[tipo] || colores.aviso }
    }).showToast();
}

function guardarEnLocalStorage() {
    try {
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(padronSocios));
        return true;
    } catch (error) {
        notificar("No se pudieron guardar los cambios en este navegador.", "error");
        return false;
    }
}

function convertirEnSocios(datos) {
    if (!Array.isArray(datos)) {
        throw new Error("El formato de los datos de socios no es válido.");
    }
    return datos.map((datosSocio) => new Socio(datosSocio));
}

async function cargarDatosIniciales() {
    elementos.estado.textContent = "Cargando padrón de socios...";

    try {
        const datosGuardados = localStorage.getItem(CLAVE_STORAGE);

        if (datosGuardados !== null) {
            const sociosParseados = JSON.parse(datosGuardados);
            padronSocios = convertirEnSocios(sociosParseados);
            elementos.estado.textContent = "Padrón recuperado desde este navegador.";
        } else {
            const respuesta = await fetch(URL_SOCIOS);
            if (!respuesta.ok) {
                throw new Error(`No se pudo cargar el archivo de datos (HTTP ${respuesta.status}).`);
            }

            const datosJson = await respuesta.json();
            padronSocios = convertirEnSocios(datosJson);
            guardarEnLocalStorage();
            elementos.estado.textContent = "Padrón inicial cargado correctamente desde el archivo JSON.";
        }
    } catch (error) {
        padronSocios = [];
        elementos.estado.textContent = `No se pudieron cargar los datos: ${error.message}`;
        notificar("No se pudo cargar el padrón. Revisá la conexión y la ubicación del archivo JSON.", "error");
    } finally {
        renderizarSocios();
    }
}

function calcularIngresosTotales() {
    const total = padronSocios.reduce((acumulador, socio) => acumulador + socio.cuotaActual, 0);
    elementos.ingresos.textContent = formatoMoneda.format(total);
    elementos.cantidad.textContent = `${padronSocios.length} ${padronSocios.length === 1 ? "socio registrado" : "socios registrados"}`;
}

function crearTextoEtiqueta(etiqueta, valor) {
    const parrafo = document.createElement("p");
    const titulo = document.createElement("strong");
    titulo.textContent = `${etiqueta}: `;
    parrafo.append(titulo, document.createTextNode(valor));
    return parrafo;
}

function crearTarjetaSocio(socio) {
    const { id, nombre, edad, categoria, cuotaActual, recargoAplicado } = socio;
    const tarjeta = document.createElement("article");
    tarjeta.className = "socio-card";

    const informacion = document.createElement("div");
    informacion.className = "socio-info";
    informacion.append(
        crearTextoEtiqueta("Nombre", `${nombre} (${edad} años)`),
        crearTextoEtiqueta("Categoría", categoria),
        crearTextoEtiqueta("Cuota actual", formatoMoneda.format(cuotaActual))
    );

    const acciones = document.createElement("div");
    acciones.className = "socio-acciones";

    const botonRecargo = document.createElement("button");
    botonRecargo.type = "button";
    botonRecargo.className = "btn-recargo";
    botonRecargo.dataset.accion = "recargo";
    botonRecargo.dataset.id = id;
    botonRecargo.textContent = recargoAplicado ? "Recargo aplicado" : "Aplicar +10%";
    botonRecargo.disabled = recargoAplicado;

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.className = "btn-eliminar";
    botonEliminar.dataset.accion = "eliminar";
    botonEliminar.dataset.id = id;
    botonEliminar.textContent = "Dar de baja";

    acciones.append(botonRecargo, botonEliminar);
    tarjeta.append(informacion, acciones);
    return tarjeta;
}

function renderizarSocios() {
    elementos.contenedor.replaceChildren();
    calcularIngresosTotales();

    const categoriaSeleccionada = elementos.filtro.value;
    const sociosVisibles = categoriaSeleccionada === "Todos"
        ? padronSocios
        : padronSocios.filter((socio) => socio.categoria === categoriaSeleccionada);

    if (sociosVisibles.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.className = "mensaje-vacio";
        mensaje.textContent = padronSocios.length === 0
            ? "Todavía no hay socios registrados. Podés agregar el primero desde el formulario."
            : "No hay socios para la categoría seleccionada.";
        elementos.contenedor.appendChild(mensaje);
        return;
    }

    sociosVisibles.forEach((socio) => {
        elementos.contenedor.appendChild(crearTarjetaSocio(socio));
    });
}

function limpiarFormulario() {
    elementos.formulario.reset();
    elementos.cuota.value = "";
    elementos.nombre.focus();
}

function validarFormulario() {
    const nombre = elementos.nombre.value.trim() || "";
    const edad = Number(elementos.edad.value);
    const categoria = elementos.categoria.value;
    const cuotaBase = preciosPorCategoria[categoria] || 0;

    if (nombre.length < 2) {
        notificar("Ingresá un nombre de al menos 2 caracteres.", "aviso");
        elementos.nombre.focus();
        return null;
    }

    if (!Number.isInteger(edad) || edad < 1 || edad > 110) {
        notificar("La edad debe ser un número entero entre 1 y 110.", "aviso");
        elementos.edad.focus();
        return null;
    }

    if (!cuotaBase) {
        notificar("Seleccioná una categoría válida.", "aviso");
        elementos.categoria.focus();
        return null;
    }

    return { nombre, edad, categoria, cuotaBase };
}

async function registrarSocio(evento) {
    evento.preventDefault();
    const datosSocio = validarFormulario();
    if (!datosSocio) return;

    const nuevoSocio = new Socio(datosSocio);
    padronSocios.push(nuevoSocio);
    guardarEnLocalStorage();

    elementos.filtro.value = "Todos";
    renderizarSocios();
    limpiarFormulario();
    notificar(`Socio ${nuevoSocio.nombre} registrado correctamente.`);
}

async function confirmarBaja(socio) {
    const resultado = await Swal.fire({
        title: "¿Dar de baja al socio?",
        text: `Se eliminará a ${socio.nombre} del padrón activo.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, dar de baja",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#c0392b",
        cancelButtonColor: "#64748b",
        reverseButtons: true
    });

    if (!resultado.isConfirmed) return;
    padronSocios = padronSocios.filter((socioActual) => socioActual.id !== socio.id);
    guardarEnLocalStorage();
    renderizarSocios();
    notificar(`Se dio de baja a ${socio.nombre}.`);
}

async function confirmarVaciarPadron() {
    if (padronSocios.length === 0) {
        notificar("El padrón ya está vacío.", "aviso");
        return;
    }

    const resultado = await Swal.fire({
        title: "¿Vaciar todo el padrón?",
        text: "Se eliminarán todos los socios guardados. Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, vaciar padrón",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#c0392b",
        cancelButtonColor: "#64748b",
        reverseButtons: true
    });

    if (!resultado.isConfirmed) return;
    padronSocios = [];
    guardarEnLocalStorage();
    elementos.filtro.value = "Todos";
    renderizarSocios();
    notificar("El padrón se vació correctamente.");
}

function gestionarAccionSocio(evento) {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;

    const socio = padronSocios.find((socioActual) => socioActual.id === boton.dataset.id);
    if (!socio) return;

    if (boton.dataset.accion === "recargo") {
        const seAplico = socio.aplicarRecargo();
        if (!seAplico) {
            notificar("Este socio ya tiene aplicado el recargo.", "aviso");
            return;
        }
        guardarEnLocalStorage();
        renderizarSocios();
        notificar(`Se aplicó el recargo del 10% a ${socio.nombre}.`);
    }

    if (boton.dataset.accion === "eliminar") {
        confirmarBaja(socio);
    }
}

function actualizarPrecioCategoria() {
    const precio = preciosPorCategoria[elementos.categoria.value] || "";
    elementos.cuota.value = precio ? formatoMoneda.format(precio) : "";
}

elementos.formulario.addEventListener("submit", registrarSocio);
elementos.categoria.addEventListener("change", actualizarPrecioCategoria);
elementos.filtro.addEventListener("change", renderizarSocios);
elementos.contenedor.addEventListener("click", gestionarAccionSocio);
elementos.botonVaciar.addEventListener("click", confirmarVaciarPadron);

cargarDatosIniciales();
