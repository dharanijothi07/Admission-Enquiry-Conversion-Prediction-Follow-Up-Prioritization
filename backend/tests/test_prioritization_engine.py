import pytest
from datetime import date, timedelta, datetime, timezone
from app.services.prioritization_engine import (
    FollowUpPrioritizationEngine,
    PrioritizationInput,
    PrioritizationOutput,
    GOVERNANCE_DISCLAIMER
)

# =====================================================================
# 1. UNIT TESTS: PURE DETERMINISTIC PRIORITIZATION LOGIC
# =====================================================================

def test_engine_deterministic_score_calculation():
    """Verifies transparent points breakdown across all components."""
    ref_date = date(2026, 10, 23)
    
    # Task due today, contacted 4 days ago, Application Submitted, ML prob 80%, assigned
    p_input = PrioritizationInput(
        enquiry_id="test-enq-1",
        scheduled_date=date(2026, 10, 23), # Due today: +22 pts
        last_contacted_date=date(2026, 10, 19), # 4 days gap: +8 pts
        application_stage="Application Submitted", # High stakes stage: +20 pts
        conversion_probability=80, # High ML conversion (>=75%): +15 pts
        model_version="admission_model_v1.0.0",
        counsellor_id="counsellor-1",
        response_history=["Interested - Requested Prospectus"], # Positive response: +8 pts
        reference_date=ref_date
    )

    output = FollowUpPrioritizationEngine.evaluate(p_input)
    # Expected: 22 + 8 + 20 + 15 + 8 = 73 points
    assert output.operational_score == 73
    assert output.priority == "HIGH"
    assert output.is_due_today is True
    assert output.is_overdue is False
    assert len(output.reasons) >= 5
    assert "admission_model_v1.0.0" in output.model_version

def test_separation_conversion_propensity_vs_operational_urgency():
    """
    CRITICAL ARCHITECTURAL TEST:
    Verifies that Conversion Probability (ML) is distinct from Operational Urgency.
    
    Case A: High ML conversion (92%), but scheduled 10 days in future -> LOW Operational Urgency.
    Case B: Low ML conversion (35%), but overdue by 5 days -> HIGH Operational Urgency.
    """
    ref_date = date(2026, 10, 23)

    # Case A: Future scheduled high-intent lead
    case_a = PrioritizationInput(
        enquiry_id="lead-future-vip",
        scheduled_date=ref_date + timedelta(days=10), # Far future (+0 pts)
        last_contacted_date=ref_date - timedelta(days=1), # Contacted yesterday (+2 pts)
        application_stage="Contacted", # (+10 pts)
        conversion_probability=92, # High ML propensity (+15 pts)
        counsellor_id="counsellor-1",
        response_history=["High Intent - Scheduling Campus Visit"],
        reference_date=ref_date
    )
    result_a = FollowUpPrioritizationEngine.evaluate(case_a)
    # Score: 0 (future) + 2 (yesterday) + 10 (stage) + 15 (ML) + 8 (history) = 35 pts
    assert result_a.conversion_probability == 92
    assert result_a.conversion_propensity_label == "High Conversion Propensity"
    assert result_a.operational_score < 40
    assert result_a.priority == "LOW" # Operational urgency is LOW today despite high conversion propensity!

    # Case B: Overdue lead with low conversion propensity
    case_b = PrioritizationInput(
        enquiry_id="lead-overdue-cold",
        scheduled_date=ref_date - timedelta(days=5), # Overdue 5 days (+35 pts)
        last_contacted_date=ref_date - timedelta(days=12), # 12 days gap (+14 pts)
        application_stage="New", # (+12 pts)
        conversion_probability=35, # Low ML propensity (+5 pts)
        counsellor_id="counsellor-1",
        response_history=["Not Reachable"],
        reference_date=ref_date
    )
    result_b = FollowUpPrioritizationEngine.evaluate(case_b)
    # Score: 35 + 14 + 12 + 5 + 5 = 71 pts
    assert result_b.conversion_probability == 35
    assert result_b.is_overdue is True
    assert result_b.days_overdue == 5
    assert result_b.priority == "HIGH" # Operational urgency is HIGH today due to overdue backlog!

def test_edge_case_critically_overdue_10_days():
    """Edge case: Task overdue by 10 days receives maximum penalty and urgent action."""
    ref_date = date(2026, 10, 23)
    p_input = PrioritizationInput(
        enquiry_id="enq-overdue-10",
        scheduled_date=ref_date - timedelta(days=10),
        last_contacted_date=ref_date - timedelta(days=15),
        application_stage="Application Submitted",
        conversion_probability=65,
        counsellor_id="counsellor-1",
        reference_date=ref_date
    )
    output = FollowUpPrioritizationEngine.evaluate(p_input)
    assert output.is_overdue is True
    assert output.days_overdue == 10
    assert output.priority == "HIGH"
    assert any("Critically overdue by 10 days" in r for r in output.reasons)
    assert "Call applicant immediately" in output.recommended_action

def test_edge_case_fresh_uncontacted_lead():
    """Edge case: Fresh enquiry with no previous contact history receives introductory priority."""
    ref_date = date(2026, 10, 23)
    p_input = PrioritizationInput(
        enquiry_id="enq-fresh",
        scheduled_date=ref_date,
        last_contacted_date=None, # Never contacted
        application_stage="New",
        conversion_probability=None, # ML pending
        counsellor_id="counsellor-1",
        reference_date=ref_date
    )
    output = FollowUpPrioritizationEngine.evaluate(p_input)
    assert any("Never contacted: fresh enquiry" in r for r in output.reasons)
    assert output.conversion_propensity_label == "Propensity Assessment Pending"
    assert "Initial outreach" in output.recommended_action or "scheduled follow-up" in output.recommended_action

def test_edge_case_unassigned_counsellor():
    """Edge case: Lead lacking assigned counsellor gets escalation points."""
    ref_date = date(2026, 10, 23)
    p_input = PrioritizationInput(
        enquiry_id="enq-unassigned",
        scheduled_date=ref_date,
        last_contacted_date=ref_date - timedelta(days=2),
        application_stage="In Discussion",
        counsellor_id=None, # Unassigned
        reference_date=ref_date
    )
    output = FollowUpPrioritizationEngine.evaluate(p_input)
    assert any("Unassigned lead: requires prompt counsellor assignment" in r for r in output.reasons)

def test_edge_case_repeated_unreachable_channel_shift():
    """Edge case: 2+ consecutive missed calls suggests shifting channel to WhatsApp/async."""
    ref_date = date(2026, 10, 23)
    p_input = PrioritizationInput(
        enquiry_id="enq-unreachable",
        scheduled_date=ref_date,
        last_contacted_date=ref_date - timedelta(days=3),
        application_stage="Contacted",
        counsellor_id="counsellor-1",
        response_history=["Not Reachable", "Not Reachable"], # 2 consecutive missed calls
        reference_date=ref_date
    )
    output = FollowUpPrioritizationEngine.evaluate(p_input)
    assert any("Repeated unreachability (2 missed calls)" in r for r in output.reasons)
    assert "Shift channel: Send WhatsApp" in output.recommended_action

def test_ethical_guardrail_no_demographic_leakage():
    """
    ETHICAL SAFETY TEST:
    Verifies that no sensitive personal attributes (religion, caste, gender,
    city/tier, parental income) exist in engine inputs or influence the score.
    """
    p_input = PrioritizationInput(
        enquiry_id="safe-lead",
        scheduled_date=date.today(),
        application_stage="New"
    )
    # Confirm fields on dataclass
    assert not hasattr(p_input, "religion")
    assert not hasattr(p_input, "caste")
    assert not hasattr(p_input, "gender")
    assert not hasattr(p_input, "income")
    assert not hasattr(p_input, "student_name")

    output = FollowUpPrioritizationEngine.evaluate(p_input)
    assert output.governance_notice == GOVERNANCE_DISCLAIMER
    assert "strictly does NOT automate or influence formal admission" in output.governance_notice

def test_counsellor_manual_override_with_reason():
    """Verifies that counsellor manual override supercedes engine tier and logs reason."""
    p_input = PrioritizationInput(
        enquiry_id="overridden-lead",
        scheduled_date=date.today() + timedelta(days=5), # Low urgency
        application_stage="New",
        conversion_probability=30,
        is_overridden=True,
        overridden_priority="HIGH",
        override_reason="Parent visited admissions office unannounced; requested priority counselling"
    )
    output = FollowUpPrioritizationEngine.evaluate(p_input)
    assert output.priority == "HIGH"
    assert output.is_overridden is True
    assert output.overridden_priority == "HIGH"
    assert "MANUAL OVERRIDE: Counsellor set priority to HIGH" in output.reasons[0]
    assert "Parent visited admissions office" in output.reasons[0]


# =====================================================================
# 2. INTEGRATION TESTS: FASTAPI ENDPOINTS & AUDIT TRAILS
# =====================================================================

def test_api_schedule_followup_auto_evaluates_prioritization(client, counsellor_a_token, enquiry_of_counsellor_a):
    """Tests that scheduling a follow-up triggers automatic operational evaluation and audit logging."""
    today_str = date.today().isoformat()
    resp = client.post(
        "/api/v1/followups",
        headers={"Authorization": f"Bearer {counsellor_a_token}"},
        json={
            "enquiry_id": enquiry_of_counsellor_a.id,
            "scheduled_date": today_str,
            "scheduled_time": "10:30 AM",
            "channel": "Phone Call",
            "notes": "Discuss curriculum with student"
        }
    )
    assert resp.status_code == 201
    data = resp.json()
    assert "operational_score" in data
    assert 0 <= data["operational_score"] <= 100
    assert len(data["priority_reasons"]) > 0
    assert data["recommended_action"] is not None
    assert data["is_due_today"] is True
    assert "governance_notice" in data

def test_api_override_priority_with_mandatory_audit(client, counsellor_a_token, enquiry_of_counsellor_a):
    """Tests manual priority override endpoint with audit record generation."""
    # 1. Create a follow-up
    task = client.post(
        "/api/v1/followups",
        headers={"Authorization": f"Bearer {counsellor_a_token}"},
        json={
            "enquiry_id": enquiry_of_counsellor_a.id,
            "scheduled_date": (date.today() + timedelta(days=3)).isoformat(),
            "scheduled_time": "02:00 PM",
            "channel": "WhatsApp"
        }
    ).json()

    task_id = task["id"]

    # 2. Attempt override with blank reason (should fail with 422)
    bad_resp = client.post(
        f"/api/v1/followups/{task_id}/override",
        headers={"Authorization": f"Bearer {counsellor_a_token}"},
        json={
            "new_priority": "HIGH",
            "override_reason": " " # Blank
        }
    )
    assert bad_resp.status_code == 422

    # 3. Successful override with substantive reason
    good_resp = client.post(
        f"/api/v1/followups/{task_id}/override",
        headers={"Authorization": f"Bearer {counsellor_a_token}"},
        json={
            "new_priority": "HIGH",
            "override_reason": "Candidate father phoned asking for immediate hostel allotment briefing"
        }
    )
    assert good_resp.status_code == 200
    data = good_resp.json()
    assert data["priority"] == "HIGH"
    assert data["is_overridden"] is True
    assert data["override_reason"] == "Candidate father phoned asking for immediate hostel allotment briefing"

    # 4. Verify audit trail endpoint
    audit_resp = client.get(
        f"/api/v1/followups/{task_id}/audit-trail",
        headers={"Authorization": f"Bearer {counsellor_a_token}"}
    )
    assert audit_resp.status_code == 200
    audits = audit_resp.json()
    assert len(audits) >= 2 # Initial ENGINE_EVALUATION + PRIORITY_OVERRIDE
    override_log = next(a for a in audits if a["action"] == "PRIORITY_OVERRIDE")
    assert override_log["new_priority"] == "HIGH"
    assert "Candidate father phoned" in override_log["override_reason"]
    assert override_log["changed_by_name"] is not None

def test_api_operational_summary_statistics(client, counsellor_a_token):
    """Tests GET /summary/operational returns aggregated counts for dashboard cards."""
    resp = client.get(
        "/api/v1/followups/summary/operational",
        headers={"Authorization": f"Bearer {counsellor_a_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "pending_tasks" in data
    assert "overdue_tasks" in data
    assert "due_today_tasks" in data
    assert "high_priority_tasks" in data
    assert "governance_notice" in data
