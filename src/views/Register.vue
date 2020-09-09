<template>
  <div class="register">
    <van-nav-bar title="注册" left-text="登录" right-text="关闭" @click-left="goPage('Login')" @click-right="goPage('Home')" />

    <div class="logo">
      <img class="auto-img logo-img" src="../assets/images/logo.png" alt />
    </div>

    <van-form @submit="register">
      <van-field
        v-model="userInfo.phone"
        type="text"
        name="手机号"
        label="手机号"
        label-width="1.5rem"
        placeholder="请输入您的手机号"
        left-icon="phone-o"
        maxlength="11"
        clearable
      >
        <template v-slot:left-icon>
          <i class="fa fa-mobile fa-lg fa-fw"></i>
        </template>
      </van-field>
      <van-field
        v-model="userInfo.nickName"
        type="text"
        name="昵称"
        label="昵称"
        label-width="1.5rem"
        placeholder="请输入您的昵称"
        left-icon="user-o"
        maxlength="8"
        clearable
      >
        <template v-slot:left-icon>
          <i class="fa fa-user-o fa-lg fa-fw"></i>
        </template>
      </van-field>
      <van-field
        v-model="userInfo.password"
        :type="isEye ? 'text' : 'password'"
        name="密码"
        label="密码"
        label-width="1.5rem"
        placeholder="请输入您的密码"
        :right-icon="isEye ? 'eye-o' : 'closed-eye'"
        @click-right-icon="viewPassword"
        maxlength="16"
        clearable
      >
        <template v-slot:left-icon>
          <i class="fa fa-unlock-alt fa-lg fa-fw"></i>
        </template>
      </van-field>
      <div class="register-btn">
        <van-button round block type="info" native-type="submit" color="linear-gradient(to right bottom, #FA7157, #FB9E8D)">立即注册</van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
// 导入样式
import "../assets/css/register.less";

// 导入验证表单模块
import validForm from "../assets/js/validForm";

export default {
  name: "Register",

  data() {
    return {
      // 用户注册信息
      userInfo: {
        phone: "",
        nickName: "",
        password: ""
      },

      // 密码框内眼睛(false:闭眼;tureL:睁眼)
      isEye: false
    };
  },

  methods: {
    // 跳转页面
    goPage(name) {
      this.$router.push({name});
    },

    // 切换密码格式
    viewPassword() {
      this.isEye = !this.isEye;
    },

    // 注册
    register() {
      // 验证注册信息
      // 验证表单
      if (validForm.validUserForm(this.userInfo)) {
        // 合并复制对象
        let data = Object.assign({}, this.userInfo);
        // 额外在 data对象中添加 appkey属性
        data.appkey = this.appkey;

        // 开启加载提示
        this.$toast.loading({
          message: "加载中...",
          forbidClick: true,

          //延迟自动关闭加载提示(如果值为 0,则不会自动关闭)
          duration: 0
        });

        // 发起请求注册
        this.axios({
          method: "POST",
          url: "/register",

          // post传递参数需要写在 data
          data
        })
          .then(result => {
            // 关闭加载提示
            this.$toast.clear();

            

            // 跳转
            if (result.data.code == 100) {
              // 跳转到登录页面
              this.$router.push({ name: "Login" });
            } else {
              this.$toast(result.data.msg);
            }
          })
          .catch(err => {
            // 关闭加载提示
            this.$toast.clear();

            
          });
      }
    }
  }
};
</script>

<style lang="less" scoped>
</style>