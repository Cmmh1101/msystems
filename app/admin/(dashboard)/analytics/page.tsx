import { getGa4Overview } from "@/lib/ga4";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminAnalyticsPage() {
  let data: Awaited<ReturnType<typeof getGa4Overview>> | null = null;
  let errorMessage: string | null = null;

  try {
    data = await getGa4Overview();
  } catch (err) {
    console.error("admin analytics: GA4 fetch failed", err);
    errorMessage =
      "Couldn't load analytics right now. If you just set this up, GA4 access can take a few minutes to propagate — try refreshing shortly.";
  }

  return (
    <>
      <h1>Analytics</h1>
      <p className="admin-page-sub">Last 30 days, from GA4.</p>

      {errorMessage && <div className="admin-empty">{errorMessage}</div>}

      {data && (
        <>
          <div className="admin-stat-row">
            <div className="admin-stat-tile">
              <span className="admin-stat-value">{data.totals.activeUsers.toLocaleString()}</span>
              <span className="admin-stat-label">Active users</span>
            </div>
            <div className="admin-stat-tile">
              <span className="admin-stat-value">{data.totals.sessions.toLocaleString()}</span>
              <span className="admin-stat-label">Sessions</span>
            </div>
            <div className="admin-stat-tile">
              <span className="admin-stat-value">{data.totals.pageViews.toLocaleString()}</span>
              <span className="admin-stat-label">Page views</span>
            </div>
          </div>

          {data.dailySessions.length > 0 && (
            <div className="admin-chart-wrap">
              <h2 className="admin-section-heading">Sessions by day</h2>
              <div className="admin-bar-chart">
                {data.dailySessions.map((d) => {
                  const max = Math.max(...data!.dailySessions.map((x) => x.sessions), 1);
                  return (
                    <div className="admin-bar" key={d.date} title={`${d.date}: ${d.sessions}`}>
                      <div className="admin-bar-fill" style={{ height: `${(d.sessions / max) * 100}%` }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="admin-two-col">
            <div>
              <h2 className="admin-section-heading">Top pages</h2>
              <div className="admin-table-wrap">
                {data.topPages.length === 0 ? (
                  <div className="admin-empty">No page view data yet.</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Page</th>
                        <th>Views</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topPages.map((p) => (
                        <tr key={p.path}>
                          <td className="muted">{p.path}</td>
                          <td>{p.views.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div>
              <h2 className="admin-section-heading">Traffic sources</h2>
              <div className="admin-table-wrap">
                {data.topSources.length === 0 ? (
                  <div className="admin-empty">No traffic source data yet.</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Channel</th>
                        <th>Sessions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topSources.map((s) => (
                        <tr key={s.channel}>
                          <td className="muted">{s.channel}</td>
                          <td>{s.sessions.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
