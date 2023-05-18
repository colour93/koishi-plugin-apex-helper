import * as localeData from './locale.json'
const locale: Locale = localeData as Locale

interface Locale {
    event: { [key: string]: string };
    map: { [key: string]: string };
    crafting: {
        item: { [key: string]: string };
        rarity: { [key: string]: string };
        weapon: { [key: string]: string };
    };
}

export class MapData {
    battle_royale: MapItem;
    ranked: MapItem;
    ltm: MapItem;

    constructor(data: any) {
        this.battle_royale = new MapItem(data.battle_royale)
        this.ranked = new MapItem(data.ranked)
        this.ltm = new MapItem(data.ltm)
    }
}

class MapItem {
    current: MapInfo;
    next: MapInfo;

    constructor(data: MapItem) {
        this.current = new MapInfo(data.current);
        this.next = new MapInfo(data.next);
    }
}

class MapInfo {
    start!: number;
    end!: number;
    readableDate_start!: string;
    readableDate_end!: string;
    map!: string;
    map_zh?: string;
    code!: string;
    DurationInSecs!: number;
    DurationInMinutes!: number;
    isActive?: boolean;
    eventName?: string;
    eventName_zh?: string;
    asset?: string;
    remainingSecs?: number;
    remainingMins?: number;
    remainingTimer?: string;

    constructor(data: MapInfo) {
        Object.assign(this, data);
        this.map_zh = locale.map[this.code];
        if (this.eventName) this.eventName_zh = locale.event[this.eventName];
    }
}

class Rotation {
    time: Date;
    timestamp: number;
    timestr: string;

    constructor(ts: number) {
        this.time = new Date(ts);
        this.timestamp = ts;
        this.timestr = this.time.toLocaleTimeString();
    }
}

export class CraftingData {
    daily!: BundleItem;
    weekly!: BundleItem;
    weapon: BundleItem;

    constructor(data: Array<any>) {

        let weaponOrigin: any;

        data.forEach(item => {

            switch (item.bundleType) {

                case 'daily':
                    this.daily = new BundleItem(item)
                    break;

                case 'weekly':
                    this.weekly = new BundleItem(item)
                    break;

                case 'permanent':
                    if (item.bundle == 'weapon_one') weaponOrigin = item;
                    if (item.bundle == 'weapon_two') weaponOrigin.bundleContent.push(...item.bundleContent)
                    break;

                default:
                    break;
            }

        })

        weaponOrigin.bundle = 'weapon'
        this.weapon = new BundleItem(weaponOrigin)

    }
}

class BundleItem {
    bundle!: string;
    start!: number;
    end!: number;
    startDate!: string;
    endDate!: string;
    duration: number;
    bundleType!: string;
    bundleContent!: Array<IBundleContent>

    constructor(data: any) {
        if (data.bundle == 'weapon') data.bundleContent = data.bundleContent.map((e: IBundleContent) => new BundleWeaponContent(e))
        else data.bundleContent = data.bundleContent.map((e: IBundleContent) => new BundleCommonContent(e))
        this.duration = data.end * 1000 - (new Date()).getTime()
        Object.assign(this, data)
    }
}

interface IBundleContent {
    item: string;
    item_zh: string;
    cost: number;
    itemType: {
        name: string;
        rarity: string;
        asset: string;
        rarityHex: string;
    }
}

class BundleCommonContent implements IBundleContent {
    item!: string;
    item_zh: string;
    cost!: number;
    itemType!: {
        name: string;
        rarity: string;
        asset: string;
        rarityHex: string;
    }

    constructor(data: IBundleContent) {
        Object.assign(this, data);
        this.item_zh = `${locale.crafting.rarity[this.itemType.rarity] + locale.crafting.item[this.itemType.name]}/${this.cost}`
    }
}

class BundleWeaponContent implements IBundleContent {
    item!: string;
    item_zh: string;
    cost!: number;
    itemType!: {
        name: string;
        rarity: string;
        asset: string;
        rarityHex: string;
    }

    constructor(data: IBundleContent) {
        Object.assign(this, data);
        this.item_zh = `${locale.crafting.weapon[this.itemType.name]}/${this.cost}`
    }
}