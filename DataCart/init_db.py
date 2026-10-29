"""
DataCart - SQLite Database Initialization & Seeding Script
College Data Science Programming Project

Creates the 5 SQLite tables:
1. users
2. products
3. cart
4. orders
5. order_items

Seeds 2 admin accounts, 8 sample customers, 24 products, and 30+ orders.
"""

import sqlite3
import os
import csv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, 'database.db')
CSV_FILE = os.path.join(BASE_DIR, 'orders.csv')
if not os.path.exists(CSV_FILE):
    CSV_FILE = os.path.join(os.path.dirname(BASE_DIR), 'orders.csv')

PRODUCTS_DATA = [
    # Electronics
    ('p-1', 'Sony WH-1000XM5 Wireless Headphones', 'Electronics', 349.0, 25, 4.8,
     'Industry-leading noise canceling wireless headphones with dual processors, 8 microphones, LDAC audio, and 30-hour battery life.',
     'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'),
    ('p-2', 'Bose SoundLink Revolve+ II Bluetooth Speaker', 'Electronics', 299.0, 18, 4.6,
     'Deep, loud and immersive 360-degree portable sound with water-resistant design and flexible fabric handle.',
     'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80'),
    ('p-3', 'Logitech MX Master 3S Wireless Mouse', 'Electronics', 99.0, 45, 4.9,
     'Quiet clicking ergonomic performance mouse with 8K DPI track-on-glass sensor and MagSpeed electromagnetic scrolling.',
     'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'),
    ('p-4', 'Apple AirPods Pro 2nd Gen USB-C', 'Electronics', 249.0, 30, 4.7,
     'Up to 2x more Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio, and precision finding case.',
     'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80'),

    # Laptops
    ('p-5', 'Apple MacBook Air 15" M2 Chip', 'Laptops', 1199.0, 15, 4.9,
     'Impossibly thin 15-inch Liquid Retina display, fast M2 processor, 18-hour battery, silent fanless design with 16GB unified memory.',
     'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'),
    ('p-6', 'Dell XPS 13 Plus Ultrabook', 'Laptops', 1299.0, 12, 4.5,
     'Stunning minimalist design with zero-lattice keyboard, seamless glass haptic touchpad, and 3.5K OLED touch display.',
     'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80'),
    ('p-7', 'Lenovo ThinkPad X1 Carbon Gen 11', 'Laptops', 1399.0, 10, 4.8,
     'Legendary business ultrabook with ultralight carbon fiber chassis, spill-resistant keyboard, and enterprise security features.',
     'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'),
    ('p-8', 'HP Envy 15 x360 2-in-1 Touch Laptop', 'Laptops', 899.0, 20, 4.4,
     'Flexible 360-degree convertible hinge laptop with stylus support, AMD Ryzen 7 processor, and vibrant IPS touchscreen.',
     'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'),

    # Mobile Phones
    ('p-9', 'Samsung Galaxy S24 Ultra 5G', 'Mobile Phones', 1299.0, 22, 4.8,
     'Titanium frame, 200MP camera system with AI zoom, built-in S-Pen, Snapdragon 8 Gen 3, and flat Dynamic AMOLED 2X screen.',
     'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80'),
    ('p-10', 'Apple iPhone 15 Pro Max', 'Mobile Phones', 1199.0, 25, 4.9,
     'Forged in titanium with A17 Pro chip, Action button, 5x telephoto optical zoom, and Super Retina XDR display with ProMotion.',
     'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80'),
    ('p-11', 'Google Pixel 8 Pro AI Smartphone', 'Mobile Phones', 999.0, 16, 4.6,
     'Super Actua display, Google Tensor G3 chip, advanced AI computational photography, Magic Editor, and temperature sensor.',
     'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'),
    ('p-12', 'OnePlus 12 5G Hasselblad Edition', 'Mobile Phones', 799.0, 28, 4.5,
     'Snapdragon 8 Gen 3 with 4th Gen Hasselblad camera for mobile, 5400mAh battery with 100W SuperVOOC ultra-fast charging.',
     'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80'),

    # Accessories
    ('p-13', 'Anker 737 GaN 120W Fast Charger', 'Accessories', 69.0, 50, 4.8,
     'Compact 3-port high-speed GaNPrime charger capable of charging a laptop, tablet, and phone simultaneously.',
     'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'),
    ('p-14', 'Ergonomic Aluminum Laptop Stand', 'Accessories', 45.0, 60, 4.7,
     'Fully adjustable height and tilt dual-hinge laptop riser made of solid aircraft-grade anodized aluminum with heat dissipation vents.',
     'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'),
    ('p-15', 'SanDisk Extreme 1TB Portable NVMe SSD', 'Accessories', 119.0, 35, 4.8,
     'Rugged portable solid state drive with up to 1050MB/s read speeds, IP65 water and dust resistance, and 2-meter drop protection.',
     'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80'),
    ('p-16', 'Keychron K2 Mechanical RGB Keyboard', 'Accessories', 89.0, 32, 4.7,
     '75% compact wireless mechanical keyboard with Gateron G Pro switches, RGB backlighting, Mac/Windows layout switch, and hot-swappable PCB.',
     'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'),

    # Books
    ('p-17', 'Python for Data Analysis (3rd Edition)', 'Books', 49.0, 40, 4.9,
     'The definitive guide to manipulating, processing, cleaning, and crunching datasets in Python written by Wes McKinney, creator of the Pandas project.',
     'https://images.unsplash.com/photo-1532012164546-f432f2e37b7b?auto=format&fit=crop&w=800&q=80'),
    ('p-18', 'Hands-On Machine Learning with Scikit-Learn & TensorFlow', 'Books', 59.0, 35, 4.9,
     'By Aurélien Géron. Comprehensive practical reference covering classification, regression, clustering, neural networks, and deep learning architectures.',
     'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'),
    ('p-19', 'Designing Data-Intensive Applications', 'Books', 52.0, 25, 5.0,
     'By Martin Kleppmann. The big ideas behind reliable, scalable, and maintainable systems: storage engines, distributed transactions, and batch processing.',
     'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'),
    ('p-20', 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Books', 42.0, 30, 4.6,
     'By Robert C. Martin (Uncle Bob). Timeless software engineering principles, refactoring patterns, naming conventions, and unit test disciplines.',
     'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80'),

    # Smart Devices
    ('p-21', 'Amazon Echo Show 8 (3rd Gen) Smart Display', 'Smart Devices', 149.0, 24, 4.6,
     'HD smart touch display with spatial audio, smart home hub with Zigbee & Thread, 13MP camera with auto-framing, and Alexa voice assistant.',
     'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80'),
    ('p-22', 'Apple Watch Series 9 GPS 45mm', 'Smart Devices', 429.0, 18, 4.8,
     'Powerful S9 SiP chip with Double Tap gesture, brighter Always-On display, ECG heart monitor, Crash Detection, and advanced workout tracking.',
     'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'),
    ('p-23', 'Fitbit Charge 6 Fitness Tracker', 'Smart Devices', 159.0, 28, 4.5,
     'Advanced fitness and health tracker with built-in GPS, YouTube Music controls, Google Maps directions, and EDA stress scan sensor.',
     'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=800&q=80'),
    ('p-24', 'TP-Link Kasa Smart Wi-Fi Plug Mini (4-Pack)', 'Smart Devices', 39.0, 45, 4.7,
     'Control connected appliances from anywhere with scheduling, timer, away mode, and energy monitoring via voice or app.',
     'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'),
]

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # 1. users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer',
        phone TEXT,
        address TEXT,
        city TEXT,
        pincode TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ''')
    
    # 2. products table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        rating REAL NOT NULL DEFAULT 4.5,
        description TEXT NOT NULL,
        image TEXT NOT NULL
    );
    ''')
    
    # 3. cart table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS cart (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
    ''')
    
    # 4. orders table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        order_date TEXT NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        payment_method TEXT DEFAULT 'UPI',
        shipping_address TEXT,
        city TEXT,
        pincode TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    ''')
    
    # 5. order_items table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
    ''')
    
    # Seed 2 Admin accounts
    cursor.execute('''
    INSERT OR IGNORE INTO users (id, name, email, password, role)
    VALUES ('u-admin-1', 'Admin Controller', 'admin@datacart.com', 'admin123', 'admin');
    ''')
    cursor.execute('''
    INSERT OR IGNORE INTO users (id, name, email, password, role)
    VALUES ('u-admin-2', 'Inventory Manager', 'manager@datacart.com', 'admin123', 'admin');
    ''')
    
    # Seed Customers
    customers = [
        ('u-cust-1', 'Kasi', 'kasi@example.com', 'password123', 'customer', '+91 98111 22334', '42 MG Road', 'Bengaluru', '560001'),
        ('u-cust-2', 'Priya Patel', 'priya.patel@example.com', 'password123', 'customer', '+91 98222 33445', '108 Nehru Nagar', 'Ahmedabad', '380015'),
        ('u-cust-3', 'Arjun Verma', 'arjun.verma@example.com', 'password123', 'customer', '+91 98333 44556', '24 Park Street', 'Kolkata', '700016'),
        ('u-cust-4', 'Ananya Sen', 'ananya.sen@example.com', 'password123', 'customer', '+91 98444 55667', '78 Bandra West', 'Mumbai', '400050'),
        ('u-cust-5', 'Rohit Kumar', 'rohit.kumar@example.com', 'password123', 'customer', '+91 98555 66778', '12 Connaught Place', 'New Delhi', '110001'),
        ('u-cust-6', 'Neha Gupta', 'neha.gupta@example.com', 'password123', 'customer', '+91 98666 77889', '55 Anna Salai', 'Chennai', '600002'),
        ('u-cust-7', 'Vikram Aditya', 'vikram.aditya@example.com', 'password123', 'customer', '+91 98777 88990', '19 Jubilee Hills', 'Hyderabad', '500033'),
        ('u-cust-8', 'Kavya Nair', 'kavya.nair@example.com', 'password123', 'customer', '+91 98888 99001', '33 Marine Drive', 'Kochi', '682011'),
    ]
    for c in customers:
        cursor.execute('''
        INSERT OR IGNORE INTO users (id, name, email, password, role, phone, address, city, pincode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        ''', c)

    # Seed 24 Products
    product_name_to_id = {}
    for p in PRODUCTS_DATA:
        product_name_to_id[p[1]] = p[0]
        cursor.execute('''
        INSERT OR REPLACE INTO products (id, name, category, price, stock, rating, description, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        ''', p)

    # Seed Orders and Order Items from orders.csv
    if os.path.exists(CSV_FILE):
        with open(CSV_FILE, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            order_totals = {}
            order_rows = []
            for row in reader:
                order_id = row['Order_ID']
                order_rows.append(row)
                amt = float(row.get('Total_Amount', 0))
                order_totals[order_id] = order_totals.get(order_id, 0.0) + amt

            # Insert unique orders
            seen_orders = set()
            item_seq = 1
            for row in order_rows:
                oid = row['Order_ID']
                if oid not in seen_orders:
                    seen_orders.add(oid)
                    cursor.execute('''
                    INSERT OR REPLACE INTO orders (id, user_id, order_date, total_amount, status, payment_method, shipping_address, city, pincode)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                    ''', (
                        oid,
                        row['Customer_ID'],
                        row['Order_Date'],
                        order_totals[oid],
                        row['Status'],
                        row.get('Payment_Method', 'UPI'),
                        f"{row['Customer_Name']} Address",
                        'Bengaluru',
                        '560001'
                    ))

                # Insert order item
                prod_id = product_name_to_id.get(row['Product'], f"p-{item_seq}")
                cursor.execute('''
                INSERT OR REPLACE INTO order_items (id, order_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?, ?);
                ''', (
                    f"item-{oid}-{item_seq}",
                    oid,
                    prod_id,
                    int(row['Quantity']),
                    float(row['Price'])
                ))
                item_seq += 1

    # Seed sample cart items for customer 1
    cursor.execute('''
    INSERT OR IGNORE INTO cart (id, user_id, product_id, quantity)
    VALUES ('c-sample-1', 'u-cust-1', 'p-1', 1);
    ''')
    cursor.execute('''
    INSERT OR IGNORE INTO cart (id, user_id, product_id, quantity)
    VALUES ('c-sample-2', 'u-cust-1', 'p-17', 2);
    ''')

    conn.commit()
    conn.close()
    print(f"Database {DB_NAME} initialized and seeded successfully with {len(PRODUCTS_DATA)} products, users, and orders!")

if __name__ == '__main__':
    init_db()
