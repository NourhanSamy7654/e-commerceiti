import { getCurrentUser } from "./js/shared/storage.js";
import { addItemToCart, getCartItemsCount } from "./js/shared/cart.js";

const brandsContainer = document.querySelector(".brands");
const userAccount = document.getElementById("userAccount");
const userNameDisplay = document.getElementById("userNameDisplay");
const cartCountDisplay = document.getElementById("cartCount");
const mainHeader = document.querySelector(".main-header");
const navMenu = document.querySelector(".nav-menu");
const menuToggleButton = document.querySelector(".menu-toggle");
const headerSearchBox = document.getElementById("headerSearchBox");
const searchInput = document.getElementById("headerSearchInput");

const ensureAvatarImage = () => {
  if (!userAccount || !userNameDisplay) {
    return null;
  }

  let avatarImage = userAccount.querySelector(".user-avatar");

  if (!avatarImage) {
    avatarImage = document.createElement("img");
    avatarImage.className = "user-avatar";
    avatarImage.alt = "";
    avatarImage.setAttribute("aria-hidden", "true");
    avatarImage.hidden = true;
    userAccount.insertBefore(avatarImage, userNameDisplay);
  }

  return avatarImage;
};

const updateHeaderUserState = () => {
  if (!userAccount || !userNameDisplay) {
    return;
  }

  const userIcon = userAccount.querySelector(".fa-user");
  const avatarImage = ensureAvatarImage();
  const currentUser = getCurrentUser();

  if (!currentUser) {
    userNameDisplay.hidden = true;
    userNameDisplay.textContent = "";
    userAccount.setAttribute("aria-label", "Sign in");
    userAccount.setAttribute("href", "signin.html");

    if (userIcon) {
      userIcon.hidden = false;
    }

    if (avatarImage) {
      avatarImage.hidden = true;
      avatarImage.removeAttribute("src");
    }

    return;
  }

  const displayName = currentUser.username || currentUser.email.split("@")[0];

  userNameDisplay.textContent = displayName;
  userNameDisplay.hidden = false;
  userAccount.setAttribute("aria-label", `Open account for ${displayName}`);
  userAccount.setAttribute("href", "account.html");

  if (currentUser.profileImage && avatarImage) {
    avatarImage.src = currentUser.profileImage;
    avatarImage.hidden = false;

    if (userIcon) {
      userIcon.hidden = true;
    }

    return;
  }

  if (avatarImage) {
    avatarImage.hidden = true;
    avatarImage.removeAttribute("src");
  }

  if (userIcon) {
    userIcon.hidden = false;
  }
};

const slugify = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parsePrice = (rawText = "") => {
  const match = rawText.replace(/,/g, "").match(/\$\s*(\d+(?:\.\d+)?)/);
  return match ? Number.parseFloat(match[1]) : 0;
};

const updateCartCountUI = () => {
  if (!cartCountDisplay) {
    return;
  }

  const itemsCount = getCartItemsCount();
  cartCountDisplay.textContent = String(itemsCount);
  cartCountDisplay.hidden = itemsCount === 0;
};

const ensureSearchEmptyState = () => {
  let emptyState = document.getElementById("searchEmptyState");

  if (emptyState) {
    return emptyState;
  }

  const firstProductGrid = document.querySelector(".product-grid");

  if (!firstProductGrid || !firstProductGrid.parentElement) {
    return null;
  }

  emptyState = document.createElement("p");
  emptyState.id = "searchEmptyState";
  emptyState.className = "search-empty-state";
  emptyState.textContent = "No products match your search.";
  firstProductGrid.parentElement.insertBefore(emptyState, firstProductGrid);

  return emptyState;
};

const filterProductsBySearch = (rawQuery = "") => {
  const productCards = Array.from(document.querySelectorAll(".product-card"));

  if (!productCards.length) {
    return;
  }

  const query = rawQuery.trim().toLowerCase();

  const matchedCards = productCards.filter((card) => {
    const productTitle =
      card.querySelector(".product-title")?.textContent?.trim().toLowerCase() || "";

    return !query || productTitle.includes(query);
  });

  productCards.forEach((card) => {
    card.hidden = true;
  });

  matchedCards.forEach((card) => {
    card.hidden = false;
  });

  const emptyState = ensureSearchEmptyState();

  if (!emptyState) {
    return;
  }

  const shouldShowEmptyState = Boolean(query) && matchedCards.length === 0;
  emptyState.classList.toggle("show", shouldShowEmptyState);
};

const extractProductData = (card, index) => {
  const titleElement = card.querySelector(".product-title");
  const priceElement = card.querySelector(".product-price");
  const imageElement = card.querySelector(".product-image img");

  const title = titleElement ? titleElement.textContent.trim() : `Product ${index + 1}`;
  const rawPrice = priceElement ? priceElement.textContent : "";
  const price = parsePrice(rawPrice);
  const image = imageElement ? imageElement.getAttribute("src") || "" : "";

  const imageSlug = slugify((image.split("/").pop() || "product").replace(/\.[^.]+$/, ""));
  const id = `${slugify(title)}-${Math.round(price * 100)}-${imageSlug || "item"}`;

  return {
    id,
    title,
    image,
    price,
    quantity: 1,
  };
};

const bindAddToCartButton = (addButton, card, index) => {
  if (!addButton || addButton.dataset.cartBound === "true") {
    return;
  }

  addButton.dataset.cartBound = "true";
  addButton.type = "button";

  addButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const product = extractProductData(card, index);
    addItemToCart(product);
    updateCartCountUI();

    addButton.textContent = "Added";
    addButton.disabled = true;

    window.setTimeout(() => {
      addButton.textContent = "Add to Cart";
      addButton.disabled = false;
    }, 700);
  });
};

const setupAddToCartButtons = () => {
  const productCards = document.querySelectorAll(".product-card");

  if (!productCards.length) {
    return;
  }

  productCards.forEach((card, index) => {
    const productInfo = card.querySelector(".product-info");

    if (!productInfo) {
      return;
    }

    let addButton = productInfo.querySelector(".add-to-cart-btn");

    if (!addButton) {
      addButton = document.createElement("button");
      addButton.className = "add-to-cart-btn";
      addButton.textContent = "Add to Cart";
      productInfo.appendChild(addButton);
    }

    bindAddToCartButton(addButton, card, index);
  });
};

const setupMobileMenuToggle = () => {
  if (!mainHeader || !navMenu || !menuToggleButton) {
    return;
  }

  const closeMenu = () => {
    mainHeader.classList.remove("is-menu-open");
    menuToggleButton.setAttribute("aria-expanded", "false");
  };

  const toggleMenu = () => {
    const isOpen = mainHeader.classList.toggle("is-menu-open");
    menuToggleButton.setAttribute("aria-expanded", String(isOpen));
  };

  menuToggleButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleMenu();
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target.closest("select")) {
      return;
    }

    const link = event.target.closest("a");

    if (link) {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!mainHeader.classList.contains("is-menu-open")) {
      return;
    }

    if (!mainHeader.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 991) {
      closeMenu();
    }
  });
};

const setupHeaderSearch = () => {
  if (!searchInput) {
    return;
  }

  headerSearchBox?.addEventListener("click", () => {
    searchInput.focus();
  });

  searchInput.addEventListener("input", () => {
    filterProductsBySearch(searchInput.value);
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    searchInput.value = "";
    filterProductsBySearch("");
    searchInput.blur();
  });
};

const setupReviewsCarousel = () => {
  const reviewsSlider = document.querySelector(".reviews-slider");
  const reviewsTrack = reviewsSlider?.querySelector(".reviews-grid");
  const previousButton = document.querySelector(".reviews-prev");
  const nextButton = document.querySelector(".reviews-next");

  if (!reviewsSlider || !reviewsTrack || !previousButton || !nextButton) {
    return;
  }

  const originalSlides = Array.from(reviewsTrack.querySelectorAll(".review-card"));

  if (originalSlides.length < 2) {
    return;
  }

  originalSlides.forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    reviewsTrack.appendChild(clone);
  });

  const loopStartIndex = originalSlides.length;
  let currentIndex = 0;
  let autoplayTimer = null;
  let isSliding = false;

  const getGap = () => {
    const computedStyles = window.getComputedStyle(reviewsTrack);
    const gapValue = computedStyles.gap || computedStyles.columnGap || "0";
    return Number.parseFloat(gapValue) || 0;
  };

  const getStepSize = () => {
    const firstSlide = reviewsTrack.querySelector(".review-card");

    if (!firstSlide) {
      return 0;
    }

    return firstSlide.getBoundingClientRect().width + getGap();
  };

  const updateTrackPosition = (withTransition = true) => {
    reviewsTrack.style.transition = withTransition ? "transform 0.45s ease" : "none";
    reviewsTrack.style.transform = `translateX(-${currentIndex * getStepSize()}px)`;
  };

  const queueSlide = (targetIndex) => {
    if (isSliding) {
      return;
    }

    const step = getStepSize();

    if (!step) {
      return;
    }

    isSliding = true;
    currentIndex = targetIndex;
    updateTrackPosition(true);
  };

  const goToNext = () => {
    if (currentIndex >= loopStartIndex) {
      currentIndex -= loopStartIndex;
      updateTrackPosition(false);
    }

    window.requestAnimationFrame(() => {
      queueSlide(currentIndex + 1);
    });
  };

  const goToPrevious = () => {
    if (currentIndex <= 0) {
      currentIndex += loopStartIndex;
      updateTrackPosition(false);
    }

    window.requestAnimationFrame(() => {
      queueSlide(currentIndex - 1);
    });
  };

  const stopAutoplay = () => {
    if (!autoplayTimer) {
      return;
    }

    window.clearInterval(autoplayTimer);
    autoplayTimer = null;
  };

  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer = window.setInterval(goToNext, 3000);
  };

  const restartAutoplay = () => {
    startAutoplay();
  };

  previousButton.addEventListener("click", () => {
    goToPrevious();
    restartAutoplay();
  });

  nextButton.addEventListener("click", () => {
    goToNext();
    restartAutoplay();
  });

  reviewsTrack.addEventListener("transitionend", () => {
    isSliding = false;
  });

  window.addEventListener("resize", () => {
    updateTrackPosition(false);
    isSliding = false;
  });

  reviewsSlider.addEventListener("mouseenter", stopAutoplay);
  reviewsSlider.addEventListener("mouseleave", startAutoplay);
  reviewsSlider.addEventListener("focusin", stopAutoplay);
  reviewsSlider.addEventListener("focusout", startAutoplay);

  updateTrackPosition(false);
  startAutoplay();
};

if (brandsContainer) {
  brandsContainer.insertAdjacentHTML("beforeend", brandsContainer.innerHTML);
}

updateHeaderUserState();
setupAddToCartButtons();
updateCartCountUI();
setupMobileMenuToggle();
setupHeaderSearch();
setupReviewsCarousel();
