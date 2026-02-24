# Domain Setup — savannasellstn.com

## Current State
- Domain: `savannasellstn.com`
- Registrar: GoDaddy
- Hosting: Vercel (auto-deploys from GitHub `main` branch)
- Not yet connected

## How to Connect GoDaddy Domain to Vercel

### Step 1: Add Domain in Vercel
1. Go to your Vercel dashboard → select the **savanna-sells-tn** project
2. Click **Settings** → **Domains**
3. Type `savannasellstn.com` and click **Add**
4. Vercel will show you the DNS records you need to set

### Step 2: Update DNS in GoDaddy
1. Log into GoDaddy → **My Products** → find `savannasellstn.com` → **DNS**
2. Delete any existing A records pointing to GoDaddy parking pages
3. Add the records Vercel gave you (usually one of these options):

**Option A — A Record (recommended):**
| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

**Option B — Nameservers (hands full control to Vercel):**
- Change GoDaddy nameservers to the ones Vercel provides
- This means Vercel manages all DNS, not just the website

### Step 3: Wait for Propagation
- DNS changes can take up to 48 hours, but usually work within 5–30 minutes
- Vercel will automatically provision an SSL certificate (HTTPS) once DNS is verified

### Step 4: Verify in Vercel
- Go back to Vercel **Settings** → **Domains**
- Both `savannasellstn.com` and `www.savannasellstn.com` should show green checkmarks
