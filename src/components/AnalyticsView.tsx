import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import {
  BarChart3,
  Download,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  ShoppingBag,
  FileSpreadsheet,
  PieChart as PieIcon,
  Layers,
  ArrowUpRight,
  Database,
  Cpu,
  Sparkles,
  GitCommit,
  Calculator,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { SalesAnalytics, Product, Order, RFMSegmentName } from '../types';
import { generateOrdersCSV, generateProductsCSV, downloadCSVFile } from '../utils/analyticsEngine';

interface AnalyticsViewProps {
  analytics: SalesAnalytics;
  orders: Order[];
  products: Product[];
  onOpenProjectHub: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  orders,
  products,
  onOpenProjectHub,
}) => {
  const [activeTab, setActiveTab] = useState<'visualizations' | 'forecast' | 'rfm' | 'market-basket' | 'simulator'>('visualizations');

  // Simulator State (What-If Analysis)
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [adSpend, setAdSpend] = useState<number>(300);
  const [priceElasticity, setPriceElasticity] = useState<number>(1.6); // Elastic demand (|Ed| > 1)

  // Chart Canvas Refs for Tab 1
  const monthlySalesRef = useRef<HTMLCanvasElement | null>(null);
  const categorySalesRef = useRef<HTMLCanvasElement | null>(null);
  const salesDistributionRef = useRef<HTMLCanvasElement | null>(null);
  const topProductsRef = useRef<HTMLCanvasElement | null>(null);
  const orderStatusRef = useRef<HTMLCanvasElement | null>(null);
  const customerSpendingRef = useRef<HTMLCanvasElement | null>(null);

  // Chart Canvas Ref for Tab 2 (Forecasting)
  const forecastChartRef = useRef<HTMLCanvasElement | null>(null);

  // Store Chart instances
  const chartsRef = useRef<{ [key: string]: Chart }>({});

  // Render Visualizations Tab charts
  useEffect(() => {
    if (activeTab !== 'visualizations') return;

    // Destroy previous charts before recreating
    Object.values(chartsRef.current).forEach((chart) => chart.destroy());
    chartsRef.current = {};

    // 1. Monthly Sales (Line Chart)
    if (monthlySalesRef.current) {
      chartsRef.current.monthly = new Chart(monthlySalesRef.current, {
        type: 'line',
        data: {
          labels: analytics.monthlySales.map((m) => m.month),
          datasets: [
            {
              label: 'Sales Revenue ($ USD)',
              data: analytics.monthlySales.map((m) => m.sales),
              borderColor: '#4f46e5',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              fill: true,
              tension: 0.35,
              borderWidth: 2.5,
              pointBackgroundColor: '#4f46e5',
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` Revenue: $${(ctx.parsed.y ?? 0).toLocaleString()}`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: { callback: (val) => `$${val}` },
            },
            x: { grid: { display: false } },
          },
        },
      });
    }

    // 2. Category-wise Sales (Bar Chart)
    if (categorySalesRef.current) {
      chartsRef.current.category = new Chart(categorySalesRef.current, {
        type: 'bar',
        data: {
          labels: analytics.categorySales.map((c) => c.category),
          datasets: [
            {
              label: 'Category Revenue ($ USD)',
              data: analytics.categorySales.map((c) => c.sales),
              backgroundColor: [
                '#6366f1',
                '#3b82f6',
                '#06b6d4',
                '#10b981',
                '#f59e0b',
                '#ec4899',
              ],
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` Sales: $${(ctx.parsed.y ?? 0).toLocaleString()}`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: { callback: (val) => `$${val}` },
            },
            x: { grid: { display: false } },
          },
        },
      });
    }

    // 3. Sales Distribution (Doughnut / Pie Chart)
    if (salesDistributionRef.current) {
      chartsRef.current.distribution = new Chart(salesDistributionRef.current, {
        type: 'doughnut',
        data: {
          labels: analytics.salesDistribution.map((d) => d.category),
          datasets: [
            {
              data: analytics.salesDistribution.map((d) => d.value),
              backgroundColor: [
                '#6366f1',
                '#06b6d4',
                '#10b981',
                '#f59e0b',
                '#ec4899',
                '#8b5cf6',
              ],
              borderWidth: 2,
              borderColor: '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: $${Number(ctx.raw).toLocaleString()}`,
              },
            },
          },
          cutout: '65%',
        },
      });
    }

    // 4. Top 10 Products (Horizontal Bar Chart)
    if (topProductsRef.current) {
      const top10 = analytics.topProducts.slice(0, 8);
      chartsRef.current.topProducts = new Chart(topProductsRef.current, {
        type: 'bar',
        data: {
          labels: top10.map((p) => p.name.length > 22 ? p.name.substring(0, 20) + '...' : p.name),
          datasets: [
            {
              label: 'Total Revenue ($)',
              data: top10.map((p) => p.totalRevenue),
              backgroundColor: '#4f46e5',
              borderRadius: 4,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` Revenue: $${(ctx.parsed.x ?? 0).toLocaleString()}`,
              },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: { callback: (val) => `$${val}` },
            },
            y: { grid: { display: false } },
          },
        },
      });
    }

    // 5. Order Status (Doughnut Chart)
    if (orderStatusRef.current) {
      chartsRef.current.orderStatus = new Chart(orderStatusRef.current, {
        type: 'doughnut',
        data: {
          labels: analytics.orderStatusCounts.map((s) => s.status),
          datasets: [
            {
              data: analytics.orderStatusCounts.map((s) => s.count),
              backgroundColor: [
                '#f59e0b', // Pending (amber)
                '#3b82f6', // Confirmed (blue)
                '#6366f1', // Shipped (indigo)
                '#10b981', // Delivered (emerald)
                '#ef4444', // Cancelled (rose)
              ],
              borderWidth: 2,
              borderColor: '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
          },
          cutout: '60%',
        },
      });
    }

    // 6. Customer Spending (Bar Chart)
    if (customerSpendingRef.current) {
      const topCustomers = analytics.customerSpending.slice(0, 6);
      chartsRef.current.customerSpending = new Chart(customerSpendingRef.current, {
        type: 'bar',
        data: {
          labels: topCustomers.map((c) => c.customerName.split(' ')[0]),
          datasets: [
            {
              label: 'Total Spend ($)',
              data: topCustomers.map((c) => c.totalSpent),
              backgroundColor: '#0ea5e9',
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` Spent: $${(ctx.parsed.y ?? 0).toLocaleString()}`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: { callback: (val) => `$${val}` },
            },
            x: { grid: { display: false } },
          },
        },
      });
    }

    return () => {
      Object.values(chartsRef.current).forEach((chart) => chart.destroy());
    };
  }, [analytics, activeTab]);

  // Render Time-Series Forecasting Chart
  useEffect(() => {
    if (activeTab !== 'forecast' || !forecastChartRef.current) return;

    if (chartsRef.current.forecast) {
      chartsRef.current.forecast.destroy();
    }

    const labels = analytics.forecast.forecastMonths.map(f => f.month);
    const actualData = analytics.forecast.forecastMonths.map(f => f.actualSales);
    const predictedData = analytics.forecast.forecastMonths.map(f => f.predictedSales);

    chartsRef.current.forecast = new Chart(forecastChartRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Actual Revenue (Historical)',
            data: actualData,
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.15)',
            borderWidth: 3,
            fill: false,
            tension: 0.25,
            pointRadius: 5,
            pointBackgroundColor: '#4f46e5',
          },
          {
            label: 'ML Linear Regression Forecast (Next 3 Months)',
            data: predictedData,
            borderColor: '#f59e0b',
            borderDash: [6, 6],
            borderWidth: 2.5,
            backgroundColor: 'rgba(245, 158, 11, 0.05)',
            fill: false,
            tension: 0.2,
            pointRadius: 5,
            pointBackgroundColor: '#f59e0b',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 14 } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed.y ?? 0;
                return ` ${ctx.dataset.label}: $${val.toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { callback: (v) => `$${v}` },
          },
          x: { grid: { display: false } },
        },
      },
    });

    return () => {
      if (chartsRef.current.forecast) {
        chartsRef.current.forecast.destroy();
      }
    };
  }, [analytics, activeTab]);

  const handleDownloadOrdersCSV = () => {
    const csv = generateOrdersCSV(orders, products);
    downloadCSVFile('orders.csv', csv);
  };

  const handleDownloadProductsCSV = () => {
    const csv = generateProductsCSV(products);
    downloadCSVFile('products.csv', csv);
  };

  // What-If Simulation Calculations
  // Quantity change % = - elasticity * discount %
  const quantityUpliftPercent = (priceElasticity * discountPercent);
  const baselineRevenue = analytics.totalRevenue || 10000;
  const simulatedQuantityMultiplier = 1 + quantityUpliftPercent / 100;
  const simulatedPriceMultiplier = 1 - discountPercent / 100;
  const adEffectMultiplier = 1 + (adSpend / 2000) * 0.15; // ad spend uplift

  const simulatedRevenue = Math.round(
    baselineRevenue * simulatedQuantityMultiplier * simulatedPriceMultiplier * adEffectMultiplier
  );
  const simulatedGrossProfit = Math.round(simulatedRevenue * 0.45 - adSpend);
  const revenueDifference = simulatedRevenue - baselineRevenue;

  const RFM_BADGES: Record<RFMSegmentName, { bg: string; text: string; desc: string }> = {
    'Champions (VIP)': {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      desc: 'High frequency, recent transactions, highest lifetime spend.',
    },
    'Loyal Customers': {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      desc: 'Consistent ordering history with steady revenue contribution.',
    },
    'Potential Loyalists': {
      bg: 'bg-indigo-50 border-indigo-200',
      text: 'text-indigo-700',
      desc: 'Recent shoppers with high engagement and upsell potential.',
    },
    'At-Risk / Inactive': {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      desc: 'Long dormant duration since last purchase; needs win-back campaign.',
    },
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>Data Science & Machine Learning Intelligence Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Sales & Predictive Analytics Platform
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Advanced analytics powered by Linear Regression, RFM Clustering, TF-IDF NLP, and Association Rule Mining.
          </p>
        </div>

        {/* Action Buttons: CSV Export & Docs */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleDownloadOrdersCSV}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Download real orders.csv dataset"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export orders.csv</span>
          </button>
          <button
            onClick={handleDownloadProductsCSV}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Download products.csv dataset"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export products.csv</span>
          </button>
          <button
            onClick={onOpenProjectHub}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ML Models & Viva Docs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Revenue
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ${analytics.totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            Min: ${analytics.minOrderValue} | Max: ${analytics.maxOrderValue}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Average Order Value
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ${analytics.avgOrderValue}
          </div>
          <div className="text-[11px] text-slate-500">
            Per completed customer order
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            ML Forecast (Nov 2026)
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
            ${analytics.forecast.forecastMonths.find(f => f.isForecast)?.predictedSales.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            {analytics.forecast.growthRate >= 0 ? `+${analytics.forecast.growthRate}%` : `${analytics.forecast.growthRate}%`} projected trend
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Model Accuracy (R²)
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {analytics.forecast.r2Score}
          </div>
          <div className="text-[11px] text-slate-500">
            MAE: ±${analytics.forecast.mae}
          </div>
        </div>
      </div>

      {/* Main Analytics Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 gap-1 overflow-x-auto text-xs font-semibold shadow-2xs">
        <button
          onClick={() => setActiveTab('visualizations')}
          className={`py-2 px-3.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'visualizations'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>1. Sales Visualizations (6 Charts)</span>
        </button>

        <button
          onClick={() => setActiveTab('forecast')}
          className={`py-2 px-3.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'forecast'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>2. ML Time-Series Forecasting</span>
        </button>

        <button
          onClick={() => setActiveTab('rfm')}
          className={`py-2 px-3.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'rfm'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>3. Customer RFM Segmentation</span>
        </button>

        <button
          onClick={() => setActiveTab('market-basket')}
          className={`py-2 px-3.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'market-basket'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>4. Market Basket Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`py-2 px-3.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'simulator'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>5. What-If Price Simulator</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: 6 Chart.js Visualizations */}
      {/* ======================================================== */}
      {activeTab === 'visualizations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Chart 1: Monthly Sales (Line Chart) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">1. Monthly Sales Trend</h3>
                  <p className="text-[11px] text-slate-500">Line chart • Aggregated by month</p>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  df.resample('M')
                </span>
              </div>
              <div className="h-60 relative">
                <canvas ref={monthlySalesRef} />
              </div>
            </div>

            {/* Chart 2: Category-wise Sales (Bar Chart) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">2. Category-wise Sales</h3>
                  <p className="text-[11px] text-slate-500">Bar chart • Revenue by category</p>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  df.groupby('Category')
                </span>
              </div>
              <div className="h-60 relative">
                <canvas ref={categorySalesRef} />
              </div>
            </div>

            {/* Chart 3: Sales Distribution (Pie / Doughnut Chart) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">3. Sales Distribution</h3>
                  <p className="text-[11px] text-slate-500">Doughnut chart • Share of total revenue</p>
                </div>
                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                  Share %
                </span>
              </div>
              <div className="h-60 relative">
                <canvas ref={salesDistributionRef} />
              </div>
            </div>

            {/* Chart 4: Top 10 Products (Horizontal Bar Chart) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">4. Top Products by Revenue</h3>
                  <p className="text-[11px] text-slate-500">Bar chart • Best-selling items</p>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  .head(10)
                </span>
              </div>
              <div className="h-60 relative">
                <canvas ref={topProductsRef} />
              </div>
            </div>

            {/* Chart 5: Order Status (Doughnut Chart) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">5. Order Fulfillment Status</h3>
                  <p className="text-[11px] text-slate-500">Doughnut chart • Delivered, shipped & pending</p>
                </div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  .value_counts()
                </span>
              </div>
              <div className="h-60 relative">
                <canvas ref={orderStatusRef} />
              </div>
            </div>

            {/* Chart 6: Customer Spending (Bar Chart) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">6. Customer Spending</h3>
                  <p className="text-[11px] text-slate-500">Bar chart • Lifetime spend by active users</p>
                </div>
                <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                  df.groupby('User')
                </span>
              </div>
              <div className="h-60 relative">
                <canvas ref={customerSpendingRef} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ML Time-Series Linear Regression Forecasting */}
      {/* ======================================================== */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Supervised Machine Learning: Scikit-learn Linear Regression</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Revenue Trajectory & Next-Quarter Forecasting
                </h3>
                <p className="text-xs text-slate-500">
                  Model Equation: <code className="font-mono font-bold text-indigo-700 bg-slate-100 px-1.5 py-0.5 rounded">y = {analytics.forecast.slope} · x + {analytics.forecast.intercept}</code>
                </p>
              </div>

              <div className="flex gap-4 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400">R² Score:</span>
                  <div className="font-bold text-slate-900">{analytics.forecast.r2Score}</div>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-slate-400">Mean Abs Error:</span>
                  <div className="font-bold text-slate-900">±${analytics.forecast.mae}</div>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-slate-400">Slope (β₁):</span>
                  <div className="font-bold text-emerald-600">+{analytics.forecast.slope}/mo</div>
                </div>
              </div>
            </div>

            {/* Forecast Chart Canvas */}
            <div className="h-80 relative">
              <canvas ref={forecastChartRef} />
            </div>

            {/* Forecast Data Table */}
            <div className="overflow-x-auto pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Detailed Month-by-Month Projection Table:
              </h4>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Timeline Month</th>
                    <th className="py-2.5 px-3">Data Type</th>
                    <th className="py-2.5 px-3">Actual Sales ($)</th>
                    <th className="py-2.5 px-3">Model Prediction ($)</th>
                    <th className="py-2.5 px-3">Lower Bound (-10%)</th>
                    <th className="py-2.5 px-3">Upper Bound (+10%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.forecast.forecastMonths.map((row) => (
                    <tr
                      key={row.month}
                      className={row.isForecast ? 'bg-amber-50/40 font-medium' : 'hover:bg-slate-50'}
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {row.month}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.isForecast
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          {row.isForecast ? 'ML Forecast' : 'Historical Actual'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {row.actualSales !== null ? `$${row.actualSales.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-indigo-700">
                        ${row.predictedSales.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        ${row.lowerBound.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        ${row.upperBound.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: Customer RFM Segmentation */}
      {/* ======================================================== */}
      {activeTab === 'rfm' && (
        <div className="space-y-6">
          {/* RFM Cohort Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics.rfmDistribution.map((group) => {
              const badge = RFM_BADGES[group.segment];
              return (
                <div
                  key={group.segment}
                  className={`p-4 rounded-xl border ${badge.bg} space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${badge.text}`}>
                      {group.segment}
                    </span>
                    <span className="text-xs font-bold bg-white px-2 py-0.5 rounded shadow-2xs text-slate-700">
                      {group.percentage}% of users
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {group.count} Customers
                  </div>
                  <div className="text-xs text-slate-600">
                    Revenue: <span className="font-bold text-slate-900">${group.totalRevenue.toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {badge.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Customer RFM Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Customer RFM Scoring Matrix (Recency, Frequency, Monetary)
              </h3>
              <p className="text-xs text-slate-500">
                Segmented using standard feature scaling and quintile score classification (1 to 4).
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Customer Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Recency (Days Ago)</th>
                    <th className="py-2.5 px-3">Frequency (Orders)</th>
                    <th className="py-2.5 px-3">Monetary ($ Spent)</th>
                    <th className="py-2.5 px-3">RFM Scores (R-F-M)</th>
                    <th className="py-2.5 px-3">Assigned Cohort</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.rfmSegments.map((cust) => {
                    const badge = RFM_BADGES[cust.segment];
                    return (
                      <tr key={cust.customerId} className="hover:bg-slate-50/60 transition">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {cust.customerName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{cust.email}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">
                          {cust.recencyDays} days
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">
                          {cust.frequencyOrders} orders
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          ${cust.monetarySpent.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-indigo-700">
                          {cust.rScore}-{cust.fScore}-{cust.mScore}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badge.bg} ${badge.text}`}
                          >
                            {cust.segment}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: Market Basket Analysis (Apriori Rules) */}
      {/* ======================================================== */}
      {activeTab === 'market-basket' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-2xs">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded mb-1">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Unsupervised ML: Apriori Association Rule Mining</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Frequently Bought Together (Co-occurrence Rules)
              </h3>
              <p className="text-xs text-slate-500">
                Calculates Lift ratios and joint Support from transaction carts. A Lift &gt; 1.0 indicates that purchasing Item A strongly increases the probability of purchasing Item B.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-3">Antecedent (Item A)</th>
                    <th className="py-3 px-3 text-center">Rule</th>
                    <th className="py-3 px-3">Consequent (Item B)</th>
                    <th className="py-3 px-3">Support (%)</th>
                    <th className="py-3 px-3">Confidence (%)</th>
                    <th className="py-3 px-3">Lift Ratio</th>
                    <th className="py-3 px-3">Actionable Insight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.associationRules.map((rule, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs truncate" title={rule.itemA}>
                        {rule.itemA}
                      </td>
                      <td className="py-3 px-3 text-center text-indigo-600 font-bold">➔</td>
                      <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs truncate" title={rule.itemB}>
                        {rule.itemB}
                      </td>
                      <td className="py-3 px-3 text-slate-700">{rule.support}%</td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{rule.confidence}%</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {rule.lift}x Lift
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        Bundle recommendation on checkout
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-3 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">How to explain this during viva:</span>
                <p className="mt-0.5 leading-relaxed">
                  Support measures popularity of the itemset across all orders. Confidence measures how often B is purchased when A is in the cart. Lift is the ratio of observed support to expected support under statistical independence. Lift = 1.45 means the customer is 45% more likely to buy Item B when Item A is already selected.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: What-If Price Elasticity & Scenario Simulator */}
      {/* ======================================================== */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-2xs">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded mb-1">
                <Sliders className="w-3.5 h-3.5" />
                <span>Microeconomic Modeling: Price Elasticity of Demand (Ed)</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Interactive Revenue & Profit What-If Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Simulate how changes in promotional discount percentage and marketing investment impact order demand, projected revenue, and gross profit.
              </p>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Store Discount Rate:</span>
                  <span className="text-indigo-600 text-sm font-extrabold">{discountPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">Reduces price per unit; triggers demand uplift.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Price Elasticity (Ed):</span>
                  <span className="text-indigo-600 text-sm font-extrabold">{priceElasticity}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={priceElasticity}
                  onChange={(e) => setPriceElasticity(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">|Ed| &gt; 1 indicates price-sensitive customer base.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Digital Ad Spend ($):</span>
                  <span className="text-indigo-600 text-sm font-extrabold">${adSpend}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1500"
                  step="50"
                  value={adSpend}
                  onChange={(e) => setAdSpend(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">Simulates traffic acquisition through ad channels.</p>
              </div>
            </div>

            {/* Simulated Outcome KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-slate-500">Projected Revenue</span>
                <div className="text-2xl font-extrabold text-slate-900">
                  ${simulatedRevenue.toLocaleString()}
                </div>
                <div className="text-xs font-semibold">
                  <span className={revenueDifference >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {revenueDifference >= 0 ? `+$${revenueDifference.toLocaleString()}` : `-$${Math.abs(revenueDifference).toLocaleString()}`}
                  </span>
                  <span className="text-slate-400 font-normal"> vs baseline</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-slate-500">Unit Volume Uplift</span>
                <div className="text-2xl font-extrabold text-indigo-600">
                  +{Math.round(quantityUpliftPercent)}%
                </div>
                <div className="text-xs text-slate-500">
                  Estimated extra units sold
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-slate-500">Estimated Gross Profit</span>
                <div className="text-2xl font-extrabold text-slate-900">
                  ${simulatedGrossProfit.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">
                  Net of COGS (55%) and Ad Spend
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ML Models Summary Box (Academic Evaluation Reference) */}
      {/* ======================================================== */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-5 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold">
              Machine Learning Models Summary in DataCart
            </h3>
            <p className="text-xs text-slate-400">
              Complete reference guide for practical examination and thesis evaluation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
              Model 1: NLP
            </span>
            <div className="font-bold text-white text-sm">TF-IDF & Cosine Similarity</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>Algorithm:</strong> Content-Based Filtering. Computes term vectors across titles and descriptions; calculates angular cosine distance for top 4 similar items.
            </p>
            <div className="text-indigo-400 text-[10px] font-mono">sklearn.TfidfVectorizer</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
              Model 2: Supervised
            </span>
            <div className="font-bold text-white text-sm">Time-Series Linear Regression</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>Algorithm:</strong> Ordinary Least Squares (OLS) regression (y = mx + c). Projects monthly sales 3 months out with R² score and MAE metrics.
            </p>
            <div className="text-amber-400 text-[10px] font-mono">sklearn.LinearRegression</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
              Model 3: Unsupervised
            </span>
            <div className="font-bold text-white text-sm">Customer RFM Clustering</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>Algorithm:</strong> Recency, Frequency & Monetary behavioral segmentation. Classifies users into VIP Champions, Regulars, and At-Risk cohorts.
            </p>
            <div className="text-blue-400 text-[10px] font-mono">RFM Quintile Clustering</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
              Model 4: Association
            </span>
            <div className="font-bold text-white text-sm">Apriori Market Basket Analysis</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>Algorithm:</strong> Association rule mining evaluating transaction co-occurrences. Computes Support, Confidence, and Lift ratios (&gt; 1.0).
            </p>
            <div className="text-emerald-400 text-[10px] font-mono">Apriori Co-occurrence</div>
          </div>
        </div>
      </div>
    </div>
  );
};
