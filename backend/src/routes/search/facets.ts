import { Router } from 'express';
import { Pool } from 'pg';
import { z } from 'zod';
import { FacetService, FacetFilters } from '../../services/facetService';

const router = Router();

// Validation schema for facet request
const facetRequestSchema = z.object({
  q: z.string().optional(),
  articleTypes: z.string().optional(),
  years: z.string().optional(),
  language: z.string().optional(),
  volumes: z.string().optional(),
  issues: z.string().optional(),
  authors: z.string().optional(),
  keywords: z.string().optional()
});

// GET /api/search/facets
router.get('/', async (req, res) => {
  try {
    const params = facetRequestSchema.parse(req.query);
    const pool = req.app.get('db') as Pool;
    const facetService = new FacetService(pool);

    // Convert query params to filter object
    const filters: FacetFilters = {
      searchQuery: params.q,
      articleTypes: params.articleTypes?.split(','),
      years: params.years?.split(',').map(y => parseInt(y)),
      language: params.language,
      volumes: params.volumes?.split(',').map(v => parseInt(v)),
      issues: params.issues?.split(',').map(i => parseInt(i)),
      authors: params.authors?.split(','),
      keywords: params.keywords?.split(',')
    };

    // Generate facets using the service
    const facets = await facetService.generateFacets(filters);

    res.json({
      success: true,
      data: { 
        facets,
        totalFacets: facets.length,
        appliedFilters: Object.keys(filters).filter(key => 
          filters[key as keyof FacetFilters] !== undefined
        ).length
      }
    });

  } catch (error) {
    console.error('Error fetching facets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch facets',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;