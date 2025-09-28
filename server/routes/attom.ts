import type { RequestHandler } from "express";
import type { AttomLookupRequest, AttomLookupResponse, PropertyDetails } from "@shared/api";

/**
 * Attempts to fetch property details (beds/baths) from ATTOM API using the provided address.
 * Falls back to mocked data when ATTOM_API_KEY is not configured or fetch fails.
 */
export const attomLookup: RequestHandler = async (req, res) => {
  const body = req.body as AttomLookupRequest | undefined;
  if (!body || !body.address) {
    const response: AttomLookupResponse = {
      ok: false,
      details: null,
      error: "Missing address in request body",
    };
    return res.status(400).json(response);
  }

  const { street, city, state, postalCode } = body.address;
  const key = process.env.ATTOM_API_KEY;

  // Helper: return a friendly mock so the UI flow works without keys
  const returnMock = (reason: string) => {
    const details: PropertyDetails = {
      bedrooms: 3,
      bathrooms: 2.5,
      source: "mock",
      latitude: 41.8781,
      longitude: -87.6298,
      buildingType: "house",
      yearBuilt: 2020,
      raw: { reason },
    };
    const response: AttomLookupResponse = { ok: true, details };
    return res.status(200).json(response);
  };

  // If no API key, return mock
  if (!key) return returnMock("ATTOM_API_KEY not configured");

  try {
    // ATTOM API - example endpoint. If this fails, we gracefully fall back to mock
    const params = new URLSearchParams({
      address: `${street}, ${city}, ${state} ${postalCode}`,
    });
    const url = `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?${params.toString()}`;

    const resp = await fetch(url, {
      headers: {
        Accept: "application/json",
        apikey: key,
      },
    });

    if (!resp.ok) {
      return returnMock(`ATTOM request failed with status ${resp.status}`);
    }

    const json: any = await resp.json();

    // Try to extract property details from ATTOM response
    const first = json?.property?.[0] ?? json?.property ?? json?.[0] ?? json;
    const bds = first?.building?.rooms?.beds ?? first?.summary?.beds ?? null;
    const bths = first?.building?.rooms?.bathstotal ?? first?.summary?.baths ?? null;
    const lat = first?.location?.latitude ?? null;
    const lon = first?.location?.longitude ?? null;
    const buildingType = first?.summary?.proptype ?? first?.summary?.propertyType ?? "house";
    const yearBuilt = first?.summary?.yearbuilt ?? first?.building?.yearBuilt ?? null;

    const details: PropertyDetails = {
      bedrooms: typeof bds === "number" ? bds : null,
      bathrooms: typeof bths === "number" ? bths : null,
      latitude: typeof lat === "number" ? lat : null,
      longitude: typeof lon === "number" ? lon : null,
      buildingType: typeof buildingType === "string" ? buildingType.toLowerCase() : "house",
      yearBuilt: typeof yearBuilt === "number" ? yearBuilt : null,
      source: "attom",
      raw: first,
    };

    const response: AttomLookupResponse = { ok: true, details };
    return res.status(200).json(response);
  } catch (error: any) {
    return returnMock(`Exception: ${error?.message ?? "unknown"}`);
  }
};
