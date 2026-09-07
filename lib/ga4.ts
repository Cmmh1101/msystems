import { BetaAnalyticsDataClient } from "@google-analytics/data";

export interface Ga4Overview {
  totals: { activeUsers: number; sessions: number; pageViews: number };
  dailySessions: { date: string; sessions: number }[];
  topPages: { path: string; views: number }[];
  topSources: { channel: string; sessions: number }[];
}

function getClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.");
  }

  return new BetaAnalyticsDataClient({
    credentials: { client_email: clientEmail, private_key: privateKey },
  });
}

function formatDate(yyyymmdd: string): string {
  return `${yyyymmdd.slice(4, 6)}/${yyyymmdd.slice(6, 8)}`;
}

export async function getGa4Overview(): Promise<Ga4Overview> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    throw new Error("Missing GA4_PROPERTY_ID.");
  }

  const client = getClient();
  const property = `properties/${propertyId}`;
  const dateRanges = [{ startDate: "30daysAgo", endDate: "today" }];

  const [totalsReport] = await client.runReport({
    property,
    dateRanges,
    metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
  });

  const totalsRow = totalsReport.rows?.[0]?.metricValues;
  const totals = {
    activeUsers: Number(totalsRow?.[0]?.value ?? 0),
    sessions: Number(totalsRow?.[1]?.value ?? 0),
    pageViews: Number(totalsRow?.[2]?.value ?? 0),
  };

  const [dailyReport] = await client.runReport({
    property,
    dateRanges,
    dimensions: [{ name: "date" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
  });

  const dailySessions = (dailyReport.rows ?? []).map((row) => ({
    date: formatDate(row.dimensionValues?.[0]?.value ?? ""),
    sessions: Number(row.metricValues?.[0]?.value ?? 0),
  }));

  const [pagesReport] = await client.runReport({
    property,
    dateRanges,
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 10,
  });

  const topPages = (pagesReport.rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? "",
    views: Number(row.metricValues?.[0]?.value ?? 0),
  }));

  const [sourcesReport] = await client.runReport({
    property,
    dateRanges,
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 10,
  });

  const topSources = (sourcesReport.rows ?? []).map((row) => ({
    channel: row.dimensionValues?.[0]?.value ?? "",
    sessions: Number(row.metricValues?.[0]?.value ?? 0),
  }));

  return { totals, dailySessions, topPages, topSources };
}
