import cron from 'node-cron';
import axios from 'axios';

export function startOSMCronJob() {
  cron.schedule('0 3 * * 0', async () => {
    try {
      console.log('[Cron] Fetching cultural sites from OSM...');
      await axios.get(
        'http://localhost:3000/cultural-sites/fetch/osm?lat=50.8365&lon=12.9239&radius=5'
      );
      console.log('[Cron] Cultural sites refreshed successfully.');
    } catch (err) {
      if (err instanceof Error) {
        console.error('[Cron] Failed to refresh cultural sites:', err.message);
      } else {
        console.error('[Cron] Unknown error:', err);
      }
    }
  });
}
