import { Context, Logger, Schema } from 'koishi'

import { CraftingData, MapData } from './model'

export const name = 'apex-helper'

export interface Config {
	apikey: string
}

export const Config: Schema<Config> = Schema.object({
	apikey: Schema.string().required().description("Apex Legends API 上的 API Key (https://portal.apexlegendsapi.com/)")
})

const apiBaseUrl = "https://api.mozambiquehe.re"

export function apply(ctx: Context, config: Config) {

	const logger = new Logger("apex-helper")
	
	ctx.command('apexhelper.map', "查询当前地图轮换")
		.action(async (_) => {

			const map = await ctx.http.get(`${apiBaseUrl}/maprotation`, {
				params: {
					auth: config.apikey,
					version: 2
				}
			}).catch(err => {throw err}).then(data => new MapData(data))
			
			if (!map) return "请求失败。"

			return `当前：${map.battle_royale.current.map_zh}\n` + 
				`下个：${map.battle_royale.next.map_zh}\n` +
				`排位：${map.ranked.current.map_zh}\n` +
				`轮换：${map.battle_royale.current.remainingMins} 分钟后`

		})
	
	ctx.command('apexhelper.craft', "查询当前制造轮换")
		.action(async (_) => {

			const crafting = await ctx.http.get(`${apiBaseUrl}/crafting`, {
				params: {
					auth: config.apikey
				}
			}).catch(err => {throw err}).then(data => new CraftingData(data))
			
			if (!crafting) return "请求失败。"

			return `每日：${crafting.daily.bundleContent.map(e => e.item_zh).join(' ')}\n` + 
				`每周：${crafting.weekly.bundleContent.map(e => e.item_zh).join(' ')}\n` +
				`武器：${crafting.weapon.bundleContent.map(e => e.item_zh).join(' ')}\n` +
				`轮换：<i18n:time value="${crafting.daily.duration}" /> | <i18n:time value="${crafting.weekly.duration}" />`

		})

}
