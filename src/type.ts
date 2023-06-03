import * as localeData from './locale.json'
const locale: Locale = localeData as Locale

interface Locale {
  event: Record<string, string>
  map: Record<string, string>
  crafting: {
    item: Record<string, string>
    rarity: Record<string, string>
    weapon: Record<string, string>
  }
}
interface MapInfo {
  start: number
  end: number
  readableDate_start: string
  readableDate_end: string
  map: string
  code: string
  DurationInSecs: number
  DurationInMinutes: number
  isActive?: boolean
  eventName?: string
  eventName_zh?: string
  asset?: string
  remainingSecs?: number
  remainingMins?: number
  remainingTimer?: string
}
interface MapItem {
  current: MapInfo
  next: MapInfo
}
export interface MapData {
  battle_royale: MapItem
  ranked: MapItem
  ltm: MapItem
}
interface BundleContent {
  item: string
  cost: number
  itemType: {
    name: string
    rarity: string
    asset: string
    rarityHex: string
  }
}
export interface BundleItem {
  bundle: string
  start: number
  end: number
  startDate: string
  endDate: string
  // duration: number // 应该使用一个方法来计算
  bundleType: 'daily' | 'weekly' | 'permanent'
  bundleContent: BundleContent[]
}
export type CraftingData = Partial<{
  [key in 'daily' | 'weekly' | 'weapon']: BundleItem
}>
export function new_crafting_data(data: BundleItem[]) {
  let weaponOrigin: BundleItem | undefined
  let result: CraftingData = {}
  data.forEach(item => {
    switch (item.bundleType) {
      case 'daily':
        result['daily'] = item
        break

      case 'weekly':
        result['weekly'] = item
        break

      case 'permanent':
        if (item.bundle == 'weapon_one') weaponOrigin = item
        if (item.bundle == 'weapon_two')
          weaponOrigin?.bundleContent.push(...item.bundleContent)
        break

      default:
        break
    }
  })

  if (weaponOrigin) {
    weaponOrigin.bundle = 'weapon'
    result['weapon'] = weaponOrigin
  }
  return result
}
export function duration(data: BundleItem) {
  return data.end * 1000 - Date.now()
}
export const translate = {
  event(event_name: string): string | undefined {
    return locale.event[event_name]
  },
  bundle: {
    common({
      itemType: { rarity, name },
      cost
    }: {
      itemType: {
        rarity: string
        name: string
      }
      cost: number
    }) {
      return `${
        locale.crafting.rarity[rarity] + locale.crafting.item[name]
      }/${cost}`
    },
    weapon({
      itemType: { rarity, name },
      cost
    }: {
      itemType: {
        rarity: string
        name: string
      }
      cost: number
    }) {
      return `${
        locale.crafting.rarity[rarity] + locale.crafting.weapon[name]
      }/${cost}`
    }
  }
}
