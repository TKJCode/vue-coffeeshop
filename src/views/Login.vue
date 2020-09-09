<template>
  <div class="login">
    <van-nav-bar title="登录" left-text="注册" right-text="关闭" @click-left="goPage('Register')" @click-right="goPage('Home')" />

    <div class="logo">
      <img class="auto-img logo-img" src="../assets/images/logo.png" alt />
    </div>

    <van-form @submit="login">
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
        <van-button round block type="info" native-type="submit" color="linear-gradient(to right bottom, #FA7157, #FB9E8D)">立即登录</van-button>

        <div class="forgotPassword" @click="goPage('ForgotPwd')">
          <span class="fr">忘记密码</span>
        </div>
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
  name: "Login",

  data() {
    return {
      // 用户登录信息
      userInfo: {
        phone: "",
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

    // 登录
    login() {
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
          url: "/login",

          // post传递参数需要写在 data
          data
        })
          .then(result => {
            // 关闭加载提示
            this.$toast.clear();

            

            // 跳转
            if(result.data.code == 200) {
                

                // 存储 token,用于后面登录验证
                localStorage.setItem('__Tk', result.data.token);

                

                // 跳转到首页菜单页面
                this.$router.push("main/home");
            }else {
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
.forgotPassword {
  margin-top: 20px;
}
</style>