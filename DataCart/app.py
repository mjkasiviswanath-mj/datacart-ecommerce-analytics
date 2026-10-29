"""
DataCart - E-Commerce Sales & Data Analytics Platform
College Data Science Programming Subject Project

Full-Stack Flask Server with SQLite, Pandas/NumPy Analytics, and Scikit-learn Recommendations.
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
import sqlite3
import os
import pandas as pd
from data_science.analysis import (
    load_sales_data,
    calculate_sales_metrics,
    calculate_category_sales,
    calculate_monthly_sales,
    calculate_top_products,
    calculate_customer_spending
)
from data_science.recommendation import create_recommendation_matrix, get_recommendations

app = Flask(__name__)
app.secret_key = 'datacart_flask_secret_key_2026'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, 'database.db')

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

# ----------------- WEB PAGES (HTML TEMPLATES) ----------------- #

@app.route('/')
def index():
    """Home Page with search, featured items, and category highlights."""
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM products LIMIT 8').fetchall()
    conn.close()
    return render_template('index.html', products=products)

@app.route('/products')
def products():
    """Catalog with filtering by category and search."""
    category = request.args.get('category', 'All')
    search = request.args.get('search', '').strip()
    
    conn = get_db_connection()
    query = 'SELECT * FROM products WHERE 1=1'
    params = []
    
    if category and category != 'All':
        query += ' AND category = ?'
        params.append(category)
        
    if search:
        query += ' AND (name LIKE ? OR description LIKE ?)'
        params.extend([f'%{search}%', f'%{search}%'])
        
    products_list = conn.execute(query, params).fetchall()
    conn.close()
    return render_template('products.html', products=products_list, selected_category=category, search=search)

@app.route('/product/<product_id>')
def product_detail(product_id):
    """Product Detail Page with ML Content-Based Recommendations."""
    conn = get_db_connection()
    product = conn.execute('SELECT * FROM products WHERE id = ?', (product_id,)).fetchone()
    
    if not product:
        flash('Product not found', 'danger')
        conn.close()
        return redirect(url_for('products'))
        
    # Generate recommendations using Scikit-learn
    all_products_df = pd.read_sql_query('SELECT * FROM products', conn)
    cosine_sim = create_recommendation_matrix(all_products_df)
    recommendations = get_recommendations(product_id, all_products_df, cosine_sim, top_n=4)
    
    conn.close()
    return render_template('product.html', product=product, recommendations=recommendations)

@app.route('/cart')
def cart():
    """Shopping Cart view."""
    user_id = session.get('user_id', 'u-cust-1') # fallback to demo user
    conn = get_db_connection()
    cart_items = conn.execute('''
        SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image, p.stock
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    ''', (user_id,)).fetchall()
    
    subtotal = sum(item['price'] * item['quantity'] for item in cart_items)
    shipping = 0 if subtotal > 200 else (15 if subtotal > 0 else 0)
    grand_total = subtotal + shipping
    
    conn.close()
    return render_template('cart.html', cart_items=cart_items, subtotal=subtotal, shipping=shipping, grand_total=grand_total)

@app.route('/add-to-cart/<product_id>')
def add_to_cart(product_id):
    """Adds a product to the user's cart."""
    user_id = session.get('user_id', 'u-cust-1')
    conn = get_db_connection()
    existing = conn.execute('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', (user_id, product_id)).fetchone()
    if existing:
        conn.execute('UPDATE cart SET quantity = quantity + 1 WHERE id = ?', (existing['id'],))
    else:
        import uuid
        conn.execute('INSERT INTO cart (id, user_id, product_id, quantity) VALUES (?, ?, ?, 1)',
                     (f"c-{uuid.uuid4().hex[:8]}", user_id, product_id))
    conn.commit()
    conn.close()
    flash('Item added to cart!', 'success')
    return redirect(url_for('cart'))

@app.route('/cart/remove/<cart_id>')
def remove_from_cart(cart_id):
    """Removes an item from the cart."""
    conn = get_db_connection()
    conn.execute('DELETE FROM cart WHERE id = ?', (cart_id,))
    conn.commit()
    conn.close()
    flash('Item removed from cart!', 'info')
    return redirect(url_for('cart'))

@app.route('/checkout', methods=['GET', 'POST'])
def checkout():
    """Checkout Page with dummy payment and order generation."""
    user_id = session.get('user_id', 'u-cust-1')
    conn = get_db_connection()
    
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        address = request.form.get('address')
        city = request.form.get('city')
        pincode = request.form.get('pincode')
        payment_method = request.form.get('payment_method', 'UPI')
        
        # Calculate totals from cart
        cart_items = conn.execute('SELECT * FROM cart WHERE user_id = ?', (user_id,)).fetchall()
        if not cart_items:
            flash('Your cart is empty', 'warning')
            return redirect(url_for('products'))
            
        import random, datetime
        order_id = f"ORD-2026-{random.randint(1000, 9999)}"
        order_date = datetime.date.today().isoformat()
        
        total_amount = 0
        for item in cart_items:
            p = conn.execute('SELECT price FROM products WHERE id = ?', (item['product_id'],)).fetchone()
            total_amount += p['price'] * item['quantity']
            
        # Create order in SQLite
        conn.execute('''
            INSERT INTO orders (id, user_id, order_date, total_amount, status, payment_method, shipping_address, city, pincode)
            VALUES (?, ?, ?, ?, 'Confirmed', ?, ?, ?, ?)
        ''', (order_id, user_id, order_date, total_amount, payment_method, address, city, pincode))
        
        # Clear cart
        conn.execute('DELETE FROM cart WHERE user_id = ?', (user_id,))
        conn.commit()
        conn.close()
        
        flash(f'Order {order_id} placed successfully!', 'success')
        return redirect(url_for('orders'))
        
    conn.close()
    return render_template('checkout.html')

@app.route('/orders')
def orders():
    """Customer order history."""
    user_id = session.get('user_id', 'u-cust-1')
    conn = get_db_connection()
    user_orders = conn.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC', (user_id,)).fetchall()
    conn.close()
    return render_template('orders.html', orders=user_orders)

@app.route('/admin')
def admin_dashboard():
    """Admin Dashboard showing cards and quick actions."""
    if session.get('role') != 'admin':
        # Default allow for demo convenience
        session['role'] = 'admin'
        
    conn = get_db_connection()
    products_count = conn.execute('SELECT COUNT(*) FROM products').fetchone()[0]
    users_count = conn.execute('SELECT COUNT(*) FROM users WHERE role = "customer"').fetchone()[0]
    orders_count = conn.execute('SELECT COUNT(*) FROM orders').fetchone()[0]
    revenue_sum = conn.execute('SELECT SUM(total_amount) FROM orders WHERE status != "Cancelled"').fetchone()[0] or 0
    
    conn.close()
    return render_template('admin.html', products_count=products_count, users_count=users_count, orders_count=orders_count, total_revenue=round(revenue_sum))

@app.route('/analytics')
def analytics():
    """Dedicated Data Science Sales Analytics with Chart.js."""
    return render_template('analytics.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """User Login route."""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE email = ? AND password = ?', (email, password)).fetchone()
        conn.close()
        if user:
            session['user_id'] = user['id']
            session['user_name'] = user['name']
            session['role'] = user['role']
            flash('Logged in successfully!', 'success')
            return redirect(url_for('admin_dashboard' if user['role'] == 'admin' else 'index'))
        else:
            flash('Invalid email or password', 'danger')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Customer registration route."""
    return render_template('register.html')

# ----------------- REST JSON API ENDPOINTS ----------------- #

@app.route('/api/products')
def api_products():
    """Returns products JSON list."""
    conn = get_db_connection()
    prods = conn.execute('SELECT * FROM products').fetchall()
    conn.close()
    return jsonify([dict(p) for p in prods])

@app.route('/api/sales')
def api_sales():
    csv_path = os.path.join(BASE_DIR, 'orders.csv')
    if not os.path.exists(csv_path):
        csv_path = os.path.join(os.path.dirname(BASE_DIR), 'orders.csv')
    df = load_sales_data(csv_path)
    metrics = calculate_sales_metrics(df)
    category_sales = calculate_category_sales(df).to_dict(orient='records')
    monthly_sales = calculate_monthly_sales(df).to_dict(orient='records')
    top_products = calculate_top_products(df).to_dict(orient='records')
    customer_spending = calculate_customer_spending(df).head(10).to_dict(orient='records')
    
    return jsonify({
        'metrics': metrics,
        'category_sales': category_sales,
        'monthly_sales': monthly_sales,
        'top_products': top_products,
        'customer_spending': customer_spending
    })

@app.route('/api/recommendations/<product_id>')
def api_recommendations(product_id):
    """Returns Scikit-learn TF-IDF recommendations for a product."""
    conn = get_db_connection()
    df = pd.read_sql_query('SELECT * FROM products', conn)
    conn.close()
    sim_matrix = create_recommendation_matrix(df)
    recs = get_recommendations(product_id, df, sim_matrix, top_n=4)
    return jsonify(recs)

if __name__ == '__main__':
    print("====================================================")
    print(" DataCart - E-Commerce Sales & Analytics Server")
    print(" Running at http://127.0.0.1:5000")
    print(" Default Admin: admin@datacart.com / admin123")
    print("====================================================")
    app.run(debug=True, port=5000)
