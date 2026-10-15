"use strict";

// ==========================================
// 1. VARIABLES GLOBALES
// ==========================================

const STORAGE_KEY = "directorio_estudiantes_ucamp";

let estudiantes = [];
let estudianteEditando = null;
let estudianteEliminando = null;

// ==========================================
// 2. ELEMENTOS DEL DOM
// ==========================================

const tablaEstudiantes = document.getElementById("tablaEstudiantes");
const formEstudiante = document.getElementById("formEstudiante");
const buscarEstudiante = document.getElementById("buscarEstudiante");
const filtroGrupo = document.getElementById("filtroGrupo");

const modalEstudianteElemento = document.getElementById("modalEstudiante");
const modalEliminarElemento = document.getElementById("modalEliminar");

const modalEstudiante = bootstrap.Modal.getOrCreateInstance(
  modalEstudianteElemento,
);

const modalEliminar = bootstrap.Modal.getOrCreateInstance(
  modalEliminarElemento,
);

const toast = bootstrap.Toast.getOrCreateInstance(
  document.getElementById("toastNotificacion"),
);

// ==========================================
// 3. LOCAL STORAGE
// ==========================================

function cargarEstudiantes() {
  try {
    const datos = localStorage.getItem(STORAGE_KEY);

    if (!datos) {
      estudiantes = [];
      return;
    }

    const registros = JSON.parse(datos);

    estudiantes = Array.isArray(registros) ? registros : [];
  } catch (error) {
    console.error("Error al cargar estudiantes:", error);
    estudiantes = [];
    mostrarNotificacion("No se pudieron recuperar los datos.");
  }
}

function guardarEstudiantes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estudiantes));
    return true;
  } catch (error) {
    console.error("Error al guardar estudiantes:", error);
    mostrarNotificacion("Error al guardar los datos.");
    return false;
  }
}

// ==========================================
// 4. NOTIFICACIONES
// ==========================================

function mostrarNotificacion(mensaje) {
  document.getElementById("mensajeToast").textContent = mensaje;
  toast.show();
}

// ==========================================
// 5. OBTENER DATOS DEL FORMULARIO
// ==========================================

function obtenerDatosFormulario() {
  return {
    nombre: document.getElementById("nombre").value.trim(),
    matricula: document.getElementById("matricula").value.trim(),
    grupo: document.getElementById("grupo").value,
    semestre: document.getElementById("semestre").value,
    telefono: document.getElementById("telefono").value.trim(),
    correo: document.getElementById("correo").value.trim(),
    observaciones: document.getElementById("observaciones").value.trim(),
  };
}

// ==========================================
// 6. CREATE - REGISTRAR ESTUDIANTE
// ==========================================

function registrarEstudiante(datos) {
  const nuevoEstudiante = {
    id: crypto.randomUUID(),
    ...datos,
    fechaRegistro: new Date().toISOString(),
  };

  estudiantes.push(nuevoEstudiante);

  if (!guardarEstudiantes()) {
    estudiantes.pop();
    return false;
  }

  mostrarEstudiantes();
  mostrarNotificacion("Estudiante registrado correctamente.");

  return true;
}

// ==========================================
// 7. READ - MOSTRAR ESTUDIANTES
// ==========================================

function mostrarEstudiantes() {
  tablaEstudiantes.replaceChildren();

  const busqueda = buscarEstudiante.value.toLowerCase().trim();
  const grupoSeleccionado = filtroGrupo.value;

  const estudiantesFiltrados = estudiantes.filter((estudiante) => {
    const nombre = estudiante.nombre.toLowerCase();
    const matricula = estudiante.matricula.toLowerCase();
    const telefono = estudiante.telefono;

    const coincideBusqueda =
      nombre.includes(busqueda) ||
      matricula.includes(busqueda) ||
      telefono.includes(busqueda);

    const coincideGrupo =
      grupoSeleccionado === "" || estudiante.grupo === grupoSeleccionado;

    return coincideBusqueda && coincideGrupo;
  });

  if (estudiantesFiltrados.length === 0) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");

    celda.colSpan = 7;
    celda.className = "text-center py-4 text-secondary";
    celda.textContent = "No se encontraron estudiantes.";

    fila.appendChild(celda);
    tablaEstudiantes.appendChild(fila);
  }

  estudiantesFiltrados.forEach((estudiante, indice) => {
    const fila = document.createElement("tr");

    // Número
    const celdaNumero = document.createElement("th");
    celdaNumero.scope = "row";
    celdaNumero.textContent = indice + 1;

    // Nombre y avatar
    const celdaNombre = document.createElement("td");
    const contenedorNombre = document.createElement("div");

    contenedorNombre.className = "d-flex align-items-center gap-2";

    const avatar = document.createElement("span");
    avatar.className = "badge rounded-circle text-bg-primary p-3";

    avatar.textContent = estudiante.nombre
      .split(/\s+/)
      .slice(0, 2)
      .map((palabra) => palabra.charAt(0))
      .join("")
      .toUpperCase();

    const nombre = document.createElement("span");
    nombre.className = "fw-semibold";
    nombre.textContent = estudiante.nombre;

    contenedorNombre.append(avatar, nombre);
    celdaNombre.appendChild(contenedorNombre);

    // Matrícula
    const celdaMatricula = document.createElement("td");
    celdaMatricula.textContent = estudiante.matricula;

    // Grupo
    const celdaGrupo = document.createElement("td");
    const badgeGrupo = document.createElement("span");

    badgeGrupo.className = "badge text-bg-info";
    badgeGrupo.textContent = `Grupo ${estudiante.grupo}`;

    celdaGrupo.appendChild(badgeGrupo);

    // Teléfono
    const celdaTelefono = document.createElement("td");
    const enlaceTelefono = document.createElement("a");

    enlaceTelefono.href = `tel:${estudiante.telefono}`;
    enlaceTelefono.textContent = estudiante.telefono;
    enlaceTelefono.className = "text-decoration-none";

    celdaTelefono.appendChild(enlaceTelefono);

    // Correo
    const celdaCorreo = document.createElement("td");

    if (estudiante.correo) {
      const enlaceCorreo = document.createElement("a");

      enlaceCorreo.href = `mailto:${estudiante.correo}`;
      enlaceCorreo.textContent = estudiante.correo;
      enlaceCorreo.className = "text-decoration-none";

      celdaCorreo.appendChild(enlaceCorreo);
    } else {
      celdaCorreo.textContent = "Sin correo";
    }

    // Acciones
    const celdaAcciones = document.createElement("td");
    celdaAcciones.className = "text-center";

    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.className = "btn btn-sm btn-outline-primary me-1";
    btnEditar.textContent = "Editar";

    btnEditar.addEventListener("click", () => {
      editarEstudiante(estudiante.id);
    });

    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.className = "btn btn-sm btn-outline-danger";
    btnEliminar.textContent = "Eliminar";

    btnEliminar.addEventListener("click", () => {
      prepararEliminacion(estudiante.id);
    });

    celdaAcciones.append(btnEditar, btnEliminar);

    fila.append(
      celdaNumero,
      celdaNombre,
      celdaMatricula,
      celdaGrupo,
      celdaTelefono,
      celdaCorreo,
      celdaAcciones,
    );

    tablaEstudiantes.appendChild(fila);
  });

  document.getElementById("cantidadResultados").textContent =
    `Mostrando ${estudiantesFiltrados.length} de ${estudiantes.length} estudiantes`;

  actualizarEstadisticas();
}

// ==========================================
// 8. UPDATE - EDITAR ESTUDIANTE
// ==========================================

function editarEstudiante(id) {
  const estudiante = estudiantes.find((item) => item.id === id);

  if (!estudiante) {
    mostrarNotificacion("Estudiante no encontrado.");
    return;
  }

  estudianteEditando = id;

  document.getElementById("nombre").value = estudiante.nombre;
  document.getElementById("matricula").value = estudiante.matricula;
  document.getElementById("grupo").value = estudiante.grupo;
  document.getElementById("semestre").value = estudiante.semestre;
  document.getElementById("telefono").value = estudiante.telefono;
  document.getElementById("correo").value = estudiante.correo;
  document.getElementById("observaciones").value = estudiante.observaciones;

  document.getElementById("tituloModal").textContent = "Editar estudiante";

  document.getElementById("btnGuardar").textContent = "Actualizar estudiante";

  modalEstudiante.show();
}

function actualizarEstudiante(id, datos) {
  const indice = estudiantes.findIndex((item) => item.id === id);

  if (indice === -1) {
    mostrarNotificacion("Estudiante no encontrado.");
    return false;
  }

  const anterior = estudiantes[indice];

  estudiantes[indice] = {
    ...anterior,
    ...datos,
    fechaActualizacion: new Date().toISOString(),
  };

  if (!guardarEstudiantes()) {
    estudiantes[indice] = anterior;
    return false;
  }

  mostrarEstudiantes();
  mostrarNotificacion("Estudiante actualizado correctamente.");

  return true;
}

// ==========================================
// 9. DELETE - ELIMINAR ESTUDIANTE
// ==========================================

function prepararEliminacion(id) {
  const estudiante = estudiantes.find((item) => item.id === id);

  if (!estudiante) {
    mostrarNotificacion("Estudiante no encontrado.");
    return;
  }

  estudianteEliminando = id;

  document.getElementById("nombreEliminar").textContent = estudiante.nombre;

  modalEliminar.show();
}

function eliminarEstudiante(id) {
  const registrosAnteriores = [...estudiantes];

  estudiantes = estudiantes.filter((item) => item.id !== id);

  if (!guardarEstudiantes()) {
    estudiantes = registrosAnteriores;
    return false;
  }

  mostrarEstudiantes();
  mostrarNotificacion("Estudiante eliminado correctamente.");

  return true;
}

// ==========================================
// 10. ESTADÍSTICAS
// ==========================================

function actualizarEstadisticas() {
  const total = estudiantes.length;

  const grupos = new Set(estudiantes.map((estudiante) => estudiante.grupo));

  const contactos = estudiantes.filter(
    (estudiante) => estudiante.telefono.trim() !== "",
  ).length;

  document.getElementById("totalEstudiantes").textContent = total;
  document.getElementById("totalGrupos").textContent = grupos.size;
  document.getElementById("totalContactos").textContent = contactos;
}

// ==========================================
// 11. VALIDACIONES
// ==========================================

function validarMatricula(matricula) {
  return estudiantes.some((estudiante) => {
    return (
      estudiante.matricula.toLowerCase() === matricula.toLowerCase() &&
      estudiante.id !== estudianteEditando
    );
  });
}

function validarTelefono(telefono) {
  return /^[0-9]{10}$/.test(telefono);
}

// ==========================================
// 12. EVENTO GUARDAR FORMULARIO
// ==========================================

formEstudiante.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const datos = obtenerDatosFormulario();

  if (!formEstudiante.checkValidity()) {
    formEstudiante.reportValidity();
    return;
  }

  if (!validarTelefono(datos.telefono)) {
    mostrarNotificacion("El teléfono debe tener 10 dígitos.");
    document.getElementById("telefono").focus();
    return;
  }

  if (validarMatricula(datos.matricula)) {
    mostrarNotificacion("La matrícula ya está registrada.");
    document.getElementById("matricula").focus();
    return;
  }

  let guardado = false;

  if (estudianteEditando !== null) {
    guardado = actualizarEstudiante(estudianteEditando, datos);
  } else {
    guardado = registrarEstudiante(datos);
  }

  if (guardado) {
    modalEstudiante.hide();
    estudianteEditando = null;
    formEstudiante.reset();
  }
});

// ==========================================
// 13. EVENTO NUEVO ESTUDIANTE
// ==========================================

document.getElementById("btnNuevoEstudiante").addEventListener("click", () => {
  estudianteEditando = null;

  formEstudiante.reset();

  document.getElementById("tituloModal").textContent = "Registrar estudiante";

  document.getElementById("btnGuardar").textContent = "Guardar estudiante";
});

// ==========================================
// 14. EVENTO CONFIRMAR ELIMINACIÓN
// ==========================================

document.getElementById("confirmarEliminar").addEventListener("click", () => {
  if (estudianteEliminando === null) {
    return;
  }

  if (eliminarEstudiante(estudianteEliminando)) {
    modalEliminar.hide();
    estudianteEliminando = null;
  }
});

// ==========================================
// 15. BUSCADOR EN TIEMPO REAL
// ==========================================

buscarEstudiante.addEventListener("input", () => {
  mostrarEstudiantes();
});

// ==========================================
// 16. FILTRAR POR GRUPO
// ==========================================

filtroGrupo.addEventListener("change", () => {
  mostrarEstudiantes();
});

// ==========================================
// 17. LIMPIAR ESTADOS AL CERRAR MODALES
// ==========================================

modalEstudianteElemento.addEventListener("hidden.bs.modal", () => {
  estudianteEditando = null;
  formEstudiante.reset();
});

modalEliminarElemento.addEventListener("hidden.bs.modal", () => {
  estudianteEliminando = null;
});

// ==========================================
// 18. INICIALIZAR SISTEMA
// ==========================================

cargarEstudiantes();
mostrarEstudiantes();
