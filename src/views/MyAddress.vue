<template>
  <div class="my-address">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <van-nav-bar title="收货地址" left-text="返回" left-arrow @click-left="goBack" right-text="个人中心" @click-right="goPage('My')" />
    </div>

    <!-- 我的地址栏 -->
    <div class="address-list" v-if="addressList.length > 0">
      <van-address-list
        v-model="aid"
        :list="addressList"
        default-tag-text="默认"
        @add="goAddress"
        @edit="goAddress"
      />
    </div>

    <!-- 空状态 -->
    <div class="empty" v-else>
      <van-empty class="custom-image" image="https://img.yzcdn.cn/vant/custom-empty-image.png" description="地址列表空空如也">
        <span class="empty-text">亲快去&nbsp;</span>
        <span class="empty-link" @click="goPage('Address')">添加</span>
        <span class="empty-text">&nbsp;一个收货地址吧~</span>
      </van-empty>
    </div>
  </div>
</template>

<script>
// 导入样式
import "../assets/css/address.less";

export default {
  name: "MyAddress",

  data() {
    return {
      // token字符串
      tokenString: "",

      // 选择哪个地址
      aid: "1",

      // 地址列表
      addressList: []
    };
  },

  created() {
    // 获取 token字符串
    this.tokenString = localStorage.getItem("__Tk");

    // 调用获取地址数据方法
    this.getAddressData();
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

    // 路由跳转
    goPage(name) {
      this.$router.push({ name });
    },

    // 返回上一页路由
    goBack() {
      this.$router.go(-1);
    },

    // 获取地址数据
    getAddressData() {
      // 开启加载提示
      this.toastLoad();

      // 调用 axios
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
            res.data.result.forEach(v => {
              // 定义一个对象
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

              // 判断是否为默认地址
              if (v.isDefault) {
                this.aid = v.aid;
              }

              // 放入地址列表的数组
              this.addressList.push(currentAddress);
            });
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // 新增地址和编辑地址
    goAddress(address) {
      // 当前地址的对象
      // 如果是新增地址功能,这里是没有参数的;如果是编辑地址功能,这里是当前地址的对象参数
      // 因此上面调用该方法时也不能传参数,如果传参数会覆盖掉原来的地址对象
      

      // 定义一个对象
      let paramsObj = {
        name: "Address"
      };

      if (address) {
        paramsObj.params = {
          // 拿到地址对象中的 aid属性
          aid: address.id
        };
      }

      this.$router.push(paramsObj);
    }
  }
};
</script>