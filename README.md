# Carrier Automation Exercise

## Background

Brightway is an insurance agency. When customers submit address change requests through the Brightway website, agents currently log into each carrier's portal manually and update the address on the customer's behalf.

Most carriers do not offer APIs. The only path to automation is browser-level interaction with each carrier's web portal.

We already have RPA scripts that log into a number of carrier sites — these were built to verify that credentials work and sessions can be established. They navigate to the login page, authenticate, confirm a successful session, and stop. **They take no further action.**

**We now want to extend those automations to actually perform address changes, and scale that capability to 100+ carrier sites.**

---

## The Problem

Carrier portals are wildly inconsistent:

- Some are modern single-page apps. Some are 15-year-old server-rendered portals.
- Field names, selectors, and navigation flows differ across every site.
- Some require MFA. Some have session timeouts. Some have unreliable confirmation messages.
- Sites occasionally change layouts without notice.
- A few carriers have two entirely separate portals for old vs. new policies.

There is no standard. Every carrier is its own special case.

The login-only automations gave us a foothold, but they were each written independently and don't share much structure. Some are clean; some are rough. Extending them — without creating a maintenance nightmare — is the real challenge.

Supporting one or two carriers by hand is straightforward. Supporting 100+ — and keeping them working over time — is a real engineering challenge.

---

## What's in This Repo

This repo is an intentionally rough starting point. It is **not** a finished system.

```
src/
  browser/
    browser.ts          # Mocked browser helper — logs actions, simulates delays and failures
  utils/
    delay.ts
    logger.ts
  samples/
    sampleRequest.json  # Example address change request payload
  examples/
    legacyCarrierExample.ts  # One carrier implementation — written quickly, rough around the edges
  index.ts              # Entry point
```

The `browser.ts` layer simulates what a real browser automation library would do. No actual browser is launched. Actions are logged, artificially delayed, and occasionally fail to simulate real-world conditions.

### Demo Carrier Sites

Two hosted demo sites are available for hands-on exploration during the exercise:

- **Modern carrier**: `https://demo-modern-carrier.example.com` *(placeholder)*
- **Legacy carrier**: `https://demo-legacy-carrier.example.com` *(placeholder)*

These sites intentionally behave differently from each other to simulate the inconsistency found in real carrier portals.

---

## Running the Repo

```bash
npm install
npm run dev
```

That's it. No browser drivers, no external services.

---

## The Exercise

The existing code shows one carrier extended from a login-only automation to perform an address update. It works, but it doesn't scale. Your goal is to **think through and begin scaffolding an approach** that could support 100+ carriers sustainably — including deciding how (or whether) to build on top of the existing login scripts.

You do not need to implement everything. Architectural reasoning and the decisions you make under ambiguity matter more than a complete implementation.

**Use whatever tools help you move fast** — including AI assistants. The ability to leverage AI tooling to accelerate onboarding and code generation is part of what we're evaluating.

---

## Discussion Prompts

Come ready to talk through your thinking on questions like these:

**Scale**
- How would you structure the codebase to support 100+ carriers without it becoming unmanageable?
- We have login-only automations for some carriers already. How do you build on top of them without making a mess?
- What would a new carrier onboarding workflow look like? How long should it take?
- What would you standardize across all carriers, and what would you leave carrier-specific?

**Maintainability**
- Carrier UIs drift over time. How would you detect when an automation breaks?
- How would you make it easy for someone unfamiliar with a carrier to fix a broken automation?
- What does a runbook for a failing carrier look like?

**Operational Resiliency**
- How would you handle flaky carriers — sites that succeed 80% of the time?
- How would you surface failures to the team without waking someone up for every transient error?
- What retry and escalation logic makes sense?

**Edge Cases**
- How would you handle MFA?
- What do you do when there's no reliable confirmation message?
- How would you handle a carrier that has two completely different portal versions?

**AI-Assisted Development**
- How could AI tooling reduce the time it takes to onboard a new carrier?
- How would you use AI to help generate or maintain carrier-specific automation scripts?
- Where does AI help most, and where does it need a human in the loop?

**Tooling**
- What operational dashboards or tooling would you want to build?
- How would you give non-engineers (operations staff) visibility into automation status?

---

## A Note on the Existing Code

`legacyCarrierExample.ts` represents one carrier where the login-only automation was extended to perform an address update. The login block was ported directly from the existing script; the address update steps were added on top. It was written quickly to get something working.

It has obvious problems. That's intentional — it creates a starting point for discussion and improvement.

Feel free to critique it, refactor it, extend it, or discard the approach entirely. There's no right answer baked into this repo.
