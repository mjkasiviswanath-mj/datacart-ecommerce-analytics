import { User, Product, Order, CartItem, OrderStatus } from '../types';
import { INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_ORDERS } from '../sampleData';

const STORAGE_KEYS = {
  USERS: 'datacart_users_v2',
  PRODUCTS: 'datacart_products_v2',
  ORDERS: 'datacart_orders_v2',
  CART: 'datacart_cart_v2',
  CURRENT_USER: 'datacart_current_user_v2',
};

// Initialize default storage data
export function initStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CART)) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    // Default to a logged-in customer for effortless initial browsing experience
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[2]));
  }
}

export function resetToSampleData(): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[2]));
}

// User operations
export function getUsers(): User[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

export function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function registerUser(user: Omit<User, 'id' | 'createdAt'>): { success: boolean; user?: User; error?: string } {
  const users = getUsers();
  const existing = users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const newUser: User = {
    ...user,
    id: `u-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  setCurrentUser(newUser);
  return { success: true, user: newUser };
}

export function loginUser(email: string, password: string): { success: boolean; user?: User; error?: string } {
  const users = getUsers();
  const found = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!found) {
    return { success: false, error: 'Invalid email or password. Please check your credentials.' };
  }

  setCurrentUser(found);
  return { success: true, user: found };
}

// Product operations
export function getProducts(): Product[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveProduct(product: Omit<Product, 'id'> & { id?: string }): Product {
  const products = getProducts();
  if (product.id) {
    // Edit existing
    const idx = products.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      const updated: Product = { ...products[idx], ...product, id: product.id };
      products[idx] = updated;
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      return updated;
    }
  }

  // Add new
  const newProduct: Product = {
    ...product,
    id: `p-${Date.now()}`,
    features: product.features || [product.category],
  };
  products.unshift(newProduct);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  return newProduct;
}

export function deleteProduct(productId: string): boolean {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== productId);
  if (filtered.length !== products.length) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    return true;
  }
  return false;
}

// Cart operations
export function getCart(userId: string): CartItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CART);
    const cart: CartItem[] = data ? JSON.parse(data) : [];
    return cart.filter(item => item.userId === userId);
  } catch {
    return [];
  }
}

export function addToCart(userId: string, product: Product, quantity = 1): CartItem[] {
  const allCart: CartItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
  const existingIndex = allCart.findIndex(item => item.userId === userId && item.productId === product.id);

  if (existingIndex > -1) {
    const newQty = allCart[existingIndex].quantity + quantity;
    if (newQty <= product.stock) {
      allCart[existingIndex].quantity = newQty;
    }
  } else {
    allCart.push({
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      productId: product.id,
      product,
      quantity: Math.min(quantity, product.stock),
    });
  }

  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(allCart));
  return allCart.filter(item => item.userId === userId);
}

export function updateCartQuantity(userId: string, productId: string, delta: number): CartItem[] {
  const allCart: CartItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
  const itemIndex = allCart.findIndex(item => item.userId === userId && item.productId === productId);

  if (itemIndex > -1) {
    const item = allCart[itemIndex];
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      allCart.splice(itemIndex, 1);
    } else if (newQty <= item.product.stock) {
      item.quantity = newQty;
    }
  }

  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(allCart));
  return allCart.filter(item => item.userId === userId);
}

export function removeFromCart(userId: string, productId: string): CartItem[] {
  let allCart: CartItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
  allCart = allCart.filter(item => !(item.userId === userId && item.productId === productId));
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(allCart));
  return allCart.filter(item => item.userId === userId);
}

export function clearCart(userId: string): void {
  let allCart: CartItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
  allCart = allCart.filter(item => item.userId !== userId);
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(allCart));
}

// Order operations
export function getOrders(): Order[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : INITIAL_ORDERS;
  } catch {
    return INITIAL_ORDERS;
  }
}

export function getCustomerOrders(userId: string): Order[] {
  const orders = getOrders();
  return orders.filter(o => o.userId === userId).sort((a, b) => b.orderDate.localeCompare(a.orderDate));
}

export function createOrder(orderData: Omit<Order, 'id' | 'orderDate' | 'status'>): Order {
  const orders = getOrders();
  const products = getProducts();

  const newOrder: Order = {
    ...orderData,
    id: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    orderDate: new Date().toISOString(),
    status: 'Pending',
  };

  // Decrement stock in products
  newOrder.items.forEach(item => {
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  });

  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  orders.unshift(newOrder);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

  // Clear user's cart
  clearCart(orderData.userId);

  return newOrder;
}

export function updateOrderStatus(orderId: string, newStatus: OrderStatus): boolean {
  const orders = getOrders();
  const target = orders.find(o => o.id === orderId);
  if (target) {
    target.status = newStatus;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return true;
  }
  return false;
}
