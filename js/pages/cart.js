import {
  clearCart,
  getCartItems,
  getCartItemsCount,
  removeCartItem,
  updateCartItemQuantity,
} from "../shared/cart.js";

const cartItemsContainer = document.getElementById("cartItems");
const cartLayout = document.getElementById("cartLayout");
const emptyCartState = document.getElementById("emptyCartState");
const clearCartButton = document.getElementById("clearCartBtn");
const summaryItems = document.getElementById("summaryItems");
const summarySubtotal = document.getElementById("summarySubtotal");
const summaryTotal = document.getElementById("summaryTotal");
const cartCountDisplay = document.getElementById("cartCount");

const formatCurrency = (value) => `$${value.toFixed(2)}`;

const escapeHtml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const updateCartCountBadge = () => {
  if (!cartCountDisplay) {
    return;
  }

  const count = getCartItemsCount();
  cartCountDisplay.textContent = String(count);
  cartCountDisplay.hidden = count === 0;
};

const renderSummary = (items) => {
  const itemsCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  if (summaryItems) {
    summaryItems.textContent = String(itemsCount);
  }

  if (summarySubtotal) {
    summarySubtotal.textContent = formatCurrency(subtotal);
  }

  if (summaryTotal) {
    summaryTotal.textContent = formatCurrency(subtotal);
  }
};

const renderCartItems = () => {
  if (!cartItemsContainer || !cartLayout || !emptyCartState) {
    return;
  }

  const items = getCartItems();

  if (!items.length) {
    cartLayout.hidden = true;
    emptyCartState.hidden = false;
    cartItemsContainer.innerHTML = "";
    renderSummary([]);
    updateCartCountBadge();
    return;
  }

  cartLayout.hidden = false;
  emptyCartState.hidden = true;

  cartItemsContainer.innerHTML = items
    .map((item) => {
      const safeTitle = escapeHtml(item.title);
      const imageSrc = escapeHtml(item.image || "image/online-shop.png");
      const quantityText = `Qty: ${item.quantity}`;
      const unitPriceText = `Price: ${formatCurrency(item.price)}`;
      const rowTotal = formatCurrency(item.price * item.quantity);

      return `
        <li class="mb-3">
          <article class="card border-0 shadow-sm">
            <div class="row g-0 align-items-center">
              <div class="col-12 col-sm-3 col-md-3 col-lg-3">
                <div class="ratio ratio-1x1 bg-light rounded-start overflow-hidden">
                  <img class="w-100 h-100 object-fit-cover" src="${imageSrc}" alt="${safeTitle}" />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-6 col-lg-6">
                <div class="card-body py-3">
                  <h3 class="h6 fw-bold mb-1">${safeTitle}</h3>
                  <p class="text-secondary small mb-2">${unitPriceText}</p>
                  <div class="d-inline-flex align-items-center gap-2 bg-light border rounded-pill px-2 py-1">
                    <button
                      class="btn btn-outline-secondary btn-sm rounded-circle d-inline-flex align-items-center justify-content-center" data-role="qty-btn"
                      type="button"
                      data-action="decrement"
                      data-id="${escapeHtml(item.id)}"
                      data-qty="${item.quantity}"
                      aria-label="Decrease quantity"
                      style="width: 30px; height: 30px; line-height: 1;"
                    >
                      -
                    </button>
                    <span class="badge text-bg-white border">${quantityText}</span>
                    <button
                      class="btn btn-outline-secondary btn-sm rounded-circle d-inline-flex align-items-center justify-content-center" data-role="qty-btn"
                      type="button"
                      data-action="increment"
                      data-id="${escapeHtml(item.id)}"
                      data-qty="${item.quantity}"
                      aria-label="Increase quantity"
                      style="width: 30px; height: 30px; line-height: 1;"
                    >
                      +
                    </button>
                  </div>
                  <p class="fw-bold mb-0 mt-2">${rowTotal}</p>
                </div>
              </div>
              <div class="col-12 col-sm-3 col-md-3 col-lg-3 px-3 pb-3 pb-sm-0 text-sm-end">
                <button class="btn btn-outline-danger btn-sm rounded-pill px-3" data-role="remove-btn" type="button" data-id="${escapeHtml(item.id)}">
                  Remove
                </button>
              </div>
            </div>
          </article>
        </li>
      `;
    })
    .join("");

  renderSummary(items);
  updateCartCountBadge();
};

if (cartItemsContainer) {
  cartItemsContainer.addEventListener("click", (event) => {
    const quantityButton = event.target.closest("[data-role=\"qty-btn\"]");

    if (quantityButton) {
      const itemId = quantityButton.getAttribute("data-id") || "";
      const action = quantityButton.getAttribute("data-action");
      const currentQuantity = Number.parseInt(
        quantityButton.getAttribute("data-qty") || "1",
        10
      );

      if (!itemId || !Number.isInteger(currentQuantity)) {
        return;
      }

      const nextQuantity =
        action === "increment" ? currentQuantity + 1 : currentQuantity - 1;

      updateCartItemQuantity(itemId, nextQuantity);
      renderCartItems();
      return;
    }

    const button = event.target.closest("[data-role=\"remove-btn\"]");

    if (!button) {
      return;
    }

    const itemId = button.getAttribute("data-id") || "";

    if (!itemId) {
      return;
    }

    removeCartItem(itemId);
    renderCartItems();
  });
}

if (clearCartButton) {
  clearCartButton.addEventListener("click", () => {
    clearCart();
    renderCartItems();
  });
}

renderCartItems();

