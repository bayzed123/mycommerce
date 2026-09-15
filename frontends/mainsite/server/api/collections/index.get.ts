import type { ProductCollection } from '~/types'
import { createErrorTemplate } from '~/utils'

export default defineEventHandler(async (_event): Promise<ProductCollection> => {
  try {
    // Real catalogue from the Shop API. This used to return
    // `collectionRestApiFixture`, which is why the live homepage showed
    // placeholder collections with https://example.com/... illustrations.
    const data = await $fetch<ProductCollection>('/graphql/', {
      baseURL: useRuntimeConfig().public.prodDomain,
      method: 'POST',
      body: {
        query: `
        query {
          allCollections {
            name
            viewName
            category
            subCategory
            description
            illustration
            numberOfItems
            slug
            subcategorySlug
            tags
            createdOn
          }
        }`
      }
    })

    return data
  } catch (error) {
    const template = createErrorTemplate(error)
    throw createError(template)
  }
})
