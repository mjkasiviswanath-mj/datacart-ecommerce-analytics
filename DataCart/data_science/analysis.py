"""
DataCart - Advanced Data Science & Machine Learning Analysis Module
College Data Science Programming Subject Project

This module utilizes Pandas DataFrames, NumPy arrays, and Scikit-learn to perform:
1. Statistical aggregation and exploratory data analysis (EDA)
2. ML Model: Time-Series Revenue Forecasting with Linear Regression (y = mx + c)
3. ML Model: Customer RFM Segmentation (Recency, Frequency, Monetary)
4. ML Model: Market Basket Association Rule Mining (Support, Confidence, Lift)
"""

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error

def load_sales_data(filepath='orders.csv'):
    """
    Loads raw CSV order data into a Pandas DataFrame.
    Converts 'Order_Date' to datetime objects for time-series operations.
    """
    df = pd.read_csv(filepath)
    df['Order_Date'] = pd.to_datetime(df['Order_Date'])
    return df

def calculate_sales_metrics(df):
    """
    Calculates essential statistical KPIs across valid (non-cancelled) orders:
    - Total Revenue (using numpy.sum)
    - Average Order Value (using numpy.mean)
    - Maximum single order sales (using numpy.max)
    - Minimum single order sales (using numpy.min)
    - Total order transactions count
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
    Performs groupby operation on 'Category' column:
    df.groupby('Category').agg({'Total_Amount': 'sum', 'Quantity': 'sum'})
    Calculates total revenue, units sold, and percentage share per category.
    """
    cat_summary = df[df['Status'] != 'Cancelled'].groupby('Category').agg(
        total_sales=('Total_Amount', 'sum'),
        items_sold=('Quantity', 'sum')
    ).reset_index()
    
    total_rev = cat_summary['total_sales'].sum()
    cat_summary['percentage'] = (cat_summary['total_sales'] / total_rev * 100).round(2)
    return cat_summary.sort_values(by='total_sales', ascending=False)

def calculate_monthly_sales(df):
    """
    Aggregates order amounts by month for line-chart trend visualization.
    Uses datetime month period format: YYYY-MM
    """
    valid = df[df['Status'] != 'Cancelled'].copy()
    valid['Month'] = valid['Order_Date'].dt.to_period('M').astype(str)
    
    monthly = valid.groupby('Month').agg(
        sales=('Total_Amount', 'sum'),
        order_count=('Order_ID', 'nunique')
    ).reset_index()
    
    return monthly.sort_values(by='Month')

def calculate_top_products(df, top_n=10):
    """
    Identifies top N products by total revenue and units sold.
    """
    prod_summary = df[df['Status'] != 'Cancelled'].groupby(['Product', 'Category']).agg(
        total_revenue=('Total_Amount', 'sum'),
        units_sold=('Quantity', 'sum')
    ).reset_index()
    
    return prod_summary.sort_values(by='total_revenue', ascending=False).head(top_n)

def calculate_customer_spending(df):
    """
    Computes Customer Lifetime Value (CLV) and purchase frequencies.
    """
    cust_summary = df[df['Status'] != 'Cancelled'].groupby(['Customer_ID', 'Customer_Name']).agg(
        total_spent=('Total_Amount', 'sum'),
        orders_count=('Order_ID', 'nunique')
    ).reset_index()
    
    return cust_summary.sort_values(by='total_spent', ascending=False)

# ==============================================================================
# ML MODEL 1: Time-Series Revenue Forecasting with Scikit-learn Linear Regression
# ==============================================================================
def forecast_sales_linear_regression(df, forecast_periods=3):
    """
    Fits Ordinary Least Squares (OLS) Linear Regression on historical monthly sales.
    Predicts sales for the next N months with R^2 goodness-of-fit and MAE.
    
    Returns:
        dict: {
            'historical': list of dicts,
            'forecast': list of dicts with upper/lower bounds,
            'r2_score': float,
            'mae': float,
            'slope': float,
            'intercept': float,
            'growth_rate_pct': float
        }
    """
    monthly = calculate_monthly_sales(df)
    n = len(monthly)
    if n < 2:
        return None
    
    # Feature X = month index (1, 2, ..., n), Target y = monthly sales
    X = np.arange(1, n + 1).reshape(-1, 1)
    y = monthly['sales'].values
    
    model = LinearRegression()
    model.fit(X, y)
    y_pred = model.predict(X)
    
    r2 = float(r2_score(y, y_pred))
    mae = float(mean_absolute_error(y, y_pred))
    slope = float(model.coef_[0])
    intercept = float(model.intercept_)
    
    # Historical fitted data
    historical = []
    for idx, row in monthly.iterrows():
        i = len(historical) + 1
        historical.append({
            'month': row['Month'],
            'actual_sales': float(row['sales']),
            'fitted_sales': round(float(model.predict([[i]])[0]), 2),
            'order_count': int(row['order_count'])
        })
    
    # Future forecasts
    future_forecasts = []
    last_period = pd.Period(monthly['Month'].iloc[-1], freq='M')
    for p in range(1, forecast_periods + 1):
        future_period = str(last_period + p)
        future_x = n + p
        pred_val = round(max(0.0, float(model.predict([[future_x]])[0])), 2)
        future_forecasts.append({
            'month': future_period,
            'predicted_sales': pred_val,
            'lower_bound': round(pred_val * 0.88, 2),
            'upper_bound': round(pred_val * 1.12, 2)
        })
    
    growth_rate = 0.0
    if len(historical) > 0 and len(future_forecasts) > 0:
        last_actual = historical[-1]['actual_sales']
        next_pred = future_forecasts[0]['predicted_sales']
        if last_actual > 0:
            growth_rate = round(((next_pred - last_actual) / last_actual) * 100, 2)
            
    return {
        'historical': historical,
        'forecast': future_forecasts,
        'r2_score': round(r2, 4),
        'mae': round(mae, 2),
        'slope': round(slope, 2),
        'intercept': round(intercept, 2),
        'growth_rate_pct': growth_rate
    }

# ==============================================================================
# ML MODEL 2: Customer RFM Segmentation (Recency, Frequency, Monetary)
# ==============================================================================
def perform_rfm_segmentation(df, reference_date='2026-10-27'):
    """
    Segments customers using the industry-standard RFM Model:
    - Recency (R): Days since last purchase
    - Frequency (F): Number of repeat orders
    - Monetary (M): Total monetary spending
    
    Assigns segments:
    - Champions (VIP)
    - Loyal Customers
    - Potential Loyalists
    - At-Risk / Inactive
    """
    valid = df[df['Status'] != 'Cancelled'].copy()
    ref_dt = pd.to_datetime(reference_date)
    
    rfm = valid.groupby(['Customer_ID', 'Customer_Name']).agg(
        last_order=('Order_Date', 'max'),
        frequency=('Order_ID', 'nunique'),
        monetary=('Total_Amount', 'sum')
    ).reset_index()
    
    rfm['recency_days'] = (ref_dt - rfm['last_order']).dt.days
    
    # Assign scores
    def assign_segment(row):
        r = row['recency_days']
        f = row['frequency']
        m = row['monetary']
        
        if r <= 35 and f >= 3 and m >= 25000:
            return 'Champions (VIP)'
        elif r <= 60 and f >= 2:
            return 'Loyal Customers'
        elif r <= 45 and f == 1:
            return 'Potential Loyalists'
        else:
            return 'At-Risk / Inactive'
            
    rfm['segment'] = rfm.apply(assign_segment, axis=1)
    return rfm.sort_values(by='monetary', ascending=False)

# ==============================================================================
# ML MODEL 3: Market Basket Association Rule Mining (Apriori Algorithm)
# ==============================================================================
def market_basket_analysis(df, min_support=0.05, min_confidence=0.20):
    """
    Mines item co-occurrence associations from multi-item customer baskets.
    Calculates:
    - Support: P(A ∩ B)
    - Confidence: P(B | A) = Support(A ∪ B) / Support(A)
    - Lift: Confidence / P(B)  (Lift > 1 implies positive affinity)
    """
    valid = df[df['Status'] != 'Cancelled']
    baskets = valid.groupby('Order_ID')['Product'].apply(list)
    total_baskets = len(baskets)
    
    if total_baskets == 0:
        return []
        
    # Item frequency
    item_counts = {}
    pair_counts = {}
    
    for items in baskets:
        unique_items = list(set(items))
        for item in unique_items:
            item_counts[item] = item_counts.get(item, 0) + 1
            
        for i in range(len(unique_items)):
            for j in range(i + 1, len(unique_items)):
                pair = tuple(sorted([unique_items[i], unique_items[j]]))
                pair_counts[pair] = pair_counts.get(pair, 0) + 1
                
    rules = []
    for (item_a, item_b), count in pair_counts.items():
        support_ab = count / total_baskets
        if support_ab < min_support:
            continue
            
        # Rule: A -> B
        support_a = item_counts[item_a] / total_baskets
        support_b = item_counts[item_b] / total_baskets
        
        conf_a_b = support_ab / support_a
        lift_a_b = conf_a_b / support_b
        
        if conf_a_b >= min_confidence:
            rules.append({
                'antecedent': item_a,
                'consequent': item_b,
                'support_pct': round(support_ab * 100, 1),
                'confidence_pct': round(conf_a_b * 100, 1),
                'lift': round(lift_a_b, 2)
            })
            
        # Rule: B -> A
        conf_b_a = support_ab / support_b
        lift_b_a = conf_b_a / support_a
        if conf_b_a >= min_confidence:
            rules.append({
                'antecedent': item_b,
                'consequent': item_a,
                'support_pct': round(support_ab * 100, 1),
                'confidence_pct': round(conf_b_a * 100, 1),
                'lift': round(lift_b_a, 2)
            })
            
    rules = sorted(rules, key=lambda x: x['lift'], reverse=True)
    return rules

if __name__ == '__main__':
    print("Testing DataCart Advanced Analytics & ML Module...")
    df = load_sales_data('orders.csv')
    print("Metrics:", calculate_sales_metrics(df))
    print("\nLinear Regression Forecast:")
    print(forecast_sales_linear_regression(df))
    print("\nRFM Customer Segments:")
    print(perform_rfm_segmentation(df).head())
    print("\nMarket Basket Association Rules:")
    print(market_basket_analysis(df)[:5])
