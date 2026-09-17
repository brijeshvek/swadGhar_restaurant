# SwadGhar Deployment Guide (Render & Netlify)

This guide walks you through deploying your **Node.js/Express Backend to Render** and your **React/Vite Frontend to Netlify**.

---

## Part 1: Deploy Backend to Render

### 1. Create a Web Service on Render
1. Go to [dashboard.render.com](https://dashboard.render.com) and log in.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `https://github.com/brijeshvek/swadGhar_restaurant`.
4. Configure the service settings:
   * **Name**: `swadghar-backend` (or your preferred name)
   * **Region**: Choose closest to your users (e.g. `Singapore` or `Oregon`)
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
   * **Instance Type**: `Free`

### 2. Add Environment Variables on Render
Under the **Environment Variables** tab of your service, add the following key-value pairs:

| Variable Name | Recommended Value / Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | `mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/swadghar?retryWrites=true&w=majority` |
| `JWT_SECRET` | `swadghar_super_secure_jwt_secret_key_2026_prod` *(or click generate)* |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | `https://<your-site-name>.netlify.app` *(add after creating Netlify app)* |
| `RAZORPAY_KEY_ID` | `rzp_test_Td5GYtIrYigZH7` *(your Razorpay Key ID)* |
| `RAZORPAY_KEY_SECRET` | `E1Qg0y2vwPAMxVpz3X3DjKLh` *(your Razorpay Key Secret)* |
| `CLOUDINARY_CLOUD_NAME`| `demo` |
| `CLOUDINARY_API_KEY` | `1234567890` |
| `CLOUDINARY_API_SECRET`| `abcdefghijklmnopqrstuvwxyz` |

### 3. Deploy & Copy Backend URL
* Click **Create Web Service**.
* Once deployed, Render will provide your public URL:
  `https://swadghar-backend.onrender.com` (Save this for Netlify configuration).

---

## Part 2: Deploy Frontend to Netlify

### 1. Connect GitHub to Netlify
1. Go to [app.netlify.com](https://app.netlify.com) and log in.
2. Click **Add new site** → **Import an existing project**.
3. Authorize GitHub and select `swadGhar_restaurant`.

### 2. Configure Netlify Build Settings
* **Base directory**: `frontend`
* **Build command**: `npm run build`
* **Publish directory**: `dist` (or `frontend/dist`)

### 3. Set Frontend Environment Variables on Netlify
In Netlify Site Settings → **Environment variables**, add:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://swadghar-backend.onrender.com/api` *(Your Render backend URL followed by `/api`)* |

### 4. Deploy Site
* Click **Deploy site**.
* Netlify will build and provide your live URL: `https://swadghar.netlify.app`.

---

## Part 3: Connect Frontend & Backend

1. In your **Render Dashboard**, update the `CLIENT_URL` variable to match your live Netlify domain:
   * `CLIENT_URL` = `https://swadghar.netlify.app`
2. Save changes (Render will automatically redeploy with the updated CORS origin).

---

## Testing & Verifying Deployment

1. **Backend Health Check**: Open `https://your-backend.onrender.com/api/health` in your browser. You should receive:
   ```json
   {
     "success": true,
     "message": "SwadGhar Restaurant API is healthy and operational"
   }
   ```
2. **Frontend App**: Open your Netlify URL and verify:
   * Browsing Menu dishes and categories.
   * Customer Registration & Profile picture upload.
   * Adding to Cart & Razorpay Checkout.
   * Viewing and printing Tax Invoices.
   * Submitting inquiries through the Contact page.
   * Logging into the Admin portal (`admin@swadghar.com` / `Admin@123`).
