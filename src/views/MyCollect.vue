<template>
  <div class="myCollect">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <van-nav-bar fixed title="我的收藏" left-text="返回" left-arrow @click-left="goBack" />
    </div>

    <!-- 收藏栏 -->
    <div class="collect" v-if="collectData.length > 0">
      <div class="collect-item clearfix">
        <div class="goods-item fl" v-for="(item, index) in collectData" :key="index">
          <div class="item-img" @click="goGoodsDetail(item.pid)">
            <img class="auto-img" :src="item.smallImg" alt />
          </div>
          <div class="item-text">
            <div class="text-top">
              <div class="zh-name">{{item.name}}</div>
              <div class="en-name">{{item.enname}}</div>
            </div>
            <div class="text-bottom clearfix">
              <span class="price fl">￥{{item.price}}</span>
              <span class="del-icon fr" @click="removeCollect(item.pid, index)">
                <van-icon name="delete" color="#999" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else>
      <van-empty class="custom-image" image="https://img.yzcdn.cn/vant/custom-empty-image.png" description="收藏列表空空如也">
        <span class="empty-text">亲快去&nbsp;</span>
        <span class="empty-link" @click="goPage('Home')">首页</span>
        <span class="empty-text">&nbsp;逛逛吧~</span>
      </van-empty>
    </div>
  </div>
</template>

<script>
// 导入样式
import "../assets/css/myCollect.less";

export default {
  name: "MyCollect",

  data() {
    return {
      // 收藏商品数据
      collectData: []
    };
  },

  created() {
    // 获取 token字符串
    this.tokenString = localStorage.getItem("__Tk");

    // 调用查询收藏商品数据的方法
    this.findCollect();
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

    // 返回上一级
    goBack() {
      this.$router.go(-1);
    },

    // 路由跳转
    goPage(name) {
      this.$router.push({ name });
    },

    // 查询收藏商品数据
    findCollect() {
      // 开启加载提示
      this.toastLoad();

      // 发起查询收藏商品请求
      this.axios({
        method: "GET",
        url: "/findAllLike",
        params: {
          appkey: this.appkey,
          tokenString: this.tokenString
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 判断
          if (res.data.code == 2000) {
            // 把收藏商品数据放入数组中
            this.collectData = res.data.result;
            
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // 跳转商品详情页面
    goGoodsDetail(pid) {
      this.$router.push({ name: "Detail", query: { pid } });
    },

    // 删除收藏商品
    removeCollect(pid, index) {
      // 弹窗确认
      this.$dialog
        .confirm({
          title: "提示",
          message: "是否取消收藏 ？"
        })
        .then(() => {
          // 开启加载提示
          this.toastLoad();
          // 发起删除收藏商品请求
          this.axios({
            method: "POST",
            url: "/notlike",
            data: {
              appkey: this.appkey,
              tokenString: this.tokenString,
              pid
            }
          })
            .then(res => {
              this.$toast.clear();
              

              // 判断
              if (res.data.code == 900) {
                // 同时从收藏页面删除该商品
                this.collectData.splice(index, 1);
                this.$toast.success(res.data.msg);
              } else {
                this.$toast.fail(res.data.msg);
              }
            })
            .catch(err => {
              this.$toast.clear();
              
            });
        })
        .catch(() => {});
    }
  }
};
</script>