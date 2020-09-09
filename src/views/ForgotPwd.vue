<template>
  <div class="forgotPwd">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <van-nav-bar title="找回密码" left-text="返回" left-arrow :fixed="true" @click-left="goBack" />
    </div>

    <!-- 输入框栏 -->
    <div class="forgot-ipt">
      <!-- 邮箱验证 -->
      <div v-if="!isNext">
        <van-form @submit="nextClick">
          <van-field
            v-model="emailCheck.email"
            type="text"
            label="邮箱"
            placeholder="请输入邮箱"
            clearable
            left-icon="envelop-o"
            label-width="5em"
          />

          <!-- key: 防止当前表单域会将内容携带给其他表单域(保证每一项都是唯一的) -->
          <van-field
            key="code"
            v-model="emailCheck.code"
            type="text"
            center
            clearable
            label="验证码"
            placeholder="请输入邮箱验证码"
            left-icon="certificate"
            label-width="5em"
          >
            <template #button>
              <van-button
                size="small"
                color="linear-gradient(to right bottom, #FB9E8D, #FA7157)"
                @click="sendEmailCode"
                :disabled="isSend"
              >{{codeText}}</van-button>
            </template>
          </van-field>
          <div class="btn-submit">
            <van-button
              round
              block
              color="linear-gradient(to right bottom, #FB9E8D, #FA7157)"
              native-type="submit"
              @click="nextClick"
            >下一步</van-button>
          </div>
        </van-form>
      </div>

      <!-- 修改密码 -->
      <div v-else>
        <van-form @submit="submitPwd">
          <van-field
            v-model="userInfo.phone"
            type="text"
            label="手机号"
            placeholder="请输入手机号"
            left-icon="phone-o"
            clearable
            label-width="5em"
            maxlength="11"
          />
          <van-field
            v-model="userInfo.password"
            :type="isEye ? 'text' : 'password'"
            label="新密码"
            placeholder="请输入新密码"
            left-icon="passed"
            :right-icon="isEye ? 'eye-o' : 'closed-eye'"
            @click-right-icon="viewPassword"
            clearable
            label-width="5em"
            maxlength="16"
          />
          <div class="btn-submit">
            <van-button
              round
              block
              color="linear-gradient(to right bottom, #FB9E8D, #FA7157)"
              native-type="submit"
            >提交</van-button>
          </div>
        </van-form>
      </div>
    </div>
  </div>
</template>

<script>
// 导入样式
import "../assets/css/forgotpwd.less";

// 导入表单验证 js
import validForm from "../assets/js/validForm";

export default {
  name: "ForgotPwd",
  data() {
    return {
      // 邮箱验证
      emailCheck: {
        email: "",
        code: ""
      },

      codeText: "发送验证码",
      isSend: false,

      // 修改密码
      userInfo: {
        phone: "",
        password: ""
      },

      // 密码框内眼睛(false:闭眼;tureL:睁眼)
      isEye: false,

      // 下一步
      isNext: false
    };
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

    // 页面跳转返回上一级
    goBack() {
      if (this.isNext) {
        this.isNext = false;
      } else {
        this.$router.go(-1);
      }
    },

    // 切换密码格式
    viewPassword() {
      this.isEye = !this.isEye;
    },

    // 点击 "下一步"
    nextClick() {
      // 再次验证邮箱,防止用户发送验证码后再修改邮箱
      if (!validForm.validUserForm(this.emailCheck)) {
        return;
      }

      // 开启加载提示
      this.toastLoad();

      // 发起验证邮箱验证码请求
      this.axios({
        method: "POST",
        url: "/checkValidCode",
        data: {
          appkey: this.appkey,
          validCode: this.emailCheck.code
        }
      })
        .then(res => {
          this.$toast.clear();
          

          if (res.data.code == "K001") {
            this.isNext = true;
          }else {
            this.$toast.fail(res.data.msg);
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // 发送邮箱验证码
    sendEmailCode() {
      // 邮箱正则验证
      if (!validForm.validUserForm({ email: this.emailCheck.email })) {
        return;
      }

      // 获取邮箱验证码
      // 开启加载提示
      this.toastLoad();

      // 点击 "发送验证码" 后文本提示定时器
      let time = 60;
      this.codeText = time + "秒后重新发送";
      this.isSend = true;
      let timer = setInterval(() => {
        if (time == 0) {
          clearInterval(timer);
          timer = null;
          this.codeText = "发送验证码";
          this.isSend = false;
        } else {
          time--;
          this.codeText = time + "秒后重新发送";
        }
      }, 1000);

      // 发起获取邮箱验证码请求
      this.axios({
        method: "POST",
        url: "/emailValidCode",
        data: {
          appkey: this.appkey,
          email: this.emailCheck.email
        }
      })
        .then(res => {
          this.$toast.clear();
          

          if (res.data.code == "J001") {
            this.$toast(res.data.msg);
          } else {
            this.$toast.fail(res.data.msg);
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // 提交修改密码
    submitPwd() {
      // 验证表单
      if(!validForm.validUserForm(this.userInfo)) {
        return;
      }

      // 开启加载提示
      this.toastLoad();

      // 发起修改密码请求
      this.axios({
        method: 'POST',
        url: '/retrievePassword',
        data: {
          appkey: this.appkey,
          phone: this.userInfo.phone,
          password: this.userInfo.password
        }
      }).then(res => {
        this.$toast.clear();
        

        // 判断
        if(res.data.code == 'L001') {
          this.$toast.success(res.data.msg);
          this.$router.push({name: 'Login'});
        }else {
          this.$toast.fail(res.data.msg);
        }
      }).catch(err => {
        this.$toast.clear();
        
      })
    }
  }
};
</script>