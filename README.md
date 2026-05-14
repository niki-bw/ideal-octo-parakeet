# Address Change Automation Exercise

## The Problem

Portals are wildly inconsistent:

- Some are modern single-page apps. Some are 15-year-old server-rendered portals.
- Field names, selectors, and navigation flows differ across every site.
- Some require MFA. Some have session timeouts. Some have unreliable confirmation messages.
- Sites occasionally change layouts without notice.

There is no standard. Every portal is its own special case.

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
    legacyCarrierExample.ts  # One implementation — written quickly, rough around the edges
  index.ts              # Entry point
```

The `browser.ts` layer simulates what a real browser automation library would do. No actual browser is launched. Actions are logged, artificially delayed, and occasionally fail to simulate real-world conditions.

### Demo Portals

Two hosted demo portals are available for hands-on exploration during the exercise:

- **Portal 1**: `https://niki-bw.github.io/mockaddresschange/Site1/login.html` 
- Login Username: agent Password: demo123
- Loom video: https://www.loom.com/share/c5ddd79cbf054c81be1aac21e13b2044
- **Portal 2**: `https://niki-bw.github.io/mockaddresschange/Site2/login.html` 
- Login Username: jsmith Password: Welcome1

These sites intentionally behave differently from each other to simulate the inconsistency found in real portals.

---

## Running the Repo

```bash
npm install
npm run dev
```

This will execute the examples/legacyCarrierExample.js automation using the data in samples/sampleRequest.json.

