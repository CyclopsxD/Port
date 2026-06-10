# security_spec.md - Firebase Security Specification

## 1. Data Invariants
- **Public Visibility**: Portfolio configurations (hero, about), projects, skills, and timeline events are publicly readable by any user, signed in or not, to allow normal portfolio rendering.
- **Admin & Contributor Auth**: Writing or updating portfolio configs (hero, about), projects, skills, and timeline events is strictly restricted to authenticated users who have an "Admin" or "Contributor" role inside the `/team/` collection.
- **Zero-Trust Message Submissions**: Direct messages can be created by any anonymous visitor, but reading or deleting messages is strictly restricted to authenticated "Admin" or "Contributor" users.
- **Log Integrity**: System audit logs are immutable once written and can only be read by "Admin" users.
- **Role Isolation**: No user can update their own role inside `/team/` or self-assign an "Admin" or "Contributor" role. Any role upgrade must be performed by an existing verified "Admin" user.

---

## 2. The "Dirty Dozen" Payloads (Exploit Payloads)

Here of 12 malicious direct payloads targeting Firebase Firestore collections:

### Exploit 1: Anonymous Project Deletion
- **Target Path**: `/projects/proj_1`
- **Action**: `DELETE`
- **Auth State**: Unauthenticated

### Exploit 2: Unverified Role Escalation
- **Target Path**: `/team/attacker`
- **Action**: `CREATE`
- **Auth State**: Authenticated as `attacker`, trying to set custom `role: "Admin"`
- **Payload**:
```json
{
  "id": "attacker",
  "name": "Attacker",
  "email": "attacker@exploit.com",
  "role": "Admin",
  "status": "Active",
  "avatarUrl": "https://attacker.site/pic.png",
  "lastActive": "Just now"
}
```

### Exploit 3: Arbitrary Message Overwrite
- **Target Path**: `/messages/msg_1`
- **Action**: `UPDATE`
- **Auth State**: Unauthenticated, attempting to override message body
- **Payload**:
```json
{
  "message": "Pwned!"
}
```

### Exploit 4: Injected Bulk ID Poisoning
- **Target Path**: `/projects/extremelylongid_greaterthan128chars_extremelylongid_greaterthan128chars_extremelylongid_greaterthan128chars_extremelylongid_greaterthan128chars`
- **Action**: `CREATE`
- **Auth State**: Authenticated (as Contributor)

### Exploit 5: Audit Log Spoofing
- **Target Path**: `/logs/log_1`
- **Action**: `UPDATE`
- **Auth State**: Authenticated (as Contributor)
- **Payload**:
```json
{
  "action": "Attacker did nothing suspicious"
}
```

### Exploit 6: Project "clicksCount" Value Poisoning (String Injection)
- **Target Path**: `/projects/proj_1`
- **Action**: `UPDATE`
- **Auth State**: Authenticated (as Contributor), modifying clicksCount to a 1MB string
- **Payload**:
```json
{
  "clicksCount": "1000000_clicks_exploit..."
}
```

### Exploit 7: Orphaned Project Creation
- **Target Path**: `/projects/proj_orphaned`
- **Action**: `CREATE`
- **Auth State**: Authenticated (as Contributor), leaving out required fields like title and image
- **Payload**:
```json
{
  "id": "proj_orphaned",
  "category": "Web"
}
```

### Exploit 8: Timeline Period Timestamp Tampering
- **Target Path**: `/timeline/time_1`
- **Action**: `UPDATE`
- **Auth State**: Authenticated (as Contributor), modifying company details without permission

### Exploit 9: Shadow Field Injection in Skill
- **Target Path**: `/skills/sk_1`
- **Action**: `CREATE`
- **Auth State**: Authenticated (as Contributor), injecting unregistered properties
- **Payload**:
```json
{
  "id": "sk_1",
  "name": "Vulnerability Scanner",
  "category": "Backend",
  "level": 99,
  "hackedProperty": "ghost"
}
```

### Exploit 10: Anonymous Log Scraping
- **Target Path**: `/logs/log_1`
- **Action**: `GET`
- **Auth State**: Unauthenticated

### Exploit 11: Message Status Flip
- **Target Path**: `/messages/msg_1`
- **Action**: `UPDATE`
- **Auth State**: Unauthenticated visitor attempting to mark message as read

### Exploit 12: Analytics Fraud Injection
- **Target Path**: `/analytics/today`
- **Action**: `UPDATE`
- **Auth State**: Unauthenticated visitor trying to set views to negative integer
- **Payload**:
```json
{
  "views": -999999
}
```

---

## 3. The Test Runner Spec

Test assertions verify that every malicious transaction is strictly stopped.

```ts
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";

// The local firebase rules tests suite configuration...
```
