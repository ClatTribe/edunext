// lib/fetcher.ts

// ─────────────────────────────────────────────
// Server-Side Fetch
// ─────────────────────────────────────────────
async function fetchUrlServerSide(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);


  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Referer": "https://www.google.com/",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    if (!html || html.length < 100) {
      throw new Error("Response is empty");
    }

    return html;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─────────────────────────────────────────────
//  STRATEGY 2: CORS Proxies
// ─────────────────────────────────────────────
// const CORS_PROXIES = [
//   {
//     name: "allorigins",
//     build: (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
//   },
//   {
//     name: "corsproxy.io",
//     build: (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
//   },
//   {
//     name: "codetabs",
//     build: (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
//   },
//   {
//     name: "jsonp.afeld",
//     build: (u: string) => `https://jsonp.afeld.me/?url=${encodeURIComponent(u)}`,
//   },
//   {
//     name: "cors-anywhere",
//     build: (u: string) => `https://cors-anywhere.herokuapp.com/${u}`,
//   },
// ];

// async function fetchWithProxies(url: string): Promise<string> {
//   for (const proxy of CORS_PROXIES) {
//     try {
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 12000);

//       try {
//         const res = await fetch(proxy.build(url), {
//           signal: controller.signal,
//           headers: {
//             "User-Agent": "Mozilla/5.0",
//             "Accept-Language": "en-US,en;q=0.9",
//           },
//         });

//         if (res.ok) {
//           const html = await res.text();
//           if (html && html.length > 500) return html;
//         }
//       } finally {
//         clearTimeout(timeoutId);
//       }
//     } catch {
//       continue;
//     }
//   }

//   throw new Error("All CORS proxies failed");
// }

// ─────────────────────────────────────────────
//  Main Fetch Function
// ─────────────────────────────────────────────

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function fetchUrl(url: string): Promise<string> {
  if (!isValidUrl(url)) {
    throw new Error("Invalid URL format");
  }

  try {
    return await fetchUrlServerSide(url);
  } catch (err) {
    console.warn("[Fetch] Server-side failed");
  }

  // try {
  //   return await fetchWithProxies(url);
  // } catch (err) {
  //   console.warn("[Fetch] Proxies failed");
  // }

  throw new Error("Unable to fetch URL. Please copy and paste the page HTML directly.");
}