// app/api/colleges/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cacheData } from '../../../../lib/cache';
import { supabase } from '../../../..//lib/supabase';

export const revalidate = 3600; // Revalidate every 1 hour
export const dynamic = 'force-dynamic'; // Ensure fresh requests

interface College {
  id: number;
  slug?: string;
  card_detail?: {
    college_name?: string;
    location?: string;
    url?: string;
    contact?: string;
    email?: string;
    rating?: string;
    review_count?: string;
    avg_package?: string;
    high_package?: string;
    fees?: string;
    ranking?: string;
    approvals?: string;
    scholarship?: string;
    entrance_exam?: string;
    courses?: string[];
  };
}

/**
 * GET /api/colleges
 * Fetch colleges with optional filters
 * 
 * Query Parameters:
 * - action: "search" | "filter" | "top150" (default)
 * - q: search query
 * - city: filter by city
 * - state: filter by state
 * - page: pagination page (default: 1)
 * - limit: results per page (default: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'top150';
    const q = searchParams.get('q');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 150);

    console.log('📥 API Request:', { action, q, city, state, page, limit });

    let data: College[] = [];
    let count = 0;
    let cacheKey = '';

    // Route different queries
    if (action === 'search' && q) {
      // Search for colleges by name
      cacheKey = `colleges:search:${q.toLowerCase()}:page${page}`;
      data = await cacheData(
        cacheKey,
        async () => {
          console.log(`🔍 Searching colleges for: "${q}"`);
          
          const { data: results, error } = await supabase
            .from('college_microsites')
            .select('id, slug, card_detail')
            .ilike('card_detail->college_name', `%${q}%`)
            .order('id', { ascending: true })
            .range((page - 1) * limit, page * limit - 1);

          if (error) {
            console.error('Supabase error:', error);
            throw error;
          }

          console.log(`✅ Found ${results?.length || 0} colleges`);
          return results || [];
        },
        { ttl: 3600 } // Cache for 1 hour
      );
    } else if (action === 'filter' && (city || state)) {
      // Filter by location
      cacheKey = `colleges:location:${city || 'all'}:${state || 'all'}:page${page}`;
      data = await cacheData(
        cacheKey,
        async () => {
          console.log(`📍 Filtering colleges by location: city=${city}, state=${state}`);
          
          let query = supabase
            .from('college_microsites')
            .select('id, slug, card_detail');

          if (city) {
            query = query.ilike('card_detail->location', `%${city}%`);
          }
          if (state) {
            query = query.ilike('card_detail->location', `%${state}%`);
          }

          const { data: results, error } = await query
            .order('id', { ascending: true })
            .range((page - 1) * limit, page * limit - 1);

          if (error) throw error;
          return results || [];
        },
        { ttl: 1800 } // Cache for 30 minutes
      );
    } else {
      // Default: Get top 150 colleges
      cacheKey = 'colleges:top150';
      data = await cacheData(
        cacheKey,
        async () => {
          console.log('⭐ Fetching top 150 colleges...');
          
          const { data: results, error } = await supabase
            .from('college_microsites')
            .select('id, slug, card_detail')
            .order('id', { ascending: true })
            .limit(150);

          if (error) {
            console.error('Supabase error:', error);
            throw error;
          }

          console.log(`✅ Fetched ${results?.length || 0} colleges`);
          return results || [];
        },
        { ttl: 3600 } // Cache for 1 hour
      );
    }

    // Map the response to match your frontend format
    const mappedData = data.map((college) => ({
      id: college.id,
      slug: college.slug,
      card_detail: college.card_detail,
      'College Name': college.card_detail?.college_name || null,
      college_name: college.card_detail?.college_name || null,
      Location: college.card_detail?.location || null,
      location: college.card_detail?.location || null,
      url: college.card_detail?.url || null,
      contact: college.card_detail?.contact || null,
      email: college.card_detail?.email || null,
      'User Rating': college.card_detail?.rating || null,
      'User Reviews': college.card_detail?.review_count || null,
      'Average Package': college.card_detail?.avg_package || null,
      'Highest Package': college.card_detail?.high_package || null,
      'Course Fees': college.card_detail?.fees || null,
      Ranking: college.card_detail?.ranking || null,
      Approvals: college.card_detail?.approvals || null,
      scholarship: college.card_detail?.scholarship || null,
      entrance_exam: college.card_detail?.entrance_exam || null,
      'Application Link': college.card_detail?.url || null,
    }));

    const validColleges = mappedData.filter(
      (college) => college['College Name'] !== null
    );

    console.log(`✨ Returning ${validColleges.length} colleges (from cache key: ${cacheKey})`);

    return NextResponse.json(
      {
        success: true,
        count: validColleges.length,
        data: validColleges,
        cached: true,
        cacheKey, // For debugging
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch colleges',
      },
      { status: 500 }
    );
  }
}