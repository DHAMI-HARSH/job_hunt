import { NextRequest, NextResponse } from "next/server";

async function getAccessToken(request: NextRequest) {
  const refreshToken = request.cookies.get("drive_refresh_token")?.value;
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!refreshToken || !clientId || !clientSecret) return null;
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ refresh_token: refreshToken, client_id: clientId, client_secret: clientSecret, grant_type: "refresh_token" }) });
  if (!response.ok) return null;
  const data = (await response.json()) as { access_token?: string };
  return data.access_token || null;
}

const driveFileFields = "files(id,name,mimeType,modifiedTime,size,webViewLink)";

export async function GET(request: NextRequest) {
  const accessToken = await getAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "Connect Google Drive first." }, { status: 401 });
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const folderQuery = folderId ? ` and '${folderId}' in parents` : "";
  const query = encodeURIComponent(`trashed = false${folderQuery} and (mimeType = 'application/pdf' or mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' or mimeType = 'application/msword')`);
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime%20desc&pageSize=20&spaces=drive&fields=${encodeURIComponent(driveFileFields)}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) return NextResponse.json({ error: "Google Drive could not be read." }, { status: response.status });
  return NextResponse.json(await response.json());
}

export async function POST(request: NextRequest) {
  const accessToken = await getAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "Connect Google Drive first." }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get("resume");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a resume file first." }, { status: 400 });

  const metadata: { name: string; mimeType: string; parents?: string[] } = { name: file.name, mimeType: file.type || "application/octet-stream" };
  if (process.env.GOOGLE_DRIVE_FOLDER_ID) metadata.parents = [process.env.GOOGLE_DRIVE_FOLDER_ID];
  const boundary = `job-scout-${Date.now()}`;
  const body = new Blob([`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${file.type || "application/octet-stream"}\r\n\r\n`, await file.arrayBuffer(), `\r\n--${boundary}--`]);
  const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=${encodeURIComponent("id,name,mimeType,modifiedTime,webViewLink")}`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": `multipart/related; boundary=${boundary}` }, body });
  if (!response.ok) return NextResponse.json({ error: "Google Drive could not save that resume." }, { status: response.status });
  return NextResponse.json(await response.json());
}
