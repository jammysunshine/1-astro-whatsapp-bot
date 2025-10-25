# Story 16.1: Razorpay Integration Setup

## User Story
As a developer,
I want to set up Razorpay integration for Indian payments,
So that users in India can make real payments via UPI, PayTM, and cards.

## Acceptance Criteria
1. Razorpay account created and API keys configured
2. Payment service updated to use Razorpay for Indian users
3. UPI, PayTM, and card payment methods enabled
4. Existing payment simulation remains functional during setup

## Integration Verification
1. Existing bot functionality continues to work unchanged
2. Payment service maintains current API interface
3. No breaking changes to existing payment flow

## Technical Notes
- Integrate Razorpay SDK into existing payment service
- Update region detection logic to route Indian users to Razorpay
- Maintain backward compatibility with simulation mode
- Add proper error handling for Razorpay API failures

## Definition of Done
- [ ] Razorpay account and API keys configured
- [ ] Payment service code updated for Razorpay integration
- [ ] UPI, PayTM, and card payments tested
- [ ] Existing simulation mode preserved
- [ ] Integration verification completed
- [ ] Code reviewed and approved