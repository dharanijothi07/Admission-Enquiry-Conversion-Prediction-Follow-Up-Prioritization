"""Shared option lists used by validation, ML features and demo data."""
from typing import Literal

SOURCES = ["website", "walk_in", "referral", "social_media", "education_fair", "phone_call"]
FEE_LEVELS = ["low", "medium", "high"]  # how comfortably the family can afford the fees
STATUSES = ["new", "contacted", "visited", "applied", "admitted", "lost"]
CLOSED_STATUSES = {"admitted", "lost"}
CHANNELS = ["call", "whatsapp", "email", "sms", "visit", "other"]

COURSES = [
    "B.Tech Computer Science",
    "B.Tech Mechanical",
    "MBA",
    "BBA",
    "B.Com",
    "BCA",
    "MCA",
    "B.Sc Nursing",
]

SourceT = Literal["website", "walk_in", "referral", "social_media", "education_fair", "phone_call"]
FeeLevelT = Literal["low", "medium", "high"]
StatusT = Literal["new", "contacted", "visited", "applied", "admitted", "lost"]
ChannelT = Literal["call", "whatsapp", "email", "sms", "visit", "other"]
