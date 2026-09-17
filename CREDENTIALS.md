# 🔐 SwadGhar Restaurant - System Credentials & Franchise Logins

This document contains all default administrative, franchise branch manager, and customer credentials for the **SwadGhar Restaurant System**.

---

## 👑 Central Administration Account

Full access to all 5 franchises, entire menu catalog (31 categories, 171 dishes), financial analytics, order processing, and table reservations.

| Parameter | Value |
|---|---|
| **Portal URL** | `https://swadghar-restaurant.netlify.app/login` (or `http://localhost:5173/login`) |
| **User ID / Email** | `admin@swadghar.com` |
| **Password** | `Admin@123` |
| **Role** | `admin` |
| **Permissions** | Full CRUD on Dishes, Categories, Orders, Inquiries, Coupons & Settings |

---

## 🏪 5 Restaurant Franchise Branch Manager Accounts

Dedicated login credentials for each of the 5 SwadGhar franchise locations across Gujarat and Mumbai.

| # | Franchise Branch | City / Location | User ID (Email) | Password | Manager Name | Role |
|---|---|---|---|---|---|---|
| 1 | **SwadGhar - Ahmedabad Flagship** | SG Highway, Bodakdev, Ahmedabad | `ahmedabad@swadghar.com` | `Ahmedabad@123` | Rajesh Patel | `staff` |
| 2 | **SwadGhar - Surat Diamond City** | Ghod Dod Road, Athwa Lines, Surat | `surat@swadghar.com` | `Surat@123` | Ketan Vaghani | `staff` |
| 3 | **SwadGhar - Vadodara Royal Heritage** | RC Dutt Road, Alkapuri, Vadodara | `vadodara@swadghar.com` | `Vadodara@123` | Hardik Shah | `staff` |
| 4 | **SwadGhar - Rajkot Kathiyawad Darbar** | Kalawad Road, Kotecha, Rajkot | `rajkot@swadghar.com` | `Rajkot@123` | Bhavesh Jadeja | `staff` |
| 5 | **SwadGhar - Mumbai Express** | SV Road, Borivali West, Mumbai | `mumbai@swadghar.com` | `Mumbai@123` | Nitin Mehta | `staff` |

---

## 👨‍🍳 Central Staff & Support Account

| Parameter | Value |
|---|---|
| **User ID / Email** | `staff@swadghar.com` |
| **Password** | `Staff@123` |
| **Role** | `staff` |

---

## 👤 Sample Customer Account

For testing user registration, cart checkout, online payments, and table reservations:

| Parameter | Value |
|---|---|
| **Customer Name** | Aarav Sharma |
| **User ID / Email** | `customer@gmail.com` |
| **Password** | `Customer@123` |
| **Role** | `customer` |

---

## 🌐 Live System URLs

| Service | Live Deployment URL |
|---|---|
| **Frontend Web App (Netlify)** | [https://swadghar-restaurant.netlify.app](https://swadghar-restaurant.netlify.app) |
| **Backend API (Render)** | [https://swadghar-restaurant-backend.onrender.com](https://swadghar-restaurant-backend.onrender.com) |
| **MongoDB Atlas Database** | `cluster0.3q4spvt.mongodb.net/swadghar` |
| **Franchise Showcase Page** | [https://swadghar-restaurant.netlify.app/franchise](https://swadghar-restaurant.netlify.app/franchise) |

---

## 🎟️ Active Promotional Discount Coupons

| Coupon Code | Discount | Type | Description |
|---|---|---|---|
| `SWAD10` | **10% OFF** | Percentage | General welcome discount for all diners |
| `WELCOME20` | **20% OFF** | Percentage | First-time online order promo |
| `FESTIVE50` | **₹50 FLAT OFF** | Fixed Amount | Festive celebration dining coupon |

---

> [!NOTE]
> To reset or re-populate all data and user accounts into MongoDB Atlas anytime, run:
> ```bash
> npm --prefix backend run seed
> ```
