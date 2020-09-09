<template>
  <div class="safeCenter">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <van-nav-bar
        title="安全中心"
        left-text="返回"
        left-arrow
        @click-left="goBack"
        right-text="退出登录"
        @click-right="exitLogin"
      />
    </div>

    <!-- 修改密码 -->
    <div class="change-password" @click="show = true">修改密码</div>

    <!-- 底部弹出层 -->
    <van-action-sheet v-model="show" title="修改密码">
      <div class="actionContent">
        <van-form @submit="submitPwd">
          <van-field
            v-model="userInfo.oldPassword"
            type="text"
            label="旧密码"
            placeholder="旧密码（6-16位）"
            clearable
          />
          <van-field
            v-model="userInfo.password"
            type="text"
            label="新密码"
            placeholder="新密码（6-16位）"
            clearable
          />
          <van-button color="linear-gradient(to bottom right, #FA7157, #FB9E8D)" block round>提交</van-button>
        </van-form>
      </div>
    </van-action-sheet>

    <!-- 注销账号 -->
    <div class="cancel-account" @click="destroyAccount">注销账号</div>
  </div>
</template>

<script>
// 导入样式
import "../assets/css/safeCenter.less";

// 导入表单验证 js
import validForm from "../assets/js/validForm";

export default {
  name: "SafeCenter",
  data() {
    return {
      show: false,
      userInfo: {
        oldPassword: "",
        password: ""
      }
    };
  },

  created() {
    // 获取 token字符串
    this.tokenString = localStorage.getItem("__Tk");
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

    // 退出登录
    exitLogin() {
      // 弹窗确认
      this.$dialog
        .confirm({
          title: "提示",
          message: "是否要退出登录？",
          confirmButtonColor: "#FA7157"
        })
        .then(() => {
          // 清除 token
          localStorage.removeItem("__Tk");

          // 跳转到登录页面
          this.$router.push({ name: "Login" });
        })
        .catch(() => {});
    },

    // 修改密码
    submitPwd() {
      // 验证密码表单
      if (!validForm.validUserForm(this.userInfo)) {
        return;
      }

      // 开启加载提示
      this.toastLoad();

      // 发起修改密码请求
      this.axios({
        method: "POST",
        url: "/updatePassword",
        data: {
          appkey: this.appkey,
          tokenString: this.tokenString,
          password: this.userInfo.password,
          oldPassword: this.userInfo.oldPassword
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 关闭修改密码弹出框
          this.show = false;

          if (res.data.code == "E001") {
            // 清除 token
            localStorage.removeItem("__Tk");

            this.$toast.success(res.data.msg);

            // 跳转到登录页面
            this.$router.push({ name: "Login" });
          } else {
            this.$toast.fail(res.data.msg);
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // 注销账号
    destroyAccount() {
      // 弹窗确认
      this.$dialog
        .confirm({
          title: "提示",
          message: "一旦注销账号，数据将无法恢复！",
          confirmButtonColor: "#FA7157"
        })
        .then(() => {
          // 开启加载提示
          this.toastLoad();

          // 发起注销账号请求
          this.axios({
            method: "POST",
            url: "/destroyAccount",
            data: {
              appkey: this.appkey,
              tokenString: this.tokenString
            }
          })
            .then(res => {
              this.$toast.clear();
              

              // 判断
              if (res.data.code == "G001") {
                // 清除 token
                localStorage.removeItem("__Tk");

                // 跳转到登录页面
                this.$router.push({ name: "Login" });
              }else {
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