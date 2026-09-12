# Security Specification for FoodFresh AI Firestore Storage

## 1. Data Invariants
1. **User Scope Invariant**: A food freshness scan at `/users/{userId}/scans/{scanId}` can only be created, read, updated, or deleted by the authenticated user whose `request.auth.uid == userId`.
2. **Owner Identity Invariant**: The `userId` field inside any scan document must match `request.auth.uid`. Cross-user identity spoofing is forbidden.
3. **Dataset Authorship Invariant**: Only authenticated users can contribute to `/dataset/{itemId}`. The `authorId` must match `request.auth.uid`.
4. **Dataset Modification Invariant**: Only the original creator of a dataset item (`resource.data.authorId == request.auth.uid`) or an admin can modify or delete it.
5. **PII Isolation Invariant**: User documents at `/users/{userId}` are strictly restricted to the owning user (`request.auth.uid == userId`). No blanket public or multi-user reads of user profile data.
6. **Volumetric Boundaries Invariant**: All strings, keys, and numeric fields must stay within bounded limits (e.g., ID <= 128 characters, food_name <= 150 characters, freshness_score between 0 and 100).
7. **No Unauthenticated Access**: Unauthenticated requests (`request.auth == null`) are rejected for all writes and private reads.
8. **Catch-All Safety Invariant**: Any path not explicitly matched is denied by the root default-deny rule.

## 2. The Dirty Dozen Malicious Payloads

1. **Payload 1 (Cross-User Write / Identity Spoofing)**:
   - Target: `/users/alice123/scans/scan999`
   - Actor: `bob456`
   - Payload: `{ "id": "scan999", "userId": "bob456", "food_name": "Spoofed Banana", "freshness_score": 10 }`
   - Expected Result: `PERMISSION_DENIED` (Path userId does not match auth UID).

2. **Payload 2 (Scan Field Identity Mismatch)**:
   - Target: `/users/alice123/scans/scan999`
   - Actor: `alice123`
   - Payload: `{ "id": "scan999", "userId": "charlie789", "food_name": "Spoofed Apple", "freshness_score": 90 }`
   - Expected Result: `PERMISSION_DENIED` (`incoming().userId != request.auth.uid`).

3. **Payload 3 (Unauthenticated Read to Private Scans)**:
   - Target: `/users/alice123/scans/scan1`
   - Actor: Unauthenticated (`request.auth == null`)
   - Expected Result: `PERMISSION_DENIED`.

4. **Payload 4 (Unauthenticated Read to User Profile)**:
   - Target: `/users/alice123`
   - Actor: Unauthenticated (`request.auth == null`)
   - Expected Result: `PERMISSION_DENIED`.

5. **Payload 5 (Cross-User Read to User Profile)**:
   - Target: `/users/alice123`
   - Actor: `bob456`
   - Expected Result: `PERMISSION_DENIED` (User profile read restricted to owner).

6. **Payload 6 (Oversized Payload / Denial-of-Wallet Attack)**:
   - Target: `/users/alice123/scans/scan1`
   - Actor: `alice123`
   - Payload: `{ "id": "scan1", "userId": "alice123", "food_name": "A".repeat(50000), "freshness_score": 50 }`
   - Expected Result: `PERMISSION_DENIED` (`food_name.size() > 150`).

7. **Payload 7 (Path Injection / Invalid Document ID)**:
   - Target: `/users/alice123/scans/bad$id!*#`
   - Actor: `alice123`
   - Expected Result: `PERMISSION_DENIED` (Regex check fail on scanId).

8. **Payload 8 (Dataset Spoofed Author Write)**:
   - Target: `/dataset/ds_sample_01`
   - Actor: `alice123`
   - Payload: `{ "id": "ds_sample_01", "authorId": "victimUser999", "food_name": "Spoiled Milk", "freshness_label": "Spoiled" }`
   - Expected Result: `PERMISSION_DENIED` (`incoming().authorId != request.auth.uid`).

9. **Payload 9 (Unauthenticated Dataset Contribution)**:
   - Target: `/dataset/ds_sample_02`
   - Actor: Unauthenticated
   - Payload: `{ "id": "ds_sample_02", "authorId": "anon", "food_name": "Bread", "freshness_label": "Fresh" }`
   - Expected Result: `PERMISSION_DENIED`.

10. **Payload 10 (Unauthorized Dataset Tampering / Non-Author Overwrite)**:
    - Target: `/dataset/ds_alice_sample` (authored by `alice123`)
    - Actor: `bob456`
    - Action: `update` or `delete`
    - Expected Result: `PERMISSION_DENIED` (`existing().authorId != request.auth.uid`).

11. **Payload 11 (Invalid Freshness Score Range)**:
    - Target: `/users/alice123/scans/scan2`
    - Actor: `alice123`
    - Payload: `{ "id": "scan2", "userId": "alice123", "food_name": "Steak", "freshness_score": 9999 }`
    - Expected Result: `PERMISSION_DENIED` (`freshness_score > 100`).

12. **Payload 12 (Root Catch-All Bypass Attempt)**:
    - Target: `/admin_settings/system_keys` or `/unknown_collection/hack`
    - Actor: `alice123`
    - Expected Result: `PERMISSION_DENIED` (Caught by default `match /{document=**} { allow read, write: if false; }`).
