// API client for article-related operations

import { 
  Article, 
  ArticleWithDetails, 
  Volume, 
  Issue, 
  VolumeWithIssues,
  IssueWithArticles,
  CreateVolumeRequest,
  CreateIssueRequest,
  PublishArticleRequest,
  ArticleSearchFilters,
  ArticleSearchResponse
} from '../types/article';

// Use Next.js API routes instead of external backend
const API_BASE_URL = '/api';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const articleApi = {
  /**
   * Get all published articles with pagination and filtering
   */
  async getPublishedArticles(
    page: number = 1,
    limit: number = 10,
    filters?: ArticleSearchFilters
  ): Promise<ArticleSearchResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/articles?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return handleResponse(response);
    } catch (error) {
      // Return mock data if API fails
      console.warn('Articles API not available, returning mock data:', error);
      return {
        articles: [
          {
            id: '1',
            submission_id: 'sub1',
            title: 'Community-Based Social Work Interventions in Rural Africa',
            abstract: 'This study examines the effectiveness of community-based social work interventions in rural African communities. Through a mixed-methods approach, we analyzed the impact of culturally adapted social work practices on community development and individual well-being.',
            authors: ['Dr. Amara Okafor', 'Prof. Kwame Asante', 'Dr. Fatima Al-Rashid'],
            keywords: ['community social work', 'rural development', 'cultural adaptation', 'Africa'],
            pdf_url: '/sample-article.pdf',
            issue_id: 'issue1',
            volume_number: 1,
            issue_number: 1,
            volume_year: 2024,
            volume_description: 'Inaugural Volume',
            issue_description: 'Community Development Focus',
            published_at: '2024-01-15T00:00:00Z',
            created_at: '2024-01-10T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z'
          },
          {
            id: '2',
            submission_id: 'sub2',
            title: 'Policy Analysis: Social Protection Systems in West Africa',
            abstract: 'An in-depth analysis of social protection systems across West African nations, examining policy frameworks, implementation challenges, and outcomes for vulnerable populations.',
            authors: ['Dr. Kofi Mensah', 'Dr. Aisha Diallo'],
            keywords: ['social policy', 'social protection', 'West Africa', 'policy analysis'],
            pdf_url: '/sample-article-2.pdf',
            issue_id: 'issue1',
            volume_number: 1,
            issue_number: 1,
            volume_year: 2024,
            volume_description: 'Inaugural Volume',
            issue_description: 'Community Development Focus',
            published_at: '2024-02-01T00:00:00Z',
            created_at: '2024-01-25T00:00:00Z',
            updated_at: '2024-02-01T00:00:00Z'
          },
          {
            id: '3',
            submission_id: 'sub3',
            title: 'Mental Health Services in Urban African Settings',
            abstract: 'This research explores the delivery of mental health services in urban African contexts, highlighting innovative approaches to addressing mental health challenges in resource-constrained environments.',
            authors: ['Dr. Thandiwe Mthembu', 'Prof. Omar Hassan', 'Dr. Grace Wanjiku'],
            keywords: ['mental health', 'urban settings', 'service delivery', 'Africa'],
            pdf_url: '/sample-article-3.pdf',
            issue_id: 'issue2',
            volume_number: 1,
            issue_number: 2,
            volume_year: 2024,
            volume_description: 'Inaugural Volume',
            issue_description: 'Mental Health and Well-being',
            published_at: '2024-03-15T00:00:00Z',
            created_at: '2024-03-10T00:00:00Z',
            updated_at: '2024-03-15T00:00:00Z'
          }
        ],
        total: 3,
        page: page,
        totalPages: 1
      };
    }
  },

  /**
   * Get article by ID
   */
  async getArticleById(id: string): Promise<{ article: ArticleWithDetails }> {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return handleResponse(response);
    } catch (error) {
      // Return mock data if API fails
      console.warn('Article API not available, returning mock data:', error);
      return {
        article: {
          id: id,
          submission_id: 'sub1',
          title: 'Community-Based Social Work Interventions in Rural Africa',
          abstract: 'This study examines the effectiveness of community-based social work interventions in rural African communities. Through a mixed-methods approach, we analyzed the impact of culturally adapted social work practices on community development and individual well-being. The research was conducted across five rural communities in Ghana, Kenya, and Nigeria over a period of 18 months. Our findings indicate that culturally adapted interventions show significantly better outcomes compared to standardized approaches.',
          authors: ['Dr. Amara Okafor', 'Prof. Kwame Asante', 'Dr. Fatima Al-Rashid'],
          keywords: ['community social work', 'rural development', 'cultural adaptation', 'Africa', 'intervention effectiveness'],
          pdf_url: '/sample-article.pdf',
          issue_id: 'issue1',
          volume_number: 1,
          issue_number: 1,
          volume_year: 2024,
          volume_description: 'Inaugural Volume',
          issue_description: 'Community Development Focus',
          published_at: '2024-01-15T00:00:00Z',
          created_at: '2024-01-10T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        }
      };
    }
  },

  /**
   * Search articles
   */
  async searchArticles(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ArticleSearchResponse> {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/articles/search?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return handleResponse(response);
    } catch (error) {
      // Return filtered mock data if API fails
      console.warn('Article search API not available, returning mock data:', error);
      const mockArticles = [
        {
          id: '1',
          submission_id: 'sub1',
          title: 'Community-Based Social Work Interventions in Rural Africa',
          abstract: 'This study examines the effectiveness of community-based social work interventions in rural African communities.',
          authors: ['Dr. Amara Okafor', 'Prof. Kwame Asante', 'Dr. Fatima Al-Rashid'],
          keywords: ['community social work', 'rural development', 'cultural adaptation', 'Africa'],
          pdf_url: '/sample-article.pdf',
          issue_id: 'issue1',
          volume_number: 1,
          issue_number: 1,
          volume_year: 2024,
          volume_description: 'Inaugural Volume',
          issue_description: 'Community Development Focus',
          published_at: '2024-01-15T00:00:00Z',
          created_at: '2024-01-10T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        },
        {
          id: '2',
          submission_id: 'sub2',
          title: 'Policy Analysis: Social Protection Systems in West Africa',
          abstract: 'An in-depth analysis of social protection systems across West African nations.',
          authors: ['Dr. Kofi Mensah', 'Dr. Aisha Diallo'],
          keywords: ['social policy', 'social protection', 'West Africa', 'policy analysis'],
          pdf_url: '/sample-article-2.pdf',
          issue_id: 'issue1',
          volume_number: 1,
          issue_number: 1,
          volume_year: 2024,
          volume_description: 'Inaugural Volume',
          issue_description: 'Community Development Focus',
          published_at: '2024-02-01T00:00:00Z',
          created_at: '2024-01-25T00:00:00Z',
          updated_at: '2024-02-01T00:00:00Z'
        }
      ];

      // Simple search filtering
      const filteredArticles = mockArticles.filter(article =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.abstract.toLowerCase().includes(query.toLowerCase()) ||
        article.authors.some(author => author.toLowerCase().includes(query.toLowerCase())) ||
        article.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
      );

      return {
        articles: filteredArticles,
        total: filteredArticles.length,
        page: page,
        totalPages: Math.ceil(filteredArticles.length / limit)
      };
    }
  },

  /**
   * Get all volumes with their issues
   */
  async getVolumes(): Promise<{ volumes: VolumeWithIssues[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/volumes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return handleResponse(response);
    } catch (error) {
      // Return mock data if API fails
      console.warn('Volumes API not available, returning mock data:', error);
      return {
        volumes: [
          {
            id: 'vol1',
            volume_number: 1,
            year: 2024,
            description: 'Inaugural Volume - Foundations of African Social Work',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            issues: [
              {
                id: 'issue1',
                issue_number: 1,
                volume_id: 'vol1',
                description: 'Community Development Focus',
                published_at: '2024-01-15T00:00:00Z',
                created_at: '2024-01-10T00:00:00Z',
                updated_at: '2024-01-15T00:00:00Z'
              },
              {
                id: 'issue2',
                issue_number: 2,
                volume_id: 'vol1',
                description: 'Mental Health and Well-being',
                published_at: '2024-03-15T00:00:00Z',
                created_at: '2024-03-10T00:00:00Z',
                updated_at: '2024-03-15T00:00:00Z'
              }
            ]
          }
        ]
      };
    }
  },

  /**
   * Get volume by ID with issues and articles
   */
  async getVolumeById(id: string): Promise<{ volume: VolumeWithIssues }> {
    const response = await fetch(`${API_BASE_URL}/volumes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Get issue by ID with articles
   */
  async getIssueById(id: string): Promise<{ issue: IssueWithArticles }> {
    const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Get articles by volume and issue
   */
  async getArticlesByVolumeAndIssue(
    volumeNumber: number,
    issueNumber: number
  ): Promise<{ articles: ArticleWithDetails[] }> {
    const response = await fetch(
      `${API_BASE_URL}/articles/volume/${volumeNumber}/issue/${issueNumber}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return handleResponse(response);
  },

  // Admin/Editor functions below require authentication

  /**
   * Create a new volume (admin/editor only)
   */
  async createVolume(volumeData: CreateVolumeRequest): Promise<{ message: string; volume: Volume }> {
    const response = await fetch(`${API_BASE_URL}/volumes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(volumeData),
    });

    return handleResponse(response);
  },

  /**
   * Create a new issue (admin/editor only)
   */
  async createIssue(issueData: CreateIssueRequest): Promise<{ message: string; issue: Issue }> {
    const response = await fetch(`${API_BASE_URL}/issues`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(issueData),
    });

    return handleResponse(response);
  },

  /**
   * Publish an article from a submission (admin/editor only)
   */
  async publishArticle(articleData: PublishArticleRequest): Promise<{ message: string; article: Article }> {
    const response = await fetch(`${API_BASE_URL}/articles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(articleData),
    });

    return handleResponse(response);
  },

  /**
   * Update article metadata (admin/editor only)
   */
  async updateArticle(
    id: string,
    updateData: Partial<Pick<Article, 'title' | 'abstract' | 'authors' | 'keywords'>>
  ): Promise<{ message: string; article: Article }> {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    return handleResponse(response);
  },

  /**
   * Delete article (admin only)
   */
  async deleteArticle(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Update volume (admin/editor only)
   */
  async updateVolume(
    id: string,
    updateData: Partial<CreateVolumeRequest>
  ): Promise<{ message: string; volume: Volume }> {
    const response = await fetch(`${API_BASE_URL}/volumes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    return handleResponse(response);
  },

  /**
   * Update issue (admin/editor only)
   */
  async updateIssue(
    id: string,
    updateData: Partial<CreateIssueRequest>
  ): Promise<{ message: string; issue: Issue }> {
    const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    return handleResponse(response);
  },

  /**
   * Delete volume (admin only)
   */
  async deleteVolume(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/volumes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Delete issue (admin only)
   */
  async deleteIssue(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Get all submissions ready for publication (admin/editor only)
   */
  async getSubmissionsReadyForPublication(): Promise<{ submissions: any[] }> {
    const response = await fetch(`${API_BASE_URL}/submissions/ready-for-publication`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },
};