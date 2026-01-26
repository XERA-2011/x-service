---
description: Standard development workflow. Loads project guidelines before coding.
---

# Development Workflow

Before making any code changes, complete these preliminary steps.

## 1. Identify Target Files

Determine which file types will be modified based on the user's request:
- Python backend (`.py`)
- Frontend (`.js`, `.html`, `.css`)

## 2. Load Required Guidelines

Read the relevant skill documents:

- **For Python files**: Read `.agent/skills/python_development/SKILL.md`
- **For Frontend files**: Read `.agent/skills/frontend_development/SKILL.md`

If both types are involved, read both.

## 3. Confirm Key Constraints

After reading, briefly state the 2-3 most critical constraints from the guidelines that apply to this specific task. Example:
- "Python 3.9 compatible syntax required"
- "Mobile-first responsive design"
- "Use `akshare_call_with_retry` for data fetching"

## 4. Proceed with Development

Now proceed with the user's actual coding request, ensuring all changes adhere to the loaded guidelines.

## 5. Resilience Check (Self-Correction)

Before finishing, ask yourself:
- "If the API fails or times out, will the UI get stuck in 'Loading...'?"
- "If one part of `Promise.all` fails, will the rest still render?"
- "Are error messages aligned correctly (centered)?"

If the answer is NO, apply fixes immediately.

---

**Usage**: `/dev <your coding request>`
