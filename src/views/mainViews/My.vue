<template>
  <div class="my">
    <!-- 用户信息栏 -->
    <div
      class="my-bg"
      :style="{backgroundImage: 'url(' + userInfoData.userBg + ')'}"
      v-if="isLogin"
    >
      <!-- 顶部 "更换背景" -->
      <div class="top-change">
        <div class="change-div">
          <div>更换背景</div>
          <van-uploader class="change-bg" :max-size="maxSize" :after-read="uploadFile" />
        </div>
      </div>

      <!-- 用户头像和昵称栏 -->
      <div class="my-info">
        <div class="info-head">
          <img class="auto-img head-img" :src="userInfoData.userImg" alt />
        </div>
        <div class="info-text">
          <div class="info-name">{{userInfoData.nickName}}</div>
          <div
            class="info-sign"
          >简介：{{userInfoData.desc == '' ? '这个人其实不懒，不然也不会留下这句话...' : userInfoData.desc}}</div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="my-bg-empty" v-else>
      <span class="empty-text">亲快去&nbsp;</span>
      <span class="empty-link" @click="goPage('Register')">注册</span>
      <span class="empty-text">&nbsp;/&nbsp;</span>
      <span class="empty-link" @click="goPage('Login')">登录</span>
      <span class="empty-text">&nbsp;账号吧~</span>
    </div>

    <!-- 单元格列表 -->
    <div class="my-cell">
      <van-cell-group>
        <van-cell
          v-for="(item, index) in listData"
          :key="index"
          :title="item.title"
          is-link
          @click="goPage(item.routeName)"
        />
      </van-cell-group>
    </div>
  </div>
</template>

<script>
// 导入样式
import "../../assets/css/mainCss/my.less";

export default {
  name: "My",

  data() {
    return {
      // 单元格列表数据
      listData: [
        {
          title: "账号管理",
          routeName: "AccountManage"
        },
        {
          title: "地址管理",
          routeName: "MyAddress"
        },
        {
          title: "我的收藏",
          routeName: "MyCollect"
        },
        {
          title: "安全中心",
          routeName: "SafeCenter"
        }
      ],

      // 用户信息数据
      userInfoData: {},

      // 上传图片大小限制(1MB=1024KB=1024*1024B)
      maxSize: 1 * 1024 * 1024,

      // 检测是否处于登录状态
      isLogin: false
    };
  },

  created() {
    // 获取 token字符串
    this.tokenString = localStorage.getItem("__Tk");

    // 处于登录状态
    if (this.tokenString) {
      this.isLogin = true;

      // 调用获取用户信息的方法
      this.getUserInfo();
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

    // 跳转路由页面
    goPage(name) {
      if (name == "Login" || name == "Register") {
        this.$router.push({ name });
      } else {
        if (!this.isLogin) {
          this.$toast({ message: "请先登录", icon: "friends-o" });
        } else {
          this.$router.push({ name });
        }
      }
    },

    // 获取用户信息
    getUserInfo() {
      // 开启加载提示
      this.toastLoad();

      // 发送获取用户信息请求
      this.axios({
        method: "GET",
        url: "/findMy",
        params: {
          appkey: this.appkey,
          tokenString: this.tokenString
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 判断
          if (res.data.code == "A001") {
            // 把返回来的用户信息放入数组内
            this.userInfoData = res.data.result[0];
            // 
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // 上传背景图片
    uploadFile(file) {
      // 

      // 获取上传文件的 base64
      let serverBase64Img = file.content.replace(
        /^data:image\/[a-zA-Z]+;base64,/,
        ""
      );
      // 

      // 获取上传图片的类型
      let imgType = file.file.type.split("/")[1];
      // 

      // 开启加载提示
      this.toastLoad();

      // 发起上传背景图片请求
      this.axios({
        method: "POST",
        url: "/updateUserBg",
        data: {
          appkey: this.appkey,
          tokenString: this.tokenString,
          imgType,
          serverBase64Img
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 判断
          if (res.data.code == "I001") {
            this.userInfoData.userBg = res.data.userBg;
            this.$toast.success("更换背景成功");
          } else {
            this.$toast.fail("更换背景失败");
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    }
  }
};
</script>