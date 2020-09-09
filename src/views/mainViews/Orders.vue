<template>
  <div class="orders">
    <!-- 顶部标签栏 -->
    <div class="top-tab" v-if="isLogin">
      <van-tabs
        v-model="activeName"
        @change="findOrderStatus"
        color="#FA7157"
        title-active-color="#FA7157"
        sticky
        line-height="2"
      >
        <van-tab
          :title="item.title"
          :name="item.name"
          v-for="(item, index) in tabContent"
          :key="index"
        >
          <!-- 商品列表 start -->
          <div class="orders-content">
            <div class="content-list" v-for="(item, index) in oidsData" :key="index">
              <!-- 商品号码 -->
              <div class="goods-No clearfix">
                <div class="item-number fl">{{item}}</div>
                <div class="item-text fr clearfix" v-if="orderData[item].status == 2">
                  <div class="fl">已收货</div>
                  <div class="item-icon fl" @click="removeOrder(item)">
                    <van-icon name="delete" />
                  </div>
                </div>
                <div class="item-text fr clearfix" v-else>
                  <div class="fl" @click="receiveClick(item)">确认收货</div>
                </div>
              </div>

              <!-- 商品图文 -->
              <div class="goods-info clearfix" v-for="(v, i) in orderData[item].data" :key="i">
                <div class="info-img fl">
                  <img class="auto-img" v-lazy="v.smallImg" alt />
                </div>
                <div class="info-text fl clearfix">
                  <div class="text-left fl">
                    <div class="zh-name one-text">{{v.name}}</div>
                    <div class="en-name one-text">{{v.enname}}</div>
                    <div class="rule one-text">{{v.rule}}</div>
                  </div>
                  <div class="text-right fr">
                    <div class="right-price one-text">￥{{v.price}}</div>
                    <div class="right-count one-text">x{{v.count}}</div>
                  </div>
                </div>
              </div>
              <div class="goods-price clearfix">
                <span class="price fr one-text">￥{{orderData[item].priceTotal}}</span>
                <span class="total fr one-text">共计 {{orderData[item].count}} 件商品 合计：</span>
                <span
                  class="time fl one-text"
                >{{orderData[item].date | formatDate('yyyy-MM-dd hh:mm:ss')}}</span>
              </div>
            </div>
          </div>
          <!-- 商品列表 end -->
        </van-tab>
      </van-tabs>
    </div>

    <!-- 空状态 -->
    <div class="empty" v-else>
      <van-empty description="没有订单数据 ..." >
        <span class="empty-text">亲快去&nbsp;</span>
        <span class="empty-link" @click="goPage('Register')">注册</span>
        <span class="empty-text">&nbsp;/&nbsp;</span>
        <span class="empty-link" @click="goPage('Login')">登录</span>
        <span class="empty-text">&nbsp;账号吧~</span>
      </van-empty>
    </div>
  </div>
</template>

<script>
// 导入样式
import "../../assets/css/mainCss/orders.less";

export default {
  name: "Orders",

  data() {
    return {
      // 顶部标签栏内容
      tabContent: [
        {
          title: "全部",
          name: "0"
        },
        {
          title: "待收货",
          name: "1"
        },
        {
          title: "已收货",
          name: "2"
        }
      ],

      // 订单的状态码(0: 全部，1: 待收货，2: 已收货)
      activeName: "0",

      // 每个大订单的订单编号数据数组
      oidsData: [],

      // 订单数据
      orderData: {},

      // 是否已经登录
      isLogin: false
    };
  },

  created() {
    // 获取 token字符串
    this.tokenString = localStorage.getItem("__Tk");

    // 查询是否已经登录
    if (this.tokenString) {
      this.isLogin = true;

      //调用查询该状态下的订单商品
      this.getOrderGoods();
    }
  },

  methods: {
    // 开启加载提示
    toastLoad() {
      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        //延迟自动关闭加载提示(如果值为 0,则不会自动关闭)
        duration: 0
      });
    },

    // 跳转路由
    goPage(name) {
      this.$router.push({name});
    },

    // 切换不同的标签时展示不同状态的商品
    findOrderStatus(name) {
      // 查询订单状态标识码
      // 

      //调用查询该状态下的订单商品
      this.getOrderGoods();
    },

    // 查询订单商品
    getOrderGoods() {
      // 开启加载提示
      this.toastLoad();

      // 发起查询订单请求
      this.axios({
        method: "GET",
        url: "/findOrder",
        params: {
          appkey: this.appkey,
          tokenString: this.tokenString,
          status: this.activeName
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 判断
          if (res.data.code == 70000) {
            // 订单日期的降序排序
            res.data.result.sort((a, b) => {
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            });

            // =======================================

            // 数据结构：
            // {
            //   订单编号 1: {
            //     data: [{}, {}, {}],
            //     status: ''
            //   }
            // }

            // 根据订单编号 oid来确定每个大订单
            // 定义一个存放订单编号 oid的数组
            let oids = [];

            // 循环遍历取出每个订单的订单编号
            res.data.result.forEach(v => {
              // 获取每个大订单的订单编号
              // 如果 oids数组内没有这个 oid,则放入数组内(避免 oid重复)
              if (oids.indexOf(v.oid) === -1) {
                oids.push(v.oid);
              }
            });
            // 

            // 将订单编号数据赋值给 data内的数组
            this.oidsData = oids;

            // =======================================

            // 根据订单编号来筛选商品
            // 创建一个新对象存放订单的数据
            let orders = {};
            // 遍历获取数据
            res.data.result.forEach(v => {
              if (!orders[v.oid]) {
                // 如果当前订单编号的订单数据不存在,则创建一个新的订单存放该订单数据
                orders[v.oid] = {
                  data: [v],
                  status: v.status,
                  count: v.count,
                  priceTotal: v.count * v.price,
                  date: v.createdAt
                };
              } else {
                // 如果当前订单编号的订单数据存在,则继续把数据放入该数组中

                // 计算总数量和总价格(上方由于总数量和总价格都不在 v, i的循环遍历中,因此要用 orderData[item].count和 orderData[item].priceTotal来表示)
                orders[v.oid].count += v.count;
                orders[v.oid].priceTotal += v.count * v.price;

                // 把商品数据放入 data内
                orders[v.oid].data.push(v);
              }
            });
            // 
            // 把订单商品数据赋值给 data内的数组
            this.orderData = orders;
            
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // 确认收货
    receiveClick(oid) {
      // 开启加载提示
      this.toastLoad();

      // 发起确认收货请求
      this.axios({
        method: "POST",
        url: "/receive",
        data: {
          appkey: this.appkey,
          tokenString: this.tokenString,
          oid
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 判断
          if (res.data.code == 80000) {
            // 商品状态改变
            this.orderData[oid].status = 2;

            // 如果商品是待收货状态,则删除页面上的订单数据
            if (this.activeName == 1) {
              // 获取要删除的 id
              let index = this.oidsData.indexOf(oid);

              this.oidsData.splice(index, 1);
            }
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // 删除订单
    removeOrder(oid) {
      // 开启加载提示
      this.toastLoad();

      // 发起删除订单请求
      this.axios({
        method: "POST",
        url: "/removeOrder",
        data: {
          appkey: this.appkey,
          tokenString: this.tokenString,
          oid
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 判断
          if (res.data.code == 90000) {
            // 删除页面上订单
            // 先匹配好下标 index
            let index = this.oidsData.indexOf(oid);
            this.oidsData.splice(index, 1);

            // 删除成功提示
            this.$toast.success(res.data.msg);
          } else {
            // 删除失败提示
            this.$toast.fail(res.data.msg);
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