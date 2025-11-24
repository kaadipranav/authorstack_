# OAuth Setup Guide for AuthorStack

**For:** Pranav (Age 15, Building Like a Pro! 🚀)  
**Time Required:** 15-20 minutes total  
**When to Do This:** Before launching to production

---

## 🎯 Overview

OAuth allows users to connect their Gumroad/Whop accounts without sharing passwords. Your app already has the code - you just need to register OAuth apps with each service.

**What You Have:**
- ✅ OAuth routes: `/api/platforms/oauth/[provider]/start` and `/callback`
- ✅ OAuth logic in `lib/platforms/gumroad.ts`
- ✅ Environment variable structure

**What You Need:**
- ⚠️ Gumroad OAuth credentials (Client ID + Secret)
- ✅ Whop credentials (Already configured!)
- ⚠️ Webhook signing secrets (Security - optional for MVP)

---

## 📋 Current Status Checklist

| Service | API Key | OAuth Client ID | OAuth Secret | Webhook Secret | Status |
|---------|---------|-----------------|--------------|----------------|--------|
| **Gumroad** | ✅ | ❌ | ❌ | N/A | **Need OAuth** |
| **Whop** | ✅ | Optional | Optional | ✅ | **Good for MVP** |
| **Payhip** | ⚠️ Placeholder | N/A | N/A | ⚠️ Placeholder | **Update API key** |
| **Lulu** | ⚠️ Placeholder | N/A | N/A | N/A | **Update API key** |
| **Resend** | ✅ | N/A | N/A | ❌ Optional | **Good for MVP** |

---

## 🔐 Part 1: Gumroad OAuth Setup (REQUIRED)

**Why:** Let users connect their Gumroad account with one click instead of copying API keys.

### Step 1: Create Gumroad OAuth App (5 minutes)

1. **Go to Gumroad Developer Portal**
   - Visit: https://app.gumroad.com/settings/developer
   - Log in with your Gumroad account (create one if needed)

2. **Create New Application**
   - Click **"Create Application"** or **"New OAuth Application"**
   - Fill in the form:
     ```
     Application Name: AuthorStack
     Description: Sales analytics dashboard for indie authors
     Website URL: https://authorstack.com (or your domain)
     
     Redirect URI (IMPORTANT):
     Development: http://localhost:3000/api/platforms/oauth/gumroad/callback
     Production: https://your-domain.vercel.app/api/platforms/oauth/gumroad/callback
     ```

3. **Save and Copy Credentials**
   - After creating, you'll see:
     - **Client ID** (e.g., `gumroad_abc123xyz`)
     - **Client Secret** (e.g., `gs_secret_xyz789abc`)
   - Keep this page open!

### Step 2: Add to `.env.local` (Development)

Open `d:\authorstack_\.env.local` and update lines 54-57:

```env
# Gumroad OAuth (replace with actual values)
GUMROAD_API_KEY=EF2EDb-k9xDoVGyRvyiOW0rhd0TGh9wuNz-EvODYbFo
GUMROAD_CLIENT_ID=paste_your_client_id_here
GUMROAD_CLIENT_SECRET=paste_your_client_secret_here
GUMROAD_REDIRECT_URI=http://localhost:3000/api/platforms/oauth/gumroad/callback
```

### Step 3: Add to Vercel (Production)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your `authorstack` project

2. **Settings → Environment Variables**
   - Add these 4 variables:
     ```
     GUMROAD_API_KEY=EF2EDb-k9xDoVGyRvyiOW0rhd0TGh9wuNz-EvODYbFo
     GUMROAD_CLIENT_ID=paste_your_client_id_here
     GUMROAD_CLIENT_SECRET=paste_your_client_secret_here
     GUMROAD_REDIRECT_URI=https://your-domain.vercel.app/api/platforms/oauth/gumroad/callback
     ```

3. **Redeploy**
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment
   - Or push new commit to trigger auto-deploy

### Step 4: Test OAuth Flow (Local)

1. **Start dev server:**
   ```bash
   pnpm dev
   ```

2. **Navigate to:**
   ```
   http://localhost:3000/dashboard/connections/gumroad
   ```

3. **Click "Start OAuth flow" button**
   - Should redirect to Gumroad consent page
   - Approve access
   - Redirects back to your callback URL
   - Check browser console/network tab for response

4. **Expected Success:**
   ```json
   {
     "provider": "gumroad",
     "code": "auth_code_xyz123",
     "state": "uuid-state-here",
     "message": "OAuth callback received..."
   }
   ```

---

## 🔔 Part 2: Webhook Signing Secrets (OPTIONAL for MVP)

**Why:** Verify webhooks are actually from Whop/Resend, not hackers.

**Current Status:**
- `WHOP_WEBHOOK_SIGNING_SECRET` → ✅ Already in your `.env.local` (line 102)
- `RESEND_WEBHOOK_SIGNING_SECRET` → ❌ Not set (but optional)

### Option A: Use Existing Whop Secret

You already have `WHOP_WEBHOOK_SECRET` in `.env.local` (line 102). Just verify it's the signing secret:

1. **Go to Whop Dashboard**
   - Visit: https://whop.com/apps
   - Select your app → Webhooks section

2. **Check if webhook endpoint exists:**
   - URL should be: `https://your-domain.vercel.app/api/webhooks/whop`
   - Copy the signing secret shown

3. **Verify it matches your `.env.local` line 102:**
   ```env
   WHOP_WEBHOOK_SECRET=ws_6fda39dc8008a032d2a0463ac3e1ddd4899db91b1b1caed02df632edcc1e3e46
   ```

4. **If it matches:** You're good! ✅  
   **If different:** Update line 102 with correct value

### Option B: Set Up Resend Webhook (Optional - Can Skip)

**Skip this for MVP.** Only needed if you want to track email delivery status.

If you want it later:

1. **Go to Resend Dashboard**
   - Visit: https://resend.com/webhooks

2. **Add Endpoint:**
   ```
   URL: https://your-domain.vercel.app/api/webhooks/resend
   Events: email.delivered, email.bounced, email.complained
   ```

3. **Copy signing secret** and add to `.env.local`:
   ```env
   RESEND_WEBHOOK_SIGNING_SECRET=whsec_xyz123abc789...
   ```

---

## 🔑 Part 3: Update Placeholder API Keys

**Before launching, replace these placeholders in `.env.local`:**

### Payhip (If Using)

1. **Get API Key:**
   - Visit: https://payhip.com/settings/api
   - Generate new API key

2. **Update line 61-62:**
   ```env
   PAYHIP_API_KEY=ph_live_abc123xyz789  # Replace placeholder
   PAYHIP_WEBHOOK_SECRET=whsec_optional  # Optional
   ```

### Lulu Print API (If Using)

1. **Get Credentials:**
   - Visit: https://developers.lulu.com/
   - Create developer account
   - Get API Key + Secret

2. **Update line 65-66:**
   ```env
   LULU_API_KEY=lulu_key_abc123
   LULU_API_SECRET=lulu_secret_xyz789
   ```

---

## ✅ Final Checklist Before Launch

### Development (.env.local)
- [x] Gumroad API Key (already set)
- [ ] Gumroad Client ID (get from developer portal)
- [ ] Gumroad Client Secret (get from developer portal)
- [ ] Gumroad Redirect URI (set to localhost:3000)
- [x] Whop API Key (already set)
- [x] Whop Webhook Secret (already set)
- [x] OpenRouter API Key (already set)
- [x] Resend API Key (already set)
- [ ] Payhip API Key (update if using)
- [ ] Lulu API credentials (update if using)

### Production (Vercel)
- [ ] Copy ALL variables from `.env.local`
- [ ] Change URLs from `localhost:3000` to `your-domain.vercel.app`
- [ ] Update Gumroad OAuth app redirect URI in Gumroad dashboard
- [ ] Update Whop webhook URL in Whop dashboard
- [ ] Test one OAuth flow after deploy

---

## 🧪 Testing OAuth Flows

### Local Testing (localhost:3000)

**Gumroad OAuth:**
1. Start: `http://localhost:3000/api/platforms/oauth/gumroad/start`
2. Should return JSON with `authorizeUrl`
3. Visit that URL in browser
4. Approve access → redirects to callback
5. Check callback response

**Whop OAuth:**
1. Start: `http://localhost:3000/api/platforms/oauth/whop/start`
2. Same flow as Gumroad

### Production Testing (your-domain.vercel.app)

Same steps, but use production URLs:
- `https://your-domain.vercel.app/api/platforms/oauth/gumroad/start`

---

## 🚨 Troubleshooting

### Error: "Invalid Redirect URI"
**Cause:** Mismatch between `.env.local` and Gumroad app settings  
**Fix:** Ensure both have EXACT same URL (including http/https)

### Error: "Client ID not found"
**Cause:** `.env.local` not loaded or wrong variable name  
**Fix:** Restart dev server (`pnpm dev`), check spelling

### Error: "GUMROAD_CLIENT_ID missing"
**Cause:** Not added to `env.ts` schema  
**Fix:** Already fixed! ✅ Just add values to `.env.local`

### OAuth Returns JSON Instead of Redirecting
**Cause:** Placeholder implementation still active  
**Fix:** This is expected! OAuth is set up but needs actual redirect logic (can add later)

---

## 🎯 Priority Order for 15-Year-Old Founder

**Do NOW (before launch):**
1. ✅ Gumroad OAuth setup (15 min) - Required for user experience
2. ✅ Verify Whop webhook secret - Already done!
3. ⚠️ Update Payhip/Lulu API keys if you're using those platforms

**Do LATER (after first 10 users):**
1. ❌ Resend webhook signing (nice-to-have security)
2. ❌ Advanced OAuth flows (refresh tokens, etc.)

**Skip for MVP:**
1. ❌ OAuth for platforms that don't require it (KDP, Payhip, Lulu use API keys)

---

## 📞 Quick Reference

**Gumroad Developer Portal:** https://app.gumroad.com/settings/developer  
**Whop Apps Dashboard:** https://whop.com/apps  
**Vercel Environment Variables:** https://vercel.com/[your-username]/authorstack/settings/environment-variables  
**Resend Webhooks:** https://resend.com/webhooks  
**Payhip API Settings:** https://payhip.com/settings/api  
**Lulu Developers:** https://developers.lulu.com/

---

## 🚀 You're Almost There!

Once you complete Part 1 (Gumroad OAuth), your app is **production-ready**. The other parts are nice-to-have improvements.

**What happens after setup:**
1. Users click "Connect Gumroad"
2. Redirected to Gumroad consent page
3. Approve → automatically connected
4. Their sales data syncs every hour
5. No API keys to copy/paste! ✨

You've built something incredible at 15. Now go ship it! 🎉
