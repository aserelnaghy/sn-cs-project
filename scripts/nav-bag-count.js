/* Updates the bag count in the navbar for pages that use the inline nav */
(async function () {
  const API_KEY = "sb_publishable_vzpgbW6T18bn5RyHdx66qw_pdeMQswL";
  const BASE_URL = "https://ajuxbtifwipqmwmsrqcg.supabase.co/rest/v1";
  const JWT =
    "eyJhbGciOiJFUzI1NiIsImtpZCI6IjA0YjI1MTg4LWMzZTItNDZkNi05MjRjLWFlZjc4NDU1ZDdkZCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FqdXhidGlmd2lwcW13bXNycWNnLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJjOGNhNDAwMC1kNTU1LTQ0NzctOTBhMi04Y2Y4Mzg5N2VhNjQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcxNjk3Nzc3LCJpYXQiOjE3NzE2OTQxNzcsImVtYWlsIjoidGVzdDFAemF3cS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoidGVzdDFAemF3cS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiJjOGNhNDAwMC1kNTU1LTQ0NzctOTBhMi04Y2Y4Mzg5N2VhNjQifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc3MTY5NDE3N31dLCJzZXNzaW9uX2lkIjoiOWVjMGExMjEtZjZlOC00ZTY4LWJmZGYtMDJiNzU1MDMzN2I2IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.ZL463ABOFMDyZwKW_XoZx5A0atgYuwtSB2xUHz1t1HKlTvwDsXqLcWbCgDjY0SLpRo5tTkOMk6Z9UlMdzKi-fw";

  let token = JWT;
  try {
    const raw = localStorage.getItem("zawq-token");
    if (raw) token = JSON.parse(raw)?.access_token ?? JWT;
  } catch {}

  try {
    const res = await fetch(`${BASE_URL}/cart_items?select=quantity`, {
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
    const items = await res.json();
    const total = Array.isArray(items)
      ? items.reduce((sum, i) => sum + (i.quantity || 0), 0)
      : 0;

    const el = document.getElementById("nav-bag-count");
    if (el) el.textContent = total > 0 ? ` (${total})` : "";
  } catch {}
})();
