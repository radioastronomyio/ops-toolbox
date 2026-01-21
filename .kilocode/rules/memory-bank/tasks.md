# Ops Toolbox Tasks and Workflows

## Common Workflows

### Adding a New Utility App

**When to use:** Creating a new tool in the ops-toolbox collection  
**Frequency:** Occasional (as new utility needs arise)

**Steps:**

1. Create directory structure:
   ```bash
   mkdir -p apps/{app-name}
   touch apps/{app-name}/index.html
   touch apps/{app-name}/App.jsx  # or main.js for vanilla
   touch apps/{app-name}/README.md
   ```

2. Decide on framework:
   - React if stateful (live preview, complex UI state)
   - Vanilla JS if simple (form → result)

3. Implement core functionality:
   - Single-purpose, does one thing well
   - Zero external network calls
   - Dark theme default, light theme option

4. Add to landing page navigation (root `index.html`)

5. Test locally: `npm run dev --workspace=apps/{app-name}`

6. Update memory bank context.md with new utility status

7. Push to main for deployment

**Expected Outcome:** New utility accessible at `/{app-name}` route  
**Common Issues:** Forgetting to register in Vite workspace config if using workspaces

---

### Verifying Zero Data Transmission

**When to use:** Before deployment, after any changes involving external libraries  
**Frequency:** Every significant change

**Steps:**

1. Open app in browser
2. Open DevTools → Network tab
3. Clear network log
4. Perform all app operations (paste input, change themes, export)
5. Verify network tab shows zero requests (except initial page load assets)

**Expected Outcome:** No XHR/Fetch calls, no third-party requests  
**Common Issues:** CDN-loaded libraries making telemetry calls — prefer npm packages

---

## Memory Bank Maintenance

### Updating context.md

**When:** After every significant work session  
**What to update:**

1. Move completed items from "Next Steps" to "Recent Accomplishments"
2. Update "Current Phase" if phase changed
3. Update "Next Steps" with new actionable items
4. Document any new decisions in "Active Decisions"
5. Add/resolve blockers as appropriate
6. Update "Last Updated" date

**Quality check:** Does context.md accurately reflect current state?

---

### Updating architecture.md

**When:** When adding new utilities or changing patterns  
**What to update:**

1. Add new apps to structure diagram
2. Document architectural decisions with rationale
3. Update integration points if new dependencies added

**Quality check:** Can someone understand the repo structure from this file alone?

---

## Session Management

### Session Start Procedure

**Objective:** Load context and confirm understanding

1. **Load memory bank files**
   - Read brief.md (foundational context)
   - Read context.md (current state and next steps)
   - Scan architecture.md and tech.md as needed

2. **Confirm context**
   - Display current phase and immediate next steps
   - Note any stale context (>7 days since last update)

3. **Ready state**
   - Confirm understanding with operator
   - Proceed with work

---

### Session End Procedure

**Objective:** Update memory bank with session outcomes

1. **Update context.md**
   - Add accomplishments to "Recent Accomplishments"
   - Update "Next Steps" based on current state
   - Document decisions made during session
   - Update "Last Updated" date

2. **Update other files if needed**
   - architecture.md if structure changed
   - tech.md if dependencies changed

3. **Commit changes**
   ```bash
   git add .
   git commit -m "chore: update memory bank after {work description}"
   ```

---

## Deployment Workflow

### Deploy to Azure Static Web Apps

**When to use:** After changes merged to main  
**Frequency:** Automatic via CI/CD, manual if needed

**Automatic (preferred):**
```bash
git push origin main
# GitHub Actions handles build and deploy
```

**Manual (if needed):**
```bash
npm run build
# Upload dist/ to Azure Static Web Apps via portal or CLI
```

**Expected Outcome:** Changes live at production URL within 2-3 minutes  
**Common Issues:** Build failures — check GitHub Actions logs
