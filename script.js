
// script.js corregido - solo frontend

let precioBase = 0;
let carrito = [];

function mostrarDetalles(nombreProducto, precio) {
  const modal = document.getElementById('modal');
  const titulo = document.getElementById('tituloProducto');
  const form = document.getElementById('formOpciones');

  modal.style.display = 'flex';
  titulo.innerText = nombreProducto;
  precioBase = precio;

  form.innerHTML = `
    <label><input type="checkbox" value="50"> Laterales (+50€)</label><br>
    <label><input type="checkbox" value="40"> Puerta trasera (+40€)</label><br>
    <label><input type="checkbox" value="70"> Piso (+70€)</label><br>
    <label><input type="checkbox" value="30"> Protector de cubreruedas (+30€)</label><br>
    <label><input type="checkbox" value="10"> Tornillería (+10€)</label><br><br>
    <p><strong>Precio total: <span id="precioTotal">${precio}</span> €</strong></p>
    <button type="button" onclick="añadirAlCarrito()">Añadir al carrito</button>
  `;

  const checkboxes = form.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(opcion => {
    opcion.addEventListener('change', actualizarPrecio);
  });

  actualizarPrecio();
}

function actualizarPrecio() {
  let total = precioBase;
  const opciones = document.querySelectorAll('#formOpciones input[type="checkbox"]');
  opciones.forEach(op => {
    if (op.checked) total += parseInt(op.value);
  });
  document.getElementById('precioTotal').innerText = total;
}

function cerrarModal() {
  document.getElementById('modal').style.display = 'none';
}

function añadirAlCarrito() {
  const nombreProducto = document.getElementById('tituloProducto').innerText;
  const precioFinal = parseInt(document.getElementById('precioTotal').innerText);

  const seleccionadas = [];
  const opciones = document.querySelectorAll('#formOpciones input[type="checkbox"]');
  opciones.forEach(op => {
    if (op.checked) seleccionadas.push(op.parentNode.innerText);
  });

  carrito.push({
    nombre: nombreProducto,
    opciones: seleccionadas,
    precio: precioFinal
  });

  const user = firebase.auth().currentUser;
  if (user) {
    db.collection("carritos").doc(user.uid).set({ carrito })
      .then(() => console.log("Carrito guardado en la nube ✅"))
      .catch(error => console.error("Error al guardar el carrito:", error));
  }

  cerrarModal();
  alert("Producto añadido al carrito.");
}

function mostrarCarrito() {
  document.getElementById('carrito').style.display = 'flex';
  actualizarCarrito();
}

function cerrarCarrito() {
  document.getElementById('carrito').style.display = 'none';
}

function actualizarCarrito() {
  const lista = document.getElementById('listaCarrito');
  lista.innerHTML = '';
  let total = 0;

  carrito.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.nombre}</strong><br>${item.opciones.join(', ')}<br>${item.precio} € <button onclick="eliminarDelCarrito(${index})">Eliminar</button>`;
    lista.appendChild(li);
    total += item.precio;
  });

  document.getElementById('totalCarrito').innerText = total;
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  actualizarCarrito();
}

function abrirAreaCliente() {
  document.getElementById('modalCliente').style.display = 'flex';
}

function cerrarAreaCliente() {
  document.getElementById('modalCliente').style.display = 'none';
}

function mostrarFormulario(tipo) {
  const formReg = document.getElementById('formRegistro');
  const formLog = document.getElementById('formLogin');
  formReg.style.display = tipo === 'registro' ? 'block' : 'none';
  formLog.style.display = tipo === 'registro' ? 'none' : 'block';
}

function validarRegistro() {
  const nombre = document.getElementById('nombreRegistro').value.trim();
  const email = document.getElementById('emailRegistro').value.trim();
  const password = document.getElementById('passwordRegistro').value.trim();

  if (!nombre || !email || !password) return alert("Rellena todos los campos.");

  const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!patronEmail.test(email)) return alert("Correo inválido.");
  if (password.length < 7) return alert("Contraseña muy corta.");

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("¡Registro exitoso!");
      cerrarAreaCliente();
    })
    .catch(error => alert("Error al registrar: " + error.message));
}

function validarLogin() {
  const email = document.getElementById('emailLogin').value.trim();
  const password = document.getElementById('passwordLogin').value.trim();

  if (!email || !password) return alert("Rellena ambos campos.");

  auth.signInWithEmailAndPassword(email, password)
    .then((cred) => {
      alert("Bienvenido de nuevo, " + cred.user.email);
      cerrarAreaCliente();
      auth.signInWithEmailAndPassword(email, password)
  .then((cred) => {
    const user = cred.user;
    alert("¡Bienvenido de nuevo, " + user.email + " 👋");
    cerrarAreaCliente();
    mostrarUsuarioLogueado(user.email); // 👈 esta línea es clave
  })
  .catch((error) => {
    alert("Error al iniciar sesión: " + error.message);
  });
    })
    .catch(error => alert("Error al iniciar sesión: " + error.message));
}

document.addEventListener("DOMContentLoaded", function () {
  const stripe = Stripe('pk_test_51RJp4zRrXcu8ntoPCkZ9LMiFxF8JVTHyR563ihk5DrDmwPZ36aYAaPSDB905dMg55g9kPB0qBaDFUyp7KBpEGA3Z00sT4rgLOn');

  window.pagarConStripe = function () {
    fetch("https://us-central1-infurgo-web.cloudfunctions.net/crearCheckout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ carrito })
    })
    .then(res => res.json())
    .then(data => stripe.redirectToCheckout({ sessionId: data.id }))
    .catch(error => alert("Error al iniciar el pago: " + error.message));
  };
});


let precioBase = 0;
let carrito = [];

function mostrarDetalles(nombreProducto, precio) {
  const modal = document.getElementById('modal');
  const titulo = document.getElementById('tituloProducto');
  const form = document.getElementById('formOpciones');

  modal.style.display = 'flex';
  titulo.innerText = nombreProducto;
  precioBase = precio;

  form.innerHTML = `
    <label><input type="checkbox" value="50"> Laterales (+50€)</label><br>
    <label><input type="checkbox" value="40"> Puerta trasera (+40€)</label><br>
    <label><input type="checkbox" value="70"> Piso (+70€)</label><br>
    <label><input type="checkbox" value="30"> Protector de cubreruedas (+30€)</label><br>
    <label><input type="checkbox" value="10"> Tornillería (+10€)</label><br><br>
    <p><strong>Precio total: <span id="precioTotal">${precio}</span> €</strong></p>
    <button type="button" onclick="añadirAlCarrito()">Añadir al carrito</button>
  `;

  const checkboxes = form.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(opcion => {
    opcion.addEventListener('change', actualizarPrecio);
  });

  actualizarPrecio();
}

function actualizarPrecio() {
  let total = precioBase;
  const opciones = document.querySelectorAll('#formOpciones input[type="checkbox"]');
  opciones.forEach(op => {
    if (op.checked) total += parseInt(op.value);
  });
  document.getElementById('precioTotal').innerText = total;
}

function cerrarModal() {
  document.getElementById('modal').style.display = 'none';
}

function añadirAlCarrito() {
  const nombreProducto = document.getElementById('tituloProducto').innerText;
  const precioFinal = parseInt(document.getElementById('precioTotal').innerText);

  const seleccionadas = [];
  const opciones = document.querySelectorAll('#formOpciones input[type="checkbox"]');
  opciones.forEach(op => {
    if (op.checked) seleccionadas.push(op.parentNode.innerText);
  });

  carrito.push({
    nombre: nombreProducto,
    opciones: seleccionadas,
    precio: precioFinal
  });

  const user = firebase.auth().currentUser;
  if (user) {
    db.collection("carritos").doc(user.uid).set({ carrito })
      .then(() => console.log("Carrito guardado en la nube ✅"))
      .catch(error => console.error("Error al guardar el carrito:", error));
  }

  cerrarModal();
  alert("Producto añadido al carrito.");
}

function mostrarCarrito() {
  document.getElementById('carrito').style.display = 'flex';
  actualizarCarrito();
}

function cerrarCarrito() {
  document.getElementById('carrito').style.display = 'none';
}

function actualizarCarrito() {
  const lista = document.getElementById('listaCarrito');
  lista.innerHTML = '';
  let total = 0;

  carrito.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.nombre}</strong><br>${item.opciones.join(', ')}<br>${item.precio} € <button onclick="eliminarDelCarrito(${index})">Eliminar</button>`;
    lista.appendChild(li);
    total += item.precio;
  });

  document.getElementById('totalCarrito').innerText = total;
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  actualizarCarrito();
}

function abrirAreaCliente() {
  document.getElementById('modalCliente').style.display = 'flex';
}

function cerrarAreaCliente() {
  document.getElementById('modalCliente').style.display = 'none';
}

function mostrarFormulario(tipo) {
  const formReg = document.getElementById('formRegistro');
  const formLog = document.getElementById('formLogin');
  formReg.style.display = tipo === 'registro' ? 'block' : 'none';
  formLog.style.display = tipo === 'registro' ? 'none' : 'block';
}

function validarRegistro() {
  const nombre = document.getElementById('nombreRegistro').value.trim();
  const email = document.getElementById('emailRegistro').value.trim();
  const password = document.getElementById('passwordRegistro').value.trim();

  if (!nombre || !email || !password) return alert("Rellena todos los campos.");

  const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!patronEmail.test(email)) return alert("Correo inválido.");
  if (password.length < 7) return alert("Contraseña muy corta.");

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("¡Registro exitoso!");
      cerrarAreaCliente();
    })
    .catch(error => alert("Error al registrar: " + error.message));
}

function validarLogin() {
  const email = document.getElementById('emailLogin').value.trim();
  const password = document.getElementById('passwordLogin').value.trim();

  if (!email || !password) return alert("Rellena ambos campos.");

  auth.signInWithEmailAndPassword(email, password)
    .then((cred) => {
      alert("Bienvenido de nuevo, " + cred.user.email);
      cerrarAreaCliente();
    })
    .catch(error => alert("Error al iniciar sesión: " + error.message));
}

function mostrarUsuarioLogueado(nombre) {
  const menu = document.querySelector('.menu');

  // Evitar duplicados
  if (document.getElementById('usuario-logueado')) return;

  // Eliminar botón "Área Cliente"
  const areaCliente = document.querySelector('a[onclick="abrirAreaCliente()"]');
  if (areaCliente) areaCliente.remove();

  // Mostrar nombre
  const span = document.createElement('span');
  span.id = "usuario-logueado";
  span.style.marginLeft = '20px';
  span.style.fontWeight = 'bold';
  span.innerText = `👤 ${nombre}`;
  menu.appendChild(span);

  // Botón "Mis pedidos"
  const btnPedidos = document.createElement('a');
  btnPedidos.href = "javascript:void(0)";
  btnPedidos.innerText = "Mis pedidos";
  btnPedidos.style.marginLeft = "20px";
  btnPedidos.onclick = mostrarHistorialPedidos;
  menu.appendChild(btnPedidos);

  // Botón "Cerrar sesión"
  const btnCerrar = document.createElement('a');
  btnCerrar.href = "javascript:void(0)";
  btnCerrar.innerText = "Cerrar sesión";
  btnCerrar.style.marginLeft = "20px";
  btnCerrar.onclick = cerrarSesion;
  menu.appendChild(btnCerrar);
}

document.addEventListener("DOMContentLoaded", function () {
  const stripe = Stripe('pk_test_51RJp4zRrXcu8ntoPCkZ9LMiFxF8JVTHyR563ihk5DrDmwPZ36aYAaPSDB905dMg55g9kPB0qBaDFUyp7KBpEGA3Z00sT4rgLOn');

  window.pagarConStripe = function () {
    fetch("https://us-central1-infurgo-web.cloudfunctions.net/crearCheckout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ carrito })
    })
    .then(res => res.json())
    .then(data => stripe.redirectToCheckout({ sessionId: data.id }))
    .catch(error => alert("Error al iniciar el pago: " + error.message));
  };
});
