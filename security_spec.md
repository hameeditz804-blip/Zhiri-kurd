# Security Specification - ژیری کورد (Zhiri Kurd)

## Data Invariants
1. User profiles are strictly tied to the Firebase Authentication UID.
2. Image history records must always reference the UID of the generating user.
3. Users cannot modify the `uid` or `email` of a profile once created.
4. Users cannot modify existing history records (only create or delete).

## The Dirty Dozen Payloads
1. **Identity Spoofing**: Attempt to create a user profile for a different UID.
2. **Key Injection**: Attempt to add `isAdmin: true` to a user profile.
3. **Ghost Update**: Attempt to change the `uid` field during an update.
4. **Data Over-write**: Attempt to modify a history record created by another user.
5. **PII Leak**: Attempt to list all users in the system.
6. **Cross-User Delete**: Attempt to delete another user's image history.
7. **Size Attack**: Attempt to inject 1MB string into a prompt field.
8. **Broken Reference**: Create an image history record with a null `userId`.
9. **Timestamp Spoof**: Attempt to set a past `timestamp` (though we don't strictly enforce serverTime here yet, the field must be a valid timestamp).
10. **ID Poisoning**: Use a document ID that is a 1.5KB junk string.
11. **Shadow Creation**: Create a user profile without matching the authenticated email.
12. **Unauthorized Metadata**: Attempt to add additional fields to the history record.

## Verification
All these payloads are blocked by the `firestore.rules` logic using `isOwner()`, `isValid[Entity]()`, and `affectedKeys().hasOnly()`.
