"""
DataCart - Content-Based Recommendation System
College Data Science Programming Subject Project

Uses Scikit-learn's TfidfVectorizer and cosine_similarity to recommend similar items
based on category, title, specifications, and textual descriptions.
"""

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def build_corpus(products_df):
    """
    Constructs a weighted textual document for each product by combining:
    - Category (repeated for domain weight)
    - Product Name
    - Product Description
    """
    corpus = []
    for _, row in products_df.iterrows():
        # Double weight on category for stronger grouping
        text = f"{row['category']} {row['category']} {row['name']} {row['description']}"
        corpus.append(text)
    return corpus

def create_recommendation_matrix(products_df):
    """
    Fits TF-IDF vectorizer on the combined corpus and computes
    the pairwise Cosine Similarity Matrix:
    
    Formula: Cosine_Sim(A, B) = (A . B) / (||A|| * ||B||)
    """
    corpus = build_corpus(products_df)
    
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(corpus)
    
    # Pairwise cosine similarity matrix
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    return cosine_sim

def get_recommendations(product_id, products_df, cosine_sim, top_n=4):
    """
    Finds top_n most similar products for the specified product_id.
    Excludes the target product itself.
    """
    if product_id not in products_df['id'].values:
        return []
    
    # Find row index of product
    idx = products_df[products_df['id'] == product_id].index[0]
    
    # Calculate similarity scores
    sim_scores = list(enumerate(cosine_sim[idx]))
    
    # Sort descending by similarity score
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    # Exclude the item itself (index idx) and select top N
    top_indices = [i[0] for i in sim_scores if i[0] != idx][:top_n]
    
    recommendations = products_df.iloc[top_indices].to_dict(orient='records')
    return recommendations
