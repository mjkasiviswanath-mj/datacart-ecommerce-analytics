export type Role = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  description: string;
  image: string;
  features?: string[];
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export type PaymentMethod = 'Cash on Delivery' | 'Card' | 'UPI';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  pincode: string;
  paymentMethod: PaymentMethod;
  orderDate: string; // ISO date string e.g. 2026-09-15
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
}

export interface RecommendationResult {
  product: Product;
  similarityScore: number;
  matchingFeatures: string[];
}

export interface SalesForecast {
  forecastMonths: {
    month: string;
    actualSales: number | null;
    predictedSales: number;
    isForecast: boolean;
    lowerBound: number;
    upperBound: number;
  }[];
  r2Score: number;
  mae: number;
  growthRate: number;
  slope: number;
  intercept: number;
}

export type RFMSegmentName =
  | 'Champions (VIP)'
  | 'Loyal Customers'
  | 'Potential Loyalists'
  | 'At-Risk / Inactive';

export interface CustomerRFMSegment {
  customerId: string;
  customerName: string;
  email: string;
  recencyDays: number;
  frequencyOrders: number;
  monetarySpent: number;
  rScore: number;
  fScore: number;
  mScore: number;
  segment: RFMSegmentName;
}

export interface AssociationRule {
  itemA: string;
  itemB: string;
  support: number; // % of total orders containing both
  confidence: number; // P(B | A)
  lift: number; // Ratio of observed to expected co-occurrence (>1 means strong positive correlation)
}

export interface SalesAnalytics {
  totalRevenue: number;
  avgOrderValue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  maxOrderValue: number;
  minOrderValue: number;
  monthlySales: { month: string; sales: number; orderCount: number }[];
  categorySales: { category: string; sales: number; itemsSold: number; percentage: number }[];
  salesDistribution: { category: string; value: number }[];
  topProducts: { name: string; category: string; totalRevenue: number; unitsSold: number }[];
  orderStatusCounts: { status: OrderStatus; count: number }[];
  customerSpending: { customerName: string; email: string; totalSpent: number; orderCount: number }[];
  forecast: SalesForecast;
  rfmSegments: CustomerRFMSegment[];
  associationRules: AssociationRule[];
  rfmDistribution: { segment: RFMSegmentName; count: number; totalRevenue: number; percentage: number }[];
}
