# T082A — v1.0.33 Home/Tracker Live Summary Consistency Hotfix

**Date:** 22 May 2026  
**Version:** 1.0.33 (no bump)  
**Branch:** `task/T082A-v1.0.33-home-tracker-summary-consistency`

## Problem

T082 review queue and JSON exports are correct on `/review-queue/` and `/data/*`, but `/` and `/tracker/` still foreground T080 coverage copy, causing external checks to report stale v1.0.31/T080 summaries.

## Goal

Home and tracker pages visibly reflect v1.0.33 T082 operator decision workflow with correct counts and validators/smoke guards.
