import type { Metadata } from 'next';
import CATCollegePredictor from '../../../components/CATCollegePredictor';

export const metadata: Metadata = {
  title: 'CAT College Predictor 2025 | Check Your B-School Admission Chances',
  description: 'Enter your CAT percentile to instantly see which IIMs, IITs, FMS, JBIMS, and top B-schools across India are within your reach. Get personalized admission predictions for 100+ management institutes based on CAT 2025.',
  keywords: 'CAT predictor, CAT 2025, IIM admission, B-school predictor, MBA college predictor, FMS, JBIMS, IIT management, CAT percentile, MBA admission chances, top B-schools India, management institutes',
  openGraph: {
    title: 'CAT College Predictor 2025 | Find Your Best B-School Match',
    description: 'Discover which IIMs, IITs, and premier B-schools you can get into based on your CAT percentile. Get instant admission predictions for 100+ top management institutes.',
  },
  alternates: {
    canonical: 'https://www.getedunext.com/cat-college-predictor',
  },
};

export default function Page() {
  return <CATCollegePredictor />;
}