<template>
  <div class="accountManage">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <van-nav-bar title="账户管理" left-text="返回" left-arrow @click-left="goBack" />
    </div>

    <!-- 账号管理列表 -->
    <div class="accountManage-list">
      <!-- 头像 -->
      <van-cell class="cell-head" title="头像" value="内容">
        <template #default>
          <div class="head">
            <img class="auto-img" :src="userInfoData.userImg" alt />
            <van-uploader class="uploader" :after-read="uploadFile" />
          </div>
        </template>
      </van-cell>

      <!-- 用户 id和手机号(不可修改) -->
      <van-cell title="用户id" :value="userInfoData.userId" />
      <van-cell title="手机号" :value="userInfoData.phone" />

      <!-- 昵称(可修改) -->
      <van-field
        v-model="userInfoData.nickName"
        label="昵称"
        @blur="updateUserInfo({url: '/updateNickName', key: 'nickName', value: userInfoData.nickName})"
        input-align="right"
        clearable
      />

      <!-- 简介(可修改) -->
      <van-field
        class="desc"
        label-width="10em"
        type="textarea"
        :autosize="true"
        maxlength="30"
        v-model="userInfoData.desc"
        label="简介"
        @blur="updateUserInfo({url: '/updateDesc', key: 'desc', value: userInfoData.desc})"
        input-align="right"
        clearable
      />
    </div>
  </div>
</template>

<script>
// 导入样式
import "../assets/css/accountManage.less";

export default {
  name: "AccountManage",

  data() {
    return {
      // 用户个人信息列表
      userInfoData: {}
    };
  },

  created() {
    // 获取 token字符串
    this.tokenString = localStorage.getItem("__Tk");

    // 调用查询用户个人信息的方法
    this.getUserInfo();
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

    // 返回上一级页面
    goBack() {
      this.$router.go(-1);
    },

    // 查询用户个人信息
    getUserInfo() {
      // 开启加载提示
      this.toastLoad();

      // 发起查询用户个人信息请求
      this.axios({
        method: "GET",
        url: "/findAccountInfo",
        params: {
          appkey: this.appkey,
          tokenString: this.tokenString
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 判断
          if (res.data.code == "B001") {
            this.userInfoData = res.data.result[0];
            // 
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // 上传用户头像
    uploadFile(file) {
      

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
        url: "/updateAvatar",
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
          if (res.data.code == "H001") {
            this.userInfoData.userImg = res.data.userImg;
          }else {
            this.$toast.fail(res.data.msg);
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // 修改用户信息(昵称和简介)
    updateUserInfo(obj) {
      // 开启加载提示
      this.toastLoad();

      // 发起修改用户信息请求
      this.axios({
        method: "POST",
        url: obj.url,
        data: {
          appkey: this.appkey,
          tokenString: this.tokenString,
          [obj.key]: obj.value
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 判断
          if (res.data.code == "C001" || res.data.code == "D001") {
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