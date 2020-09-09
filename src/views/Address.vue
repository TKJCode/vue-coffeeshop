<template>
  <div class="address">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <van-nav-bar :title="!!aid ? '编辑地址' : '新增地址'" left-text="返回" left-arrow @click-left="goBack" />
    </div>

    <!-- 地址编辑栏 -->
    <div class="address-list">
      <van-address-edit
        :area-list="areaList"
        :address-info="addressInfo"
        show-postal
        :show-delete="!!aid"
        save-button-text="保存地址"
        show-set-default
        show-search-result
        :area-columns-placeholder="['请选择', '请选择', '请选择']"
        @save="saveAddress"
        @delete="removeAddress"
      />
    </div>
  </div>
</template>

<script>
// 导入 area.js
import areaList from "../assets/js/area";

// 导入样式
import "../assets/css/address.less";

export default {
  name: "Address",

  data() {
    return {
      // token字符串
      tokenString: "",

      areaList,

      // 地址信息
      // 这里的空数据是要和查询地址对象出来的真数据进行关联,并赋值给新增地址的页面处
      addressInfo: {
        name: "", //收货人姓名
        tel: "", //收货人手机号
        province: "", //省份
        city: "", //城市
        county: "", //区县
        addressDetail: "", //详细地址
        areaCode: "", //地区编码(通过省市区选择获取),
        postalCode: "", //邮政编码
        isDefault: false //是否为默认地址
      },

      // 地址 id
      aid: ""
    };
  },

  created() {
    // 获取 token字符串
    this.tokenString = localStorage.getItem("__Tk");

    // 截取路由参数(地址 id:aid)
    // 截取 MyAddress.vue中的 goAddress方法中的 aid(即地址栏中地址后面附带的 aid)
    this.aid = this.$route.params.aid;
    // 
    // 

    // 如果存在 aid(即编辑地址功能)
    // 新增地址功能是没有 aid放出来的
    if (this.aid) {
      // 调用根据地址 id获取地址数据的方法
      this.getAddressByAid(this.aid);
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

    // 返回上一级
    goBack() {
      this.$router.go(-1);
    },

    // 保存地址
    saveAddress(addressData) {
      // 

      // 判断数据是否相同的布尔值标识开关
      let isSame = true;

      // 如果存在 aid属性,即正在使用编辑地址功能
      if (this.aid) {
        // 判断用户是否修改了地址
        // 根据获取当前的地址数据(addressData)和查询地址返回回来的数据是否一致
        // 
        // 

        // 遍历原来的数据,然后比较修改后的数据
        for (let key in this.addressInfo) {
          // 如果当中有一个不相等的,就发起修改请求
          if (this.addressInfo[key] != addressData[key]) {
            // 存在不同数据,表明用户已经修改过地址
            isSame = false;
          }
        }
      }

      // 开启加载提示
      this.toastLoad();

      // 判断是否为新增地址还是编辑地址(根据是否有 aid属性来判断)
      if (this.aid) {
        if (!isSame) {
          // 编辑地址
          // 

          // 把地址信息复制到个人地址信息对象里
          let userAddress = Object.assign({}, this.addressInfo);
          // 

          // 遍历
          for (let key in userAddress) {
            // 把修改后的个人地址数据对象覆盖到修改前的地址数据对象
            userAddress[key] = addressData[key];
          }

          // 把 isDefault属性转为 Number类型
          userAddress.isDefault = Number(userAddress.isDefault);
          // 

          // 还要加入三个参数(appkey, tokenString, aid)
          userAddress.appkey = this.appkey;
          userAddress.tokenString = this.tokenString;
          userAddress.aid = this.aid;
          // 

          // 发起编辑地址请求
          this.axios({
            method: "POST",
            url: "/editAddress",
            data: userAddress
          })
            .then(res => {
              this.$toast.clear();
              

              // 判断
              if (res.data.code == 30000) {
                // 跳转到 "收获地址" 路由
                this.$router.push({ name: "MyAddress" });

                this.$toast.success(res.data.msg);
              } else {
                this.$toast.fail(res.data.msg);
              }
            })
            .catch(err => {
              this.$toast.clear();
              
            });
        } else {
          this.$toast.clear();
        }

        // ==========================================
      } else {
        // 新增地址
        // 地址接口数据
        let data = {
          name: "", //收货人姓名
          tel: "", //收货人手机号
          province: "", //省份
          city: "", //城市
          county: "", //区县
          addressDetail: "", //详细地址
          areaCode: "", //地区编码(通过省市区选择获取),
          postalCode: "", //邮政编码
          isDefault: "" //是否为默认地址(值只能为 0 或者 1, ==> 0: 非默认地址, 1: 默认地址)
        };

        // 拷贝对象属性
        for (let key in data) {
          data[key] = addressData[key];
        }
        data.appkey = this.appkey;
        data.tokenString = this.tokenString;
        data.isDefault = Number(data.isDefault);

        // 

        // 调用 axios
        this.axios({
          method: "POST",
          url: "/addAddress",
          data
        })
          .then(res => {
            this.$toast.clear();
            

            // 判断
            if (res.data.code == 9000) {
              // 跳转到 "收货地址" 路由
              this.$router.push({ name: "MyAddress" });

              this.$toast.success(res.data.msg);
            } else {
              this.$toast.fail(res.data.msg);
            }
          })
          .catch(err => {
            this.$toast.clear();
            
          });
      }
    },

    // 根据地址 id获取地址数据
    getAddressByAid(aid) {
      // 开启加载提示
      this.toastLoad();

      // 调用 axios
      this.axios({
        method: "GET",
        url: "/findAddressByAid",
        params: {
          appkey: this.appkey,
          tokenString: this.tokenString,
          aid: this.aid
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 判断
          if (res.data.code == 40000) {
            // 将地址对象内的 isDefault属性由 Number类型转为布尔类型
            res.data.result[0].isDefault = Boolean(
              res.data.result[0].isDefault
            );
            
            // 遍历对象
            for (let key in this.addressInfo) {
              // res.data.result[0]为查询地址的地址对象(有且只有一个数组)

              // 将地址对象复制进该地址数组内
              this.addressInfo[key] = res.data.result[0][key];
            }
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // 删除地址
    removeAddress() {
      // 开启加载提示
      this.toastLoad();

      // 发起删除地址请求
      this.axios({
        method: "POST",
        url: "/deleteAddress",
        data: {
          appkey: this.appkey,
          tokenString: this.tokenString,
          aid: this.aid
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 判断
          if (res.data.code == 10000) {
            // 跳转到 "收货地址" 路由
            this.$router.push({ name: "MyAddress" });

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


