import { User } from '../types/auth';
import { AdmissionEnquiry } from '../types/enquiry';
import { FollowUpTask } from '../types/followUp';
import { MLEvaluationReport } from '../types/mlEvaluation';

/**
 * ⚠️ DEMO & ACADEMIC PROJECT NOTICE:
 * All records below are synthetically generated for demonstration and evaluation
 * of the Admission Enquiry Conversion Prediction & Prioritization System.
 * No real student PII is contained herein.
 */
export const IS_DEMO_MODE = true;
export const DEMO_BANNER_TEXT = "ACADEMIC DEMO MODE: Fictional synthetic dataset for Final Year College Project. ML weights are simulated for explainable AI verification.";

export const MOCK_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Dr. S. Rangarajan',
    email: 'admin@edupredict.edu',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Admissions Directorate & Strategy',
    phone: '+91 94432 10001',
    activeEnquiriesCount: 184,
    conversionRate: 46.8,
    status: 'active'
  },
  {
    id: 'user-counsellor-1',
    name: 'Priya Sundaram',
    email: 'priya@edupredict.edu',
    role: 'counsellor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'Engineering & Technology Admissions',
    phone: '+91 98401 23456',
    activeEnquiriesCount: 52,
    conversionRate: 44.2,
    status: 'active'
  },
  {
    id: 'user-counsellor-2',
    name: 'Rajesh Kannan',
    email: 'rajesh@edupredict.edu',
    role: 'counsellor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Management & Computer Applications',
    phone: '+91 98402 34567',
    activeEnquiriesCount: 48,
    conversionRate: 39.5,
    status: 'active'
  },
  {
    id: 'user-counsellor-3',
    name: 'Sneha Raman',
    email: 'sneha@edupredict.edu',
    role: 'counsellor',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    department: 'Outreach & Lateral Entry Admissions',
    phone: '+91 98403 45678',
    activeEnquiriesCount: 41,
    conversionRate: 41.8,
    status: 'active'
  },
  {
    id: 'user-counsellor-4',
    name: 'Arun Karthik',
    email: 'arun@edupredict.edu',
    role: 'counsellor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'Engineering (Electronics & Mechanical)',
    phone: '+91 98404 56789',
    activeEnquiriesCount: 43,
    conversionRate: 37.0,
    status: 'active'
  }
];

export const MOCK_ENQUIRIES: AdmissionEnquiry[] = [
  {
    id: 'ENQ-2026-081',
    applicationNo: 'APP-2026-0081',
    studentName: 'Karthik Sivakumar',
    email: 'karthik.siva26@gmail.com',
    phone: '+91 98840 12890',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    program: 'B.Tech Artificial Intelligence & Data Science',
    leadSource: 'Walk-in / Campus Visit',
    status: 'Campus Visit Scheduled',
    counsellorId: 'user-counsellor-1',
    counsellorName: 'Priya Sundaram',
    qualifyingExam: '12th Standard / HSC',
    percentageScore: 92.4,
    mathsPhysicsScore: 95.0,
    entranceExamPercentile: 94.2,
    category: 'General',
    budgetRange: '₹1.5L - ₹2.5L / year',
    hostelRequired: true,
    busTransportRequired: false,
    enquiryDate: '2026-10-18',
    lastContactedDate: '2026-10-22',
    engagementScore: 94,
    brochureDownloaded: true,
    campusVisitAttended: true,
    parentAccompanied: true,
    priorityTier: 'Urgent',
    prediction: {
      score: 0.93,
      probabilityPercentage: 93,
      priority: 'Urgent',
      confidenceScore: 0.94,
      modelVersion: 'XGBoost-Ensemble-v2.3 (Demo)',
      predictedAt: '2026-10-22T11:30:00Z',
      recommendedAction: 'Call immediately with HOD lab tour invite & scholarship eligibility letter',
      topDrivers: [
        {
          featureName: 'Campus Visit Attended with Parents',
          category: 'interaction',
          value: 'Yes (Father accompanied)',
          weight: 0.38,
          impact: 'positive',
          explanation: 'Students who visit campus with parents have 4.2x higher historical conversion rate.'
        },
        {
          featureName: 'Maths & Physics Cutoff',
          category: 'academic',
          value: '95.0%',
          weight: 0.28,
          impact: 'positive',
          explanation: 'High cutoff aligns directly with AI & DS eligibility and merit scholarship tier.'
        },
        {
          featureName: 'High Engagement Telemetry',
          category: 'engagement',
          value: '94 / 100',
          weight: 0.18,
          impact: 'positive',
          explanation: 'Multiple curriculum downloads and portal logins within 72 hours.'
        },
        {
          featureName: 'Hostel Distance Factor',
          category: 'demographic',
          value: 'Hostel Required (Coimbatore to Chennai)',
          weight: -0.05,
          impact: 'negative',
          explanation: 'Outstation students compare regional colleges unless hostel allotment is guaranteed.'
        }
      ],
      riskFactors: [
        'Evaluating competing deemed university in Coimbatore with local proximity',
        'Awaiting TNEA counseling round 1 results'
      ]
    },
    interactions: [
      {
        id: 'int-1',
        timestamp: '2026-10-18 10:15 AM',
        counsellorName: 'Priya Sundaram',
        type: 'Campus Visit',
        notes: 'Student visited with father. Showed strong interest in AI GPU lab and robotics club.'
      },
      {
        id: 'int-2',
        timestamp: '2026-10-21 04:30 PM',
        counsellorName: 'Priya Sundaram',
        type: 'Call',
        notes: 'Father requested breakdown of hostel fees and bus commute options. Positive tone.'
      }
    ],
    followUpTasks: [],
    createdAt: '2026-10-18T04:45:00Z',
    updatedAt: '2026-10-22T11:30:00Z'
  },
  {
    id: 'ENQ-2026-082',
    applicationNo: 'APP-2026-0082',
    studentName: 'Ananya Meenakshi',
    email: 'ananya.meenu@outlook.com',
    phone: '+91 97910 88210',
    city: 'Madurai',
    state: 'Tamil Nadu',
    program: 'B.Tech Computer Science & Engineering',
    leadSource: 'Website Form',
    status: 'In Discussion',
    counsellorId: 'user-counsellor-1',
    counsellorName: 'Priya Sundaram',
    qualifyingExam: '12th Standard / HSC',
    percentageScore: 89.6,
    mathsPhysicsScore: 91.5,
    entranceExamPercentile: 91.0,
    category: 'General',
    budgetRange: '₹1.5L - ₹2.5L / year',
    hostelRequired: true,
    busTransportRequired: false,
    enquiryDate: '2026-10-19',
    lastContactedDate: '2026-10-22',
    engagementScore: 86,
    brochureDownloaded: true,
    campusVisitAttended: false,
    parentAccompanied: false,
    priorityTier: 'High',
    prediction: {
      score: 0.84,
      probabilityPercentage: 84,
      priority: 'High',
      confidenceScore: 0.89,
      modelVersion: 'XGBoost-Ensemble-v2.3 (Demo)',
      predictedAt: '2026-10-22T09:15:00Z',
      recommendedAction: 'Invite for Virtual 360 Campus Tour & connect with 3rd year CSE student mentor',
      topDrivers: [
        {
          featureName: 'High 12th Board Marks',
          category: 'academic',
          value: '89.6%',
          weight: 0.32,
          impact: 'positive',
          explanation: 'Academic credentials comfortably surpass CSE open competition criteria.'
        },
        {
          featureName: 'Direct Inbound Organic Lead',
          category: 'interaction',
          value: 'Website Form (Curriculum Inquiry)',
          weight: 0.22,
          impact: 'positive',
          explanation: 'Organic website inquiries have 2.8x higher commitment than social ads.'
        },
        {
          featureName: 'Campus Visit Not Yet Made',
          category: 'interaction',
          value: 'No',
          weight: -0.14,
          impact: 'negative',
          explanation: 'Conversion likelihood jumps from 48% to 85% once an in-person or virtual tour is logged.'
        }
      ],
      riskFactors: [
        'Also considering top tier government college in Trichy'
      ]
    },
    interactions: [
      {
        id: 'int-3',
        timestamp: '2026-10-20 11:00 AM',
        counsellorName: 'Priya Sundaram',
        type: 'Call',
        notes: 'Explored curriculum specifics, asked about AWS and Microsoft campus recruitment.'
      }
    ],
    followUpTasks: [],
    createdAt: '2026-10-19T06:10:00Z',
    updatedAt: '2026-10-22T09:15:00Z'
  },
  {
    id: 'ENQ-2026-083',
    applicationNo: 'APP-2026-0083',
    studentName: 'Vignesh Balaji',
    email: 'vignesh.balaji05@gmail.com',
    phone: '+91 94441 55672',
    city: 'Chennai',
    state: 'Tamil Nadu',
    program: 'B.Tech Information Technology',
    leadSource: 'Google Search Ads',
    status: 'Application Submitted',
    counsellorId: 'user-counsellor-2',
    counsellorName: 'Rajesh Kannan',
    qualifyingExam: '12th Standard / HSC',
    percentageScore: 84.0,
    mathsPhysicsScore: 82.5,
    entranceExamPercentile: 83.0,
    category: 'OBC',
    budgetRange: '₹1.5L - ₹2.5L / year',
    hostelRequired: false,
    busTransportRequired: true,
    enquiryDate: '2026-10-15',
    lastContactedDate: '2026-10-23',
    engagementScore: 78,
    brochureDownloaded: true,
    campusVisitAttended: true,
    parentAccompanied: true,
    priorityTier: 'High',
    prediction: {
      score: 0.79,
      probabilityPercentage: 79,
      priority: 'High',
      confidenceScore: 0.91,
      modelVersion: 'XGBoost-Ensemble-v2.3 (Demo)',
      predictedAt: '2026-10-23T08:00:00Z',
      recommendedAction: 'Verify provisional certificates and issue seat confirmation token fee link',
      topDrivers: [
        {
          featureName: 'Application Form Submitted',
          category: 'interaction',
          value: 'Completed & Fee Paid',
          weight: 0.45,
          impact: 'positive',
          explanation: 'Stage progression strongly correlates with final seat booking.'
        },
        {
          featureName: 'Local Commuter Advantage',
          category: 'demographic',
          value: 'Chennai (College Bus Route 14)',
          weight: 0.15,
          impact: 'positive',
          explanation: 'Day-scholars residing on college bus routes convert 35% higher.'
        }
      ],
      riskFactors: []
    },
    interactions: [
      {
        id: 'int-4',
        timestamp: '2026-10-16 02:15 PM',
        counsellorName: 'Rajesh Kannan',
        type: 'Call',
        notes: 'Helped student upload Class 10 and 12 mark statements.'
      }
    ],
    followUpTasks: [],
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-23T08:00:00Z'
  },
  {
    id: 'ENQ-2026-084',
    applicationNo: 'APP-2026-0084',
    studentName: 'Deepak Krishnan',
    email: 'deepak.krishnan03@yahoo.com',
    phone: '+91 98845 99312',
    city: 'Salem',
    state: 'Tamil Nadu',
    program: 'B.Tech Electronics & Communication',
    leadSource: 'Education Fair / Expo',
    status: 'Contacted',
    counsellorId: 'user-counsellor-4',
    counsellorName: 'Arun Karthik',
    qualifyingExam: '12th Standard / HSC',
    percentageScore: 76.5,
    mathsPhysicsScore: 74.0,
    category: 'General',
    budgetRange: 'Under ₹1.5L / year',
    hostelRequired: true,
    busTransportRequired: false,
    enquiryDate: '2026-10-14',
    lastContactedDate: '2026-10-20',
    engagementScore: 54,
    brochureDownloaded: false,
    campusVisitAttended: false,
    parentAccompanied: false,
    priorityTier: 'Medium',
    prediction: {
      score: 0.52,
      probabilityPercentage: 52,
      priority: 'Medium',
      confidenceScore: 0.76,
      modelVersion: 'XGBoost-Ensemble-v2.3 (Demo)',
      predictedAt: '2026-10-20T14:00:00Z',
      recommendedAction: 'Offer installment payment plan info & highlight VLSI/Embedded systems placement records',
      topDrivers: [
        {
          featureName: 'Budget Constraint vs Fee Gap',
          category: 'demographic',
          value: 'Under ₹1.5L / year',
          weight: -0.25,
          impact: 'negative',
          explanation: 'Standard tuition is ₹1.85L. Financial aid / educational loan guidance required.'
        },
        {
          featureName: 'Event Expo Walk-in',
          category: 'interaction',
          value: 'Education Fair Stall',
          weight: 0.12,
          impact: 'positive',
          explanation: 'Initial contact made in person; showed interest in hardware core jobs.'
        }
      ],
      riskFactors: [
        'Budget sensitive - needs SBI education loan tie-up assistance'
      ]
    },
    interactions: [],
    followUpTasks: [],
    createdAt: '2026-10-14T09:30:00Z',
    updatedAt: '2026-10-20T14:00:00Z'
  },
  {
    id: 'ENQ-2026-085',
    applicationNo: 'APP-2026-0085',
    studentName: 'Harini Jayaraman',
    email: 'harini.j2004@gmail.com',
    phone: '+91 97890 11445',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    program: 'MCA - Cloud Computing',
    leadSource: 'Alumni Referral',
    status: 'In Discussion',
    counsellorId: 'user-counsellor-2',
    counsellorName: 'Rajesh Kannan',
    qualifyingExam: 'Undergraduate Degree',
    percentageScore: 87.2,
    category: 'General',
    budgetRange: '₹1.5L - ₹2.5L / year',
    hostelRequired: true,
    busTransportRequired: false,
    enquiryDate: '2026-10-17',
    lastContactedDate: '2026-10-21',
    engagementScore: 88,
    brochureDownloaded: true,
    campusVisitAttended: false,
    parentAccompanied: false,
    priorityTier: 'Urgent',
    prediction: {
      score: 0.91,
      probabilityPercentage: 91,
      priority: 'Urgent',
      confidenceScore: 0.93,
      modelVersion: 'XGBoost-Ensemble-v2.3 (Demo)',
      predictedAt: '2026-10-21T16:00:00Z',
      recommendedAction: 'Connect with alumnus referee & schedule immediate faculty interaction',
      topDrivers: [
        {
          featureName: 'Alumni Referral Source',
          category: 'interaction',
          value: 'Referral (Batch 2023)',
          weight: 0.42,
          impact: 'positive',
          explanation: 'Alumni referrals have the highest historical enrollment conversion rate (78%).'
        },
        {
          featureName: 'Consistent UG Academic Record',
          category: 'academic',
          value: '87.2% B.Sc Computer Science',
          weight: 0.24,
          impact: 'positive',
          explanation: 'Exceeds direct MCA admission benchmark.'
        }
      ],
      riskFactors: []
    },
    interactions: [],
    followUpTasks: [],
    createdAt: '2026-10-17T11:00:00Z',
    updatedAt: '2026-10-21T16:00:00Z'
  },
  {
    id: 'ENQ-2026-086',
    applicationNo: 'APP-2026-0086',
    studentName: 'Mohammed Ashik',
    email: 'ashik.mohammed@gmail.com',
    phone: '+91 96001 77432',
    city: 'Vellore',
    state: 'Tamil Nadu',
    program: 'MBA - Technology Management',
    leadSource: 'Social Media (Instagram/LinkedIn)',
    status: 'New',
    counsellorId: 'user-counsellor-3',
    counsellorName: 'Sneha Raman',
    qualifyingExam: 'Undergraduate Degree',
    percentageScore: 71.0,
    category: 'OBC',
    budgetRange: 'Above ₹2.5L / year',
    hostelRequired: false,
    busTransportRequired: false,
    enquiryDate: '2026-10-22',
    lastContactedDate: undefined,
    engagementScore: 42,
    brochureDownloaded: false,
    campusVisitAttended: false,
    parentAccompanied: false,
    priorityTier: 'Low',
    prediction: {
      score: 0.34,
      probabilityPercentage: 34,
      priority: 'Low',
      confidenceScore: 0.72,
      modelVersion: 'XGBoost-Ensemble-v2.3 (Demo)',
      predictedAt: '2026-10-22T17:15:00Z',
      recommendedAction: 'Send automated WhatsApp brochure & nurture with executive alumni stories',
      topDrivers: [
        {
          featureName: 'Cold Social Media Lead',
          category: 'interaction',
          value: 'Instagram Lead Ad',
          weight: -0.22,
          impact: 'negative',
          explanation: 'Social ad form clicks have low conversion without warm phone follow-up.'
        },
        {
          featureName: 'No Brochure Download Recorded',
          category: 'engagement',
          value: 'Not Downloaded',
          weight: -0.15,
          impact: 'negative',
          explanation: 'Passive interest indicated.'
        }
      ],
      riskFactors: [
        'Passive engagement; multiple clicks on competing business schools'
      ]
    },
    interactions: [],
    followUpTasks: [],
    createdAt: '2026-10-22T17:15:00Z',
    updatedAt: '2026-10-22T17:15:00Z'
  },
  {
    id: 'ENQ-2026-087',
    applicationNo: 'APP-2026-0087',
    studentName: 'Pooja Venkatesh',
    email: 'pooja.venkat2005@gmail.com',
    phone: '+91 98414 66321',
    city: 'Chennai',
    state: 'Tamil Nadu',
    program: 'B.Tech Artificial Intelligence & Data Science',
    leadSource: 'Walk-in / Campus Visit',
    status: 'Converted',
    counsellorId: 'user-counsellor-1',
    counsellorName: 'Priya Sundaram',
    qualifyingExam: '12th Standard / HSC',
    percentageScore: 94.8,
    mathsPhysicsScore: 96.0,
    entranceExamPercentile: 96.5,
    category: 'General',
    budgetRange: 'Above ₹2.5L / year',
    hostelRequired: false,
    busTransportRequired: true,
    enquiryDate: '2026-10-10',
    lastContactedDate: '2026-10-23',
    engagementScore: 98,
    brochureDownloaded: true,
    campusVisitAttended: true,
    parentAccompanied: true,
    priorityTier: 'Urgent',
    prediction: {
      score: 0.97,
      probabilityPercentage: 97,
      priority: 'Urgent',
      confidenceScore: 0.98,
      modelVersion: 'XGBoost-Ensemble-v2.3 (Demo)',
      predictedAt: '2026-10-23T10:00:00Z',
      recommendedAction: 'Admission fee processed! Send welcome kit & orientation invite',
      topDrivers: [
        {
          featureName: 'Fee Payment & Document Verification',
          category: 'interaction',
          value: 'Paid Token Fee',
          weight: 0.60,
          impact: 'positive',
          explanation: 'Final conversion confirmed.'
        }
      ],
      riskFactors: []
    },
    interactions: [
      {
        id: 'int-5',
        timestamp: '2026-10-23 10:00 AM',
        counsellorName: 'Priya Sundaram',
        type: 'Campus Visit',
        notes: 'Parent paid admission registration fee. Provisional allotment letter issued.'
      }
    ],
    followUpTasks: [],
    createdAt: '2026-10-10T09:00:00Z',
    updatedAt: '2026-10-23T10:00:00Z'
  },
  {
    id: 'ENQ-2026-088',
    applicationNo: 'APP-2026-0088',
    studentName: 'Rohan Matthew',
    email: 'rohan.matthew@gmail.com',
    phone: '+91 94871 22904',
    city: 'Kochi',
    state: 'Kerala',
    program: 'B.Tech Mechanical Engineering',
    leadSource: 'School Outreach Program',
    status: 'Contacted',
    counsellorId: 'user-counsellor-4',
    counsellorName: 'Arun Karthik',
    qualifyingExam: '12th Standard / HSC',
    percentageScore: 78.4,
    mathsPhysicsScore: 79.0,
    category: 'General',
    budgetRange: '₹1.5L - ₹2.5L / year',
    hostelRequired: true,
    busTransportRequired: false,
    enquiryDate: '2026-10-12',
    lastContactedDate: '2026-10-19',
    engagementScore: 61,
    brochureDownloaded: true,
    campusVisitAttended: false,
    parentAccompanied: false,
    priorityTier: 'Medium',
    prediction: {
      score: 0.58,
      probabilityPercentage: 58,
      priority: 'Medium',
      confidenceScore: 0.81,
      modelVersion: 'XGBoost-Ensemble-v2.3 (Demo)',
      predictedAt: '2026-10-19T15:30:00Z',
      recommendedAction: 'Highlight electric vehicle & CAD lab facilities; share Kerala student alumni contacts',
      topDrivers: [
        {
          featureName: 'School Career Guidance Drive Attendee',
          category: 'interaction',
          value: 'School Seminar Kochi',
          weight: 0.16,
          impact: 'positive',
          explanation: 'Attended session by college admissions team.'
        },
        {
          featureName: 'Out-of-state Travel Distance',
          category: 'demographic',
          value: 'Kerala to TN',
          weight: -0.12,
          impact: 'negative',
          explanation: 'Competes with Kerala government engineering colleges.'
        }
      ],
      riskFactors: [
        'Awaiting KEAM engineering entrance rank list'
      ]
    },
    interactions: [],
    followUpTasks: [],
    createdAt: '2026-10-12T10:00:00Z',
    updatedAt: '2026-10-19T15:30:00Z'
  }
];

export const MOCK_FOLLOW_UPS: FollowUpTask[] = [
  {
    id: 'TASK-101',
    enquiryId: 'ENQ-2026-081',
    studentName: 'Karthik Sivakumar',
    courseInterested: 'B.Tech AI & Data Science',
    counsellorId: 'user-counsellor-1',
    counsellorName: 'Priya Sundaram',
    scheduledDate: '2026-10-23', // Today
    scheduledTime: '11:00 AM',
    channel: 'Phone Call',
    status: 'Pending',
    priority: 'Urgent',
    notes: 'Father requested hostel fee structure and AI lab tour confirmation. High conversion intent!',
    createdAt: '2026-10-22T11:45:00Z'
  },
  {
    id: 'TASK-102',
    enquiryId: 'ENQ-2026-082',
    studentName: 'Ananya Meenakshi',
    courseInterested: 'B.Tech Computer Science',
    counsellorId: 'user-counsellor-1',
    counsellorName: 'Priya Sundaram',
    scheduledDate: '2026-10-23', // Today
    scheduledTime: '02:30 PM',
    channel: 'WhatsApp',
    status: 'Pending',
    priority: 'High',
    notes: 'Send 360 Virtual Campus Tour link and 2025-26 CSE placement statistics booklet.',
    createdAt: '2026-10-22T09:30:00Z'
  },
  {
    id: 'TASK-103',
    enquiryId: 'ENQ-2026-085',
    studentName: 'Harini Jayaraman',
    courseInterested: 'MCA - Cloud Computing',
    counsellorId: 'user-counsellor-2',
    counsellorName: 'Rajesh Kannan',
    scheduledDate: '2026-10-23', // Today
    scheduledTime: '04:00 PM',
    channel: 'Virtual Counselling',
    status: 'Pending',
    priority: 'Urgent',
    notes: 'Facilitate Google Meet call with MCA Department Head Dr. Sundar.',
    createdAt: '2026-10-21T16:10:00Z'
  },
  {
    id: 'TASK-104',
    enquiryId: 'ENQ-2026-084',
    studentName: 'Deepak Krishnan',
    courseInterested: 'B.Tech Electronics & Comm.',
    counsellorId: 'user-counsellor-4',
    counsellorName: 'Arun Karthik',
    scheduledDate: '2026-10-21', // Overdue
    scheduledTime: '03:00 PM',
    channel: 'Phone Call',
    status: 'Overdue',
    priority: 'Medium',
    notes: 'Student wanted details on education loan documents and installment plans.',
    createdAt: '2026-10-18T10:00:00Z'
  },
  {
    id: 'TASK-105',
    enquiryId: 'ENQ-2026-087',
    studentName: 'Pooja Venkatesh',
    courseInterested: 'B.Tech AI & Data Science',
    counsellorId: 'user-counsellor-1',
    counsellorName: 'Priya Sundaram',
    scheduledDate: '2026-10-23',
    scheduledTime: '10:00 AM',
    channel: 'Campus Visit',
    status: 'Completed',
    priority: 'Urgent',
    outcome: 'Enrolled / Paid Application Fee',
    notes: 'Completed enrollment and verified original certificates. Success!',
    completedAt: '2026-10-23T10:30:00Z',
    createdAt: '2026-10-22T16:00:00Z'
  },
  {
    id: 'TASK-106',
    enquiryId: 'ENQ-2026-088',
    studentName: 'Rohan Matthew',
    courseInterested: 'B.Tech Mechanical Engineering',
    counsellorId: 'user-counsellor-4',
    counsellorName: 'Arun Karthik',
    scheduledDate: '2026-10-25', // Upcoming
    scheduledTime: '11:30 AM',
    channel: 'Phone Call',
    status: 'Pending',
    priority: 'Medium',
    notes: 'Follow up after KEAM mock allotment results are published.',
    createdAt: '2026-10-20T12:00:00Z'
  }
];

export const MOCK_ML_EVALUATION: MLEvaluationReport = {
  isSyntheticDemo: true,
  disclaimer: "College Academic Research Prototype: Evaluated on synthetic stratified test dataset (N = 1,200 admission records). Fictional benchmark used for model demonstration; not an operational deployment audit.",
  modelVersion: "XGBoost-Classifier v2.3.1 (Trained on 4,800 Synthetic Historical Records)",
  trainedDate: "October 2026",
  datasetSize: {
    totalRecords: 6000,
    trainingRecords: 4800,
    testRecords: 1200,
    splitRatio: "80% Train / 20% Stratified Test"
  },
  metrics: {
    accuracy: 0.884,
    precision: 0.867,
    recall: 0.852,
    f1Score: 0.859,
    rocAuc: 0.914,
    prAuc: 0.887
  },
  confusionMatrix: {
    truePositive: 443,  // Correctly predicted enrolled
    falsePositive: 68,  // Predicted enrolled but didn't enroll
    falseNegative: 77,  // Predicted not enrolled but enrolled
    trueNegative: 612   // Correctly predicted not enrolled
  },
  featureImportances: [
    {
      feature: 'campus_visit_attended',
      category: 'Interaction Telemetry',
      importance: 0.284,
      description: 'Physical campus walk-in presence with parents is the strongest single predictor.'
    },
    {
      feature: 'qualifying_percentage_score',
      category: 'Academic Credentials',
      importance: 0.212,
      description: 'Higher 12th cutoff scores show higher decision readiness for self-financing engineering seats.'
    },
    {
      feature: 'lead_source_type',
      category: 'Channel Attribution',
      importance: 0.165,
      description: 'Referrals & direct organic website forms outperform cold social ad leads.'
    },
    {
      feature: 'engagement_score',
      category: 'Web/Portal Activity',
      importance: 0.138,
      description: 'Brochure downloads, page views, and quick response to WhatsApp outreach.'
    },
    {
      feature: 'budget_alignment_index',
      category: 'Demographic/Financial',
      importance: 0.106,
      description: 'Affordability match against program annual fee schedule.'
    },
    {
      feature: 'commute_distance_km',
      category: 'Geographic Telemetry',
      importance: 0.095,
      description: 'Hostel requirement vs regional vicinity to campus.'
    }
  ],
  modelComparisons: [
    {
      name: 'XGBoost Classifier (Current)',
      type: 'Gradient Boosted Trees',
      accuracy: 0.884,
      precision: 0.867,
      recall: 0.852,
      f1Score: 0.859,
      rocAuc: 0.914,
      inferenceLatencyMs: 14,
      isCurrentChampion: true
    },
    {
      name: 'Random Forest Classifier',
      type: 'Ensemble Bagging',
      accuracy: 0.856,
      precision: 0.835,
      recall: 0.819,
      f1Score: 0.827,
      rocAuc: 0.889,
      inferenceLatencyMs: 22,
      isCurrentChampion: false
    },
    {
      name: 'LightGBM Classifier',
      type: 'Leaf-wise Tree Boosting',
      accuracy: 0.879,
      precision: 0.860,
      recall: 0.846,
      f1Score: 0.853,
      rocAuc: 0.908,
      inferenceLatencyMs: 9,
      isCurrentChampion: false
    },
    {
      name: 'Logistic Regression (Baseline)',
      type: 'Linear Benchmark',
      accuracy: 0.772,
      precision: 0.730,
      recall: 0.715,
      f1Score: 0.722,
      rocAuc: 0.812,
      inferenceLatencyMs: 2,
      isCurrentChampion: false
    }
  ],
  calibrationCurve: [
    { bin: '0 - 20%', predictedProb: 0.11, trueFraction: 0.09 },
    { bin: '20 - 40%', predictedProb: 0.31, trueFraction: 0.28 },
    { bin: '40 - 60%', predictedProb: 0.52, trueFraction: 0.54 },
    { bin: '60 - 80%', predictedProb: 0.71, trueFraction: 0.73 },
    { bin: '80 - 100%', predictedProb: 0.91, trueFraction: 0.93 }
  ]
};

export const MOCK_FUNNEL_DATA = [
  { stage: 'Total Enquiries', count: 480, dropoff: '0%' },
  { stage: 'Contacted', count: 395, dropoff: '17.7%' },
  { stage: 'In Discussion', count: 284, dropoff: '28.1%' },
  { stage: 'Campus Visit', count: 188, dropoff: '33.8%' },
  { stage: 'Application Form', count: 124, dropoff: '34.0%' },
  { stage: 'Enrolled / Converted', count: 86, dropoff: '30.6%' }
];

export const MOCK_MONTHLY_TRENDS = [
  { month: 'May 2026', enquiries: 120, conversions: 24, highIntentLeads: 42 },
  { month: 'Jun 2026', enquiries: 240, conversions: 58, highIntentLeads: 86 },
  { month: 'Jul 2026', enquiries: 380, conversions: 96, highIntentLeads: 144 },
  { month: 'Aug 2026', enquiries: 410, conversions: 112, highIntentLeads: 168 },
  { month: 'Sep 2026', enquiries: 310, conversions: 78, highIntentLeads: 110 },
  { month: 'Oct 2026', enquiries: 215, conversions: 54, highIntentLeads: 82 }
];

export const MOCK_SOURCE_PERFORMANCE = [
  { source: 'Walk-in / Campus Visit', count: 96, converted: 58, rate: 60.4 },
  { source: 'Alumni Referral', count: 64, converted: 42, rate: 65.6 },
  { source: 'Website Form', count: 154, converted: 52, rate: 33.8 },
  { source: 'Google Search Ads', count: 88, converted: 26, rate: 29.5 },
  { source: 'Education Fair', count: 72, converted: 18, rate: 25.0 },
  { source: 'Social Media Ads', count: 120, converted: 21, rate: 17.5 }
];
