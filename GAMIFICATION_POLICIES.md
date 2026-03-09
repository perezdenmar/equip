# Gamification System Policies & Rules

This document outlines the policies, rules, and limitations of the "equip" Gamification System.

## 1. Point Accrual Rules

Points are earned through positive student engagement and contributions to the "equip" community.

| Action | Points Earned | Frequency |
| :--- | :--- | :--- |
| **Refer a Friend** | 50 points | Per successful sign-up |
| **Complete Qualification** | 100 points | Per verified completion |
| **Referral Course Enrollment** | 25 points | When a referee enrolls in their first course |
| **Daily Check-in (Future)** | 5 points | Max once per day |

## 2. Redemption Rules

Points can be redeemed for partner gift certificates.

- **Base Value**: 100 points = PHP 10.00 equivalent (value may vary by partner).
- **Escalation Bonus**: Redemption value increases with accumulated points.
    - **Tier 1 (Bronze)**: < 500 points (1x value)
    - **Tier 2 (Silver)**: 500 - 999 points (1.1x value)
    - **Tier 3 (Gold)**: 1,000+ points (1.25x value)

## 3. Priority Placement Algorithm

Students with wishlisted courses receive priority placement when courses marked "Coming Soon" become "Open".

### Queue Calculation:
- **Base Position**: Timestamp of joining the wishlist.
- **Priority Multiplier**: `Current Points / 10`.
- **Final Queue Score**: `(Seconds since join) + (Priority Multiplier * 3600)`.
- *Higher Score = Higher Priority*.

## 4. Caps and Limitations

- **Daily Cap**: Students cannot earn more than 200 points per day (excluding qualification completions).
- **Referral Limit**: Maximum of 50 referrals per year per student.
- **Expiration**: Points do not expire as long as the account remains active. Accounts inactive for more than 12 months will have their points reset.

## 5. Fraud Prevention

- **Referral Verification**: Referees must verify their email and complete profile setup before points are awarded.
- **Duplicate Detection**: Systems track IP addresses, device IDs, and email patterns to detect self-referrals.
- **Audit Logs**: Every point transaction is logged for administrative review.
- **Sanctions**: Users found engaging in fraud will have their points revoked and may be barred from future rewards or courses.

## 6. Dispute Resolution

- **Reporting**: Students can report missing points or redemption issues via the "Help Desk" in the Profile section.
- **Processing Time**: Disputes are reviewed by the Admin team within 3-5 business days.
- **Final Decision**: The "equip" administration's decision on point allocations and rewards is final.
