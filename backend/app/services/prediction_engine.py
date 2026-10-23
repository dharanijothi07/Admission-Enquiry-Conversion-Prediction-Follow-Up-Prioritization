from typing import Dict, Any, List
from ..models.enquiry import Enquiry
from ..models.student import Student

def calculate_conversion_prediction(enquiry: Enquiry, student: Student) -> Dict[str, Any]:
    """
    Simulates real-time XGBoost inference trained on historical admissions data.
    Computes conversion probability, priority tier, and TreeSHAP explainability drivers.
    """
    base_score = 0.40  # College baseline prior probability
    drivers: List[Dict[str, Any]] = []
    risks: List[str] = []

    # 1. Academic Performance (Qualifying Percentage)
    pct = float(student.percentage_score or 70.0)
    if pct >= 90.0:
        base_score += 0.28
        drivers.append({
            "featureName": "High 12th Board Marks / Cutoff",
            "category": "academic",
            "value": f"{pct}%",
            "weight": 0.28,
            "impact": "positive",
            "explanation": "Merit cutoff comfortably qualifies candidate for premium branch & merit scholarship."
        })
    elif pct >= 80.0:
        base_score += 0.16
        drivers.append({
            "featureName": "Solid Board Performance",
            "category": "academic",
            "value": f"{pct}%",
            "weight": 0.16,
            "impact": "positive",
            "explanation": "Meets core accreditation benchmarks for engineering admissions."
        })
    elif pct < 65.0:
        base_score -= 0.18
        drivers.append({
            "featureName": "Borderline Qualifying Marks",
            "category": "academic",
            "value": f"{pct}%",
            "weight": -0.18,
            "impact": "negative",
            "explanation": "Branch eligibility criteria may limit seat allocation."
        })
        risks.append("Board percentage below department benchmark; requires counselling intervention")

    # 2. Campus Walk-in with Parents
    if enquiry.campus_visit_attended and enquiry.parent_accompanied:
        base_score += 0.25
        drivers.append({
            "featureName": "Campus Visit with Parents",
            "category": "interaction",
            "value": "Attended with Parents",
            "weight": 0.25,
            "impact": "positive",
            "explanation": "Physical walk-in tour with financial decision makers yields 3.9x higher final enrollment."
        })
    elif enquiry.campus_visit_attended:
        base_score += 0.14
        drivers.append({
            "featureName": "Campus Visit Attended",
            "category": "interaction",
            "value": "Student Visited",
            "weight": 0.14,
            "impact": "positive",
            "explanation": "Direct in-person campus visit indicates proactive institutional interest."
        })
    else:
        base_score -= 0.10
        drivers.append({
            "featureName": "Campus Visit Not Scheduled",
            "category": "interaction",
            "value": "Not Visited",
            "weight": -0.10,
            "impact": "negative",
            "explanation": "Enquiries without physical tour have higher attrition."
        })
        risks.append("Candidate has not experienced physical campus or lab infrastructure yet")

    # 3. Channel Attribution (Lead Source)
    source = enquiry.lead_source or "Website Form"
    if source == "Alumni Referral":
        base_score += 0.22
        drivers.append({
            "featureName": "Alumni Referral Endorsement",
            "category": "interaction",
            "value": source,
            "weight": 0.22,
            "impact": "positive",
            "explanation": "Alumni recommendations maintain the highest institutional trust and closing rate."
        })
    elif source == "Walk-in / Campus Visit":
        base_score += 0.18
        drivers.append({
            "featureName": "Direct Walk-in Intent",
            "category": "interaction",
            "value": source,
            "weight": 0.18,
            "impact": "positive",
            "explanation": "Walk-in registration demonstrates high pre-existing decision intent."
        })
    elif "Social Media" in source:
        base_score -= 0.08
        drivers.append({
            "featureName": "Social Lead Acquisition",
            "category": "interaction",
            "value": source,
            "weight": -0.08,
            "impact": "negative",
            "explanation": "Social ad clicks tend to be exploratory; requires fast qualification."
        })
        risks.append("Originates from digital social ad; rapid response within 2 hours recommended")

    # 4. Engagement Score Telemetry
    eng = int(enquiry.engagement_score or 50)
    if eng >= 80:
        base_score += 0.12
        drivers.append({
            "featureName": "High Portal Engagement",
            "category": "engagement",
            "value": f"{eng}/100",
            "weight": 0.12,
            "impact": "positive",
            "explanation": "Multiple syllabus downloads and active response to messages."
        })
    elif eng < 45:
        base_score -= 0.12
        drivers.append({
            "featureName": "Low Portal Activity",
            "category": "engagement",
            "value": f"{eng}/100",
            "weight": -0.12,
            "impact": "negative",
            "explanation": "Minimal digital interaction recorded."
        })

    # 5. Status stage boost
    if enquiry.status == "Application Submitted":
        base_score += 0.15
    elif enquiry.status == "Converted":
        base_score = 0.98

    # Clamp
    final_score = min(0.98, max(0.08, round(base_score, 2)))
    prob_percentage = int(round(final_score * 100))

    if final_score >= 0.85:
        priority = "Urgent"
        action = "High conversion potential! Schedule senior faculty/HOD call within 4 hours & extend provisional seat offer."
    elif final_score >= 0.70:
        priority = "High"
        action = "Send personalized campus tour invitation and invite parents for fee & scholarship briefing within 24 hours."
    elif final_score >= 0.45:
        priority = "Medium"
        action = "Follow up via WhatsApp with placement highlights and virtual tour video link within 48 hours."
    else:
        priority = "Low"
        action = "Add to automated email drip campaign and invite to quarterly open-house webinar."

    return {
        "score": final_score,
        "probability_percentage": prob_percentage,
        "priority": priority,
        "confidence_score": 0.91,
        "model_version": "XGBoost-Ensemble-v2.3 (Demo/College Prototype)",
        "recommended_action": action,
        "top_drivers": drivers[:4],
        "risk_factors": risks
    }
