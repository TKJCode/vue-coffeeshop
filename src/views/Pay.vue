<template>
  <div class="pay">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <van-nav-bar title="提交订单" left-text="返回" left-arrow @click-left="goBack" />
    </div>

    <!-- 订单列表 -->
    <div class="pay-content">
      <!-- 点击出现弹出层 -->
      <div class="selAddress clearfix one-text" @click="showPopup">
        <div class="sel-icon fl">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#iconlocation" />
          </svg>
        </div>
        <div class="sel-text fl">
          <div class="person-info">
            <span class="info-name">{{userInfo.receiver}}</span>
            <span class="info-tel">{{userInfo.tel}}</span>
          </div>
          <div class="info-address">{{userInfo.address}}</div>
          <div class="info-remark">收货不便时，可选择暂存服务</div>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="content-list">
        <div class="goods-info clearfix" v-for="(item, index) in ordersData" :key="index">
          <div class="info-img fl">
            <img class="auto-img" :src="item.small_img" alt />
          </div>
          <div class="info-text fl clearfix">
            <div class="text-left fl">
              <div class="zh-name one-text">{{item.name}}</div>
              <div class="en-name one-text">{{item.enname}}</div>
              <div class="rule one-text">{{item.rule}}</div>
            </div>
            <div class="text-right fr">
              <div class="right-price one-text">￥{{item.price}}</div>
              <div class="right-count one-text">x{{item.count}}</div>
            </div>
          </div>
        </div>
        <div class="goods-price clearfix">
          <span class="price fr one-text">￥{{total}}</span>
          <span class="total fr one-text">共计 {{countAll}} 件商品 合计：</span>
        </div>
      </div>
    </div>

    <!-- 底部导航栏 -->
    <div class="bottom-nav">
      <van-submit-bar :price="total * 100" button-text="立即结算" @submit="payOrders" />
    </div>

    <!-- 弹出层 -->
    <van-popup class="popup" round v-model="isShow" position="bottom">
      <van-address-list
        v-model="aid"
        :list="addressList"
        default-tag-text="默认"
        @select="selectAddress"
        @add="goPage('Address')"
      />
    </van-popup>
  </div>
</template>

<script>
// 导入样式
import "../assets/css/pay.less";

// 导入图标 js
import "../assets/js/iconfont";

export default {
  name: "Pay",

  data() {
    return {
      // 弹出层显示
      isShow: false,

      // 地址列表 id
      aid: "",

      // 地址列表数据
      addressList: [],

      // 购物车的商品 id数组
      sids: [],

      // 地址 id
      aid: "",

      // 订单数据
      ordersData: [],

      // 总价格
      total: 0,

      // 总数量
      countAll: 0,

      // 结算订单时需要提供的用户信息(包括用户姓名、手机号和收货地址)
      userInfo: {
        receiver: "若还未设置收货地址，请先前往填写",
        phone: "",
        address: "若已设置收货地址，请选择您的收货地址"
      }
    };
  },

  created() {
    // 获取 token字符串
    this.tokenString = localStorage.getItem("__Tk");
    // 
    // 

    // 截取查询路由参数 sids
    this.sids = this.$route.query.sids.split("-");
    // 

    // 调用查询地址的方法
    this.getAddressData();

    // 调用查询订单的方法
    this.getOrdersData();
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

    // =====================================================

    // 返回上一级
    goBack() {
      this.$router.go(-1);
    },

    // =====================================================

    // 跳转路由页面
    goPage(name) {
      this.$router.push({name});
    },

    // =====================================================

    // 显示/隐藏弹出层
    showPopup() {
      this.isShow = true;
    },

    // =====================================================

    // 选择地址
    selectAddress(item) {
      // 

      // 弹出层隐藏
      this.isShow = false;

      this.userInfo = {
        receiver: item.name,
        tel: item.tel,
        address: item.address
      };
      // 
    },

    // =====================================================

    // 查询地址数据
    getAddressData() {
      // 开启加载提示
      this.toastLoad();

      // 发起查询地址请求
      this.axios({
        method: "GET",
        url: "/findAddress",
        params: {
          appkey: this.appkey,
          tokenString: this.tokenString
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 判断
          if (res.data.code == 20000) {
            // 遍历地址数据
            res.data.result.forEach(v => {
              // 创建一个新的地址数据存放该数据
              let currentAddress = {
                id: v.aid,
                name: v.name,
                tel: v.tel,
                address:
                  v.province == v.city
                    ? v.city + v.county + v.addressDetail
                    : v.province + v.city + v.county + v.addressDetail,
                isDefault: Boolean(v.isDefault)
              };

              // 默认地址
              if (v.isDefault) {
                this.aid = v.aid;

                // 如果存在默认地址,则默认选择默认地址
                // this.userInfo.address = currentAddress.address;
              }

              // 放入地址列表中
              this.addressList.push(currentAddress);
            });
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // =====================================================

    // 查询订单数据
    getOrdersData() {
      // 开启加载提示
      this.toastLoad();

      // 发起查询订单请求
      this.axios({
        method: "GET",
        url: "/commitShopcart",
        params: {
          appkey: this.appkey,
          tokenString: this.tokenString,
          sids: JSON.stringify(this.sids)
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 判断
          if (res.data.code == 50000) {
            // 遍历计算总数量和总价格
            res.data.result.forEach(v => {
              (this.countAll += v.count), (this.total += v.count * v.price);
            });

            // 把查询回来的订单数据重新放入订单数组中
            this.ordersData = res.data.result;
            // 
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // =====================================================

    // 结算订单
    payOrders() {
      // 判断是否有地址数据
      if (this.userInfo.address == "若已设置收货地址，请选择您的收货地址") {
        this.$toast("请选择收货地址");
        return;
      }

      // 开启加载提示
      this.toastLoad();

      // 发起提交订单请求
      this.axios({
        method: "POST",
        url: "/pay",
        data: {
          appkey: this.appkey,
          tokenString: this.tokenString,
          sids: JSON.stringify(this.sids),
          phone: this.userInfo.phone,
          address: this.userInfo.address,
          receiver: this.userInfo.receiver
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 判断
          if (res.data.code == 60000) {
            // 跳转路由到订单页面
            this.$router.push({ name: "Orders" });

            this.$toast.success(res.data.msg);
          } else {
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