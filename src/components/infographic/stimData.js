/**
 * Stim Annual Report Data Configuration
 *
 * Update this file with new data each year.
 * All monetary values are in SEK (Swedish Krona).
 *
 * Data sources:
 * - Stim Annual Report: https://www.stim.se/api/files/file/STIM-Annual-Report-2024.pdf
 * - Music Ally: https://musically.com/2024/06/18/stim-is-latest-collecting-society-to-break-payout-records-in-2023/
 */

export const STIM_DATA_2023 = {
  year: 2023,

  // Membership
  members: 105000,
  memberGrowthPercent: 16, // vs 2018

  // Financial (in billions SEK)
  revenue: 3.1,
  revenueIncrease: 400, // in millions SEK
  payout: 2.6,
  payoutGrowthPercent: 62, // vs 2018

  // Streaming
  streamingRevenue: 1.09, // in billions SEK
  streamingGrowthPercent: 27,

  // Historical comparison
  comparison: {
    startYear: 2018,
    endYear: 2023,
    startMembers: 90000,
    endMembers: 105000,
    startPayout: 1.6, // billions
    endPayout: 2.6, // billions
  },

  // Global position
  globalRanking: {
    perCapita: 2, // Second in the world after Iceland
    netExporters: ['US', 'GB', 'KR', 'SE'], // Only 4 countries
  },
}

// Placeholder for 2024 data - update when available
export const STIM_DATA_2024 = {
  year: 2024,

  // Update these values when 2024 report is published
  members: 106000, // Estimated
  memberGrowthPercent: 18,

  revenue: 3.3, // Estimated
  revenueIncrease: 200,
  payout: 2.8, // Estimated
  payoutGrowthPercent: 75,

  streamingRevenue: 1.2, // Estimated
  streamingGrowthPercent: 10,

  comparison: {
    startYear: 2019,
    endYear: 2024,
    startMembers: 95000,
    endMembers: 106000,
    startPayout: 1.8,
    endPayout: 2.8,
  },

  globalRanking: {
    perCapita: 2,
    netExporters: ['US', 'GB', 'KR', 'SE'],
  },
}

// Default to most recent complete data
export const CURRENT_DATA = STIM_DATA_2023

/**
 * Card configurations for the infographic
 * Each card type maps to a specific visualization
 */
export const CARD_CONFIGS = [
  {
    id: 'hero',
    type: 'hero',
    data: (d) => ({
      members: d.members,
    }),
  },
  {
    id: 'revenue',
    type: 'revenue',
    data: (d) => ({
      revenue: d.revenue,
      increase: d.revenueIncrease,
    }),
  },
  {
    id: 'payout',
    type: 'payout',
    data: (d) => ({
      payout: d.payout,
    }),
  },
  {
    id: 'streaming',
    type: 'streaming',
    data: (d) => ({
      streaming: d.streamingRevenue,
      growth: d.streamingGrowthPercent,
    }),
  },
  {
    id: 'growth',
    type: 'growth',
    data: (d) => ({
      payoutGrowth: d.payoutGrowthPercent,
      memberGrowth: d.memberGrowthPercent,
    }),
  },
  {
    id: 'global',
    type: 'global',
    data: (d) => ({
      ranking: d.globalRanking,
    }),
  },
  {
    id: 'cta',
    type: 'cta',
    data: () => ({}),
  },
]

/**
 * Generate card data from yearly data
 */
export function generateCardData(yearData = CURRENT_DATA) {
  return CARD_CONFIGS.map((config) => ({
    id: config.id,
    type: config.type,
    data: config.data(yearData),
  }))
}

/**
 * Text content for each card (bilingual)
 * This can be extended for more languages
 */
export const TEXT_CONTENT = {
  sv: {
    hero: {
      title: 'MEDLEMMAR',
      subtitle: 'musikskapare och förlag',
      fact: 'Näst flest medlemmar per capita i världen',
    },
    revenue: {
      title: 'INTÄKTER',
      unit: 'miljarder kr',
      increase: 'ökning',
      compared: 'jämfört med föregående år',
    },
    payout: {
      title: 'UTBETALAT',
      unit: 'miljarder kr',
      to: 'till kompositörer, textförfattare & musikförlag',
    },
    streaming: {
      title: 'FRÅN STREAMING',
      unit: 'miljarder kr',
      growth: 'tillväxt på ett år',
    },
    growth: {
      title: 'TILLVÄXT',
      payouts: 'Utbetalningar',
      members: 'Medlemmar',
    },
    global: {
      title: '1 av 4',
      subtitle: 'nettoexportörer av musik',
      description:
        'Sverige är ett av endast fyra länder som exporterar mer musik än vi importerar',
    },
    cta: {
      title: 'Vill du veta mer?',
      subtitle: 'Läs hela årsredovisningen',
      link: 'stim.se/arsredovisning',
    },
  },
  en: {
    hero: {
      title: 'MEMBERS',
      subtitle: 'music creators and publishers',
      fact: 'Second highest membership per capita globally',
    },
    revenue: {
      title: 'REVENUE',
      unit: 'billion SEK',
      increase: 'increase',
      compared: 'compared to previous year',
    },
    payout: {
      title: 'PAID OUT',
      unit: 'billion SEK',
      to: 'to composers, songwriters & publishers',
    },
    streaming: {
      title: 'FROM STREAMING',
      unit: 'billion SEK',
      growth: 'year-over-year growth',
    },
    growth: {
      title: 'GROWTH',
      payouts: 'Payouts',
      members: 'Members',
    },
    global: {
      title: '1 of 4',
      subtitle: 'net music exporters',
      description:
        'Sweden is one of only four countries that exports more music than it imports',
    },
    cta: {
      title: 'Want to learn more?',
      subtitle: 'Read the full annual report',
      link: 'stim.se/annual-report',
    },
  },
}
