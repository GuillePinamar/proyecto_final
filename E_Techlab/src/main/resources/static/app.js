const API_URL = 'http://localhost:8080/api/productos';
const API_CATEGORIAS = 'http://localhost:8080/api/categorias';
const API_VENTAS = 'http://localhost:8080/api/ventas';

let carrito = [];
let productosGlobales = []; 
let categoriasGlobales = []; 

document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
    cargarProductos();
});

// --- NAVEGACIÓN ASIDE ---
function mostrarSeccion(vista) {
    const secCatalogo = document.getElementById('seccion-catalogo');
    const secGestion = document.getElementById('seccion-gestion');
    const secCategorias = document.getElementById('seccion-categorias');
    const secHistorial = document.getElementById('seccion-historial');

    const menuCatalogo = document.getElementById('menu-catalogo');
    const menuGestion = document.getElementById('menu-gestion');
    const menuCategorias = document.getElementById('menu-categorias');
    const menuHistorial = document.getElementById('menu-historial');

    // Ocultar todas las secciones y quitar la clase active
    if (secCatalogo) secCatalogo.classList.add('d-none');
    if (secGestion) secGestion.classList.add('d-none');
    if (secCategorias) secCategorias.classList.add('d-none');
    if (secHistorial) secHistorial.classList.add('d-none');

    if (menuCatalogo) menuCatalogo.classList.remove('active');
    if (menuGestion) menuGestion.classList.remove('active');
    if (menuCategorias) menuCategorias.classList.remove('active');
    if (menuHistorial) menuHistorial.classList.remove('active');

    if (vista === 'catalogo') {
        if (secCatalogo) secCatalogo.classList.remove('d-none');
        if (menuCatalogo) menuCatalogo.classList.add('active');
    } else if (vista === 'gestion') {
        if (secGestion) secGestion.classList.remove('d-none');
        if (menuGestion) menuGestion.classList.add('active');
    } else if (vista === 'categorias') {
        if (secCategorias) secCategorias.classList.remove('d-none');
        if (menuCategorias) menuCategorias.classList.add('active');
        cargarTablaCategorias();
    } else if (vista === 'historial') {
        if (secHistorial) secHistorial.classList.remove('d-none');
        if (menuHistorial) menuHistorial.classList.add('active');
        cargarHistorialCompras();
    }
}

// --- CARGAR CATEGORÍAS ---
async function cargarCategorias() {
    try {
        const response = await fetch(API_CATEGORIAS);
        if (response.ok) {
            categoriasGlobales = await response.json();

            const selectModal = document.getElementById('modal-prod-categoria');
            if (selectModal) {
                selectModal.innerHTML = '<option value="">Seleccione una categoría...</option>';
                categoriasGlobales.forEach(cat => {
                    selectModal.innerHTML += `<option value="${cat.idCategoria}">${cat.nombre}</option>`;
                });
            }

            renderizarFiltrosCategorias();
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

function renderizarFiltrosCategorias() {
    const contenedorFiltros = document.getElementById('filtros-categorias');
    if (!contenedorFiltros) return;

    let html = `<button class="btn btn-outline-dark btn-sm me-2 mb-2 active" onclick="filtrarPorCategoria('todos', event)">Todos</button>`;

    categoriasGlobales.forEach(cat => {
        html += `<button class="btn btn-outline-dark btn-sm me-2 mb-2" onclick="filtrarPorCategoria(${cat.idCategoria}, event)">${cat.nombre}</button>`;
    });

    contenedorFiltros.innerHTML = html;
}

function filtrarPorCategoria(idCategoria, event) {
    const botones = document.querySelectorAll('#filtros-categorias button');
    botones.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (idCategoria === 'todos') {
        renderizarGridCatalogo(productosGlobales);
    } else {
        const filtrados = productosGlobales.filter(p => p.categoria && p.categoria.idCategoria === idCategoria);
        renderizarGridCatalogo(filtrados);
    }
}

// --- GESTIÓN DE CATEGORÍAS (CRUD) ---
async function cargarTablaCategorias() {
    try {
        const response = await fetch(API_CATEGORIAS);
        if (!response.ok) throw new Error('Error al cargar categorías');

        const categorias = await response.json();
        const tbody = document.getElementById('tabla-categorias-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (categorias.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-muted">No hay categorías registradas.</td></tr>`;
            return;
        }

        categorias.forEach(cat => {
            tbody.innerHTML += `
                <tr>
                    <td class="ps-3">${cat.idCategoria}</td>
                    <td class="fw-semibold">${cat.nombre}</td>
                    <td class="text-end pe-3">
                        <button class="btn btn-sm btn-warning me-1" onclick="cargarCategoriaEnModal(${cat.idCategoria}, '${cat.nombre}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarCategoria(${cat.idCategoria})">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error al cargar tabla de categorías:', error);
    }
}

function abrirModalCrearCategoria() {
    const inputId = document.getElementById('modal-cat-id');
    const form = document.getElementById('form-categoria');
    const label = document.getElementById('modalCategoriaLabel');

    if (inputId) inputId.value = '';
    if (form) form.reset();
    if (label) label.innerText = 'Nueva Categoría';

    const modalEl = document.getElementById('modalCategoria');
    if (modalEl) {
        const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalInstance.show();
    }
}

function cargarCategoriaEnModal(id, nombre) {
    const inputId = document.getElementById('modal-cat-id');
    const inputNombre = document.getElementById('modal-cat-nombre');
    const label = document.getElementById('modalCategoriaLabel');

    if (inputId) inputId.value = id;
    if (inputNombre) inputNombre.value = nombre;
    if (label) label.innerText = 'Editar Categoría';

    const modalEl = document.getElementById('modalCategoria');
    if (modalEl) {
        const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalInstance.show();
    }
}

async function guardarCategoria(event) {
    event.preventDefault();

    const id = document.getElementById('modal-cat-id').value;
    const nombre = document.getElementById('modal-cat-nombre').value.trim();

    const categoriaData = { nombre };
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_CATEGORIAS}/${id}` : API_CATEGORIAS;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoriaData)
        });

        if (response.ok) {
            const modalEl = document.getElementById('modalCategoria');
            if (modalEl) {
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) modalInstance.hide();
            }

            alert(id ? '¡Categoría actualizada con éxito!' : '¡Categoría creada con éxito!');
            cargarCategorias();
            cargarTablaCategorias();
        } else {
            const errorMsg = await response.text();
            alert('Error al guardar la categoría: ' + errorMsg);
        }
    } catch (error) {
        console.error('Error de red al guardar categoría:', error);
    }
}

async function eliminarCategoria(id) {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
        const response = await fetch(`${API_CATEGORIAS}/${id}`, { method: 'DELETE' });

        if (response.ok) {
            alert('Categoría eliminada con éxito.');
            cargarCategorias();
            cargarTablaCategorias();
            cargarProductos();
        } else {
            alert('No se pudo eliminar la categoría. Asegúrate de que no haya productos vinculados a ella.');
        }
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
    }
}

// --- CARGAR PRODUCTOS (TABLA Y CATÁLOGO) ---
async function cargarProductos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al obtener los productos');

        productosGlobales = await response.json();

        renderizarTablaGestion(productosGlobales);
        renderizarGridCatalogo(productosGlobales);
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

function renderizarTablaGestion(productos) {
    const tbody = document.getElementById('tabla-productos-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    productos.forEach(prod => {
        const imagenDefault = 'https://via.placeholder.com/300x180?text=Sin+Imagen';
        const nombreCategoria = prod.categoria ? prod.categoria.nombre : 'Sin categoría';

        tbody.innerHTML += `
            <tr>
                <td class="ps-3">${prod.idProducto}</td>
                <td><img src="${prod.imagenUrl || imagenDefault}" width="50" height="50" style="object-fit:cover;" class="rounded"></td>
                <td>${prod.nombre}</td>
                <td><span class="badge bg-secondary">${nombreCategoria}</span></td>
                <td>${formatearMoneda(prod.precio)}</td>
                <td>${prod.stock}</td>
                <td class="text-end pe-3">
                    <button class="btn btn-sm btn-warning me-1" onclick="cargarDatosEnModal(${prod.idProducto})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${prod.idProducto})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function renderizarGridCatalogo(productos) {
    const gridCatalogo = document.getElementById('grid-catalogo');
    if (!gridCatalogo) return;
    gridCatalogo.innerHTML = '';

    if (productos.length === 0) {
        gridCatalogo.innerHTML = `<div class="col-12 text-center py-5 text-muted">No hay productos disponibles en esta categoría.</div>`;
        return;
    }

    productos.forEach(prod => {
        const imagenDefault = 'https://via.placeholder.com/300x180?text=Sin+Imagen';
        const nombreCategoria = prod.categoria ? prod.categoria.nombre : '';

        gridCatalogo.innerHTML += `
            <div class="col">
                <div class="card h-100 shadow-sm border-0">
                    <img src="${prod.imagenUrl || imagenDefault}" class="card-img-top card-img-top-catalog w-100 h-100 object-fit-contain p-3" alt="${prod.nombre}" style="height: 180px;">
                    <div class="card-body d-flex flex-column">
                        <div class="mb-2"><span class="badge bg-primary-subtle text-primary">${nombreCategoria}</span></div>
                        <h5 class="card-title fw-bold">${prod.nombre}</h5>
                        <p class="card-text text-muted small flex-grow-1">${prod.descripcion || 'Sin descripción disponible.'}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <span class="fs-5 fw-bold text-primary">${formatearMoneda(prod.precio)}</span>
                            <span class="badge ${prod.stock > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}">
                                ${prod.stock > 0 ? `Stock: ${prod.stock}` : 'Sin Stock'}
                            </span>
                        </div>
                        <button class="btn btn-outline-primary w-100 mt-3" 
                                onclick="agregarAlCarrito(${prod.idProducto}, '${prod.nombre}', ${prod.precio})"
                                ${prod.stock === 0 ? 'disabled' : ''}>
                            <i class="bi bi-cart-plus me-1"></i> ${prod.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// --- GUARDAR PRODUCTO ---
async function guardarProducto(event) {
    event.preventDefault();

    const id = document.getElementById('modal-prod-id').value;
    const categoriaId = document.getElementById('modal-prod-categoria').value;

    const productoData = {
        nombre: document.getElementById('modal-prod-nombre').value.trim(),
        descripcion: document.getElementById('modal-prod-descripcion').value.trim(),
        precio: parseFloat(document.getElementById('modal-prod-precio').value),
        stock: parseInt(document.getElementById('modal-prod-stock').value),
        imagenUrl: document.getElementById('modal-prod-imagen').value.trim(),
        categoria: categoriaId ? { idCategoria: parseInt(categoriaId) } : null
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productoData)
        });

        if (response.ok) {
            const modal = document.getElementById('modalProducto');
            const modalInstancia = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
            modalInstancia.hide();

            cargarProductos();
            alert(id ? '¡Producto actualizado con éxito!' : '¡Producto creado con éxito!');
        } else {
            alert('Error al guardar el producto.');
        }
    } catch (error) {
        console.error('Error de red:', error);
    }
}

// --- ELIMINAR PRODUCTO ---
async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

        if (response.ok) {
            cargarProductos();
        } else {
            alert('No se pudo eliminar el producto.');
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
    }
}

// --- CARGAR DATOS EN MODAL PARA EDITAR ---
async function cargarDatosEnModal(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('No se pudo obtener el producto.');

        const producto = await response.json();

        document.getElementById('modal-prod-id').value = producto.idProducto;
        document.getElementById('modal-prod-nombre').value = producto.nombre;
        document.getElementById('modal-prod-precio').value = producto.precio;
        document.getElementById('modal-prod-stock').value = producto.stock;
        document.getElementById('modal-prod-descripcion').value = producto.descripcion || '';
        document.getElementById('modal-prod-imagen').value = producto.imagenUrl || '';

        if (producto.categoria) {
            document.getElementById('modal-prod-categoria').value = producto.categoria.idCategoria;
        } else {
            document.getElementById('modal-prod-categoria').value = '';
        }

        document.getElementById('modalProductoLabel').innerText = 'Editar Producto';

        const modal = document.getElementById('modalProducto');
        const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
        modalInstance.show();
    } catch (error) {
        console.error('Error al cargar el producto para editar:', error);
        alert('No se pudieron cargar los datos del producto.');
    }
}

// --- ABRIR MODAL PARA CREAR NUEVO PRODUCTO ---
function abrirModalCrearProducto() {
    document.getElementById('modal-prod-id').value = '';
    document.getElementById('form-producto').reset();
    document.getElementById('modalProductoLabel').innerText = 'Nuevo Producto';

    const modalEl = document.getElementById('modalProducto');
    const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modalInstance.show();
}

// --- HISTORIAL DE COMPRAS ---
async function cargarHistorialCompras() {
    try {
        const response = await fetch(API_VENTAS);
        if (!response.ok) throw new Error('Error al obtener el historial');
        
        const ventas = await response.json();
        const tbody = document.getElementById('tabla-historial-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (ventas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No hay compras registradas todavía.</td></tr>`;
            return;
        }

        ventas.forEach(venta => {
            
            const idVentaMostrar = venta.idVentas !== undefined ? venta.idVentas : 
                                   (venta.idVenta !== undefined ? venta.idVenta : 
                                   (venta.id !== undefined ? venta.id : 'S/N'));

            let fechaFormateada = 'Fecha no disponible';
            if (venta.fecha) {
                if (Array.isArray(venta.fecha)) {
                    const [y, m, d, h = 0, min = 0] = venta.fecha;
                    const fechaObj = new Date(y, m - 1, d, h, min);
                    fechaFormateada = fechaObj.toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
                } else {
                    const fechaObj = new Date(venta.fecha);
                    if (!isNaN(fechaObj)) {
                        fechaFormateada = fechaObj.toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
                    } else {
                        fechaFormateada = venta.fecha; // Muestra el texto plano si no se pudo convertir
                    }
                }
            }

            let listaDetalles = '<div class="d-flex flex-column gap-1">';
            if (venta.detalles) {
                venta.detalles.forEach(d => {
                    const subtotalItem = d.cantidad * d.precioUnitario;
                    listaDetalles += `
                        <div class="d-flex justify-content-between align-items-center text-secondary small border-bottom pb-1 mb-1">
                            <span><span class="badge bg-light text-dark border me-2">${d.cantidad}x</span> ${d.nombreProducto}</span>
                            <span class="fw-semibold text-dark">${formatearMoneda(subtotalItem)}</span>
                        </div>`;
                });
            }
            listaDetalles += '</div>';

            tbody.innerHTML += `
                <tr>
                    <td class="ps-3 fw-bold text-primary">#${idVentaMostrar}</td>
                    <td class="text-muted small"><i class="bi bi-calendar-event me-1"></i> ${fechaFormateada}</td>
                    <td>${listaDetalles}</td>
                    <td class="fw-bold text-success fs-6 text-end pe-3">${formatearMoneda(venta.total)}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error al cargar historial:', error);
    }
}
// --- LÓGICA DEL CARRITO (CORREGIDO ID -> IDPRODUCTO) ---
function agregarAlCarrito(idProducto, nombre, precio) {
    const itemExistente = carrito.find(item => item.idProducto === idProducto);

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({ idProducto, nombre, precio, cantidad: 1 });
    }

    actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
    const badgeBtnAside = document.getElementById('badge-carrito-aside');
    const totalItems = carrito.reduce((acumulador, item) => acumulador + item.cantidad, 0);

    if (totalItems > 0) {
        if (badgeBtnAside) {
            badgeBtnAside.innerText = totalItems;
            badgeBtnAside.classList.remove('d-none');
        }
    } else {
        if (badgeBtnAside) {
            badgeBtnAside.classList.add('d-none');
        }
    }
}

function abrirModalCarrito() {
    renderizarTablaCarrito();
    const modalEl = document.getElementById('modalCarrito');
    const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modalInstance.show();
}

function renderizarTablaCarrito() {
    const tbody = document.getElementById('tabla-carrito-body');
    const totalEl = document.getElementById('carrito-total');
    if (!tbody || !totalEl) return;
    tbody.innerHTML = '';

    if (carrito.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">Tu carrito está vacío. ¡Agrega algunos productos!</td>
            </tr>
        `;
        totalEl.innerText = '$0.00';
        return;
    }

    let granTotal = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        granTotal += subtotal;

        tbody.innerHTML += `
            <tr>
                <td class="fw-semibold">${item.nombre}</td>
                <td>${formatearMoneda(item.precio)}</td>
                <td>
                    <div class="input-group input-group-sm" style="width: 110px;">
                        <button class="btn btn-outline-secondary" onclick="cambiarCantidad(${item.idProducto}, -1)">-</button>
                        <input type="text" class="form-control text-center" value="${item.cantidad}" readonly>
                        <button class="btn btn-outline-secondary" onclick="cambiarCantidad(${item.idProducto}, 1)">+</button>
                    </div>
                </td>
                <td class="fw-bold text-success">${formatearMoneda(subtotal)}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarDelCarrito(${item.idProducto})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    totalEl.innerText = formatearMoneda(granTotal);
}

function cambiarCantidad(idProducto, delta) {
    const item = carrito.find(prod => prod.idProducto === idProducto);
    if (!item) return;

    item.cantidad += delta;

    if (item.cantidad <= 0) {
        eliminarDelCarrito(idProducto);
    } else {
        actualizarContadorCarrito();
        renderizarTablaCarrito();
    }
}

function eliminarDelCarrito(idProducto) {
    carrito = carrito.filter(prod => prod.idProducto !== idProducto);
    actualizarContadorCarrito();
    renderizarTablaCarrito();
}

async function finalizarCompra() {
    if (carrito.length === 0) {
        alert('El carrito está vacío.');
        return;
    }

    // Aquí enviamos directamente el array con { idProducto, cantidad }
    const itemsCompra = carrito.map(item => ({
        idProducto: item.idProducto,
        cantidad: item.cantidad
    }));

    try {
        const response = await fetch(`${API_URL}/comprar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemsCompra)
        });

        if (response.ok) {
            alert('¡Compra realizada con éxito! Stock actualizado en el sistema.');
            carrito = [];
            actualizarContadorCarrito();

            const modalEl = document.getElementById('modalCarrito');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            cargarProductos();
        } else {
            const errorMensaje = await response.text();
            alert('Error al procesar la compra: ' + errorMensaje);
        }
    } catch (error) {
        console.error('Error de red al procesar la compra:', error);
        alert('No se pudo conectar con el servidor.');
    }
}

function formatearMoneda(valor) {
    const numero = Number(valor) || 0;
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numero);
}

