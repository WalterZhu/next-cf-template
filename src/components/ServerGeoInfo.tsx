import { headers } from 'next/headers';

export default async function ServerGeoInfo() {
  const headersList = await headers();
  const country = headersList.get('CF-IPCountry');

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold mb-2 text-blue-800">🌍 Geographic Information</h3>
      <div className="space-y-1 text-sm text-blue-700">
        <p><strong>Country:</strong> {country || 'Unknown'}</p>
      </div>
      <p className="text-xs text-blue-600 mt-2">
        This information is detected by Cloudflare Workers middleware
      </p>
    </div>
  );
}