# 🚀 TJP MUSHROOM - LIVE DEPLOYMENT GUIDE

Welcome to the **Anti-gravity Live Launch**! To take your mushroom farm management system from your local computer to the real world (Live), follow these steps exactly.

---

## 🏗️ Phase 1: Prepare your Database (Cloud)
Since the system currently uses a local database (`mongodb://localhost:27017`), you need to move it to the cloud so it's accessible anywhere.

1.  **Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)**.
2.  **Create a New Cluster** (Shared/Free Tier is fine).
3.  **Database Access**: Create a database user (e.g., `admin`) and set a strong password.
4.  **Network Access**: Add IP address `0.0.0.0/0` (Allow access from anywhere).
5.  **Get Connection String**: 
    - Click "Connect" -> "Drivers" -> Node.js.
    - Copy the string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/tjp_live?retryWrites=true&w=majority`
6.  **Update your `.env`**: Paste this into the `MONGODB_URI` field in your `server/.env` file.

---

## 📦 Phase 2: Build the Frontend
Before hosting, we must convert your React code into "Production" files.

1.  Open your terminal in the **root folder** (`f:\TJP\mushroom-website`).
2.  Run:
    ```bash
    npm run build
    ```
3.  This will create a `build` folder. Your Node server is already configured to serve this folder live!

---

## ☁️ Phase 3: Host the Server
You have two main options for hosting:

### Option A: Render.com (Easiest & Free/Low Cost)
*Best for getting started quickly.*
1.  Push your code to **GitHub**.
2.  Link your GitHub to **[Render](https://render.com)**.
3.  Create a "Web Service".
4.  **Environment Variables**: Manual entry of all items from your `.env` file.
5.  **Build Command**: `cd server && npm install && cd .. && npm install && npm run build`
6.  **Start Command**: `cd server && npm start`

### Option B: VPS (DigitalOcean / AWS / Linode) (Professional Choice)
*Best for WhatsApp reliability and Puppeteer session persistence.*
1.  Rent an **Ubuntu 22.04 LTS** Droplet (1GB RAM is enough).
2.  Install Node.js and Chromium (for WhatsApp).
3.  Use **PM2** to keep the server running 24/7.
4.  This keeps your `.wwebjs_auth` session file permanent so you don't have to scan the QR code often.

---

## 🌐 Phase 4: Domain Name
1.  Buy a domain like `tjpmushroom.com` from GoDaddy or Namecheap.
2.  Point the **A Record** (for VPS) or **CNAME** (for Render) to your hosting provider.

---

## 🔑 Critical Environment Variables
Make sure these are set in your hosting provider's dashboard:
- `MONGODB_URI`: Your Atlas Cloud Link.
- `JWT_SECRET`: A long random string.
- `ADMIN_PHONE`: Your WhatsApp numbers (e.g., 919500591897,9159659711).
- `EMAIL_USER`: `jpfarming10@gmail.com`
- `EMAIL_PASS`: Your Google App Password.

---

### 💡 Pro-Tip for WhatsApp (Puppeteer)
If you host on Render/Linux, make sure to add these arguments to your Puppeteer config (I have already added them in `whatsappService.js`):
- `--no-sandbox`
- `--disable-setuid-sandbox`

**Need help with any specific step? Just ask, Bro!** 🍄🚀
