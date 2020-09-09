<template>
  <div class="main">

    <!-- 二级路由插座 -->
    <div>
        <router-view></router-view>
    </div>

    <van-tabbar v-model="tabBarIndex"  active-color="#FA7157" @change="toggleTabBar">
      <van-tabbar-item v-for="(item, index) in tabBarData" :key="index" :icon="item.icon">{{item.title}}</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
export default {
  name: "Main",

  data() {
    return {
      tabBarIndex: 0,

      // 底部导航数组
      tabBarData: [
        {
          icon: "wap-home-o",
          title: "首页",
          routeName: 'Home',
          hashUrl: '/main/home'
        },
        {
          icon: "orders-o",
          title: "订单",
          routeName: 'Orders',
          hashUrl: '/main/orders'
        },
        {
          icon: "shopping-cart-o",
          title: "购物车",
          routeName: 'Shopcart',
          hashUrl: '/main/shopcart'
        },
        {
          icon: "user-o",
          title: "我的",
          routeName: 'My',
          hashUrl: '/main/my'
        }
      ]
    };
  },

  created() {
    // 获取上方地址栏路径的 hash(把 "#" 截取)
    // 解决底部 tab显示不正确的问题(与 hashUrl相对应)
    let hash = location.hash.slice(1);
    //

    // 根据路径激活对应路由
    for(let i = 0; i < this.tabBarData.length; i++) {
      if(this.tabBarData[i].hashUrl == hash) {
        // 只有唯一一个,直接 break
        this.tabBarIndex = i;
        break;
      }
    }
  },

  methods: {
      toggleTabBar(index) {
          // 
          
          this.$router.push({name: this.tabBarData[index].routeName})
      }
  }
};
</script>

<style lang="less" scoped>
.van-tabbar {
  box-shadow: 0 0 10px 0 hsla(0, 6%, 58%, 0.6);
}
</style>