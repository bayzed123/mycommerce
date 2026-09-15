import type { Nullable } from '~/types'
import type { BusinessDetailsKeyValue, BusinessDetailsKeys } from '..'


/**
 * Identity for this store.
 *
 * Everything that identified the project this codebase was extracted
 * from - another company's SIREN/SIRET/VAT, its registered address,
 * phone number and mailbox, its founder's name and biography, and links
 * to its live social accounts - has been removed rather than carried
 * over. None of it belonged to this store, and a storefront that
 * publishes someone else's legal identity is misleading to shoppers.
 *
 * The blanks below are deliberately blank: registration numbers are not
 * something to invent. Fill each one in with this business's own real
 * details before taking orders, since the mentions légales have to name
 * the actual seller.
 */
export const businessDetails: BusinessDetails = {
  name: 'Aurelle',
  legalName: 'Aurelle',
  alternateName: [
    'Aurelle Store'
  ],
  // TODO: this store's own company registration details.
  siren: '',
  siret: '',
  numberoTVA: null,
  rcs: '',
  shareCapital: null,
  creationDate: '',
  description: 'Online clothing store. Dresses, tops, shirts and trousers, with free standard delivery and easy returns.',
  logo: '',
  // TODO: this store's own social accounts, once they exist.
  sameAs: [],
  image: [],
  // TODO: this store's own registered address.
  address: {
    street: '',
    postalCode: '',
    city: '',
    lat: null,
    lng: null
  },
  priceRange: '$$',
  foundingDate: '',
  foundingLocation: '',
  founderImage: null,
  // TODO: the people actually responsible for this store and its site.
  founder: '',
  founderDescription: '',
  founderKnowsAbout: [],
  webContentManager: '',
  publishingDirector: '',
  editorInChief: '',
  // TODO: whoever actually builds and hosts this site.
  websiteProvider: {
    legalName: '',
    url: ''
  },
  cloudProvider: {
    legalName: 'Cloudflare, Inc.',
    url: 'https://www.cloudflare.com/',
    description: 'The storefront runs on Cloudflare Workers.',
    address: '101 Townsend St, San Francisco, CA 94107, United States',
    rcs: ''
  },
  // TODO: this store's own contact details.
  contact: {
    telephone: '',
    email: '',
    address: ''
  },
  socials: {}
}

/**
 * A composable to access business details throughout the application. It provides a `get` function
 * to retrieve specific details by key, ensuring type safety and consistency across the app.
 */
export function useBusinessDetails() {
  function get<K extends BusinessDetailsKeys>(key: K): BusinessDetailsKeyValue[K] {
    return businessDetails[key]
  }

  const reactiveGet = reactify(get)
  const activeSocials = computed(() => Object.keys(get('socials')) as SocialPlatform[])

  function getSocial(platform: SocialPlatform): Social | null {
    const socials = get('socials')
    return socials[platform] || null
  }

  function getSocialIcon(platform: SocialPlatform): string {
    const icons: Record<SocialPlatform, string> = {
      instagram: 'lucide:instagram',
      facebook: 'lucide:facebook',
      pinterest: 'fa7-brands:pinterest',
      twitter: 'lucide:twitter',
      linkedin: 'lucide:linkedin',
      tiktok: 'lucide:tiktok',
      youtube: 'lucide:youtube'
    }
    return icons[platform]
  }

  const address = computed(() => {
    const address = get('address')
    return `${address.street}, ${address.postalCode} ${address.city}`
  })

  const geoLocation = computed(() => {
    const address = get('address')
    if (isDefined(address.lat) && isDefined(address.lng)) {
      return `${address.lat.toString()},${address.lng.toString()}`
    } else {
      return '0,0'
    }
  })

  function suffixLegalName(name: Nullable<string>, separator: string = ' - '): string {
    const legalName = get('legalName')
    return `${name ?? ''}${separator}${legalName}`
  }

  return {
    /**
     * The business details object containing all relevant information about the business,
     * including contact details, social media links, and more.
     */
    businessDetails,
    /**
     * A computed property that returns an array of active social media
     * platforms based on the provided socials in the business details.
     */
    activeSocials,
    /**
     * A computed property that returns the full address of the business
     * as a formatted string, combining the street, postal code, and city.
     */
    address,
    /**
     * A computed property that returns the geographical location of the business
     * in the format "latitude,longitude". If latitude or longitude is not defined.
     * @default
     * "0,0"
     */
    geoLocation,
    /**
     * A function that appends the legal name of the business to a given name,
     * separated by a specified separator (default is ' - ').
     */
    suffixLegalName,
    /**
     * A function to retrieve specific business details by key, ensuring type safety.
     * @param key - The key of the business detail to retrieve.
     */
    get,
    /**
     * A reactive version of the `get` function, useful for reactive contexts.
     * @param key - The key of the business detail to retrieve reactively.
     */
    reactiveGet,
    /**
     * A function to retrieve social media details for a specific platform.
     * @param platform - The social media platform to retrieve details for (e.g., 'instagram', 'facebook').
     */
    getSocial,
    /**
     * A function to retrieve the icon name for a specific social media platform.
     * @param platform - The social media platform to retrieve the icon for (e.g., 'instagram', 'facebook').
     */
    getSocialIcon
  }
}
