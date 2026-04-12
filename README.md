# Dynamic Task Dropdown for Tempo (Jira)

## 📌 Overview

This project implements a **dynamic dropdown for Tempo Work Attributes** in Jira.

### What problem are we solving?

In Tempo, a Work Attribute (e.g., **Task**) typically shows **all available options** for every account.

However, the requirement is:

> Show only **specific tasks based on the selected Account**

---

## 🎯 Objective

When a user logs time in Tempo:

* If **Account = R&D** → show only R&D-related tasks
* If **Account = SWM** → show only SWM-related tasks

This is achieved using a **Dynamic Dropdown API**.

---

## 🧠 Concept Simplified

* **Account** → Selected in Tempo (input)
* **Task (Work Attribute)** → Dropdown we control
* **API (this project)** → Filters tasks dynamically

---

## 🔁 Flow

```
User selects Account in Tempo
        ↓
Tempo calls our API
        ↓
API reads account name
        ↓
Looks into mapping.json
        ↓
Returns filtered tasks (UUID + label)
        ↓
Tempo updates dropdown
```

---

## ⚙️ Why UUID is Required

Tempo does NOT accept plain text values.

Each task option internally has:

* `id` → UUID (used by Tempo)
* `name` → Display label

So we must return:

```json
{
  "label": "Agile Ceremonies",
  "value": "uuid-here"
}
```

---

## 🔑 Step 1 — Fetch Work Attribute UUIDs

We need UUIDs for all Task values.

### Why?

Because Tempo requires **UUIDs**, not just names, to identify values.

---

### PowerShell Command

```powershell
$token = "YOUR_TEMPO_API_TOKEN"

Invoke-RestMethod `
  -Uri "https://api.tempo.io/4/work-attributes" `
  -Headers @{ Authorization = "Bearer $token" }
```

---

### Fetch and Store Response

```powershell
$response = Invoke-RestMethod `
  -Uri "https://api.tempo.io/4/work-attributes" `
  -Headers @{ Authorization = "Bearer $token" }

$response | ConvertTo-Json -Depth 10
```

---

### What this does

* Calls Tempo API
* Retrieves all Work Attributes
* Converts response into readable JSON

---

### What to extract

From response:

```json
{
  "name": "task1",
  "values": ["uuid1", "uuid2"],
  "names": {
    "uuid1": "Agile Ceremonies",
    "uuid2": "Bug Fix"
  }
}
```

---

### Convert to usable format

| Label            | UUID  |
| ---------------- | ----- |
| Agile Ceremonies | uuid1 |
| Bug Fix          | uuid2 |

---

## 🗂 Step 2 — Create Mapping

Create:

```
src/config/mapping.json
```

---

### Example

```json
{
  "R&D": [
    {
      "label": "Agile Ceremonies",
      "value": "uuid-1"
    },
    {
      "label": "Product Development",
      "value": "uuid-2"
    }
  ],
  "SWM": [
    {
      "label": "Bug Fix",
      "value": "uuid-3"
    },
    {
      "label": "Support Work",
      "value": "uuid-4"
    }
  ]
}
```

---

### Why this is needed

This acts as:

> **Rule engine for dropdown filtering**

---

## 🧩 Step 3 — Backend Logic

### Controller

```js
const { getTasksByAccount } = require("../services/mapping.service");

exports.getTasks = (req, res) => {
  try {
    const accountName = decodeURIComponent(
      req.query.account ||
      req.headers["x-tempo-account"] ||
      ""
    );

    const tasks = getTasksByAccount(accountName);

    res.json(tasks);
  } catch (error) {
    res.status(500).json([]);
  }
};
```

---

### Service

```js
const mapping = require("../config/mapping.json");

function getTasksByAccount(accountName) {
  return mapping[accountName] || [];
}

module.exports = { getTasksByAccount };
```

---

## 🌐 Step 4 — API Endpoint

```
GET /tempo/tasks?account=R%26D
```

---

### Why `%26`?

`&` is a special character in URLs.

So:

```
R&D → R%26D
```

---

## 🚀 Step 5 — Deployment

Deploy using:

* Vercel (recommended)

```bash
npx vercel
```

---

## 🔗 Step 6 — Connect to Tempo

In Tempo Work Attribute:

* Type → **Dynamic Dropdown**
* API URL →

```
https://your-app.vercel.app/tempo/tasks
```

---

## 🧪 Final Result

| Account | Tasks shown                           |
| ------- | ------------------------------------- |
| R&D     | Agile Ceremonies, Product Development |
| SWM     | Bug Fix, Support Work                 |

---

## ⚠️ Common Issues

### Empty dropdown

* Account not passed correctly

### All tasks shown

* Mapping not applied

### API not working

* Deployment issue

---

## ✅ Summary

* Fetch UUIDs from Tempo API
* Store mapping in JSON
* Build API to filter tasks
* Connect API to Tempo Dynamic Dropdown

---

## 📌 Tech Stack

* Node.js
* Express
* Tempo API
* Vercel

---
