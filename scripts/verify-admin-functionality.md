# Admin Interface Verification Checklist

## Prerequisites
1. ✅ Ensure you have admin access to the civic portal
2. ✅ Navigate to `/admin` in your browser
3. ✅ Confirm you can see the admin panel interface

## Phase 1: Data Fetching Verification

### Users Verification
- [ ] **User Management Tab**: Click on "User Management" tab
- [ ] **User Display**: Verify users are displayed with the following fields:
  - [ ] Full Name
  - [ ] Username  
  - [ ] Email
  - [ ] Role (citizen/official/admin)
  - [ ] Department Assignment (for officials)
  - [ ] Verification Status
  - [ ] Created Date
- [ ] **Search Functionality**: Test the search bar with user names
- [ ] **Role Filtering**: Test the role filter dropdown
- [ ] **User Count**: Verify the total user count matches displayed users

### Departments Verification  
- [ ] **Departments Tab**: Click on "Departments" tab
- [ ] **Department Cards**: Verify all 18 Botswana government departments are displayed:
  - [ ] Finance
  - [ ] International Relations
  - [ ] Health
  - [ ] Child Welfare and Basic Education
  - [ ] Higher Education
  - [ ] Lands and Agriculture
  - [ ] Youth and Gender Affairs
  - [ ] State Presidency
  - [ ] Justice and Correctional Services
  - [ ] Local Government and Traditional Affairs
  - [ ] Minerals and Energy
  - [ ] Communications and Innovation
  - [ ] Environment and Tourism
  - [ ] Labour and Home Affairs
  - [ ] Sports and Arts
  - [ ] Trade and Entrepreneurship
  - [ ] Transport and Infrastructure
  - [ ] Water and Human Settlement

- [ ] **Department Information**: Each department card should show:
  - [ ] Department name
  - [ ] Description
  - [ ] Number of assigned stakeholders
  - [ ] Edit button (functional)
  - [ ] Delete button (disabled with tooltip)

## Phase 2: Department Editing Functionality

### Edit Department Dialog
- [ ] **Open Dialog**: Click edit button on any department card
- [ ] **Dialog Elements**: Verify the edit dialog contains:
  - [ ] Department Name field (pre-filled)
  - [ ] Description field (pre-filled)
  - [ ] Category dropdown (pre-filled)
  - [ ] Information note about stakeholder impact
  - [ ] Cancel button
  - [ ] Save Changes button

### Form Validation
- [ ] **Required Field**: Clear department name and verify error message
- [ ] **Name Length**: Test minimum (2 chars) and maximum (100 chars) validation
- [ ] **Description Length**: Test maximum (500 chars) validation
- [ ] **Category Selection**: Test category dropdown options:
  - [ ] Economic Affairs
  - [ ] External Affairs
  - [ ] Social Services
  - [ ] Education & Welfare
  - [ ] Infrastructure
  - [ ] Governance
  - [ ] Security

### Save Functionality
- [ ] **Valid Update**: Make a valid change and save
- [ ] **Success Toast**: Verify success notification appears
- [ ] **Data Refresh**: Confirm department list refreshes with changes
- [ ] **Dialog Close**: Verify dialog closes after successful save

### Error Handling
- [ ] **Network Error**: Test behavior with network issues (if possible)
- [ ] **Validation Errors**: Verify proper error display for invalid inputs
- [ ] **Loading States**: Confirm loading spinner appears during save

## Phase 3: Authentication & Authorization

### Admin Access Control
- [ ] **Admin Only**: Verify only admin users can access `/admin`
- [ ] **Role Check**: Test with non-admin account (should show access denied)
- [ ] **Department Updates**: Confirm only admins can edit departments

### Data Integrity
- [ ] **Referential Integrity**: Verify department changes don't break user assignments
- [ ] **Stakeholder Count**: Confirm stakeholder counts update correctly
- [ ] **Department Names**: Verify name changes reflect in user profiles

## Phase 4: UI/UX Verification

### Design Consistency
- [ ] **Civic Portal Styling**: Verify consistent styling with rest of application
- [ ] **Card Layout**: Confirm clean, modern card-based design
- [ ] **Responsive Design**: Test on different screen sizes
- [ ] **Loading States**: Verify proper loading indicators

### User Experience
- [ ] **Clear Feedback**: Confirm clear success/error messages
- [ ] **Intuitive Navigation**: Verify easy navigation between tabs
- [ ] **Confirmation Dialogs**: Test appropriate confirmation for changes
- [ ] **Accessibility**: Check keyboard navigation and screen reader compatibility

## Phase 5: System Integration

### Database Operations
- [ ] **Read Operations**: Verify data fetching from Supabase
- [ ] **Update Operations**: Confirm department updates persist
- [ ] **Transaction Safety**: Verify atomic operations
- [ ] **Error Recovery**: Test graceful handling of database errors

### Real-time Updates
- [ ] **Data Refresh**: Test manual refresh functionality
- [ ] **Auto-refresh**: Verify data updates after operations
- [ ] **Concurrent Access**: Test multiple admin users (if available)

## Verification Results

### ✅ Passed Tests
- [ ] List successful verifications here

### ❌ Failed Tests  
- [ ] List any failures with details

### 🔄 Needs Investigation
- [ ] List items requiring further testing

## Notes
- Record any observations or recommendations
- Document any edge cases discovered
- Note performance considerations
