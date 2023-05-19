import { Context, Logger, Schema } from 'koishi'

import {
  BundleItem,
  MapData,
  duration,
  new_crafting_data,
  translate
} from './type'

export const name = 'apex-helper'

export interface Config {
  apikey: string
}

export const Config: Schema<Config> = Schema.object({
  apikey: Schema.string()
    .required()
    .description(
      'Apex Legends API 上的 API Key (https://portal.apexlegendsapi.com/)'
    )
})

const apiBaseUrl = 'https://api.mozambiquehe.re'

export function apply(ctx: Context, config: Config) {
  const logger = new Logger('apex-helper')

  logger.debug('Apex Legend helper started')

  ctx.command('apexhelper.map', '查询当前地图轮换').action(async _ => {
    try {
      const map = (await ctx.http.get(`${apiBaseUrl}/maprotation`, {
        params: {
          auth: config.apikey,
          version: 2
        }
      })) as MapData
      return (
        `当前：${translate.event(map.battle_royale.current.map)}\n` +
        `下个：${translate.event(map.battle_royale.next.map)}\n` +
        `排位：${translate.event(map.ranked.current.map)}\n` +
        `轮换：${map.battle_royale.current.remainingMins} 分钟后`
      )
    } catch (_) {
      return '请求失败。'
    }
  })

  ctx.command('apexhelper.craft', '查询当前制造轮换').action(async _ => {
    try {
      const crafting = new_crafting_data(
        (await ctx.http.get(`${apiBaseUrl}/crafting`, {
          params: {
            auth: config.apikey
          }
        })) as BundleItem[]
      )
      const gen = (v: BundleItem) => {
        return v.bundleContent.map(e => {
          if (v.bundle == 'weapon') {
            return translate.bundle.weapon(e)
          }
          return translate.bundle.common(e)
        })
      }
      return (
        `每日：${
          crafting['daily'] ? gen(crafting['daily']).join(' ') : '未获取'
        }\n` +
        `每周：${
          crafting['weekly'] ? gen(crafting['weekly']).join(' ') : '未获取'
        }\n` +
        `武器：${
          crafting['weapon'] ? gen(crafting['weapon']).join(' ') : '未获取'
        }\n` +
        `轮换：<i18n:time value="${
          crafting['daily'] ? duration(crafting['daily']) : '未获取'
        }" /> | <i18n:time value="${
          crafting['weekly'] ? duration(crafting['weekly']) : '未获取'
        }" />`
      )
    } catch (_) {
      return '请求失败。'
    }
  })
}
