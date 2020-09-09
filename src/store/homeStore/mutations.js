export const mutations = {
    // 修改 banner图和商品类型数据
    changeData(state, data) {
        // data：载荷
        // data.key：修改数据的名称
        // data.value：修改的数据

        state[data.key] = data.value;
    },

    // 修改商品数据
    changeGoods(state, data) {
        // data.type：类型
        // data.value：商品数据
        state.goodsDataCache[data.type] = data.value;
    }
}