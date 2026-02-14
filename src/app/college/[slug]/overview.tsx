import { Metadata } from 'next'
import { supabase } from '../../../../lib/supabase'
import CollegeLayout from './layout'
import CollegeOverviewPage from './overview' // Import your renamed overview component

// Generate dynamic metadata for social sharing
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: college } = await supabase
    .from("college_microsites")
    .select("*")
    .eq("slug", params.slug)
    .single()

  if (!college) {
    return {
      title: 'College Not Found - EduNext',
    }
  }

  const micrositeData = college.microsite_data || {}
  const coursesCount = micrositeData?.popular_courses_table?.length || micrositeData?.fees?.[0]?.rows?.length || '95+'

  return {
    title: `${college.college_name}: Fees, Admission 2026, Courses, Cutoff, Ranking, Placement`,
    description: `${college.college_name} is an institute in ${college.location} offering over ${coursesCount} courses. Read for details on ${college.college_name} Fees, Admission 2026, Courses, Cutoff, Ranking, Placement`,
    openGraph: {
      title: `${college.college_name}: Fees, Admission 2026, Courses, Cutoff, Ranking, Placement`,
      description: `${college.college_name} is an institute in ${college.location} offering over ${coursesCount} courses. Read for details on Fees, Admission 2026, Courses...`,
      url: `https://www.getedunext.com/college/${params.slug}`,
      siteName: 'EduNext',
      images: [
        {
          url: college.image || 'https://www.getedunext.com/default-college.jpg',
          width: 1200,
          height: 630,
          alt: college.college_name,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${college.college_name}: Fees, Admission 2026, Courses, Cutoff, Ranking, Placement`,
      description: `${college.college_name} details for admission 2026...`,
      images: [college.image || 'https://www.getedunext.com/default-college.jpg'],
    },
  }
}

// Server Component wrapper
export default function CollegePage() {
  return (
    <CollegeLayout>
      <CollegeOverviewPage />
    </CollegeLayout>
  )
}