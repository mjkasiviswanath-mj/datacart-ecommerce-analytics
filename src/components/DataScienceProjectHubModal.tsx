import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Code2,
  FileCode,
  Terminal,
  Cpu,
  BarChart,
  HelpCircle,
  Copy,
  Check,
  Download,
  FolderTree,
} from 'lucide-react';
import { generateOrdersCSV, downloadCSVFile } from '../utils/analyticsEngine';
import { Order, Product } from '../types';

interface ProjectHubProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  products: Product[];
}

export const DataScienceProjectHubModal: React.FC<ProjectHubProps> = ({
  isOpen,
  onClose,
  orders,
  products,
}) => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'code' | 'pandas' | 'ml' | 'charts' | 'viva'>('quickstart');
  const [activeCodeFile, setActiveCodeFile] = useState<'app.py' | 'analysis.py' | 'recommendation.py' | 'init_db.py' | 'requirements.txt'>('analysis.py');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CODE_SNIPPETS = {
    'analysis.py': `"""
DataCart - Data Science Analysis Module
College Data Science Programming Project
Uses Python Pandas and NumPy to compute sales metrics, category aggregations, and trends.
"""

import pandas as pd
import numpy as np

def load_sales_data(filepath='orders.csv'):
    """Loads orders dataset into a Pandas DataFrame with proper date parsing."""
    df = pd.read_csv(filepath)
    df['Order_Date'] = pd.to_datetime(df['Order_Date'])
    return df

def calculate_sales_metrics(df):
    """
    Computes key performance indicators (KPIs) using NumPy & Pandas.
    - Total Revenue
    - Average Order Value (AOV)
    - Max / Min transaction amounts
    """
    valid_orders = df[df['Status'] != 'Cancelled']
    total_revenue = np.sum(valid_orders['Total_Amount'])
    avg_order_value = np.mean(valid_orders['Total_Amount'])
    max_sales = np.max(valid_orders['Total_Amount'])
    min_sales = np.min(valid_orders['Total_Amount'])
    total_orders = len(valid_orders)
    
    return {
        'total_revenue': float(total_revenue),
        'average_order_value': round(float(avg_order_value), 2),
        'max_sales': float(max_sales),
        'min_sales': float(min_sales),
        'total_orders': int(total_orders)
    }

def calculate_category_sales(df):
    """
    Aggregates sales by Category using Pandas groupby:
    df.groupby('Category').agg({'Total_Amount': 'sum', 'Quantity': 'sum'})
    """
    cat_summary = df.groupby('Category').agg(
        total_sales=('Total_Amount', 'sum'),
        units_sold=('Quantity', 'sum')
    ).reset_index()
    
    total_rev = cat_summary['total_sales'].sum()
    cat_summary['percentage'] = (cat_summary['total_sales'] / total_rev * 100).round(2)
    return cat_summary.sort_values(by='total_sales', ascending=False)

def calculate_monthly_sales(df):
    """
    Time series grouping of orders by Month.
    """
    monthly = df.copy()
    monthly['Month'] = monthly['Order_Date'].dt.strftime('%b %Y')
    return monthly.groupby('Month')['Total_Amount'].sum().reset_index()

def calculate_customer_spending(df):
    """
    Customer lifetime value analysis:
    df.groupby(['Customer_ID', 'Customer_Name']).agg({'Total_Amount': 'sum', 'Order_ID': 'count'})
    """
    return df.groupby(['Customer_ID', 'Customer_Name']).agg(
        total_spent=('Total_Amount', 'sum'),
        order_count=('Order_ID', 'nunique')
    ).reset_index().sort_values(by='total_spent', ascending=False)
`,
    'recommendation.py': `"""
DataCart - Content-Based Recommendation System
College Data Science Programming Project
Uses Scikit-learn's TfidfVectorizer and cosine_similarity to recommend similar products.
"""

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def create_recommendation_model(products_df):
    """
    Combines text attributes into a content corpus:
    - Product Category (weighted)
    - Product Name
    - Product Description
    Then fits a TF-IDF vectorizer and builds the cosine similarity matrix.
    """
    # Create combined feature string for each product
    products_df['corpus'] = (
        products_df['Category'] + " " +
        products_df['Category'] + " " + 
        products_df['Name'] + " " +
        products_df['Description']
    )
    
    # TF-IDF Vectorizer with standard English stop words removal
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(products_df['corpus'])
    
    # Compute pairwise Cosine Similarity Matrix: S = (A . B) / (||A|| * ||B||)
    cosine_sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
    return cosine_sim_matrix

def recommend_products(product_id, products_df, cosine_sim, top_n=4):
    """
    Returns top N similar products for a given product ID.
    """
    if product_id not in products_df['Product_ID'].values:
        return []
        
    idx = products_df[products_df['Product_ID'] == product_id].index[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    
    # Sort descending by cosine similarity score, excluding self (item 0)
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = [s for s in sim_scores if s[0] != idx][:top_n]
    
    rec_indices = [i[0] for i in sim_scores]
    return products_df.iloc[rec_indices].to_dict(orient='records')
`,
    'app.py': `"""
DataCart - Flask Web Application Entry Point
College Data Science Programming Project
"""

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import sqlite3
import pandas as pd
from data_science.analysis import calculate_sales_metrics, calculate_category_sales
from data_science.recommendation import create_recommendation_model, recommend_products

app = Flask(__name__)
app.secret_key = 'datacart-college-secret-key-2026'
DB_PATH = 'database.db'

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def home():
    conn = get_db()
    products = conn.execute('SELECT * FROM products LIMIT 8').fetchall()
    return render_template('index.html', products=products)

@app.route('/api/products')
def api_products():
    conn = get_db()
    products = conn.execute('SELECT * FROM products').fetchall()
    return jsonify([dict(ix) for ix in products])

@app.route('/api/sales')
def api_sales():
    df = pd.read_csv('orders.csv')
    metrics = calculate_sales_metrics(df)
    categories = calculate_category_sales(df).to_dict(orient='records')
    return jsonify({'metrics': metrics, 'categories': categories})

@app.route('/api/recommendations/<product_id>')
def api_recommendations(product_id):
    conn = get_db()
    products_df = pd.read_sql_query('SELECT * FROM products', conn)
    cosine_sim = create_recommendation_model(products_df)
    recs = recommend_products(product_id, products_df, cosine_sim)
    return jsonify(recs)

if __name__ == '__main__':
    print("Starting DataCart on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
`,
    'init_db.py': `"""
DataCart - Database Initialization & Seeding Script
Creates SQLite tables: users, products, cart, orders, order_items
"""

import sqlite3

def init_database():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # 1. users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer'
    )
    ''')
    
    # 2. products table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        rating REAL NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL
    )
    ''')
    
    # 3. cart table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS cart (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1
    )
    ''')
    
    # 4. orders table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        order_date TEXT NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending'
    )
    ''')
    
    # 5. order_items table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL
    )
    ''')
    
    # Seed default admin
    cursor.execute('''
    INSERT OR IGNORE INTO users (id, name, email, password, role)
    VALUES ('u-admin-1', 'Admin Controller', 'admin@datacart.com', 'admin123', 'admin')
    ''')
    
    conn.commit()
    conn.close()
    print("SQLite database.db tables created successfully!")

if __name__ == '__main__':
    init_database()
`,
    'requirements.txt': `flask==3.0.3
pandas==2.2.2
numpy==1.26.4
scikit-learn==1.5.0
`
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                DataCart Architecture & Technical Guide
              </h2>
              <p className="text-xs text-slate-400">
                DataCart: Flask, Pandas, NumPy, Scikit-learn, Chart.js & SQLite
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 overflow-x-auto text-xs font-semibold scrollbar-none">
          {[
            { id: 'quickstart', label: '1. Setup & Run Instructions', icon: Terminal },
            { id: 'code', label: '2. Python Source Code', icon: Code2 },
            { id: 'pandas', label: '3. Pandas & NumPy Usage', icon: FileCode },
            { id: 'ml', label: '4. Recommendation ML (TF-IDF)', icon: Cpu },
            { id: 'charts', label: '5. Chart.js Explanations', icon: BarChart },
            { id: 'viva', label: '6. Viva Q&A Cheat Sheet', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 text-sm flex-1">
          {/* TAB 1: QUICKSTART */}
          {activeTab === 'quickstart' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  How to Install Dependencies & Run the Project Locally
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Follow these simple steps on macOS, Linux, or Windows (WSL/Command Prompt).
                </p>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-xs text-indigo-700">Step 1: Install Python Dependencies</div>
                  <p className="text-xs text-slate-600">
                    Create a Python virtual environment and install Flask, Pandas, NumPy, and Scikit-learn:
                  </p>
                  <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
{`python3 -m venv venv
source venv/bin/activate    # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt`}
                  </pre>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-xs text-indigo-700">Step 2: Initialize SQLite Database</div>
                  <p className="text-xs text-slate-600">
                    Execute the database creation script to bootstrap tables (users, products, orders, cart) and seed initial accounts:
                  </p>
                  <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
{`python init_db.py`}
                  </pre>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-xs text-indigo-700">Step 3: Start the Flask Server</div>
                  <p className="text-xs text-slate-600">
                    Run the main Flask application:
                  </p>
                  <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
{`python app.py`}
                  </pre>
                  <p className="text-xs text-slate-500">
                    Open your web browser and navigate to: <code className="text-indigo-600 font-bold">http://127.0.0.1:5000</code>
                  </p>
                </div>

                {/* Step 4: Default Admin Credentials */}
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 space-y-2">
                  <div className="font-bold text-xs text-indigo-900">Step 4: Default Login Credentials</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-indigo-100">
                      <span className="font-bold text-slate-900">Admin Account</span>
                      <div className="text-slate-600 mt-1">Email: <code className="text-indigo-700 font-bold">admin@datacart.com</code></div>
                      <div className="text-slate-600">Password: <code className="text-indigo-700 font-bold">admin123</code></div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-indigo-100">
                      <span className="font-bold text-slate-900">Sample Customer Account (Kasi)</span>
                      <div className="text-slate-600 mt-1">Email: <code className="text-slate-800 font-bold">kasi@example.com</code></div>
                      <div className="text-slate-600">Password: <code className="text-slate-800 font-bold">password123</code></div>
                    </div>
                  </div>
                </div>

                {/* Project Directory Layout */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <FolderTree className="w-4 h-4 text-indigo-600" />
                    <span>Project Folder Structure (Section 18)</span>
                  </div>
                  <pre className="bg-slate-900 text-slate-200 p-3.5 rounded-lg text-xs font-mono overflow-x-auto">
{`DataCart/
├── app.py                     # Flask application entry & REST API routes
├── database.db                # SQLite database (embedded relational store)
├── init_db.py                 # SQLite schema creation & sample data seeding
├── requirements.txt           # Python library dependencies (flask, pandas, scikit-learn)
├── orders.csv                 # Raw dataset for Pandas time series & sales analytics
├── templates/                 # Jinja2 HTML templates (products, cart, analytics, etc.)
├── static/                    # CSS stylesheets, Chart.js scripts, and product images
└── data_science/
    ├── analysis.py            # Pandas & NumPy statistical aggregations
    └── recommendation.py     # Scikit-learn TF-IDF & Cosine Similarity ML engine`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE VIEWER */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Standalone Python Source Code
                  </h3>
                  <p className="text-xs text-slate-500">
                    Modular, beginner-friendly code written for standard Flask and Data Science packages.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyCode(CODE_SNIPPETS[activeCodeFile])}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* File Selector Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                {(Object.keys(CODE_SNIPPETS) as (keyof typeof CODE_SNIPPETS)[]).map((fileName) => (
                  <button
                    key={fileName}
                    onClick={() => setActiveCodeFile(fileName)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs transition cursor-pointer ${
                      activeCodeFile === fileName
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {fileName}
                  </button>
                ))}
              </div>

              {/* Code display block */}
              <div className="relative">
                <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
                  {CODE_SNIPPETS[activeCodeFile]}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: PANDAS EXPLANATION */}
          {activeTab === 'pandas' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Explanation of How Pandas and NumPy Are Used
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Key operations implemented in <code className="text-indigo-600">data_science/analysis.py</code>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">1. Loading & Time Parsing</h4>
                  <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-[11px]">
{`df = pd.read_csv('orders.csv')
df['Order_Date'] = pd.to_datetime(df['Order_Date'])`}
                  </pre>
                  <p className="text-slate-600 leading-relaxed">
                    Pandas <code className="font-mono">to_datetime</code> converts string timestamps into datetime objects, enabling time-series slicing and period extraction.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">2. Statistical Metric Calculations</h4>
                  <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-[11px]">
{`revenue = np.sum(valid_orders['Total_Amount'])
aov = np.mean(valid_orders['Total_Amount'])`}
                  </pre>
                  <p className="text-slate-600 leading-relaxed">
                    NumPy vectorized functions <code className="font-mono">np.sum</code> and <code className="font-mono">np.mean</code> calculate total revenue and Average Order Value with high computational efficiency.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">3. Category-Wise Aggregations</h4>
                  <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-[11px]">
{`df.groupby('Category').agg({
    'Total_Amount': 'sum',
    'Quantity': 'sum'
}).reset_index()`}
                  </pre>
                  <p className="text-slate-600 leading-relaxed">
                    Splits the dataset into categories and applies aggregate math to find which departments generate the most sales.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">4. Customer Lifetime Value</h4>
                  <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-[11px]">
{`df.groupby('Customer_ID').agg({
    'Total_Amount': 'sum',
    'Order_ID': 'nunique'
}).sort_values('Total_Amount', ascending=False)`}
                  </pre>
                  <p className="text-slate-600 leading-relaxed">
                    Identifies high-value customers and computes purchase frequencies for CRM targeting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RECOMMENDATION ML */}
          {activeTab === 'ml' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Content-Based Product Recommendation Machine Learning
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  How TF-IDF and Cosine Similarity deliver personalized recommendations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-3 text-xs">
                <div className="font-bold text-indigo-900 text-sm">Mathematical Formulation:</div>
                <div className="space-y-2 text-slate-700 leading-relaxed">
                  <p>
                    <strong>1. Term Frequency (TF):</strong> Measures how frequently term <em>t</em> appears in product description <em>d</em>.
                  </p>
                  <p>
                    <strong>2. Inverse Document Frequency (IDF):</strong> <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-100">IDF(t) = log((1 + N) / (1 + df(t))) + 1</code>. Diminishes the weight of ubiquitous terms (e.g., "device", "quality") and highlights unique features (e.g., "noise cancellation", "mechanical").
                  </p>
                  <p>
                    <strong>3. Cosine Similarity Formula:</strong>
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-indigo-200 font-mono text-center text-indigo-700 font-bold">
                    Similarity(A, B) = cos(θ) = (A · B) / (||A|| × ||B||)
                  </div>
                  <p>
                    Cosine similarity measures the angle between the two multidimensional TF-IDF vectors. A score of 1.0 represents an identical match, while 0.0 indicates completely orthogonal, unrelated content.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CHART EXPLANATIONS */}
          {activeTab === 'charts' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Explanation of Each Analytics Visualization
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Guide for describing the Chart.js visualizations during project defense.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="font-bold text-indigo-600">1. Monthly Sales (Line Chart):</span>
                  <p className="text-slate-600 mt-1">
                    Visualizes longitudinal revenue trajectory over 8 months. Helps identify seasonal peaks, promotions, and growth trends.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="font-bold text-blue-600">2. Category-wise Sales (Bar Chart):</span>
                  <p className="text-slate-600 mt-1">
                    Compares aggregate sales volume across Electronics, Laptops, Mobile Phones, Accessories, Books, and Smart Devices.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="font-bold text-teal-600">3. Sales Distribution (Doughnut Chart):</span>
                  <p className="text-slate-600 mt-1">
                    Shows percentage contribution of each department towards the total company revenue pool.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="font-bold text-purple-600">4. Top 10 Products (Horizontal Bar Chart):</span>
                  <p className="text-slate-600 mt-1">
                    Identifies top-selling individual SKUs (e.g. MacBook Air, ThinkPad, Galaxy S24) generating the highest cash flow.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="font-bold text-amber-600">5. Order Status (Doughnut Chart):</span>
                  <p className="text-slate-600 mt-1">
                    Operational logistics overview tracking orders through Pending, Confirmed, Shipped, Delivered, and Cancelled phases.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="font-bold text-sky-600">6. Customer Spending (Bar Chart):</span>
                  <p className="text-slate-600 mt-1">
                    Displays high-value accounts and Pareto distribution (identifying VIP customers contributing outsized revenue).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: VIVA CHEAT SHEET */}
          {activeTab === 'viva' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Viva / Lab Evaluation Questions & Model Answers
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Common questions examiners ask during Data Science Programming practical exams:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-slate-900">Q1: Why use SQLite for an e-commerce data science project?</div>
                  <div className="text-slate-600 leading-relaxed">
                    <strong>Ans:</strong> SQLite is a self-contained, serverless, zero-configuration SQL engine stored in a single <code className="font-mono">database.db</code> file. It provides full relational ACID guarantees without requiring separate server setups like MySQL/Postgres, making it ideal for portable demos and direct Pandas <code className="font-mono">pd.read_sql_query()</code> integration.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-slate-900">Q2: What is the difference between Content-Based and Collaborative Filtering?</div>
                  <div className="text-slate-600 leading-relaxed">
                    <strong>Ans:</strong> <em>Content-Based Filtering</em> (used here) recommends items by matching the attributes (category, description, features) of items previously liked by the user using TF-IDF. <em>Collaborative Filtering</em> recommends items based on the purchase patterns of other similar users. Content-based does not suffer from the "cold start" problem for new products.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-slate-900">Q3: How does Chart.js communicate with the backend?</div>
                  <div className="text-slate-600 leading-relaxed">
                    <strong>Ans:</strong> The frontend makes asynchronous REST API calls to endpoints like <code className="font-mono">/api/sales</code> and <code className="font-mono">/api/products</code>. The Python backend processes the data with Pandas and serializes the summary tables into JSON, which Chart.js renders dynamically on HTML5 canvas elements.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
