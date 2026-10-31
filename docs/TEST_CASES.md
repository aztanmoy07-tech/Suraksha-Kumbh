# Test Plan and Sample Test Cases — Suraksha Kumbh

**Scope:** Manual functional checks for the three published web interfaces and basic deployment/security checks. These are proposed test cases, not a claim that tests have already passed.

## Test environment

- Browser: current Chrome, Firefox, or Edge.
- Network: test both normal connectivity and temporary offline conditions.
- Devices: desktop and mobile viewport.
- URLs:
  - https://aztanmoy07-tech.github.io/Suraksha-Kumbh/
  - https://aztanmoy07-tech.github.io/Suraksha-Kumbh/prayagraj_twin.html
  - https://aztanmoy07-tech.github.io/Suraksha-Kumbh/User_Interface.html

## Test cases

| ID | Area | Test steps | Expected result | Actual result |
|---|---|---|---|---|
| TC-001 | Central page availability | Open the central command URL | Page loads over HTTPS without a 404 | To be recorded |
| TC-002 | Digital twin availability | Open `prayagraj_twin.html` URL directly | Digital twin page loads without relying on navigation from another page | To be recorded |
| TC-003 | User interface availability | Open `User_Interface.html` URL directly | Pilgrim/sevadar page loads | To be recorded |
| TC-004 | Responsive layout | Open each page at desktop and mobile widths | Main content remains readable; controls do not overlap | To be recorded |
| TC-005 | Navigation | Use every visible navigation link on each page | Each link opens the intended page or destination | To be recorded |
| TC-006 | Static assets | Inspect images, scripts, and styles while loading pages | No missing asset/404 errors | To be recorded |
| TC-007 | Browser console | Open developer tools and reload each page | No uncaught JavaScript errors during normal page load | To be recorded |
| TC-008 | User input validation | Submit empty and malformed values in visible forms, if present | Clear validation feedback; invalid data is not accepted | To be recorded |
| TC-009 | Backend connectivity | Exercise a feature that should call the backend, if present | Request reaches configured backend and receives expected response | To be recorded / N/A |
| TC-010 | Backend unavailable | Temporarily make backend unreachable, if applicable | UI shows a useful error/fallback rather than silently reporting success | To be recorded / N/A |
| TC-011 | Sensitive files | Review repository and deployed assets for `.env`, private keys, and tokens | No secrets are publicly accessible | To be recorded |
| TC-012 | Demo-data labeling | Review dashboards and map overlays using fixture data | Simulated data is clearly labeled as sample/demo | To be recorded |

## Defect report template

For each failed test, record:
- Test case ID
- Build/commit tested
- Browser and device
- Preconditions
- Steps to reproduce
- Expected result
- Actual result
- Screenshot or console/network error (redact secrets and personal data)
- Severity and status

## Exit criteria

- All three published pages load directly.
- No critical broken navigation or missing assets.
- Input validation behaves as expected for implemented forms.
- Backend-dependent features are verified against the deployed backend, or clearly marked as unavailable/demo.
- No private credentials or keys are exposed.
- Actual results are filled in; do not mark a test as passed without executing it.
