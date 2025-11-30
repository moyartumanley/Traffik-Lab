const linesJSONURL =
  "https://transport.integration.sl.se/v1/lines?transport_authority_id=1";
const dodgeCors = (url) => "https://corsproxy.io/?url=" + url;

/** Fetches lines from API */
export async function fetchLines() {
  const response = await fetch(dodgeCors(linesJSONURL));
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();

  const filteredLines = [
    ...(data.metro || []).map((l) => ({ ...l, type: "METRO" })),
    ...(data.bus || []).map((l) => ({ ...l, type: "BUS" })),
  ];
  const allowedLineIds = new Set(filteredLines.map((l) => l.id));
  return { filteredLines, allowedLineIds };
}