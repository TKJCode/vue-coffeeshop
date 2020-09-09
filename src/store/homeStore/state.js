export const state = {
    // 缓存首页菜单数据

    // 1.banner图数据缓存
    bannerDataCache: [],

    // 2.商品类型数据缓存
    goodsTypeDataCache: [],

    // 3.商品数据缓存
    goodsDataCache: {
        // isHot: [],
        // coffee: [],
        // latter
    },

    // 侧边栏菜单的标签高度
    height: 0,

    // 记录Home.vue侧边栏激活的下标(防止下标出现位置错误)
    // 选择商品类型
    productType: {
        type: 'isHot'
    }
}