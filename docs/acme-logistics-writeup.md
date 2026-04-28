# Acme Logistics — Inbound Carrier Sales Agent

**Prepared for:** Acme Logistics
**Prepared by:** Alex LaPointe
**Date:** April 2026

---

## What we built

A 24/7 voice agent that handles inbound carrier calls end-to-end — verifies the carrier with FMCSA, looks up the load they're calling about, negotiates a rate up to three rounds, and either books the load (transferring to a rep to close) or politely declines. Every call, booked or not, is captured in a database and surfaced live on a dashboard your sales team can use to spot trends and triage exceptions.

The agent runs on the HappyRobot platform. Our backend sits in front of your loadboard and FMCSA, enforces the negotiation rules you authorize per load, and writes structured records back to the dashboard the moment a call ends.

## How a call goes

A typical call lasts 60–120 seconds:

1. **Greeting** — agent answers, asks for the carrier's load reference number, then for their MC.
2. **FMCSA verify** — agent calls our `verify_carrier` tool with the MC. We hit FMCSA, return `eligible: true/false` plus the legal carrier name. Agent confirms the name back to the caller. Inactive or unauthorized carriers are politely declined here.
3. **Load lookup** — agent calls `find_available_loads` with the reference number (or with lane/equipment as a fallback). We return the full load record. Agent pitches it.
4. **Negotiation** — when the carrier counter-offers, the agent calls `evaluate_offer` with the dollar amount. Our backend reads each load's hidden floor and ceiling (stored alongside the load itself), tracks the round number, and returns one of: **accept**, **counter** at $X, or **reject**. The agent never invents a counter — it relays our decision. Hard cap of three rounds.
5. **Close or decline** — on accept, the agent confirms the rate and "transfers" to a sales rep to confirm the booking (web-call demos mock this; the production line would be a real warm-transfer). On reject or run-out-of-rounds, the agent thanks the carrier and ends the call.
6. **Capture** — when the call ends, HappyRobot fires a webhook back to us with the full transcript, classification, sentiment, decline reason, duration, and caller number. We merge that with the negotiation stats we tracked server-side and write the call to the database. The dashboard updates in real time — no refresh needed.

## What we capture per call

| Field | Source |
| --- | --- |
| Carrier name, MC, DOT | FMCSA verify (cached during the call so we don't double-charge) |
| Load reference, lane, equipment, posted rate | Looked up by reference number at pitch time |
| Initial offer, final rate, # of offers exchanged | Tracked by our backend during negotiation |
| Outcome | Booked / declined / no agreement / ineligible / no-match / abandoned |
| Sentiment | Positive / neutral / negative (LLM-classified end of call) |
| Classification + reasoning | Why the call ended the way it did, in one sentence |
| Decline reason | Free-text when the carrier walks away |
| Full transcript | Stored verbatim, pretty-printed in the dashboard |
| Duration, caller number | For ops |

## The dashboard

Three pages under a left-hand nav, designed to be read at a glance by a sales lead, not just engineering:

- **Calls** — every inbound call, sortable, searchable across every field, click any row for a slide-in detail panel with the full transcript rendered as a readable conversation. Multi-select rows to bulk-delete test calls.
- **Loads** — every load currently bookable, with its negotiation notes (floor/ceiling) editable inline. Update a ceiling, save, and the next call picks it up immediately.
- **Analytics** — booking rate, average final rate, average uplift per book, average offers per call, plus breakdowns by outcome, equipment type, and top lanes.

## Architecture

```
Carrier ──▶ HappyRobot agent ──HTTPS──▶ Express API ─────▶ Supabase Postgres
                │ tools                    │
                │ (verify, search,         │ route → service → repository
                │  evaluate_offer)         │
                │                          │
                │ end-of-call webhook      ▼
                └─▶ POST /webhooks/happyrobot

           Dashboard (Next.js, Vercel) ──▶ Express API
           (data goes through our API; realtime channel for invalidation only)
```

API hosted on Railway in Docker, dashboard on Vercel. API-key auth on every non-health route via constant-time comparison; the webhook has its own shared-secret header. Zod validates every body and query.

## Security

- HTTPS end-to-end (Railway, Vercel terminate TLS).
- API key never reaches the browser — the dashboard's reads go through Next.js server route handlers that proxy to our API server-side.
- Supabase Row-Level Security on every table; the service role key never leaves our backend.
- FMCSA gate runs before any load is pitched, so unauthorized carriers can't transact.

## Live links

- **Dashboard:** https://happyrobot-takehome.vercel.app
- **API health:** https://happyrobot-takehome-production-54e7.up.railway.app/health

## Out of scope (for this build)

- Real warm-transfer to a sales rep — currently mocked with a confirmation message; production would be a real SIP transfer.
- Phone number provisioning — demoing on HappyRobot's web-call trigger.
- TMS / loadboard sync — the load list lives in our DB for now; a production deployment would ingest from your TMS.
- Multi-load pitching in one call — one load per call today, easy to extend.

## What we'd add next

A real warm-transfer, a Slack/email notification when a call books outside the rep's hours, and a small "rate sensitivity" model trained on the captured data — once you have a few hundred calls, the floor/ceiling on each load can be tuned automatically per lane and equipment type instead of being set by hand.
