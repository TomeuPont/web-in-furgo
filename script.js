
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
