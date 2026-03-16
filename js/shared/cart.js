const CART_STORAGE_KEY = "cartItems";

const parseJSON = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeItem = (item = {}) => {
  const id = String(item.id || "").trim();

  if (!id) {
    return null;
  }

  const title = String(item.title || "Product").trim();
  const image = String(item.image || "").trim();
  const price = Number(item.price);
  const quantity = Number.parseInt(item.quantity, 10);

  const safePrice = Number.isFinite(price) && price >= 0 ? price : 0;
  const safeQuantity =
    Number.isInteger(quantity) && quantity > 0 ? quantity : 1;

  return {
    id,
    title: title || "Product",
    image,
    price: safePrice,
    quantity: safeQuantity,
  };
};

export const getCartItems = () => {
  const parsed = parseJSON(localStorage.getItem(CART_STORAGE_KEY), []);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.map(normalizeItem).filter(Boolean);
};

const saveCartItems = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

export const getCartItemsCount = () =>
  getCartItems().reduce((total, item) => total + item.quantity, 0);

export const addItemToCart = (item) => {
  const normalizedItem = normalizeItem(item);

  if (!normalizedItem) {
    return getCartItems();
  }

  const items = getCartItems();
  const existingItem = items.find((cartItem) => cartItem.id === normalizedItem.id);

  if (existingItem) {
    existingItem.quantity += normalizedItem.quantity;
  } else {
    items.push(normalizedItem);
  }

  saveCartItems(items);
  return items;
};

export const updateCartItemQuantity = (itemId, quantity) => {
  const items = getCartItems();
  const targetItem = items.find((item) => item.id === itemId);

  if (!targetItem) {
    return items;
  }

  const nextQuantity = Number.parseInt(quantity, 10);

  if (!Number.isInteger(nextQuantity) || nextQuantity <= 0) {
    const filteredItems = items.filter((item) => item.id !== itemId);
    saveCartItems(filteredItems);
    return filteredItems;
  }

  targetItem.quantity = nextQuantity;
  saveCartItems(items);
  return items;
};

export const removeCartItem = (itemId) => {
  const items = getCartItems();
  const filteredItems = items.filter((item) => item.id !== itemId);
  saveCartItems(filteredItems);
  return filteredItems;
};

export const clearCart = () => {
  saveCartItems([]);
};
