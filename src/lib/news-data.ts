// news-data.ts - Functions for retrieving and analyzing health-related news

/**
 * Type definitions for news data
 */
export type NewsItem = {
  id: string;
  title: string;
  source: string;
  publishDate: string;
  url: string;
  category: string;
  relevanceScore: number;
  summary: string;
  keywords: string[];
};

export type NewsCategory = 'disease_outbreak' | 'medical_research' | 'health_advisory' | 'local_health' | 'general';

/**
 * Get health-related news data from various sources
 * In a production app, this would connect to a real news API
 */
export async function getNewsData(
  location: string,
  categories: NewsCategory[] = ['disease_outbreak', 'health_advisory', 'local_health'],
  limit: number = 5
): Promise<NewsItem[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, this would fetch from news APIs
  // For now, return mock data
  const mockNews: NewsItem[] = [
    {
      id: '1',
      title: 'Flu Season Arrives Early in Northeast',
      source: 'CDC Health Reports',
      publishDate: '2023-11-15',
      url: 'https://example.com/flu-season',
      category: 'disease_outbreak',
      relevanceScore: 0.92,
      summary: 'Influenza cases are being reported at higher than usual rates for this time of year across the Northeast region.',
      keywords: ['influenza', 'outbreak', 'seasonal illness', 'public health']
    },
    {
      id: '2',
      title: 'New Study Links Processed Foods to Increased Heart Disease Risk',
      source: 'Medical Journal Weekly',
      publishDate: '2023-10-28',
      url: 'https://example.com/processed-foods-study',
      category: 'medical_research',
      relevanceScore: 0.85,
      summary: 'Research published this week shows a 23% higher risk of heart disease among those consuming high levels of ultra-processed foods.',
      keywords: ['heart disease', 'processed foods', 'nutrition', 'cardiovascular health']
    },
    {
      id: '3',
      title: 'Local Health Department Issues Air Quality Advisory',
      source: 'County Health Services',
      publishDate: '2023-11-02',
      url: 'https://example.com/air-quality-advisory',
      category: 'local_health',
      relevanceScore: 0.88,
      summary: 'Residents with respiratory conditions advised to limit outdoor activities due to poor air quality following recent wildfires.',
      keywords: ['air quality', 'respiratory health', 'public advisory', 'environmental health']
    },
    {
      id: '4',
      title: 'Pollen Counts Reach Record Highs This Spring',
      source: 'National Allergy Bureau',
      publishDate: '2023-04-12',
      url: 'https://example.com/pollen-counts',
      category: 'health_advisory',
      relevanceScore: 0.79,
      summary: 'Allergy sufferers should take precautions as pollen counts hit 5-year highs in several regions.',
      keywords: ['allergies', 'pollen', 'seasonal allergies', 'respiratory health']
    },
    {
      id: '5',
      title: 'New COVID Variant Detected in Neighboring Counties',
      source: 'State Health Department',
      publishDate: '2023-11-05',
      url: 'https://example.com/covid-variant',
      category: 'disease_outbreak',
      relevanceScore: 0.95,
      summary: 'Health officials report a new COVID variant that appears to be more transmissible but not more severe than previous strains.',
      keywords: ['COVID-19', 'coronavirus', 'variant', 'public health', 'infectious disease']
    },
    {
      id: '6',
      title: 'Mental Health Resources Expanded in Community Centers',
      source: 'City Health Initiative',
      publishDate: '2023-10-10',
      url: 'https://example.com/mental-health-resources',
      category: 'local_health',
      relevanceScore: 0.82,
      summary: 'New mental health services are now available at community centers throughout the city, offering free counseling sessions.',
      keywords: ['mental health', 'community services', 'counseling', 'public health']
    },
    {
      id: '7',
      title: 'Breakthrough in Diabetes Treatment Shows Promise',
      source: 'Medical Research Today',
      publishDate: '2023-09-28',
      url: 'https://example.com/diabetes-breakthrough',
      category: 'medical_research',
      relevanceScore: 0.91,
      summary: 'A new approach to managing Type 2 Diabetes through targeted therapy has shown significant results in clinical trials.',
      keywords: ['diabetes', 'medical research', 'clinical trials', 'treatment breakthrough']
    }
  ];
  
  // Filter by location relevance (in a real implementation, this would be more sophisticated)
  const filteredByLocation = mockNews.filter(item => 
    item.summary.toLowerCase().includes(location.toLowerCase()) || 
    item.title.toLowerCase().includes(location.toLowerCase()) ||
    Math.random() > 0.5 // Randomly include some items for demonstration
  );
  
  // Filter by requested categories
  const filteredByCategory = filteredByLocation.filter(item => 
    categories.includes(item.category as NewsCategory)
  );
  
  // Sort by relevance and recency
  const sorted = filteredByCategory.sort((a, b) => 
    (b.relevanceScore - a.relevanceScore) + 
    (new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()) / 86400000
  );
  
  // Return limited results
  return sorted.slice(0, limit);
}

/**
 * Extract health trends from news data
 */
export function extractHealthTrends(newsItems: NewsItem[]): {
  trendName: string;
  category: string;
  severity: 'low' | 'moderate' | 'high';
  relevantNews: string[];
}[] {
  // Group news by keywords/categories
  const keywordGroups: Record<string, {
    items: NewsItem[];
    category: string;
  }> = {};
  
  // Process each news item
  newsItems.forEach(item => {
    // Use primary keyword as trend identifier
    const primaryKeyword = item.keywords[0];
    
    if (!keywordGroups[primaryKeyword]) {
      keywordGroups[primaryKeyword] = {
        items: [],
        category: item.category
      };
    }
    
    keywordGroups[primaryKeyword].items.push(item);
  });
  
  // Convert groups to trends
  return Object.entries(keywordGroups).map(([keyword, group]) => {
    // Determine severity based on number of related news and average relevance
    const avgRelevance = group.items.reduce((sum, item) => 
      sum + item.relevanceScore, 0) / group.items.length;
    
    let severity: 'low' | 'moderate' | 'high' = 'low';
    if (group.items.length > 2 || avgRelevance > 0.9) {
      severity = 'high';
    } else if (group.items.length > 1 || avgRelevance > 0.8) {
      severity = 'moderate';
    }
    
    return {
      trendName: keyword.charAt(0).toUpperCase() + keyword.slice(1).replace(/_/g, ' '),
      category: group.category,
      severity,
      relevantNews: group.items.map(item => item.title)
    };
  });
}

/**
 * Get health advisories based on location
 */
export async function getHealthAdvisories(location: string): Promise<{
  type: string;
  title: string;
  description: string;
  source: string;
  date: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
}[]> {
  // Get news data first
  const newsItems = await getNewsData(location, ['health_advisory', 'disease_outbreak']);
  
  // Convert to advisories
  return newsItems.map(item => {
    // Determine severity based on keywords and relevance
    let severity: 'low' | 'moderate' | 'high' | 'critical' = 'low';
    const criticalKeywords = ['outbreak', 'emergency', 'critical', 'warning', 'urgent'];
    const highKeywords = ['alert', 'caution', 'high risk', 'danger'];
    
    if (criticalKeywords.some(word => 
      item.title.toLowerCase().includes(word) || 
      item.summary.toLowerCase().includes(word))) {
      severity = 'critical';
    } else if (highKeywords.some(word => 
      item.title.toLowerCase().includes(word) || 
      item.summary.toLowerCase().includes(word)) ||
      item.relevanceScore > 0.9) {
      severity = 'high';
    } else if (item.relevanceScore > 0.8) {
      severity = 'moderate';
    }
    
    // Determine advisory type
    let type = 'General Health';
    if (item.category === 'disease_outbreak') {
      type = 'Disease Outbreak';
    } else if (item.keywords.includes('environmental health') || 
               item.keywords.includes('air quality')) {
      type = 'Environmental';
    } else if (item.keywords.includes('food safety')) {
      type = 'Food Safety';
    }
    
    return {
      type,
      title: item.title,
      description: item.summary,
      source: item.source,
      date: item.publishDate,
      severity
    };
  });
} 