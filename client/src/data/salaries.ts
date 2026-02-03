// Salary data for programmatic SEO pages
// Based on BLS Occupational Employment Statistics 2024

export interface SalaryData {
  slug: string;
  title: string;
  alternativeTitles: string[];
  description: string;
  category: string;
  // Salary data
  median: number;
  percentile10: number;
  percentile25: number;
  percentile75: number;
  percentile90: number;
  // Experience levels
  entry: number;
  mid: number;
  senior: number;
  // Location data (top paying states)
  topStates: { state: string; salary: number }[];
  // Growth outlook
  growthRate: number; // percentage
  growthOutlook: 'declining' | 'stable' | 'growing' | 'fast';
  // Education typically required
  education: string;
  // Related jobs
  relatedJobs: string[];
  // SEO
  keywords: string[];
}

// Top 50 jobs by search volume with salary data
export const SALARY_DATA: Record<string, SalaryData> = {
  'software-engineer': {
    slug: 'software-engineer',
    title: 'Software Engineer',
    alternativeTitles: ['Software Developer', 'Programmer', 'SWE'],
    description: 'Software engineers design, develop, and maintain software applications and systems. They write code, debug programs, and collaborate with teams to build technology solutions.',
    category: 'Technology',
    median: 127260,
    percentile10: 74400,
    percentile25: 98530,
    percentile75: 166780,
    percentile90: 208000,
    entry: 85000,
    mid: 130000,
    senior: 185000,
    topStates: [
      { state: 'California', salary: 155000 },
      { state: 'Washington', salary: 150000 },
      { state: 'New York', salary: 145000 },
      { state: 'Massachusetts', salary: 140000 },
      { state: 'Texas', salary: 125000 },
    ],
    growthRate: 25,
    growthOutlook: 'fast',
    education: "Bachelor's degree in Computer Science or related field",
    relatedJobs: ['data-scientist', 'web-developer', 'devops-engineer'],
    keywords: ['software engineer salary', 'developer salary', 'programmer salary', 'tech salary'],
  },

  'registered-nurse': {
    slug: 'registered-nurse',
    title: 'Registered Nurse',
    alternativeTitles: ['RN', 'Staff Nurse', 'Nurse'],
    description: 'Registered nurses provide patient care, administer medications, coordinate treatment plans, and educate patients about health conditions in hospitals, clinics, and other healthcare settings.',
    category: 'Healthcare',
    median: 81220,
    percentile10: 59450,
    percentile25: 68970,
    percentile75: 98100,
    percentile90: 120250,
    entry: 62000,
    mid: 80000,
    senior: 105000,
    topStates: [
      { state: 'California', salary: 124000 },
      { state: 'Hawaii', salary: 106000 },
      { state: 'Oregon', salary: 98000 },
      { state: 'Alaska', salary: 97000 },
      { state: 'Massachusetts', salary: 96000 },
    ],
    growthRate: 6,
    growthOutlook: 'growing',
    education: "Bachelor's degree in Nursing (BSN) or Associate's degree",
    relatedJobs: ['nurse-practitioner', 'physician-assistant', 'medical-assistant'],
    keywords: ['nurse salary', 'RN salary', 'registered nurse pay', 'nursing salary'],
  },

  'teacher': {
    slug: 'teacher',
    title: 'Teacher',
    alternativeTitles: ['K-12 Teacher', 'Educator', 'School Teacher'],
    description: 'Teachers educate students in various subjects at elementary, middle, and high school levels. They develop lesson plans, assess student progress, and create engaging learning environments.',
    category: 'Education',
    median: 61690,
    percentile10: 42630,
    percentile25: 49880,
    percentile75: 79510,
    percentile90: 99660,
    entry: 45000,
    mid: 62000,
    senior: 85000,
    topStates: [
      { state: 'New York', salary: 87000 },
      { state: 'California', salary: 85000 },
      { state: 'Massachusetts', salary: 82000 },
      { state: 'Connecticut', salary: 79000 },
      { state: 'New Jersey', salary: 77000 },
    ],
    growthRate: 1,
    growthOutlook: 'stable',
    education: "Bachelor's degree and teaching certification",
    relatedJobs: ['school-counselor', 'principal', 'special-education-teacher'],
    keywords: ['teacher salary', 'educator pay', 'teaching salary', 'school teacher salary'],
  },

  'accountant': {
    slug: 'accountant',
    title: 'Accountant',
    alternativeTitles: ['CPA', 'Staff Accountant', 'Financial Accountant'],
    description: 'Accountants prepare and examine financial records, ensure taxes are paid properly, and assess financial operations. They provide crucial financial guidance to businesses and individuals.',
    category: 'Finance',
    median: 78000,
    percentile10: 50440,
    percentile25: 62410,
    percentile75: 99520,
    percentile90: 128970,
    entry: 55000,
    mid: 75000,
    senior: 110000,
    topStates: [
      { state: 'New York', salary: 97000 },
      { state: 'New Jersey', salary: 92000 },
      { state: 'California', salary: 88000 },
      { state: 'Connecticut', salary: 87000 },
      { state: 'Massachusetts', salary: 85000 },
    ],
    growthRate: 4,
    growthOutlook: 'stable',
    education: "Bachelor's degree in Accounting",
    relatedJobs: ['financial-analyst', 'auditor', 'tax-preparer'],
    keywords: ['accountant salary', 'CPA salary', 'accounting salary', 'bookkeeper salary'],
  },

  'marketing-manager': {
    slug: 'marketing-manager',
    title: 'Marketing Manager',
    alternativeTitles: ['Marketing Director', 'Brand Manager', 'Digital Marketing Manager'],
    description: 'Marketing managers plan and direct marketing policies and programs. They identify potential markets, develop pricing strategies, and oversee marketing campaigns.',
    category: 'Marketing',
    median: 140040,
    percentile10: 74620,
    percentile25: 101170,
    percentile75: 191000,
    percentile90: 208000,
    entry: 65000,
    mid: 95000,
    senior: 165000,
    topStates: [
      { state: 'New York', salary: 175000 },
      { state: 'New Jersey', salary: 170000 },
      { state: 'California', salary: 165000 },
      { state: 'Virginia', salary: 155000 },
      { state: 'Colorado', salary: 150000 },
    ],
    growthRate: 10,
    growthOutlook: 'growing',
    education: "Bachelor's degree in Marketing or Business",
    relatedJobs: ['digital-marketer', 'product-manager', 'sales-manager'],
    keywords: ['marketing manager salary', 'marketing director salary', 'marketing pay'],
  },

  'data-scientist': {
    slug: 'data-scientist',
    title: 'Data Scientist',
    alternativeTitles: ['Data Analyst', 'ML Engineer', 'Analytics Scientist'],
    description: 'Data scientists analyze complex data to help organizations make better decisions. They use statistics, machine learning, and programming to extract insights from large datasets.',
    category: 'Technology',
    median: 103500,
    percentile10: 61400,
    percentile25: 79100,
    percentile75: 133100,
    percentile90: 167500,
    entry: 75000,
    mid: 110000,
    senior: 160000,
    topStates: [
      { state: 'California', salary: 140000 },
      { state: 'Washington', salary: 135000 },
      { state: 'New York', salary: 130000 },
      { state: 'Virginia', salary: 120000 },
      { state: 'Massachusetts', salary: 118000 },
    ],
    growthRate: 35,
    growthOutlook: 'fast',
    education: "Master's degree in Data Science, Statistics, or related field",
    relatedJobs: ['software-engineer', 'machine-learning-engineer', 'business-analyst'],
    keywords: ['data scientist salary', 'data analyst salary', 'analytics salary', 'ML engineer salary'],
  },

  'project-manager': {
    slug: 'project-manager',
    title: 'Project Manager',
    alternativeTitles: ['PM', 'Program Manager', 'Technical Project Manager'],
    description: 'Project managers plan, execute, and close projects. They coordinate teams, manage budgets, timelines, and ensure projects meet objectives and stakeholder requirements.',
    category: 'Management',
    median: 95370,
    percentile10: 56710,
    percentile25: 71880,
    percentile75: 122720,
    percentile90: 159140,
    entry: 60000,
    mid: 90000,
    senior: 135000,
    topStates: [
      { state: 'California', salary: 120000 },
      { state: 'New York', salary: 115000 },
      { state: 'Washington', salary: 112000 },
      { state: 'New Jersey', salary: 110000 },
      { state: 'Massachusetts', salary: 108000 },
    ],
    growthRate: 7,
    growthOutlook: 'growing',
    education: "Bachelor's degree and PMP certification preferred",
    relatedJobs: ['product-manager', 'business-analyst', 'operations-manager'],
    keywords: ['project manager salary', 'PM salary', 'program manager salary'],
  },

  'mechanical-engineer': {
    slug: 'mechanical-engineer',
    title: 'Mechanical Engineer',
    alternativeTitles: ['Design Engineer', 'Manufacturing Engineer'],
    description: 'Mechanical engineers design, develop, and test mechanical devices. They work on everything from engines to manufacturing plants, applying principles of physics and materials science.',
    category: 'Engineering',
    median: 95300,
    percentile10: 62870,
    percentile25: 76980,
    percentile75: 118680,
    percentile90: 148220,
    entry: 68000,
    mid: 92000,
    senior: 130000,
    topStates: [
      { state: 'Alaska', salary: 125000 },
      { state: 'Louisiana', salary: 115000 },
      { state: 'Texas', salary: 110000 },
      { state: 'California', salary: 108000 },
      { state: 'Washington', salary: 105000 },
    ],
    growthRate: 2,
    growthOutlook: 'stable',
    education: "Bachelor's degree in Mechanical Engineering",
    relatedJobs: ['civil-engineer', 'electrical-engineer', 'industrial-engineer'],
    keywords: ['mechanical engineer salary', 'engineering salary', 'design engineer salary'],
  },

  'electrician': {
    slug: 'electrician',
    title: 'Electrician',
    alternativeTitles: ['Journeyman Electrician', 'Master Electrician', 'Electrical Technician'],
    description: 'Electricians install, maintain, and repair electrical wiring, equipment, and fixtures. They ensure electrical systems comply with codes and work safely in residential, commercial, and industrial settings.',
    category: 'Skilled Trades',
    median: 60240,
    percentile10: 37470,
    percentile25: 46500,
    percentile75: 77050,
    percentile90: 99800,
    entry: 40000,
    mid: 60000,
    senior: 85000,
    topStates: [
      { state: 'Illinois', salary: 85000 },
      { state: 'New York', salary: 82000 },
      { state: 'Alaska', salary: 80000 },
      { state: 'Hawaii', salary: 78000 },
      { state: 'Oregon', salary: 76000 },
    ],
    growthRate: 7,
    growthOutlook: 'growing',
    education: 'Apprenticeship and state license',
    relatedJobs: ['plumber', 'hvac-technician', 'construction-manager'],
    keywords: ['electrician salary', 'electrical salary', 'journeyman electrician pay'],
  },

  'pharmacist': {
    slug: 'pharmacist',
    title: 'Pharmacist',
    alternativeTitles: ['Clinical Pharmacist', 'Retail Pharmacist', 'PharmD'],
    description: 'Pharmacists dispense prescription medications, advise patients on safe use of prescriptions, and provide expertise on drug interactions and side effects.',
    category: 'Healthcare',
    median: 128570,
    percentile10: 88500,
    percentile25: 112690,
    percentile75: 150970,
    percentile90: 165550,
    entry: 110000,
    mid: 130000,
    senior: 155000,
    topStates: [
      { state: 'California', salary: 155000 },
      { state: 'Alaska', salary: 150000 },
      { state: 'Oregon', salary: 145000 },
      { state: 'Washington', salary: 142000 },
      { state: 'Vermont', salary: 140000 },
    ],
    growthRate: -2,
    growthOutlook: 'declining',
    education: 'Doctor of Pharmacy (PharmD) degree',
    relatedJobs: ['pharmacy-technician', 'nurse-practitioner', 'physician'],
    keywords: ['pharmacist salary', 'pharmacy salary', 'PharmD salary', 'retail pharmacist pay'],
  },

  'web-developer': {
    slug: 'web-developer',
    title: 'Web Developer',
    alternativeTitles: ['Front-end Developer', 'Full Stack Developer', 'Web Designer'],
    description: 'Web developers design and create websites. They are responsible for the look of the site, its technical aspects, and ensuring it performs well.',
    category: 'Technology',
    median: 80730,
    percentile10: 42550,
    percentile25: 57000,
    percentile75: 108810,
    percentile90: 146430,
    entry: 55000,
    mid: 85000,
    senior: 125000,
    topStates: [
      { state: 'Washington', salary: 115000 },
      { state: 'California', salary: 110000 },
      { state: 'New York', salary: 100000 },
      { state: 'Virginia', salary: 95000 },
      { state: 'Massachusetts', salary: 92000 },
    ],
    growthRate: 16,
    growthOutlook: 'fast',
    education: "Bachelor's degree or coding bootcamp",
    relatedJobs: ['software-engineer', 'ux-designer', 'data-scientist'],
    keywords: ['web developer salary', 'frontend developer salary', 'full stack salary'],
  },

  'nurse-practitioner': {
    slug: 'nurse-practitioner',
    title: 'Nurse Practitioner',
    alternativeTitles: ['NP', 'Advanced Practice Nurse', 'APRN'],
    description: 'Nurse practitioners provide primary and specialty healthcare. They can prescribe medications, diagnose illnesses, and manage patient care with more autonomy than RNs.',
    category: 'Healthcare',
    median: 120680,
    percentile10: 89330,
    percentile25: 103790,
    percentile75: 141240,
    percentile90: 163350,
    entry: 95000,
    mid: 120000,
    senior: 150000,
    topStates: [
      { state: 'California', salary: 155000 },
      { state: 'New Jersey', salary: 140000 },
      { state: 'Washington', salary: 135000 },
      { state: 'New York', salary: 132000 },
      { state: 'Massachusetts', salary: 130000 },
    ],
    growthRate: 45,
    growthOutlook: 'fast',
    education: "Master's or Doctoral degree in Nursing",
    relatedJobs: ['registered-nurse', 'physician-assistant', 'physician'],
    keywords: ['nurse practitioner salary', 'NP salary', 'APRN salary', 'advanced practice nurse pay'],
  },

  'physical-therapist': {
    slug: 'physical-therapist',
    title: 'Physical Therapist',
    alternativeTitles: ['PT', 'Physiotherapist', 'Rehab Specialist'],
    description: 'Physical therapists help injured or ill people improve movement and manage pain. They develop treatment plans and guide patients through exercises and therapies.',
    category: 'Healthcare',
    median: 95620,
    percentile10: 66180,
    percentile25: 78430,
    percentile75: 113790,
    percentile90: 129180,
    entry: 70000,
    mid: 92000,
    senior: 120000,
    topStates: [
      { state: 'Nevada', salary: 115000 },
      { state: 'California', salary: 110000 },
      { state: 'New Jersey', salary: 105000 },
      { state: 'Alaska', salary: 103000 },
      { state: 'Connecticut', salary: 100000 },
    ],
    growthRate: 17,
    growthOutlook: 'fast',
    education: 'Doctor of Physical Therapy (DPT) degree',
    relatedJobs: ['occupational-therapist', 'chiropractor', 'athletic-trainer'],
    keywords: ['physical therapist salary', 'PT salary', 'physiotherapist pay'],
  },

  'graphic-designer': {
    slug: 'graphic-designer',
    title: 'Graphic Designer',
    alternativeTitles: ['Visual Designer', 'Creative Designer', 'Digital Designer'],
    description: 'Graphic designers create visual concepts using computer software to communicate ideas that inspire, inform, and captivate consumers.',
    category: 'Creative',
    median: 57990,
    percentile10: 35900,
    percentile25: 44440,
    percentile75: 75750,
    percentile90: 98840,
    entry: 40000,
    mid: 58000,
    senior: 85000,
    topStates: [
      { state: 'Washington', salary: 75000 },
      { state: 'California', salary: 72000 },
      { state: 'Massachusetts', salary: 70000 },
      { state: 'New York', salary: 68000 },
      { state: 'Connecticut', salary: 66000 },
    ],
    growthRate: 3,
    growthOutlook: 'stable',
    education: "Bachelor's degree in Graphic Design or related field",
    relatedJobs: ['ux-designer', 'web-developer', 'art-director'],
    keywords: ['graphic designer salary', 'design salary', 'visual designer pay'],
  },

  'financial-analyst': {
    slug: 'financial-analyst',
    title: 'Financial Analyst',
    alternativeTitles: ['Investment Analyst', 'Business Analyst', 'Finance Analyst'],
    description: 'Financial analysts guide businesses and individuals in decisions about expending money to attain profit. They assess stocks, bonds, and other investments.',
    category: 'Finance',
    median: 95080,
    percentile10: 55560,
    percentile25: 70130,
    percentile75: 126610,
    percentile90: 166560,
    entry: 60000,
    mid: 90000,
    senior: 140000,
    topStates: [
      { state: 'New York', salary: 130000 },
      { state: 'California', salary: 115000 },
      { state: 'Connecticut', salary: 112000 },
      { state: 'Massachusetts', salary: 110000 },
      { state: 'New Jersey', salary: 108000 },
    ],
    growthRate: 9,
    growthOutlook: 'growing',
    education: "Bachelor's degree in Finance, Economics, or Business",
    relatedJobs: ['accountant', 'investment-banker', 'portfolio-manager'],
    keywords: ['financial analyst salary', 'finance salary', 'investment analyst pay'],
  },

  'human-resources-manager': {
    slug: 'human-resources-manager',
    title: 'Human Resources Manager',
    alternativeTitles: ['HR Manager', 'HR Director', 'People Manager'],
    description: 'Human resources managers plan, coordinate, and direct the administrative functions of an organization. They oversee recruiting, interviewing, and hiring of new staff.',
    category: 'Human Resources',
    median: 130000,
    percentile10: 75580,
    percentile25: 98240,
    percentile75: 168430,
    percentile90: 208000,
    entry: 70000,
    mid: 100000,
    senior: 155000,
    topStates: [
      { state: 'New Jersey', salary: 160000 },
      { state: 'New York', salary: 155000 },
      { state: 'California', salary: 150000 },
      { state: 'Washington', salary: 145000 },
      { state: 'Virginia', salary: 140000 },
    ],
    growthRate: 7,
    growthOutlook: 'growing',
    education: "Bachelor's degree in Human Resources or Business",
    relatedJobs: ['recruiter', 'training-manager', 'operations-manager'],
    keywords: ['hr manager salary', 'human resources salary', 'HR director pay'],
  },

  'plumber': {
    slug: 'plumber',
    title: 'Plumber',
    alternativeTitles: ['Pipefitter', 'Journeyman Plumber', 'Master Plumber'],
    description: 'Plumbers install and repair piping systems in residential, commercial, and industrial buildings. They work with water supply lines, waste disposal systems, and related fixtures.',
    category: 'Skilled Trades',
    median: 59880,
    percentile10: 36700,
    percentile25: 45040,
    percentile75: 79690,
    percentile90: 99920,
    entry: 38000,
    mid: 58000,
    senior: 85000,
    topStates: [
      { state: 'Illinois', salary: 90000 },
      { state: 'Alaska', salary: 85000 },
      { state: 'New Jersey', salary: 80000 },
      { state: 'Massachusetts', salary: 78000 },
      { state: 'New York', salary: 76000 },
    ],
    growthRate: 2,
    growthOutlook: 'stable',
    education: 'Apprenticeship and state license',
    relatedJobs: ['electrician', 'hvac-technician', 'pipefitter'],
    keywords: ['plumber salary', 'plumbing salary', 'journeyman plumber pay'],
  },

  'paralegal': {
    slug: 'paralegal',
    title: 'Paralegal',
    alternativeTitles: ['Legal Assistant', 'Litigation Paralegal', 'Corporate Paralegal'],
    description: 'Paralegals assist lawyers by conducting legal research, drafting documents, organizing case files, and managing administrative tasks in legal proceedings.',
    category: 'Legal',
    median: 59200,
    percentile10: 38290,
    percentile25: 46330,
    percentile75: 75470,
    percentile90: 91000,
    entry: 42000,
    mid: 58000,
    senior: 80000,
    topStates: [
      { state: 'California', salary: 72000 },
      { state: 'Massachusetts', salary: 68000 },
      { state: 'New York', salary: 67000 },
      { state: 'Connecticut', salary: 66000 },
      { state: 'Colorado', salary: 65000 },
    ],
    growthRate: 4,
    growthOutlook: 'stable',
    education: "Associate's or Bachelor's degree in Paralegal Studies",
    relatedJobs: ['legal-secretary', 'lawyer', 'court-reporter'],
    keywords: ['paralegal salary', 'legal assistant salary', 'litigation paralegal pay'],
  },

  'dental-hygienist': {
    slug: 'dental-hygienist',
    title: 'Dental Hygienist',
    alternativeTitles: ['Registered Dental Hygienist', 'RDH'],
    description: 'Dental hygienists clean teeth, examine patients for oral diseases, and provide preventive dental care. They educate patients on maintaining oral health.',
    category: 'Healthcare',
    median: 81400,
    percentile10: 59840,
    percentile25: 69130,
    percentile75: 96380,
    percentile90: 107460,
    entry: 62000,
    mid: 80000,
    senior: 100000,
    topStates: [
      { state: 'Alaska', salary: 115000 },
      { state: 'California', salary: 110000 },
      { state: 'Washington', salary: 100000 },
      { state: 'Nevada', salary: 95000 },
      { state: 'New Jersey', salary: 93000 },
    ],
    growthRate: 9,
    growthOutlook: 'growing',
    education: "Associate's degree in Dental Hygiene",
    relatedJobs: ['dental-assistant', 'dentist', 'orthodontist'],
    keywords: ['dental hygienist salary', 'RDH salary', 'dental salary'],
  },

  'real-estate-agent': {
    slug: 'real-estate-agent',
    title: 'Real Estate Agent',
    alternativeTitles: ['Realtor', 'Real Estate Broker', 'Property Agent'],
    description: 'Real estate agents help clients buy, sell, and rent properties. They arrange property showings, negotiate deals, and guide clients through the transaction process.',
    category: 'Sales',
    median: 56620,
    percentile10: 29270,
    percentile25: 36030,
    percentile75: 94770,
    percentile90: 166940,
    entry: 35000,
    mid: 60000,
    senior: 120000,
    topStates: [
      { state: 'New York', salary: 102000 },
      { state: 'Hawaii', salary: 90000 },
      { state: 'Massachusetts', salary: 85000 },
      { state: 'California', salary: 80000 },
      { state: 'Connecticut', salary: 75000 },
    ],
    growthRate: 5,
    growthOutlook: 'growing',
    education: 'Real estate license (requirements vary by state)',
    relatedJobs: ['mortgage-broker', 'property-manager', 'appraiser'],
    keywords: ['real estate agent salary', 'realtor salary', 'real estate broker pay'],
  },
};

// Helper functions
export function getSalaryBySlug(slug: string): SalaryData | null {
  return SALARY_DATA[slug] || null;
}

export function getAllSalarySlugs(): string[] {
  return Object.keys(SALARY_DATA);
}

export function getSalariesByCategory(category: string): SalaryData[] {
  return Object.values(SALARY_DATA).filter((job) => job.category === category);
}

export function getRelatedJobs(slug: string): SalaryData[] {
  const job = getSalaryBySlug(slug);
  if (!job) return [];
  return job.relatedJobs
    .map((relatedSlug) => getSalaryBySlug(relatedSlug))
    .filter((j): j is SalaryData => j !== null);
}

export function getAllCategories(): string[] {
  const categories = new Set(Object.values(SALARY_DATA).map((job) => job.category));
  return Array.from(categories).sort();
}

// Format helpers
export function formatSalary(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatGrowthOutlook(outlook: SalaryData['growthOutlook']): string {
  const labels = {
    declining: 'Declining',
    stable: 'Stable',
    growing: 'Above Average',
    fast: 'Much Faster Than Average',
  };
  return labels[outlook];
}
