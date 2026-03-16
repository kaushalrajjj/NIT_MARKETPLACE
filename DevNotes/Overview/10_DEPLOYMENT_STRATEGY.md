# 🚀 Deployment & Production Readiness

> **DevNote #10** — Moving from Localhost to the Cloud

---

## 🌐 The MongoDB "IP Problem"
When you run the site locally, your ISP gives you a specific IP address. When you deploy to a service like **Render**, **Railway**, or **Heroku**, the server's IP address is dynamic (it changes).

### The Solution: "Allow Access from Anywhere"
1. Log in to your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
2. Navigate to **Security** > **Network Access**.
3. Click **Add IP Address**.
4. Select **Allow Access From Anywhere** (which enters `0.0.0.0/0`).
5. Click **Confirm**.

> [!IMPORTANT]
> Because this opens the database to any IP, you MUST ensure your database user has a **strong, unique password**.

---

## 🔑 Environment Variables
Never upload your `.env` file to GitHub. When you deploy, you must manually add these keys to your hosting provider's "Environment Variables" settings:

| Key | Description |
|---|---|
| `PORT` | Set to `5000` (or whatever the host requires) |
| `MONGODB_URI` | Your full Atlas connection string |
| `JWT_SECRET` | A complex random string for token signing |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary account name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET`| Your Cloudinary API secret |

---

## 📦 Static Files & Clean URLs
The backend `app.js` is already configured to serve the frontend:
- `express.static` handles the CSS, JS, and Assets.
- `app.get('*', ...)` handles the clean URLs (e.g., `/browse` instead of `/browse.html`).

When deploying, make sure your **Start Command** is set to `npm start` (which runs `node backend/server.js`).

---

## 🖼️ Cloudinary in Production
Because we use Cloudinary, you don't need to worry about persistent disk storage for images on your server. Images are safely stored in the cloud, making your application "Stateless" and easy to scale.
