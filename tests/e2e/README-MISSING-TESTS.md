# Missing E2E Tests

## Board Member Calendar & Receipts

**Status**: Tests deleted (were 100% incorrect)
**Test File**: `board-member-calendar.spec.ts` (removed)
**Page**: `/board-member/calendar`
**Component**: `components/forms/board-member/BoardMemberCalendarForm.tsx`

### Why Tests Were Removed

The initial E2E tests for the board member calendar feature were created based on incorrect assumptions about the UI structure. The actual implementation has a significantly different design:

**Actual Implementation Features**:
- Multiple input modes for calendar entries:
  - Manual entry form
  - CSV upload
  - ICS (iCalendar) file upload
- Multiple input modes for receipts:
  - Manual entry form
  - CSV upload
  - Bulk paste mode
- Complex state management for switching between modes
- Different UI structure than initially assumed

**Test Assumptions (Incorrect)**:
- Simple tabbed interface with only manual entry
- Standard form fields without mode switching
- Basic add/remove functionality
- Direct form submission without upload workflows

### Test Coverage Needed

To properly test this feature, tests should cover:

1. **Calendar Entry Modes**:
   - Manual entry (add/edit/remove calendar events)
   - CSV upload workflow
   - ICS file upload workflow
   - Mode switching behavior

2. **Receipt Entry Modes**:
   - Manual entry (add/edit/remove receipts)
   - CSV upload workflow
   - Bulk paste mode
   - Receipt validation (>$50 requirement)

3. **Core Functionality**:
   - Quarter/year selection
   - Save as draft
   - Submit for public posting
   - Total receipt calculation
   - Form validation
   - Success/error messaging

4. **Data Persistence**:
   - Loading existing calendar/receipts
   - Draft recovery
   - Submission confirmation

### Implementation Approach

Before writing new tests:

1. **Manual UI exploration**:
   - Navigate to `/board-member/calendar` in browser
   - Test all input modes (manual, CSV, ICS, paste)
   - Document actual UI elements, IDs, and workflows

2. **Read source code**:
   - `components/forms/board-member/BoardMemberCalendarForm.tsx` (main component)
   - `components/forms/board-member/ICSUploadMode.tsx`
   - `components/forms/board-member/CSVUploadMode.tsx`
   - `components/forms/board-member/ReceiptsCSVUploadMode.tsx`
   - `components/forms/board-member/ReceiptsBulkPasteMode.tsx`

3. **Write focused tests**:
   - Start with manual mode tests (simplest)
   - Add upload mode tests separately
   - Test mode switching
   - Add integration tests for full workflows

### Seed Data Available

The database seed includes:
- 2 board members (Commissioner Williams, Commissioner Chen)
- 15 calendar entries across 4 quarters
- 13 lobbying receipts (>$50) across 4 quarters

Test login credentials:
- Email: `commissioner@multnomah.gov`
- Password: `board123`

### References

- Ordinance requirement: §3.001(C) - Board Member Reporting
- UI wireframe: `wireframes/` (if available)
- API endpoint: `/api/board-member-calendars` (POST)
- Database models: `BoardMemberCalendar`, `CalendarEntry`, `LobbyingReceipt`

---

## Other Test Gaps

### Admin Features (Partial Coverage)

The following admin features have E2E tests but with significant failures:

1. **Appeals Management** (`admin-appeals.spec.ts`)
   - Pass rate: 27% (3/11 tests passing)
   - Issues: Strict mode violations, dialog interaction problems
   - Needs: Selector fixes, dialog handling improvements

2. **Contract Exceptions** (`admin-contract-exceptions.spec.ts`)
   - Pass rate: 44% (8/18 tests passing)
   - Issues: Dialog overlays, form validation detection
   - Needs: Overlay click handling, form interaction fixes

3. **Violations Management** (`admin-violations.spec.ts`)
   - Pass rate: 53% (8/15 tests passing)
   - Issues: Multiple element matches, dialog clicks
   - Needs: More specific selectors, dialog interaction fixes

### Recommended Next Steps

1. **Fix existing admin tests** - Many are close to working (27-53% pass rate)
2. **Add employer expense report tests** - No coverage yet
3. **Add hour tracking tests** - Feature enabled but not tested
4. **Rewrite board calendar tests** - After UI examination

---

*Last updated: 2025-10-21*
*Created during: API integration and E2E test development session*
