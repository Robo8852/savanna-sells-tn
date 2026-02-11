# Data Contract

This document defines the data structure expected by the UI and how it maps to MLS API responses.

## How MLS Integration Works

**The agent already enters listings into the MLS** as part of their normal workflow (through their brokerage's MLS system). Every agent does this - it's how listings get syndicated to Zillow, Realtor.com, etc.

**The API pulls that data to the website automatically.** Requirements:
- Agent's MLS credentials or API key
- Access through an IDX provider (Spark API, IDX Broker, etc.)
- Or direct RESO Web API access if the MLS supports it

**No double-entry required.** The agent lists a property in MLS like they always do → API syncs it to the website automatically.

### Backend Requirements

1. Store API credentials securely (environment variables)
2. Build API routes to fetch and cache listings
3. Transform MLS data to match the frontend schema (see below)

### What the Agent Manages vs. What Syncs Automatically

| Content | How It's Updated |
|---------|------------------|
| Property listings | **Automatic** - syncs from MLS API |
| Listing photos | **Automatic** - pulled from MLS media |
| Price changes | **Automatic** - syncs from MLS |
| Sold/pending status | **Automatic** - syncs from MLS |
| Agent bio/headshot | **Manual** - developer updates or CMS |
| Contact info | **Manual** - developer updates or CMS |
| Testimonials | **Manual** - developer updates or CMS |

## Property Schema

The `ListingsGrid` component expects an array of properties with the following shape:

```typescript
interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  image: string;
  status?: 'for-sale' | 'pending' | 'sold';
}
```

## Field Mapping

| UI Field | Type | Description | MLS Equivalent |
|----------|------|-------------|----------------|
| `id` | string | Unique listing identifier | `ListingId`, `ListingKey` |
| `title` | string | Property headline | `PublicRemarks` (truncated) or custom |
| `location` | string | City, State format | `City`, `StateOrProvince` |
| `price` | number | Listing price in USD | `ListPrice` |
| `beds` | number | Bedroom count | `BedroomsTotal` |
| `baths` | number | Bathroom count | `BathroomsTotalInteger` |
| `sqft` | number | Living area square footage | `LivingArea` |
| `image` | string | Primary photo URL | `Media[0].MediaURL` |
| `status` | string | Listing status | `StandardStatus` |

## MLS API Response Transformation

Example transformation from RESO Web API format:

```typescript
function transformMLSData(mlsProperty: MLSProperty): Property {
  return {
    id: mlsProperty.ListingKey,
    title: mlsProperty.PublicRemarks?.slice(0, 50) || 'Beautiful Home',
    location: `${mlsProperty.City}, ${mlsProperty.StateOrProvince}`,
    price: mlsProperty.ListPrice,
    beds: mlsProperty.BedroomsTotal,
    baths: mlsProperty.BathroomsTotalInteger,
    sqft: mlsProperty.LivingArea,
    image: mlsProperty.Media?.[0]?.MediaURL || '/placeholder.jpg',
    status: mapStatus(mlsProperty.StandardStatus),
  };
}

function mapStatus(mlsStatus: string): Property['status'] {
  const statusMap: Record<string, Property['status']> = {
    'Active': 'for-sale',
    'Pending': 'pending',
    'Closed': 'sold',
  };
  return statusMap[mlsStatus] || 'for-sale';
}
```

## UI Rendering Rules

- **Price**: Formatted with `$` prefix and comma separators
- **Location**: Displayed with map pin icon
- **Beds/Baths/Sqft**: Displayed with respective icons in a row
- **Image**: Fills card container with `object-cover`
- **Status**: Badge overlay on image (green for sale, yellow pending, gray sold)

## Supported MLS Providers

| Provider | API Type | Notes |
|----------|----------|-------|
| Spark API | REST | Common for regional MLSs |
| IDX Broker | REST | Hosted solution |
| RESO Web API | OData | Industry standard |
| Bridge Interactive | REST | National coverage |

## Extending the Schema

To add new fields:

1. Update the `Property` interface
2. Add the field mapping to the transformation function
3. Update the `ListingsGrid` component to render the new field
