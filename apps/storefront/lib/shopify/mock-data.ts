import type { Cart, CartItem, Collection, Menu, Page, Product, ProductVariant } from "./types";

const currencyCode = "USD";
const now = new Date().toISOString();
const portalUrl = process.env.RHS_PORTAL_URL || "http://localhost:3001";

const baseOption = {
  id: "opt-default",
  name: "Title",
  values: ["Default Title"],
};

const mockProducts: Product[] = [
  {
    id: "prod_pos_terminal_starter",
    handle: "pos-terminal-starter",
    availableForSale: true,
    title: "POS Terminal Starter Kit",
    description: "All-in-one POS terminal built for counter service and quick setup.",
    descriptionHtml:
      "<p>Reliable POS kit with receipt printer support and offline-ready sales.</p><ul><li>Touchscreen terminal</li><li>Cash drawer ready</li><li>Starter onboarding</li></ul>",
    options: [baseOption],
    priceRange: {
      minVariantPrice: { amount: "799", currencyCode },
      maxVariantPrice: { amount: "799", currencyCode },
    },
    variants: [
      {
        id: "var_pos_terminal_starter",
        title: "Default Title",
        availableForSale: true,
        selectedOptions: [{ name: "Title", value: "Default Title" }],
        price: { amount: "799", currencyCode },
      },
    ],
    featuredImage: {
      url: "https://placehold.co/1200x900/png?text=POS+Terminal",
      altText: "POS terminal",
      width: 1200,
      height: 900,
    },
    images: [
      {
        url: "https://placehold.co/1200x900/png?text=POS+Terminal",
        altText: "POS terminal",
        width: 1200,
        height: 900,
      },
      {
        url: "https://placehold.co/1200x900/png?text=POS+Terminal+Side",
        altText: "POS terminal side view",
        width: 1200,
        height: 900,
      },
    ],
    seo: {
      title: "POS Terminal Starter Kit",
      description: "Counter-ready POS terminal for restaurants and cafes.",
    },
    tags: ["collection:pos-systems"],
    updatedAt: now,
  },
  {
    id: "prod_handheld_pos",
    handle: "handheld-pos",
    availableForSale: true,
    title: "Handheld POS Device",
    description: "Pocket-friendly handheld for tableside ordering.",
    descriptionHtml:
      "<p>Reduce wait time with tableside ordering and payments.</p><ul><li>Long battery life</li><li>Wi-Fi and LTE</li><li>Durable casing</li></ul>",
    options: [baseOption],
    priceRange: {
      minVariantPrice: { amount: "499", currencyCode },
      maxVariantPrice: { amount: "499", currencyCode },
    },
    variants: [
      {
        id: "var_handheld_pos",
        title: "Default Title",
        availableForSale: true,
        selectedOptions: [{ name: "Title", value: "Default Title" }],
        price: { amount: "499", currencyCode },
      },
    ],
    featuredImage: {
      url: "https://placehold.co/1200x900/png?text=Handheld+POS",
      altText: "Handheld POS device",
      width: 1200,
      height: 900,
    },
    images: [
      {
        url: "https://placehold.co/1200x900/png?text=Handheld+POS",
        altText: "Handheld POS device",
        width: 1200,
        height: 900,
      },
    ],
    seo: {
      title: "Handheld POS Device",
      description: "Tableside ordering with a compact POS device.",
    },
    tags: ["collection:pos-systems"],
    updatedAt: now,
  },
  {
    id: "prod_kitchen_display",
    handle: "kitchen-display-screen",
    availableForSale: true,
    title: "Kitchen Display Screen",
    description: "Keep tickets flowing with a bright kitchen display.",
    descriptionHtml:
      "<p>Reduce ticket errors and speed up service.</p><ul><li>Heat-resistant</li><li>Large format</li><li>Mounting kit</li></ul>",
    options: [baseOption],
    priceRange: {
      minVariantPrice: { amount: "899", currencyCode },
      maxVariantPrice: { amount: "899", currencyCode },
    },
    variants: [
      {
        id: "var_kitchen_display",
        title: "Default Title",
        availableForSale: true,
        selectedOptions: [{ name: "Title", value: "Default Title" }],
        price: { amount: "899", currencyCode },
      },
    ],
    featuredImage: {
      url: "https://placehold.co/1200x900/png?text=Kitchen+Display",
      altText: "Kitchen display screen",
      width: 1200,
      height: 900,
    },
    images: [
      {
        url: "https://placehold.co/1200x900/png?text=Kitchen+Display",
        altText: "Kitchen display screen",
        width: 1200,
        height: 900,
      },
    ],
    seo: {
      title: "Kitchen Display Screen",
      description: "Digital ticket display for faster kitchen flow.",
    },
    tags: ["collection:pos-systems"],
    updatedAt: now,
  },
  {
    id: "prod_menu_printing",
    handle: "menu-printing-bundle",
    availableForSale: true,
    title: "Menu Printing Bundle",
    description: "Premium menu printing and design-ready templates.",
    descriptionHtml:
      "<p>Launch menus that feel premium and stay consistent.</p><ul><li>Multiple sizes</li><li>Coated finish</li><li>Fast turnaround</li></ul><p>Supplier: <a href=\"https://www.vistaprint.com/marketing-materials/menus\" target=\"_blank\" rel=\"noopener noreferrer\">Vistaprint menus</a>.</p>",
    options: [baseOption],
    priceRange: {
      minVariantPrice: { amount: "129", currencyCode },
      maxVariantPrice: { amount: "129", currencyCode },
    },
    variants: [
      {
        id: "var_menu_printing",
        title: "Default Title",
        availableForSale: true,
        selectedOptions: [{ name: "Title", value: "Default Title" }],
        price: { amount: "129", currencyCode },
      },
    ],
    featuredImage: {
      url: "https://placehold.co/1200x900/png?text=Menu+Printing",
      altText: "Menu printing bundle",
      width: 1200,
      height: 900,
    },
    images: [
      {
        url: "https://placehold.co/1200x900/png?text=Menu+Printing",
        altText: "Menu printing bundle",
        width: 1200,
        height: 900,
      },
    ],
    seo: {
      title: "Menu Printing Bundle",
      description: "Professional menu printing for restaurants and cafes.",
    },
    tags: ["collection:print-marketing"],
    updatedAt: now,
  },
  {
    id: "prod_food_labels",
    handle: "food-labels-roll-pack",
    availableForSale: true,
    title: "Food Labels Roll Pack",
    description: "Custom food labels for packaging, jars, and takeaway.",
    descriptionHtml:
      "<p>Keep branding consistent across every package.</p><ul><li>Water resistant</li><li>High-contrast print</li><li>Multiple finishes</li></ul><p>Supplier: <a href=\"https://smartpress.com/offering/food-labels\" target=\"_blank\" rel=\"noopener noreferrer\">Smartpress food labels</a>.</p>",
    options: [baseOption],
    priceRange: {
      minVariantPrice: { amount: "79", currencyCode },
      maxVariantPrice: { amount: "79", currencyCode },
    },
    variants: [
      {
        id: "var_food_labels",
        title: "Default Title",
        availableForSale: true,
        selectedOptions: [{ name: "Title", value: "Default Title" }],
        price: { amount: "79", currencyCode },
      },
    ],
    featuredImage: {
      url: "https://placehold.co/1200x900/png?text=Food+Labels",
      altText: "Food labels roll",
      width: 1200,
      height: 900,
    },
    images: [
      {
        url: "https://placehold.co/1200x900/png?text=Food+Labels",
        altText: "Food labels roll",
        width: 1200,
        height: 900,
      },
    ],
    seo: {
      title: "Food Labels Roll Pack",
      description: "Custom labels for packaging and takeout.",
    },
    tags: ["collection:labels"],
    updatedAt: now,
  },
  {
    id: "prod_supply_starter",
    handle: "restaurant-supply-starter",
    availableForSale: true,
    title: "Restaurant Supply Starter",
    description: "Core tools for prep, storage, and back of house.",
    descriptionHtml:
      "<p>Bundle of must-have supplies to stock a new kitchen.</p><ul><li>Food prep tools</li><li>Storage containers</li><li>Sanitation kit</li></ul><p>Supplier: Preferred vendor.</p>",
    options: [baseOption],
    priceRange: {
      minVariantPrice: { amount: "249", currencyCode },
      maxVariantPrice: { amount: "249", currencyCode },
    },
    variants: [
      {
        id: "var_supply_starter",
        title: "Default Title",
        availableForSale: true,
        selectedOptions: [{ name: "Title", value: "Default Title" }],
        price: { amount: "249", currencyCode },
      },
    ],
    featuredImage: {
      url: "https://placehold.co/1200x900/png?text=Supply+Starter",
      altText: "Restaurant supply kit",
      width: 1200,
      height: 900,
    },
    images: [
      {
        url: "https://placehold.co/1200x900/png?text=Supply+Starter",
        altText: "Restaurant supply kit",
        width: 1200,
        height: 900,
      },
    ],
    seo: {
      title: "Restaurant Supply Starter",
      description: "Essential supplies for kitchens and prep stations.",
    },
    tags: ["collection:supplies"],
    updatedAt: now,
  },
  {
    id: "prod_receipt_printer",
    handle: "thermal-receipt-printer",
    availableForSale: true,
    title: "Thermal Receipt Printer",
    description: "Fast and quiet thermal printer for busy counters.",
    descriptionHtml:
      "<p>Keep checkout lines moving with fast receipt output.</p><ul><li>Auto cutter</li><li>USB + Ethernet</li><li>Compact footprint</li></ul>",
    options: [baseOption],
    priceRange: {
      minVariantPrice: { amount: "189", currencyCode },
      maxVariantPrice: { amount: "189", currencyCode },
    },
    variants: [
      {
        id: "var_receipt_printer",
        title: "Default Title",
        availableForSale: true,
        selectedOptions: [{ name: "Title", value: "Default Title" }],
        price: { amount: "189", currencyCode },
      },
    ],
    featuredImage: {
      url: "https://placehold.co/1200x900/png?text=Receipt+Printer",
      altText: "Receipt printer",
      width: 1200,
      height: 900,
    },
    images: [
      {
        url: "https://placehold.co/1200x900/png?text=Receipt+Printer",
        altText: "Receipt printer",
        width: 1200,
        height: 900,
      },
    ],
    seo: {
      title: "Thermal Receipt Printer",
      description: "Reliable receipt printer for POS stations.",
    },
    tags: ["collection:supplies", "collection:accessories"],
    updatedAt: now,
  },
  {
    id: "prod_qr_stands",
    handle: "qr-tabletop-stands",
    availableForSale: true,
    title: "QR Tabletop Stands",
    description: "Instant QR menus for tables and counters.",
    descriptionHtml:
      "<p>Encourage contactless ordering with branded QR stands.</p><ul><li>Acrylic finish</li><li>Custom artwork</li><li>Table-ready size</li></ul>",
    options: [baseOption],
    priceRange: {
      minVariantPrice: { amount: "59", currencyCode },
      maxVariantPrice: { amount: "59", currencyCode },
    },
    variants: [
      {
        id: "var_qr_stands",
        title: "Default Title",
        availableForSale: true,
        selectedOptions: [{ name: "Title", value: "Default Title" }],
        price: { amount: "59", currencyCode },
      },
    ],
    featuredImage: {
      url: "https://placehold.co/1200x900/png?text=QR+Stands",
      altText: "QR tabletop stands",
      width: 1200,
      height: 900,
    },
    images: [
      {
        url: "https://placehold.co/1200x900/png?text=QR+Stands",
        altText: "QR tabletop stands",
        width: 1200,
        height: 900,
      },
    ],
    seo: {
      title: "QR Tabletop Stands",
      description: "Contactless menu stands for tables.",
    },
    tags: ["collection:print-marketing", "collection:accessories"],
    updatedAt: now,
  },
];

const mockCollections: Collection[] = [
  {
    handle: "pos-systems",
    title: "POS Systems",
    description: "POS terminals, handhelds, and kitchen screens.",
    seo: {
      title: "POS Systems",
      description: "POS terminals, handhelds, and kitchen screens.",
    },
    path: "/search/pos-systems",
    updatedAt: now,
  },
  {
    handle: "supplies",
    title: "Restaurant Supplies",
    description: "Back-of-house supplies and essentials.",
    seo: {
      title: "Restaurant Supplies",
      description: "Back-of-house supplies and essentials.",
    },
    path: "/search/supplies",
    updatedAt: now,
  },
  {
    handle: "print-marketing",
    title: "Print & Marketing",
    description: "Menus, QR stands, and marketing materials.",
    seo: {
      title: "Print & Marketing",
      description: "Menus, QR stands, and marketing materials.",
    },
    path: "/search/print-marketing",
    updatedAt: now,
  },
  {
    handle: "labels",
    title: "Food Labels",
    description: "Custom labels for packaging and takeout.",
    seo: {
      title: "Food Labels",
      description: "Custom labels for packaging and takeout.",
    },
    path: "/search/labels",
    updatedAt: now,
  },
  {
    handle: "accessories",
    title: "Accessories",
    description: "Add-ons and peripherals for your POS setup.",
    seo: {
      title: "Accessories",
      description: "Add-ons and peripherals for your POS setup.",
    },
    path: "/search/accessories",
    updatedAt: now,
  },
];

const homepageFeaturedHandles = [
  "pos-terminal-starter",
  "menu-printing-bundle",
  "restaurant-supply-starter",
];
const homepageCarouselHandles = [
  "handheld-pos",
  "kitchen-display-screen",
  "food-labels-roll-pack",
  "thermal-receipt-printer",
  "qr-tabletop-stands",
];

const mockMenus: Record<string, Menu[]> = {
  "next-js-frontend-header-menu": [
    { title: "Shop All", path: "/search" },
    { title: "POS Systems", path: "/search/pos-systems" },
    { title: "Supplies", path: "/search/supplies" },
    { title: "Print & Marketing", path: "/search/print-marketing" },
    { title: "Labels", path: "/search/labels" },
    { title: "Subscriptions", path: "/subscriptions" },
  ],
  "next-js-frontend-footer-menu": [
    { title: "About", path: "/about" },
    { title: "Affiliate Info", path: "/affiliates" },
    { title: "Support", path: "/support" },
    { title: "Subscriptions", path: "/subscriptions" },
  ],
};

const mockPages: Page[] = [
  {
    id: "page_about",
    title: "About Crypto Pay",
    handle: "about",
    body:
      "<p>Crypto Pay helps restaurants source POS systems and operational supplies in one place.</p><p>We combine curated products with optional subscriptions for ongoing support.</p>",
    bodySummary: "About Crypto Pay and our mission.",
    seo: {
      title: "About Crypto Pay",
      description: "Restaurant POS systems and supply marketplace.",
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "page_affiliates",
    title: "Affiliate Information",
    handle: "affiliates",
    body:
      "<p>Some product links are affiliate links. We may earn a commission at no additional cost to you.</p>",
    bodySummary: "Affiliate disclosure.",
    seo: {
      title: "Affiliate Information",
      description: "Disclosure about affiliate links used on Crypto Pay.",
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "page_support",
    title: "Support",
    handle: "support",
    body:
      "<p>Need help selecting POS hardware or supplies?</p><p>Email <a href=\"mailto:support@cryptopay.sale\">support@cryptopay.sale</a> and our team will assist.</p>",
    bodySummary: "Support and contact details.",
    seo: {
      title: "Support",
      description: "Contact Crypto Pay support for help and onboarding.",
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "page_subscriptions",
    title: "Subscriptions",
    handle: "subscriptions",
    body:
      `<p>Subscriptions unlock POS software updates, analytics, and priority support.</p><p>Manage subscriptions in the Crypto Pay Portal: <a href=\"${portalUrl}\" target=\"_blank\" rel=\"noopener noreferrer\">${portalUrl}</a>.</p>`,
    bodySummary: "Subscription plans and portal access.",
    seo: {
      title: "Subscriptions",
      description: "POS software subscriptions and customer portal access.",
    },
    createdAt: now,
    updatedAt: now,
  },
];

const productByHandle = new Map(mockProducts.map((product) => [product.handle, product]));
const variantLookup = new Map(
  mockProducts.flatMap((product) =>
    product.variants.map((variant) => [variant.id, { product, variant }])
  )
);

function buildCart(lines: CartItem[], cartId: string): Cart {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce(
    (sum, item) => sum + Number(item.cost.totalAmount.amount),
    0
  );
  const currency = lines[0]?.cost.totalAmount.currencyCode || currencyCode;

  return {
    id: cartId,
    checkoutUrl: "/checkout",
    totalQuantity,
    lines,
    cost: {
      subtotalAmount: { amount: totalAmount.toString(), currencyCode: currency },
      totalAmount: { amount: totalAmount.toString(), currencyCode: currency },
      totalTaxAmount: { amount: "0", currencyCode: currency },
    },
  };
}

function makeLineItem(
  variant: ProductVariant,
  product: Product,
  quantity: number
): CartItem {
  return {
    id: `line-${variant.id}`,
    quantity,
    cost: {
      totalAmount: {
        amount: (Number(variant.price.amount) * quantity).toString(),
        currencyCode: variant.price.currencyCode,
      },
    },
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions,
      product: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        featuredImage: product.featuredImage,
      },
    },
  };
}

const mockCarts = new Map<string, Cart>();

function createCartId() {
  return `cart_${Math.random().toString(36).slice(2, 10)}`;
}

export function createMockCart(): Cart {
  const cartId = createCartId();
  const cart = buildCart([], cartId);
  mockCarts.set(cartId, cart);
  return cart;
}

export function getMockCart(cartId?: string): Cart | undefined {
  if (!cartId) return undefined;
  return mockCarts.get(cartId);
}

export function addMockCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Cart {
  const cart = mockCarts.get(cartId) || buildCart([], cartId);
  const updatedLines = [...cart.lines];

  lines.forEach(({ merchandiseId, quantity }) => {
    const lookup = variantLookup.get(merchandiseId);
    if (!lookup) {
      return;
    }

    const existingIndex = updatedLines.findIndex(
      (line) => line.merchandise.id === merchandiseId
    );
    if (existingIndex >= 0) {
      const existing = updatedLines[existingIndex];
      const newQuantity = existing.quantity + quantity;
      updatedLines[existingIndex] = makeLineItem(
        lookup.variant,
        lookup.product,
        newQuantity
      );
    } else {
      updatedLines.push(makeLineItem(lookup.variant, lookup.product, quantity));
    }
  });

  const nextCart = buildCart(updatedLines, cartId);
  mockCarts.set(cartId, nextCart);
  return nextCart;
}

export function updateMockCartLines(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Cart {
  const cart = mockCarts.get(cartId) || buildCart([], cartId);
  let updatedLines = [...cart.lines];

  lines.forEach(({ merchandiseId, quantity }) => {
    const lookup = variantLookup.get(merchandiseId);
    if (!lookup) {
      return;
    }

    updatedLines = updatedLines.filter(
      (line) => line.merchandise.id !== merchandiseId
    );

    if (quantity > 0) {
      updatedLines.push(makeLineItem(lookup.variant, lookup.product, quantity));
    }
  });

  const nextCart = buildCart(updatedLines, cartId);
  mockCarts.set(cartId, nextCart);
  return nextCart;
}

export function removeMockCartLines(cartId: string, lineIds: string[]): Cart {
  const cart = mockCarts.get(cartId) || buildCart([], cartId);
  const updatedLines = cart.lines.filter((line) => !lineIds.includes(line.id || ""));
  const nextCart = buildCart(updatedLines, cartId);
  mockCarts.set(cartId, nextCart);
  return nextCart;
}

export function getMockCollection(handle: string): Collection | undefined {
  return mockCollections.find((collection) => collection.handle === handle);
}

export function getMockCollections(): Collection[] {
  return [
    {
      handle: "",
      title: "All",
      description: "All products",
      seo: {
        title: "All",
        description: "All products",
      },
      path: "/search",
      updatedAt: now,
    },
    ...mockCollections,
  ];
}

function sortProducts(products: Product[], sortKey?: string, reverse?: boolean) {
  const sorted = [...products];

  if (sortKey === "PRICE") {
    sorted.sort(
      (a, b) =>
        Number(a.priceRange.maxVariantPrice.amount) -
        Number(b.priceRange.maxVariantPrice.amount)
    );
  }

  if (sortKey === "CREATED_AT") {
    sorted.sort(
      (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );
  }

  if (reverse) {
    sorted.reverse();
  }

  return sorted;
}

function getProductCollectionTags(product: Product) {
  return product.tags
    .filter((tag) => tag.startsWith("collection:"))
    .map((tag) => tag.replace("collection:", ""));
}

export function getMockCollectionProducts({
  collection,
  sortKey,
  reverse,
}: {
  collection: string;
  sortKey?: string;
  reverse?: boolean;
}): Product[] {
  if (collection === "hidden-homepage-featured-items") {
    return homepageFeaturedHandles
      .map((handle) => productByHandle.get(handle))
      .filter(Boolean) as Product[];
  }

  if (collection === "hidden-homepage-carousel") {
    return homepageCarouselHandles
      .map((handle) => productByHandle.get(handle))
      .filter(Boolean) as Product[];
  }

  if (!collection) {
    return sortProducts(mockProducts, sortKey, reverse);
  }

  const filtered = mockProducts.filter((product) =>
    getProductCollectionTags(product).includes(collection)
  );

  return sortProducts(filtered, sortKey, reverse);
}

export function getMockMenu(handle: string): Menu[] {
  return mockMenus[handle] || [];
}

export function getMockPage(handle: string): Page | undefined {
  return mockPages.find((page) => page.handle === handle);
}

export function getMockPages(): Page[] {
  return mockPages;
}

export function getMockProduct(handle: string): Product | undefined {
  return productByHandle.get(handle);
}

export function getMockProducts({
  query,
  sortKey,
  reverse,
}: {
  query?: string;
  sortKey?: string;
  reverse?: boolean;
}): Product[] {
  const normalized = query?.toLowerCase().trim();
  const filtered = !normalized
    ? mockProducts
    : mockProducts.filter(
        (product) =>
          product.title.toLowerCase().includes(normalized) ||
          product.description.toLowerCase().includes(normalized)
      );

  return sortProducts(filtered, sortKey, reverse);
}

export function getMockProductRecommendations(productId: string): Product[] {
  const product = mockProducts.find((item) => item.id === productId);
  if (!product) return [];

  const collections = getProductCollectionTags(product);
  const related = mockProducts.filter((item) =>
    collections.some((collection) =>
      getProductCollectionTags(item).includes(collection)
    )
  );

  return related.filter((item) => item.id !== productId).slice(0, 6);
}
