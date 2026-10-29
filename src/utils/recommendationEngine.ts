import { Product, RecommendationResult } from '../types';

// English Stop Words list matching Scikit-learn's standard stop_words='english'
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me',
  'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only',
  'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 's', 'same', 'she', 'should',
  'so', 'some', 'such', 't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until',
  'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
  'why', 'will', 'with', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

function extractProductCorpus(product: Product): string {
  const parts = [
    product.name,
    product.category,
    product.category, // weighted category
    product.description,
    ...(product.features || []),
  ];
  return parts.join(' ');
}

/**
 * Implements Scikit-learn style TF-IDF Vectorizer & Cosine Similarity
 * for Content-Based Product Recommendation.
 */
export function getProductRecommendations(
  targetProduct: Product,
  allProducts: Product[],
  topN: number = 4
): RecommendationResult[] {
  const candidateProducts = allProducts.filter(p => p.id !== targetProduct.id);
  if (candidateProducts.length === 0) return [];

  const corpus = allProducts.map(p => ({
    id: p.id,
    product: p,
    tokens: tokenize(extractProductCorpus(p)),
  }));

  const N = corpus.length;

  // 1. Build Vocabulary & Document Frequency (DF)
  const docFrequency: Record<string, number> = {};
  corpus.forEach(doc => {
    const uniqueTokens = new Set(doc.tokens);
    uniqueTokens.forEach(token => {
      docFrequency[token] = (docFrequency[token] || 0) + 1;
    });
  });

  const vocabulary = Object.keys(docFrequency);

  // 2. Compute IDF with standard Scikit-learn smooth_idf formula: idf = log((1 + N) / (1 + df)) + 1
  const idf: Record<string, number> = {};
  vocabulary.forEach(term => {
    idf[term] = Math.log((1 + N) / (1 + docFrequency[term])) + 1;
  });

  // 3. Vectorize each document into TF-IDF vector with L2 normalization
  function computeTfidfVector(tokens: string[]): { vector: Record<string, number>; norm: number } {
    const tf: Record<string, number> = {};
    tokens.forEach(token => {
      tf[token] = (tf[token] || 0) + 1;
    });

    const vec: Record<string, number> = {};
    let sumSquares = 0;

    vocabulary.forEach(term => {
      if (tf[term]) {
        const val = tf[term] * idf[term];
        vec[term] = val;
        sumSquares += val * val;
      }
    });

    const norm = Math.sqrt(sumSquares);
    return { vector: vec, norm: norm > 0 ? norm : 1 };
  }

  const targetDoc = corpus.find(d => d.id === targetProduct.id);
  if (!targetDoc) return [];

  const targetVectorData = computeTfidfVector(targetDoc.tokens);

  // 4. Compute Cosine Similarity with every candidate product
  const results: RecommendationResult[] = [];

  corpus.forEach(doc => {
    if (doc.id === targetProduct.id) return;

    const docVectorData = computeTfidfVector(doc.tokens);

    // Dot product: sum(u_i * v_i)
    let dotProduct = 0;
    const matchingWords: string[] = [];

    Object.keys(targetVectorData.vector).forEach(term => {
      if (docVectorData.vector[term]) {
        dotProduct += targetVectorData.vector[term] * docVectorData.vector[term];
        matchingWords.push(term);
      }
    });

    // Cosine similarity: dotProduct / (||u|| * ||v||)
    let cosineSim = dotProduct / (targetVectorData.norm * docVectorData.norm);

    // Boost score slightly if in identical category (hybrid content signal)
    if (doc.product.category === targetProduct.category) {
      cosineSim = Math.min(0.99, cosineSim + 0.15);
    }

    // Normalized to 0.00 - 1.00
    const finalScore = Math.max(0.05, Math.min(0.99, cosineSim));

    results.push({
      product: doc.product,
      similarityScore: Math.round(finalScore * 100) / 100,
      matchingFeatures: matchingWords.slice(0, 4),
    });
  });

  // Sort descending by similarity score
  results.sort((a, b) => b.similarityScore - a.similarityScore);

  return results.slice(0, topN);
}
