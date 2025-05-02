
// script.js corregido - solo frontend


let precioBase = 0;
let carrito = [];

// Funciones visibles desde HTML
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
      mostrarUsuarioLogueado(nombre);
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
      mostrarUsuarioLogueado(cred.user.email);
    })
    .catch(error => alert("Error al iniciar sesión: " + error.message));
}

function mostrarUsuarioLogueado(nombre) {
  const menu = document.querySelector('.menu');
  if (document.getElementById('usuario-logueado')) return;

  const areaCliente = document.querySelector('a[onclick="abrirAreaCliente()"]');
  if (areaCliente) areaCliente.remove();

  const span = document.createElement('span');
  span.id = "usuario-logueado";
  span.style.marginLeft = '20px';
  span.style.fontWeight = 'bold';
  span.innerText = `👤 ${nombre}`;
  menu.appendChild(span);

  const btnPedidos = document.createElement('a');
  btnPedidos.href = "javascript:void(0)";
  btnPedidos.innerText = "Mis pedidos";
  btnPedidos.style.marginLeft = "20px";
  btnPedidos.onclick = mostrarHistorialPedidos;
  menu.appendChild(btnPedidos);

  const btnCerrar = document.createElement('a');
  btnCerrar.href = "javascript:void(0)";
  btnCerrar.innerText = "Cerrar sesión";
  btnCerrar.style.marginLeft = "20px";
  btnCerrar.onclick = cerrarSesion;
  menu.appendChild(btnCerrar);
}

function cerrarSesion() {
  firebase.auth().signOut().then(() => {
    alert("Sesión cerrada.");
    location.reload();
  }).catch((error) => {
    alert("Error al cerrar sesión: " + error.message);
  });
}

function mostrarHistorialPedidos() {
  const user = firebase.auth().currentUser;
  if (!user) {
    alert("Debes iniciar sesión para ver tus pedidos.");
    return;
  }

  const contenedor = document.getElementById("listaPedidos");
  contenedor.innerHTML = "<p>Cargando pedidos...</p>";
  document.getElementById("modalHistorial").style.display = "flex";

  db.collection("pedidos").doc(user.uid).collection("historial")
    .orderBy("fecha", "desc")
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        contenedor.innerHTML = "<p>No tienes pedidos todavía.</p>";
        return;
      }

      contenedor.innerHTML = "";
      querySnapshot.forEach(doc => {
        const pedido = doc.data();
        const div = document.createElement("div");
        div.style.marginBottom = "20px";
        div.style.padding = "10px";
        div.style.border = "1px solid #ccc";
        div.style.borderRadius = "8px";
        div.style.backgroundColor = "#f9f9f9";

        const fecha = new Date(pedido.fecha).toLocaleString("es-ES");
        let html = `<strong>Fecha:</strong> ${fecha}<br><ul>`;
        pedido.items.forEach(item => {
          html += `<li><strong>${item.nombre}</strong><br>${item.opciones.join(", ")} - ${item.precio} €</li>`;
        });
        html += "</ul>";
        div.innerHTML = html;
        contenedor.appendChild(div);
      });
    })
    .catch((error) => {
      contenedor.innerHTML = "<p>Error al cargar los pedidos.</p>";
      console.error("Error:", error);
    });
}

function cerrarHistorialPedidos() {
  document.getElementById("modalHistorial").style.display = "none";
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
