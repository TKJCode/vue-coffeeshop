<template>
  <div class="home">
    <!-- 顶部轮播图 -->
    <van-swipe :autoplay="3000" indicator-color="white" style="height: 163.04px;">
      <van-swipe-item v-for="(item, index) in bannerData" :key="index">
        <img class="auto-img" v-lazy="item.bannerImg" alt />
      </van-swipe-item>
    </van-swipe>

    <!-- 左右侧栏 -->
    <div class="home-content">
      <!-- 左侧导航栏 -->
      <div class="left-nav fl">
        <div
          class="nav-item"
          :class="{active: item.isActive}"
          @click="toggleNavItem(item, index)"
          v-for="(item, index) in goodsTypeData"
          :key="index"
          :ref="'item' + index"
        >{{item.typeDesc}}</div>
        <div class="line" :style="{top: top + 'px'}"></div>
      </div>

      <!-- 右侧内容栏 -->
      <div class="right-content fl clearfix">
        <div class="content-item" v-for="(item, index) in productData" :key="index" @click="goDetail(item.pid)">
          <div class="item-img fl">
            <img class="auto-img" v-lazy="item.smallImg" alt />
          </div>
          <div class="item-text fl">
            <div class="big-title one-text">{{item.name}}</div>
            <div class="small-title one-text">{{item.enname}}</div>
            <div class="price">￥{{item.price}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 导入样式
import "../../assets/css/mainCss/home.less";

// vuex数据缓存
import { createNamespacedHelpers } from "vuex";
const { mapState: home_ms, mapMutations: home_mm } = createNamespacedHelpers(
  "homeModule"
);

export default {
  name: "Home",

  data() {
    return {
      // banner图数据
      bannerData: [],

      // 商品类型数据(左侧导航)
      goodsTypeData: [],

      // 左侧导航栏移动线条 line的 top值
      top: 5,

      // 侧边栏菜单的标签高度
      // height: 0,

      // 商品数据
      productData: []
    };
  },

  created() {
    // 获取 banner数据
    this.getBannerData();

    // 获取商品类型数据
    this.getGoodsTypeData();

    // 调用 "根据商品类型获取商品数据" 方法
    this.getProductByType(this.productType);

    this.firstMoveLine();
  },

  computed: {
    ...home_ms(["bannerDataCache", "goodsTypeDataCache", "goodsDataCache", "height", "productType"])
  },

  methods: {
    // vuex Mutations
    ...home_mm(["changeData", "changeGoods"]),

    // ===================================================

    // 初始化时移动线条
    firstMoveLine() {
      
      
      
      for(let i = 0; i < this.goodsTypeData.length; i++) {
        if(this.goodsTypeData[i].isActive) {
          this. top = i * this.height + 5;
          return;
        }
      }
    },

    // ===================================================

    // 获取 banner数据
    getBannerData() {
      // 获取 vuex的 banner缓存数据,如果存在缓存数据,则不发起请求,否则发起请求
      if (this.bannerDataCache.length > 0) {
        this.bannerData = this.bannerDataCache;
        
        return;
      }

      // 开启加载提示
      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        //延迟自动关闭加载提示(如果值为 0,则不会自动关闭)
        duration: 0
      });

      // 调用 axios
      this.axios({
        method: "GET",
        url: "/banner",
        params: {
          appkey: this.appkey
        }
      })
        .then(res => {
          this.$toast.clear();
          // 

          if (res.data.code == 300) {
            this.bannerData = res.data.result;
            

            // 缓存 banner图数据到 vuex中
            // this.$store.commit("homeModule/changeBannerData", {
            //   key: "bannerDataCache",
            //   value: res.data.result
            // });
            this.changeData({
              key: "bannerDataCache",
              value: res.data.result
            });
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // ===================================================

    // 获取商品类型数据
    getGoodsTypeData() {
      // 获取 vuex中的商品类型缓存数据
      if(this.goodsTypeDataCache.length > 0) {
        this.goodsTypeData = this.goodsTypeDataCache;
        
        return;
      }

      // 开启加载提示
      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        //延迟自动关闭加载提示(如果值为 0,则不会自动关闭)
        duration: 0
      });

      // 调用 axios
      this.axios({
        method: "GET",
        url: "/type",
        params: {
          appkey: this.appkey
        }
      })
        .then(res => {
          this.$toast.clear();
          // 

          if (res.data.code == 400) {
            // 添加 isActive属性
            res.data.result.forEach(v => {
              v.isActive = false;
            });

            // 将 "最新推荐" 这个额外的标签从头部推入到导航数组内,同时设置属性
            res.data.result.unshift({
              type: "isHot",
              typeDesc: "最新推荐",
              isActive: true
            });

            // 赋值
            this.goodsTypeData = res.data.result;

            // 缓存 商品类型数据到 vuex中
            // 获取高度值
            this.$nextTick(() => {
              // 获取左侧导航栏菜单标签的高度
              let navItemHeight = this.$refs.item0[0].clientHeight;
              // 
              // this.height = navItemHeight;
              this.changeData({
                key: 'height',
                value: navItemHeight
              })
            });

            // 缓存左侧导航栏菜单数据在 vuex
            this.changeData({
              key: 'goodsTypeDataCache',
              value: res.data.result
            })
            

          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // ===================================================

    // 切换左侧导航栏标签
    toggleNavItem(item, index) {
      if (item.isActive) {
        return;
      }

      for (let i = 0; i <= this.goodsTypeData.length; i++) {
        if (this.goodsTypeData[i].isActive) {
          this.goodsTypeData[i].isActive = false;
          break;
        }
      }

      item.isActive = true;

      // 获取左侧导航栏菜单标签的高度
      // let navItemHeight = this.$refs.;
      // 

      // 移动线条 line
      this.top = this.height * index + 5;

      // 记录当前选择的商品类型(用于纠正查看商品详情再返回首页时,右侧内容栏数据显示不正确的问题)
      this.changeData({
        key: 'productType',
        value: {
          type: item.type
        }
      })

      // 调用 "根据商品类型获取商品数据" 方法
      this.getProductByType(item);
    },

    // ===================================================

    // 根据商品类型获取商品数据
    getProductByType(item) {
      // 获取 vuex的 商品缓存数据
      if (this.goodsDataCache[item.type]) {
        this.productData = this.goodsDataCache[item.type];
        
        return;
      }

      // 获取数据前先清空数组,使其更快刷新出数据
      this.productData = [];

      // 根据数据接口获取数据的键值
      let params = {
        //params与下面 params参数同名可以直接使用,不需要再 params: data的形式
        appkey: this.appkey,
        key: "type",
        value: item.type
      };

      // 额外的类型：最新推荐
      if (item.type == "isHot") {
        params.key = "isHot";
        params.value = 1;
      }

      // 开启加载提示
      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        //延迟自动关闭加载提示(如果值为 0,则不会自动关闭)
        duration: 0
      });

      // 调用 axios
      this.axios({
        method: "GET",
        url: "/typeProducts",
        params
      })
        .then(res => {
          this.$toast.clear();
          console.log(res)

          if (res.data.code == 500) {
            this.productData = res.data.result;
            

            // 缓存商品数据到 vuex中
            this.changeGoods({
              type: item.type,
              value: res.data.result
            });
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // ===================================================

    goDetail(pid) {
      // pid：商品的 id
      this.$router.push({name: 'Detail', query: {pid}})
    }

  }
};
</script>

<style lang="less" scoped>
</style>