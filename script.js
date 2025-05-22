// Array para armazenar produtos disponíveis
const products = [
  {
    id: 1,
    name: "Nike court vision",
    price: 399.99,
    image: "img/NikeCourtVisionLow.webp",
  },
  {
    id: 2,
    name: "Nike Initiator",
    price: 439.99,
    image: "img/NikeIniator.avif",
  },
  {
    id: 3,
    name: "Adidas Grand Court",
    price: 203.00,
    image: "img/AdidasGrandCourt.avif",
  },
  {
    id: 4,
    name: "Asics Gel Cumulus",
    price: 345.99,
    image: "img/AsicsGelCumulus.png",
  },
];

// Array para armazenar itens no carrinho
let cartItems = [];
let uploadedImages = {};

// Função para formatar preço em formato brasileiro
function formatPrice(price) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Função para aumentar a quantidade
function increaseQuantity(productId) {
  const quantityInput = document.getElementById(`quantity-${productId}`);
  let currentValue = parseInt(quantityInput.value);
  if (currentValue < 10) {
    quantityInput.value = currentValue + 1;
  }
}

// Função para diminuir a quantidade
function decreaseQuantity(productId) {
  const quantityInput = document.getElementById(`quantity-${productId}`);
  let currentValue = parseInt(quantityInput.value);
  if (currentValue > 1) {
    quantityInput.value = currentValue - 1;
  }
}

// Função para manipular o upload de imagem
function handleImageUpload(event, productId) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imgElement = document.getElementById(`product-img-${productId}`);
      imgElement.src = e.target.result;
      uploadedImages[productId] = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Função para adicionar produto ao carrinho
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  const quantity = parseInt(
    document.getElementById(`quantity-${productId}`).value
  );

  // Verificar se o produto já está no carrinho
  const existingItemIndex = cartItems.findIndex(
    (item) => item.id === productId
  );

  if (existingItemIndex !== -1) {
    // Atualizar quantidade se o produto já estiver no carrinho
    cartItems[existingItemIndex].quantity += quantity;
  } else {
    // Adicionar novo item ao carrinho
    cartItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: uploadedImages[productId] || product.image,
    });
  }

  // Atualizar a visualização do carrinho
  updateCartView();

  // Mostrar mensagem de sucesso
  alert(`${quantity} unidade(s) de ${product.name} adicionado(s) ao carrinho!`);
}

// Função para remover item do carrinho
function removeFromCart(productId) {
  cartItems = cartItems.filter((item) => item.id !== productId);
  updateCartView();
}

// Função para atualizar a visualização do carrinho
function updateCartView() {
  const cartTable = document.getElementById("cart-table");
  const cartItemsContainer = document.getElementById("cart-items"); // Renomeado para não sobrescrever o array
  const emptyCartMessage = document.getElementById("empty-cart-message");
  const cartTotals = document.getElementById("cart-totals");
  const previewOrderBtn = document.getElementById("preview-order-btn");
  const generatePdfBtn = document.getElementById("generate-pdf-btn");

  // Limpar itens atuais
  cartItemsContainer.innerHTML = "";

  if (cartItems.length === 0) {
    // Carrinho vazio
    cartTable.style.display = "none";
    cartTotals.style.display = "none";
    emptyCartMessage.style.display = "block";
    previewOrderBtn.disabled = true;
    generatePdfBtn.disabled = true;
    return;
  }

  // Carrinho com itens
  emptyCartMessage.style.display = "none";
  cartTable.style.display = "table";
  cartTotals.style.display = "block";
  previewOrderBtn.disabled = false;
  generatePdfBtn.disabled = false;

  // Calcular totais
  let subtotal = 0;
  let shipping = cartItems.length > 0 ? 25 : 0;

  // Adicionar cada item ao carrinho
  cartItems.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    const row = document.createElement("tr");
    row.innerHTML = `
            <td>
                <div class="cart-product-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
            </td>
            <td>${item.name}</td>
            <td>${formatPrice(item.price)}</td>
            <td>${item.quantity}</td>
            <td>${formatPrice(itemTotal)}</td>
            <td>
                <button class="remove-btn" onclick="removeFromCart(${
                  item.id
                })">Remover</button>
            </td>
        `;
    cartItemsContainer.appendChild(row);
  });

  // Atualizar totais
  const total = subtotal + shipping;
  document.getElementById("cart-subtotal").textContent = formatPrice(subtotal);
  document.getElementById("cart-shipping").textContent = formatPrice(shipping);
  document.getElementById("cart-total").textContent = formatPrice(total);
}

// Função para preencher os dados do documento de pedido
function fillOrderDocument() {
  // Gerar número de pedido aleatório
  const orderNumber = `PED-${new Date().getFullYear()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;
  document.getElementById("order-number").textContent = orderNumber;

  // Definir data de emissão (hoje)
  const today = new Date();
  const formattedDate = today.toLocaleDateString("pt-BR");
  document.getElementById("document-date").textContent = formattedDate;

  // Definir data de entrega (hoje + 7 dias)
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + 7);
  document.getElementById("delivery-date").textContent =
    deliveryDate.toLocaleDateString("pt-BR");

  // Preencher itens do pedido
  const documentItems = document.getElementById("document-items");
  documentItems.innerHTML = "";

  let subtotal = 0;
  let shipping = cartItems.length > 0 ? 25 : 0;

  cartItems.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${formatPrice(item.price)}</td>
            <td>${item.quantity}</td>
            <td>${formatPrice(itemTotal)}</td>
        `;
    documentItems.appendChild(row);
  });

  // Atualizar totais do documento
  const total = subtotal + shipping;
  document.getElementById("document-subtotal").textContent =
    formatPrice(subtotal);
  document.getElementById("document-shipping").textContent =
    formatPrice(shipping);
  document.getElementById("document-total").textContent = formatPrice(total);
}

// Função para mostrar a visualização do pedido
function showOrderPreview() {
  document.getElementById("store-view").style.display = "none";
  document.getElementById("document-view").style.display = "block";
  document.getElementById("return-to-store-btn").style.display = "block";
  document.getElementById("download-pdf-btn").style.display = "block"; // Mostra o botão PDF na segunda tela

  // Preencher o documento com os dados do pedido
  fillOrderDocument();
}

// Função para voltar para a loja
function returnToStore() {
  document.getElementById("store-view").style.display = "block";
  document.getElementById("document-view").style.display = "none";
  document.getElementById("download-pdf-btn").style.display = "none"; // Esconde o botão PDF na loja
}

// Função para gerar o PDF do pedido
function generateOrderPDF() {
  // Primeiro mostrar a visualização do pedido
  showOrderPreview();

  // Depois gerar o PDF
  setTimeout(() => {
    const returnButton = document.getElementById("return-to-store-btn");
    const pdfButton = document.getElementById("download-pdf-btn");

    // Esconder botões temporariamente
    returnButton.style.display = "none";
    pdfButton.style.display = "none";

    // Elemento a ser convertido para PDF
    const element = document.getElementById("document-view");

    // Configurações do HTML2PDF
    const opt = {
      margin: [2, 2, 2, 2], // Margem reduzida para deixar o PDF mais compacto
      filename: "Pedido_KickStyle_Store.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // Gerar o PDF
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(function () {
        // Mostrar botões novamente
        returnButton.style.display = "block";
        pdfButton.style.display = "block";
      });
  }, 500);
}

// Adicionar event listeners para os botões
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("preview-order-btn")
    .addEventListener("click", showOrderPreview);
  document
    .getElementById("generate-pdf-btn")
    .addEventListener("click", generateOrderPDF);
  document
    .getElementById("return-to-store-btn")
    .addEventListener("click", returnToStore);
  document
    .getElementById("download-pdf-btn")
    .addEventListener("click", generateOrderPDF);

  // Inicializar o carrinho
  updateCartView();

  // Esconde o botão PDF na tela inicial
  document.getElementById("download-pdf-btn").style.display = "none";
});
