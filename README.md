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

- **Portal 1**: `https://niki-bw.github.io/mockaddresschange/Site1/login.html` 
- Login Username: agent Password: demo123
- **Portal 2**: `https://niki-bw.github.io/mockaddresschange/Site2/login.html` 
- Login Username: jsmith Password: Welcome1

These sites intentionally behave differently from each other to simulate the inconsistency found in real carrier portals.

---

## Running the Repo

```bash
npm install
npm run dev
```
