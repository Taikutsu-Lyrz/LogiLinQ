# LogilinQ - Real-Time Logistics & Shipment Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.5-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Perplexity AI](https://img.shields.io/badge/Perplexity-API-blueviolet?style=for-the-badge)](https://www.perplexity.ai/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

**LogilinQ** is a full-stack, real-time logistics management platform built from the ground up with React and Firebase. It provides a complete solution for small-scale logistics by offering three distinct user portals (Sender, Driver, and Receiver), each with a dashboard tailored to their specific needs.

This application is designed as an end-to-end tracking solution, featuring live driver map tracking, AI-powered analytics, proof-of-delivery signature capture, and comprehensive job management for all parties.

---

### 📸 Screenshots


###  Login Page 
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/f4496fa6-46ee-4edd-b317-36e6cfabefbd" />


### Sender Dashboard (Charts) 
<img width="1920" height="1852" alt="screencapture-localhost-5175-2025-11-12-05_23_59" src="https://github.com/user-attachments/assets/793db30a-3b30-4355-8485-790af027fc3e" />


### Driver Signature Capture
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/c7f2c3e5-29a9-4c86-821f-5a827e5aa59a" />


### Driver Revenue Tab 
<img width="1920" height="2527" alt="screencapture-localhost-5174-2025-11-12-05_22_21" src="https://github.com/user-attachments/assets/242e22bf-42b1-4bcb-980e-b208249fe481" />


### Live Tracking Modal 
<img width="1919" height="1078" alt="image" src="https://github.com/user-attachments/assets/5afc93ef-6eb5-435d-a661-11d822a2e2c6" />


### Receiver Dashboard (RTL) 
<img width="1920" height="1933" alt="screencapture-localhost-5173-2025-11-12-05_20_43" src="https://github.com/user-attachments/assets/e5016e5b-6250-4627-bbe1-337d25a813f5" />





---

### ✨ Core Features

I've broken down the features by what each user can do.

#### 🌐 General Platform Features
* **Authentication:** Full email/password and Google Sign-In flow via Firebase Auth.
* **Password Reset:** A "Forgot Password?" flow that sends a secure reset link to the user's email.
* **Profile Management:** A dedicated "My Profile" tab for all users to update their display name, which syncs across Firebase Auth and Firestore.
* **Multi-Language Support:**
    * Full translation into **English** and **Persian** using `react-i18next`.
    * Automatic **Right-to-Left (RTL)** layout switching based on the selected language.
    * Locally-hosted fonts (`Inter` for LTR, `Vazirmatn` for RTL) for fast, consistent rendering.
* **Modern UI/UX:**
    * **Light & Dark Mode** support (persisted in `localStorage`).
    * Fully responsive, top-tab-based navigation.
    * Custom animated loading spinner.
    * Custom-styled modals with scroll-locking and hidden scrollbars.
* **Offline Support:**
    * App is configured as an installable **Progressive Web App (PWA)** via `vite-plugin-pwa`.
    * Firestore data is cached locally using `enableIndexedDbPersistence` for offline viewing.

#### 👨‍💼 Sender Dashboard (The "Control Tower")
* **Create Shipments:** A 3-step (Receiver, Driver, Goods) form with client-side validation.
* **Live Tracking Modal:** Track "In Transit" shipments on a real-time map. The modal updates live with data from Firestore.
* **View Proof of Delivery:** As soon as a driver marks a job "Delivered," the Sender can open the details modal and instantly see the captured signature.
* **Shipment Management:**
    * Searchable list of all active shipments.
    * **Copy to Clipboard** button for easily sharing Shipment IDs.
    * **Inline Confirmation:** "Archive" and "Delete" buttons require a second click to confirm, preventing accidents.
    * Manually mark any shipment as "Completed."
* **Data & AI Dashboards:**
    * **Recap Tab:** View statistics (total shipments, fees, etc.) and visual charts for "Ongoing vs. Completed" (Doughnut) and "Shipments per Month" (Bar).
    * **AI Recap Tab:** Generate an AI-powered summary of all shipment operations using the **Perplexity API**. The prompt is sent in the user's selected language.
* **Print Manifest:** Print a formatted shipment manifest for any delivery.

#### 🚚 Driver Dashboard (The "On-the-Road" App)
* **Job Management:**
    * Automatically loads all jobs assigned to the driver's email via a live `onSnapshot` listener.
    * **Manual Job Discovery:** A "Find Shipment" form allows drivers to find *any* "Pending" job and "Claim" it, supporting a first-come, first-served model.
    * **Active Job Lock:** A driver can only have one job "In Transit" at a time, preventing conflicts.
* **Live Location Tracking:**
    * Automatically broadcasts GPS location when a job is "In Transit."
    * **Quota Optimized:** Location updates are batched to once per minute (`maximumAge: 60000`) to stay within Firebase's free-tier limits.
* **Fake GPS Service (Testing):**
    * Includes a special `ENABLE_FGPS_LOCATION.jsx` file. When `true`, it broadcasts a static location for easy testing and demos without needing to move.
* **Proof of Delivery (Signature):**
    * "Mark as Delivered" opens a modal to capture the receiver's signature.
    * The modal is **locked** (cannot be closed by accident) until the signature is saved.
    * The signature is uploaded to Firestore, and the job status is updated to "Delivered."
* **Revenue Dashboard (New!):**
    * A dedicated "Earnings Recap" tab.
    * Shows stat cards: "Total Earnings," "This Month," "Total Deliveries," and "Avg. per Delivery."
    * Doughnut chart for "Paid vs. Pending" earnings.
    * Line chart for "Earnings per Month" trend.
    * List of recent earnings with a "Mark as Paid" button to update payment status.
* **Invoice Printing:** Drivers can print a detailed, formatted invoice for any completed job.
* **Archiving:** Drivers can "Archive" or "Permanently Delete" jobs from their personal view (this does not delete the shipment for the Sender/Receiver).

#### 📦 Receiver Dashboard (The "Customer" Portal)
* **Manual Tracking:** Track any shipment by its ID to see live status and details.
* **Claim Shipments:** A "Save to My List" button allows receivers to "claim" a manually-tracked shipment and add it to their personal dashboard.
* **Live Tracking Modal:**
    * Instantly see all shipment details (Sender, Driver, Goods).
    * View the driver's live location on a map when "In Transit."
    * View the **Proof of Delivery signature** as soon as it's uploaded.
* **Shipment Management:**
    * Organized into "Ongoing," "Completed," and "Archived" tabs.
    * "Mark as Received" button to confirm final delivery.
    * "Not Received?" button to revert a "Completed" shipment back to "Delivered."
* **Data Dashboard:**
    * A "Recap" tab with stats and charts for "Shipment Status" (Ongoing, Completed, Archived) and "Shipments per Month."

---

### 🛠 Tech Stack

| Category | Technology | Version |
| :--- | :--- | :--- |
| **Front-End** | React | `19.1.1` |
| **Backend & DB** | Firebase | `12.5.0` |
| **Build Tool** | Vite | `7.1.7` |
| **AI** | Perplexity AI | `0.12.0` |
| **Charts** | `react-chartjs-2` | `5.3.1` |
| **Mapping** | `react-leaflet` | (Loaded via CDN) |
| **Signatures** | `react-signature-canvas` | `1.1.0-alpha.2` |
| **Translation** | `react-i18next` | `16.2.4` |
| **Fonts** | `vazirmatn` | `33.0.3` |
| **PWA** | `vite-plugin-pwa` | `1.1.0` |

---

### 🚀 Getting Started

Follow these instructions to get the project running locally.

#### 1. Prerequisites

You will need `npm` (or `yarn`) and a **Firebase** project.

#### 2. Installation

1.  Clone the repository:
    ```sh
    git clone [YOUR-REPO-URL]
    cd logiliq-local
    ```

2.  Install NPM packages:
    ```sh
    npm install
    ```

#### 3. Environment Variables (Critical)

This project uses a `.env` file to securely manage all API keys.

1.  Create a file in the **root** of your project named `.env`
2.  Add your API keys (they **must** start with `VITE_`):

    ```
    # Firebase Keys
    VITE_FIREBASE_API_KEY="AIzaSy..."
    VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
    VITE_FIREBASE_PROJECT_ID="your-project-id"
    VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
    VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
    VITE_FIREBASE_APP_ID="1:1234567890:web:..."

    # Perplexity AI Key
    VITE_PERPLEXITY_API_KEY="pplx-..."
    ```
3.  Add `.env` to your `.gitignore` file to keep your keys secret!

#### 4. Firebase Project Setup

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (e.g., `logilinq2`).
2.  **Select the "Spark" (Free) Plan.** Do not upgrade to the "Blaze" (Pay-as-you-go) plan.
3.  Go to **Project Settings** (⚙️ icon) > **Your apps**.
4.  Click the **Web (`</>`)** icon, register your app, and Firebase will give you the values for your `.env` file.
5.  In the Firebase Console, go to **Build > Authentication** > **Sign-in method** and enable:
    * **Email/Password**
    * **Google** (You will need to provide a project support email).
6.  In **Authentication** > **Settings** > **Authorized domains**, click "Add domain" and add `localhost` and `127.0.0.1`.
7.  In the Firebase Console, go to **Build > Firestore Database**.
8.  Click **"Create database"** and start in **Test Mode**.
9.  Click the **"Rules"** tab and replace the default rules with these:

```bash
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Allows a user to create/read/write their own role
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Allows any logged-in user to do anything to shipments
    match /shipments/{shipmentId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click "Publish" to save the rules.

### 5. (Optional) Configure Fake GPS for Testing
To test the driver's live location tracking without moving:

Open src/services/ENABLE_FGPS_LOCATION.jsx.

Change const ENABLE_FGPS_LOCATION = false; to true.

You can change the GPS_COORDINATESS to any location you want.

### 6. Run the App
You must restart your server after creating the .env file.

```bash
npm run dev
```
Your app will now be running on http://localhost:5173 (or a similar port).
