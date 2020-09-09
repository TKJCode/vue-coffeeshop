<template>
  <div class="detail">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <van-nav-bar title="商品详情" left-text="返回" left-arrow :fixed="true" @click-left="goBack" />
    </div>

    <!-- 商品大图 -->
    <div class="detail-img">
      <img class="auto-img" :src="goodsDetailData.large_img" alt />
    </div>

    <!-- 商品详情 -->
    <div class="detail-content">
      <!-- 商品标题 -->
      <div class="goods-title clearfix">
        <span class="fl goods-name">{{goodsDetailData.name}}</span>
        <span class="fr goods-collect" @click="collectAndNot()">
          <img
            class="auto-img"
            :src="require('../assets/images/' + (isCollect ? 'collect_active.png' : 'collect.png'))"
            alt
          />
        </span>
      </div>

      <!-- 商品规格 -->
      <div class="goods-spec">
        <div class="spec-box clearfix" v-for="(item, index) in goodsDetailData.spec" :key="index">
          <div class="spec-title fl">{{item.title}}</div>
          <div class="spec-tags clearfix fl" v-for="(v, i) in item.tag" :key="i">
            <div
              class="tag-item fl"
              :class="{active: v.isActive}"
              @click="toggleSpec(item, v)"
            >{{v.name}}</div>
          </div>
        </div>
      </div>

      <!-- 商品描述 -->
      <div class="goods-desc">
        <div class="desc-title">商品描述</div>
        <div class="desc-content">
          <div class="desc-item" v-for="(item, index) in goodsDetailData.desc" :key="index">{{item}}</div>
        </div>
      </div>

      <!-- 商品金额和数量 -->
      <div class="goods-priNum clearfix">
        <div class="goods-price fl">￥{{goodsDetailData.price}}</div>
        <div class="goods-number fr">
          <van-stepper v-model="goodsCount" theme="round" button-size="22" disable-input />
        </div>
      </div>

      <!-- 底部商品导航栏 -->
      <div class="bottom-nav">
        <van-goods-action>
          <van-goods-action-icon
            icon="shopping-cart-o"
            text="购物车"
            :badge="shopCartGoodsKind == 0 ? '' : shopCartGoodsKind"
            @click="goPage('Shopcart')"
          />
          <van-goods-action-button
            color="linear-gradient(to right, #FCCAC3, #F78674)"
            type="warning"
            text="加入购物车"
            @click="addShopcart"
          />
          <van-goods-action-button color="#FA7157" type="danger" text="立即购买" @click="addShopcart(true)" />
        </van-goods-action>
      </div>
    </div>
  </div>
</template>

<script>
// 导入样式
import "../assets/css/detail.less";

export default {
  name: "Detail",

  data() {
    return {
      // 商品 id
      pid: "",

      // 商品详情数据
      goodsDetailData: {},

      // 是否收藏
      isCollect: false,

      // 购物车里面的商品种类
      shopCartGoodsKind: 0,

      // 商品数量
      goodsCount: 0
    };
  },

  created() {
    // 截取查询参数
    this.pid = this.$route.query.pid;

    // 调用获取商品详情数据方法
    this.getGoodsDetail(this.pid);

    // 调用查找收藏商品的方法
    this.findCollect(this.pid);

    // 查看购物车里商品的种类
    this.shopCartKind();
  },

  methods: {
    // 页面跳转返回上一级
    goBack() {
      this.$router.go(-1);
    },

    // ========================================================

    // 页面跳转到指定页面
    goPage(name) {
      this.$router.push({name});
    },

    // ========================================================

    // 根据商品 id获取商品详情数据
    getGoodsDetail(pid) {
      

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
        url: "/productDetail",
        params: {
          pid,
          appkey: this.appkey
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 判断
          if (res.data.code == 600) {
            // 获取商品详情数据
            let data = res.data.result[0];

            // ============== 处理数据 ==============

            // 1.处理商品描述数据
            data.desc = data.desc.split(/\n/);
            // 

            // =======================================

            // 2.处理商品规格数据
            // 创建商品规格的数组
            let GoodsSpec = ["tem", "sugar", "milk", "cream"];

            // 商品规格数据如下
            // [
            //   {
            //     title: '温度',
            //     tag: [{name: '冷'}, {name: '热'}]
            //   },
            //   {
            //     title: '糖',
            //     tag: [{name: '全糖'}, {name: '半糖'}]
            //   },
            // ]

            let specArr = [];
            // 循环遍历商品详情数据
            GoodsSpec.forEach(v => {
              // 
              // 

              // 如果该商品的规格有不为空的,则推入一个改规格的详情数据
              if (data[v] != "") {
                // 创建一个该商品规格的对象
                let specObj = {
                  title: data[v + "_desc"],
                  tag: []
                };

                // 处理商品规格的详情
                let tag = data[v].split(/\//);
                // 
                // 

                // 将 tag生成一个对象
                tag.forEach((item, i) => {
                  // 
                  let tagObj = {
                    name: item,
                    isActive: i == 0
                  };

                  // 把 tagObj对象压入 specObj中
                  specObj.tag.push(tagObj);
                  // 
                });

                // 把 specObj 放入 specArr中
                specArr.push(specObj);
                // 
              }
            });

            // 把 specArr放入 data商品详情数据中
            data.spec = specArr;

            this.goodsDetailData = data;
            
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // ========================================================

    // 切换商品规格选项
    toggleSpec(item, v) {
      // item：this.goodsDetailData
      // v：this.goodsDetailData.tag
      // 
      // 
      if (v.isActive) {
        return;
      }

      for (let i = 0; i < item.tag.length; i++) {
        if (item.tag[i].isActive) {
          item.tag[i].isActive = false;
        }
      }

      v.isActive = true;
    },

    // ========================================================

    // 收藏商品和取消收藏商品
    collectAndNot() {
      // 获取 token字符串
      let tokenString = localStorage.getItem("__Tk");
      // 

      // url请求路径根据收藏状态而不同
      let url = this.isCollect ? "/notlike" : "/like";

      // 开启加载提示
      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        //延迟自动关闭加载提示(如果值为 0,则不会自动关闭)
        duration: 0
      });

      // 调用 axios
      this.axios({
        method: "POST",
        url,
        data: {
          appkey: this.appkey,
          pid: this.pid,
          tokenString
        }
      })
        .then(res => {
          this.$toast.clear();
          

          if (res.data.code == 800 || res.data.code == 900) {
            // 转换收藏状态(状态码为800时,收藏状态为真)
            this.isCollect = res.data.code == 800;

            // 提示信息
            this.$toast(res.data.msg);
          } else {
            // 如果 token无效,则跳转到登录页面
            this.$router.push({ name: "Login" });
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // ========================================================

    // 查询商品是否被收藏
    findCollect(pid) {
      // 获取 token字符串
      let tokenString = localStorage.getItem("__Tk");

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
        url: "/findlike",
        params: {
          appkey: this.appkey,
          pid,
          tokenString
        }
      })
        .then(res => {
          this.$toast.clear();
          

          if (res.data.code == 1000) {
            // 查看该商品是否已被收藏了
            this.isCollect = res.data.result.length > 0;
          } else {
            // 如果 token无效,则跳转到登录页面
            this.$router.push({ name: "Login" });
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // ========================================================

    // 查看购物车里的商品种类
    shopCartKind() {
      // 获取 token字符串
      let tokenString = localStorage.getItem("__Tk");

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
        url: "/findAllShopcart",
        params: {
          appkey: this.appkey,
          tokenString
        }
      })
        .then(res => {
          this.$toast.clear();
          

          if (res.data.code == 5000) {
            // 购物车里商品的种类
            this.shopCartGoodsKind = res.data.result.length;
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // ========================================================

    // 添加商品到购物车
    addShopcart(isBuy) {
      // 获取 token字符串
      let tokenString = localStorage.getItem("__Tk");

      // 获取商品规格 rule
      let ruleObj = this.goodsDetailData.spec;
      // 

      // 定义一个空数组存放被选择的商品规格(isActive=true)
      let ruleArr = [];

      // 循环遍历寻找 isActive
      ruleObj.forEach(v => {
        // 
        for (let i = 0; i < v.tag.length; i++) {
          if (v.tag[i].isActive) {
            ruleArr.push(v.tag[i].name);
            break;
          }
        }
      });
      // 
      // 
      let rule = ruleArr.join("/");

      // 开启加载提示
      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        //延迟自动关闭加载提示(如果值为 0,则不会自动关闭)
        duration: 0
      });

      // 调用 axios
      this.axios({
        method: "POST",
        url: "/addShopcart",
        data: {
          appkey: this.appkey,
          pid: this.pid, //商品 id
          count: this.goodsCount, //商品数量
          rule, //商品规格
          tokenString
        }
      })
        .then(res => {
          this.$toast.clear();
          

          if(res.data.code == 3000) {
            // status = 0, 表示修改数量
            // status = 1, 添加一条新的数据
            if(res.data.status == 1) {
              this.shopCartGoodsKind ++;
            }
            this.$toast(res.data.msg);

            // 如果是点击 "立即购买",先将商品加入到购物车,再跳转到结算页面(提交订单)
            if(isBuy === true) {
              setTimeout(() => {
                this.$router.push({name: 'Pay', query: {sids: res.data.sid}})
              }, 500)
            }
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    }
  }
};
</script>

<style lang="less" scoped>
</style>