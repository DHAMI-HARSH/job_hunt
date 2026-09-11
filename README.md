# Job Scout

A standalone Next.js job search app. It calls Adzuna through its own server-side route; it does not depend on n8n or the workflows in the parent folder.

## Configure

Create `jobs-listing/.env.local` from `.env.example` and add your Adzuna credentials:

```bash
ADZUNA_APP_ID=your_app_id
ADZUNA_APP_KEY=your_app_key
ADZUNA_COUNTRY=in
ADZUNA_LOCATION=India
```

The credentials are only read by `app/api/jobs/route.ts` and are never sent to the browser.

To use the dashboard resume vault, add Google OAuth credentials and register this redirect URI in Google Cloud OAuth settings:

```text
http://localhost:3000/api/drive/callback
```

Then open `/dashboard`, connect Google Drive, and upload a PDF, DOC, or DOCX resume. The dashboard lists matching files from Drive and gives you an Open link.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Search keywords are sent to Adzuna through `/api/jobs`, with India used as the default location; **Fast apply** opens the original listing in a new tab. Use `/dashboard` for your Drive resume vault, favourites, and seen jobs.

## Deploy to Vercel

This folder is deployable as its own Vercel project. In Vercel, set the project **Root Directory** to `jobs-listing` if importing the parent repository.

Add these environment variables in the Vercel project settings:

```text
ADZUNA_APP_ID
ADZUNA_APP_KEY
ADZUNA_COUNTRY=in
ADZUNA_LOCATION=India
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET
GOOGLE_DRIVE_FOLDER_ID (optional)
```

Do not commit `.env`, `.env.local`, or any API keys. After deployment, add the production callback URL to Google Cloud OAuth:

```text
https://YOUR-VERCEL-DOMAIN/api/drive/callback
```

The app has no database requirement: favourites, seen jobs, and the saved job cache live in the user’s browser, while resume files live in Google Drive.
