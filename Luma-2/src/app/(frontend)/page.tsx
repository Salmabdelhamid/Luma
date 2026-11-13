import LumaApp, { type LumaProduct } from '@/components/LumaApp'
import { getPayloadClient } from '@/lib/payload'

function relationshipName(value: unknown) {
  if (value && typeof value === 'object' && 'name' in value) {
    return String(value.name)
  }
  return 'Luma partner'
}

function mediaURL(value: unknown) {
  if (value && typeof value === 'object' && 'url' in value && value.url) {
    return String(value.url)
  }
  return ''
}

function readinessLabel(listing: {
  deliveryEstimateMinutes?: number | null
  fastGift?: boolean | null
  preparationMinutes?: number | null
}) {
  if (listing.fastGift && listing.deliveryEstimateMinutes) {
    return `Delivery in ${listing.deliveryEstimateMinutes} min`
  }
  if (listing.preparationMinutes) {
    const days = Math.max(1, Math.ceil(listing.preparationMinutes / 1440))
    return `Ready in ${days} ${days === 1 ? 'day' : 'days'}`
  }
  return 'Available now'
}

export default async function HomePage() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'listings',
    depth: 2,
    limit: 100,
    overrideAccess: false,
    sort: '-ratingAverage',
    where: {
      and: [
        { available: { equals: true } },
        { status: { equals: 'active' } },
      ],
    },
  })

  const initialProducts: LumaProduct[] = result.docs.map((listing) => ({
    id: listing.id,
    title: listing.title,
    seller: relationshipName(listing.store),
    price: listing.priceMinor / 100,
    image: mediaURL(listing.images?.[0]),
    fast: listing.fastGift ?? false,
    custom: listing.customized ?? false,
    experience: listing.listingType === 'experience',
    rating: listing.ratingAverage ?? 0,
    time: readinessLabel(listing),
  }))

  return <LumaApp initialProducts={initialProducts} />
}
