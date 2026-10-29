# DataCart – E-Commerce Sales & Data Analytics Platform
**College Data Science Programming Subject Project**

“Shop smarter with data-driven insights.”

---

## 1. Project Overview
DataCart is a full-stack educational e-commerce and data science platform designed for a college **Data Science Programming** coursework demonstration. It provides a simple, clean, modern, beginner-friendly interface that integrates:
- **Full-stack E-Commerce Operations**: Customer catalog, search, category filters, cart, checkout simulation, and order history.
- **Admin Dashboard**: Real-time KPI summary cards, product inventory CRUD, and order fulfillment status updates.
- **Data Science Analytics Module**: Powered by Python **Pandas** and **NumPy** to calculate statistical aggregations and time-series trends.
- **Data Visualizations**: 6 responsive charts rendered via **Chart.js**.
- **Machine Learning Product Recommendation**: Content-based recommendation algorithm utilizing **TF-IDF vectorization** and **Cosine Similarity** via **Scikit-learn**.
- **Relational Storage**: Embedded **SQLite** database (`database.db`).

---

## 2. Default Login Credentials
- **Admin Email**: `admin@datacart.com`
- **Admin Password**: `admin123`
- **Customer Email**: `kasi@example.com` (Kasi)
- **Customer Password**: `password123`

---

## 3. How to Install Dependencies
Open your terminal in the `DataCart/` project directory:
```bash
# 1. Create a virtual environment (recommended)
python3 -m venv venv

# 2. Activate the virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows (cmd/PowerShell):
venv\Scripts\activate

# 3. Install required packages
pip install -r requirements.txt
```

---

## 4. How to Initialize the SQLite Database
Run the provided database script to create the tables (`users`, `products`, `cart`, `orders`, `order_items`) and seed initial demo records:
```bash
python init_db.py
```
This generates the local file `database.db`.

---

## 5. How to Start the Flask Server
```bash
python app.py
```
Open your web browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 6. Project Folder Structure
```text
DataCart/
│
├── app.py                     # Main Flask web application and REST API endpoints
├── database.db                # SQLite database file
├── init_db.py                 # SQLite database creation & seeding script
├── requirements.txt           # Python library dependencies (flask, pandas, scikit-learn)
├── orders.csv                 # Raw dataset for sales analytics
├── README.md                  # Complete documentation and viva guide
│
├── templates/                 # Jinja2 HTML views
│   ├── index.html             # Home page with search & featured products
│   ├── login.html             # User login page
│   ├── register.html          # Customer registration page
│   ├── products.html          # Product catalog with category filter
│   ├── product.html           # Product detail with ML recommendations
│   ├── cart.html              # Shopping cart with quantity modification
│   ├── checkout.html          # Checkout form with dummy payment options
│   ├── orders.html            # Customer order history
│   ├── admin.html             # Admin dashboard with management tables
│   └── analytics.html         # Data science analytics dashboard with Chart.js
│
├── static/
│   ├── css/
│   │   └── style.css          # Clean custom CSS styling
│   └── js/
│       └── script.js          # Client-side scripts
│
└── data_science/
    ├── analysis.py            # Python module using Pandas & NumPy
    └── recommendation.py     # Content-based recommendation module with Scikit-learn
```

---

## 7. Explanation of How Pandas and NumPy Are Used
In `data_science/analysis.py`:
1. **Loading Data**:
   ```python
   df = pd.read_csv('orders.csv')
   df['Order_Date'] = pd.to_datetime(df['Order_Date'])
   ```
2. **Key Performance Indicators**:
   - `total_revenue = np.sum(valid_orders['Total_Amount'])`: Sum of sales.
   - `avg_order_value = np.mean(valid_orders['Total_Amount'])`: Mathematical average order value (AOV).
   - `max_sales = np.max(valid_orders['Total_Amount'])`: Highest single transaction.
3. **Category-wise Aggregation**:
   ```python
   df.groupby('Category').agg({'Total_Amount': 'sum', 'Quantity': 'sum'})
   ```
   Computes department revenues and sales volume shares.
4. **Time-Series Analysis**:
   ```python
   df['Month'] = df['Order_Date'].dt.to_period('M')
   df.groupby('Month')['Total_Amount'].sum()
   ```
   Aggregates revenue across months to discover trends.

---

## 8. Explanation of How the Recommendation System Works
In `data_science/recommendation.py`:
1. **Content Corpus Extraction**: For every product, we concatenate category, title, description, and key features into a textual document.
2. **TF-IDF Vectorization**:
   - **TF (Term Frequency)**: Frequency of term $t$ in product description $d$.
   - **IDF (Inverse Document Frequency)**: $\log\left(\frac{1 + N}{1 + \text{df}(t)}\right) + 1$. Down-weights ubiquitous generic words while giving high weight to unique distinguishing keywords.
3. **Cosine Similarity**:
   $$\text{Cosine Similarity}(\mathbf{A}, \mathbf{B}) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$
   Computes the angular similarity between the multidimensional product vectors.
4. **Ranking**: When a user inspects a product, the top 4 candidates with the highest similarity scores are returned as **“Recommended For You”**.

---

## 9. Explanation of Each Analytics Chart
1. **Monthly Sales (Line Chart)**: Illustrates sales trajectory across 8 months to track revenue growth and seasonality.
2. **Category-wise Sales (Bar Chart)**: Compares total sales across categories (Electronics, Laptops, Mobile Phones, Accessories, Books, Smart Devices).
3. **Sales Distribution (Doughnut Chart)**: Shows the percentage share of each category toward the total company revenue pool.
4. **Top 10 Products (Horizontal Bar Chart)**: Highlights individual top-selling items generating the highest cash flow.
5. **Order Status (Doughnut Chart)**: Monitors order fulfillment pipeline (Delivered, Shipped, Confirmed, Pending, Cancelled).
6. **Customer Spending (Bar Chart)**: Visualizes Customer Lifetime Value (CLV) and Pareto distribution among active shoppers.
