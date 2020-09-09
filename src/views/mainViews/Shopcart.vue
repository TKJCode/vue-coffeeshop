<template>
  <div class="shopcart">
    <!-- 1.如果购物车没有数据,则显示空状态页面 -->
    <div class="emptyPage" v-if="shopcartData.length == 0">
      <!-- 空状态图片 -->
      <van-empty description="亲赶紧去商城逛一逛吧~" :image="require('../../assets/images/empty.png')" />

      <!-- 热门推荐 -->
      <div class="hot-recom clearfix">
        <!-- 标题栏 -->
        <div class="hot-title clearfix">
          <div class="line fl"></div>
          <div class="text">热门推荐</div>
        </div>

        <!-- 商品栏 -->
        <div
          class="goods-item fl clearfix"
          v-for="(item, index) in hotGoodsData"
          :key="index"
          @click="goDetail(item.pid)"
        >
          <div class="item-img">
            <img class="auto-img" v-lazy="item.smallImg" alt />
          </div>
          <div class="item-text">
            <div class="item-name clearfix">
              <div class="text-name fl one-text">{{item.name}}</div>
              <div class="text-enname fl one-text">{{item.enname}}</div>
            </div>

            <div class="text-price fr">￥{{item.price}}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2.如果购物车有数据,则显示正常购物车页面 -->
    <div class="shopcartPage" v-else>
      <!-- 顶部管理栏 -->
      <div class="top-nav">
        <van-nav-bar :right-text="isManage ? '管理' : '完成'" :fixed="true" @click-right="manageGoods" />
      </div>

      <!-- 商品列表 -->
      <div class="goods-list">
        <van-list
          v-model="loadOptions.isLoading"
          :finished="loadOptions.isFinished"
          :finished-text="loadOptions.finishedText"
          @load="loadData"
        >
          <van-swipe-cell v-for="(item, index) in shopcartData" :key="index">
            <div class="list-item clearfix">
              <!-- 单选框 -->
              <div class="item-checkBox fl">
                <van-checkbox
                  class="checkOne"
                  checked-color="#FA7157"
                  v-model="item.isCheck"
                  @change="checkedGoodsOne"
                ></van-checkbox>
              </div>

              <!-- 商品信息 -->
              <div class="item-info fl clearfix">
                <!-- 商品图片 -->
                <div class="info-img fl">
                  <img class="auto-img" :src="item.small_img" alt />
                </div>

                <!-- 商品文字 -->
                <div class="info-text fl">
                  <div class="text-top">
                    <!-- 商品文字信息 -->
                    <div>
                      <span class="big-name">{{item.name}}</span>
                      <span class="sm-name">{{item.rule}}</span>
                    </div>
                    <div class="enname">{{item.enname}}</div>
                  </div>

                  <div class="text-bottom clearfix">
                    <!-- 商品价格 -->
                    <div class="bottom-price fl">￥{{item.price}}</div>

                    <!-- 商品数量 -->
                    <div class="bottom-number fr">
                      <van-stepper
                        v-model="item.count"
                        theme="round"
                        button-size="22"
                        :integer="true"
                        @change="modifyCount(item)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <template #right>
              <van-button
                square
                type="danger"
                text="删除"
                @click="removeGoodsOne([item.sid], index)"
              />
            </template>
          </van-swipe-cell>
        </van-list>
        <!-- =============================== -->
      </div>

      <!-- 底部商品订单栏 -->
      <div class="bottom-list" v-if="isManage">
        <van-submit-bar
          :price="total"
          :disabled="notChecked"
          button-text="提交订单"
          @submit="submitOrder"
        >
          <van-checkbox checked-color="#FA7157" v-model="checkedAll" @click="checkedGoodsAll">全选</van-checkbox>
        </van-submit-bar>
      </div>

      <div class="bottom-list" v-else>
        <van-submit-bar
          class="remove-list"
          :disabled="notChecked"
          button-text="删除订单"
          @submit="removeGoodsMore"
        >
          <van-checkbox checked-color="#FA7157" v-model="checkedAll" @click="checkedGoodsAll">全选</van-checkbox>
        </van-submit-bar>
      </div>
    </div>
  </div>
</template>

<script>
// 导入样式
import "../../assets/css/mainCss/shopcart.less";

export default {
  name: "Shopcart",

  data() {
    return {
      //isHas: false, //购物车是否有商品数据

      isManage: true, //管理按钮

      notChecked: true, //单选按钮处于未被选择的状态
      checkedAll: false, //全选按钮处于未被选择的状态

      // token字符串
      tokenString: "",

      // 购物车数据
      shopcartData: [],

      // 购物车所有商品的数据
      allShopcartData: [],

      // 商品列表懒加载
      loadOptions: {
        isLoading: true, //是否处于加载状态，加载过程中不触发 load事件
        isFinished: false, //是否已经完成加载所有数据
        finishedText: "无数据可加载..."
      },

      // 每次懒加载 8条数据
      loadCount: 8,

      // 总金额
      total: 0,

      // 空状态页面 - 热门推荐数据
      hotGoodsData: []
    };
  },

  created() {
    // 获取 token字符串
    this.tokenString = localStorage.getItem("__Tk");
    // 

    // 调用获取购物车数据方法
    this.getShopcartData();

    // 调用获取热门推荐商品的方法
    this.getHotGoods();
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

    // 获取购物车数据
    getShopcartData() {
      // 开启加载提示
      this.toastLoad();

      // 调用 axios
      this.axios({
        method: "GET",
        url: "/findAllShopcart",
        params: {
          appkey: this.appkey,
          tokenString: this.tokenString
        }
      })
        .then(res => {
          this.$toast.clear();
          // 

          // 判断
          if (res.data.code == 5000) {
            res.data.result.forEach(v => {
              v.isCheck = false;
            });

            // 赋值(购物车总的商品数据)
            this.allShopcartData = res.data.result;
            // 

            // 懒加载商品列表
            // 给购物车总的商品数据中的前 8个商品进行懒加载
            // 后面的商品只有往下翻阅才会进行加载
            this.shopcartData = this.allShopcartData.splice(0, this.loadCount);
            // console.log('shopcartData =>', this.shopcartData);
            console.log('allShopcartData =>', this.allShopcartData);
            

            // 根据截取购物车商品数量和购物车总的商品数量判断是否加载完成
            if (this.allShopcartData.length > 0) {
              this.loadOptions.isLoading = false;
            } else {
              // 无数据可加载
              this.loadOptions.isLoading = true;
              this.loadOptions.isFinished = true;
            }

            // 当购物车的商品数据为 0时,提示文字为空
            if (this.shopcartData.length == 0) {
              this.loadOptions.finishedText = "";
            }
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // =====================================================

    // 商品列表懒加载
    loadData() {
      // 

      setTimeout(() => {
        // 定时加载
        this.shopcartData.push(
          ...this.allShopcartData.splice(0, this.loadCount)
        );
        console.log(this.allShopcartData)

        // 如果购物车总的商品数据为 0时
        if (this.allShopcartData.length == 0) {
          // 无数据可加载
          this.loadOptions.isLoading = true;
          this.loadOptions.isFinished = true;
        }
      }, 500);
    },

    // =====================================================

    // 全选
    checkedGoodsAll() {
      // 遍历购物车商品数据,根据 ischeck属性判定是否全选
      this.allShopcartData.forEach(v => {
        v.isCheck = this.checkedAll;
      });
      this.shopcartData.forEach(v => {
        v.isCheck = this.checkedAll;
      });

      // 反选
      // 只要有一个选项未被勾选,全选按钮则会取消勾选
      this.notChecked = !this.checkedAll;

      // 计算总金额
      this.totalMoney();
    },

    // =====================================================

    // 单选
    checkedGoodsOne() {
      // 计算总金额(由于下方判断出现 return,因此要先调用计算总金额的方法)
      this.totalMoney();

      // 每次调用前先把所有的单选按钮取消选择状态
      this.notChecked = true;

      // 判断
      // 当所有单选按钮都为选中状态时
      for (let i = 0; i < this.shopcartData.length; i++) {
        if (this.shopcartData[i].isCheck) {
          this.notChecked = false;
          break;
        }
      }

      // 当至少有一个单选按钮不是选中状态时
      for (let i = 0; i < this.shopcartData.length; i++) {
        if (!this.shopcartData[i].isCheck) {
          // 取消全选按钮的选中状态
          this.checkedAll = false;
          return;
        }
      }

      // 把全选按钮设置为全选状态
      this.checkedAll = true;
    },

    // =====================================================

    // 管理商品列表
    manageGoods() {
      // 点击 "管理" 按钮时,isManage属性变化
      this.isManage = !this.isManage;
    },

    // =====================================================

    // 修改购物车数量
    modifyCount(item) {
      // 
      // 
      // 

      // 开启加载提示
      this.toastLoad();

      // 调用 axios
      this.axios({
        method: "POST",
        url: "/modifyShopcartCount",
        data: {
          appkey: this.appkey,
          tokenString: this.tokenString,
          sid: item.sid,
          count: item.count
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 判断
          if (res.data.code == 6000) {
            // 计算总金额
            this.totalMoney();
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // =====================================================

    // 删除单个商品
    removeGoodsOne(sids, index) {
      // 开启加载提示
      this.toastLoad();

      // 调用 axios
      this.axios({
        method: "POST",
        url: "/removeShopcart",
        data: {
          appkey: this.appkey,
          tokenString: this.tokenString,

          // sid购物车唯一标识集合字符串(sids值为 JSON.stringify([sid1, sid2, sid3]))
          sids: JSON.stringify(sids)
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 判断
          if (res.data.code == 7000) {
            // 删除指定的单个商品
            this.shopcartData.splice(index, 1);

            // 判断如果把购物车数据删至清空
            if (this.shopcartData.length == 0) {
              this.loadOptions.finishedText = "";
            }

            // 计算总金额
            this.totalMoney();

            this.$toast.success("删除成功");
          } else {
            this.$toast.fail("删除失败");
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // =====================================================

    // 删除多个商品
    removeGoodsMore() {
      // 获取删除购物车的 sid,把选中的商品 sid放入空数组内
      let sids = [];

      // 遍历
      this.shopcartData.forEach(v => {
        if (v.isCheck) {
          sids.push(v.sid);
        }
      });
      // 

      // 开启加载提示
      this.toastLoad();

      // 调用 axios
      this.axios({
        method: "POST",
        url: "/removeShopcart",
        data: {
          appkey: this.appkey,
          tokenString: this.tokenString,

          // sid购物车唯一标识集合字符串(sids值为 JSON.stringify([sid1, sid2, sid3]))
          sids: JSON.stringify(sids)
        }
      })
        .then(res => {
          this.$toast.clear();
          

          // 判断
          if (res.data.code == 7000) {
            // 根据循环遍历删除多个商品
            for (let i = this.shopcartData.length - 1; i >= 0; i--) {
              //由于删除商品后会改变数组长度,因此要倒着来循环遍历
              if (this.shopcartData[i].isCheck) {
                this.shopcartData.splice(i, 1);
              }
            }

            // 判断如果把购物车数据删至清空
            if (this.shopcartData.length == 0) {
              this.checkedAll = false; //取消全选按钮的选中状态
              this.isManage = true; //顶部导航栏的 "完成" 变为 "管理"
              this.loadOptions.finishedText = "";
            }

            // 计算总金额
            this.totalMoney();

            this.$toast.success("删除成功");
          } else {
            this.$toast.fail("删除失败");
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // =====================================================

    // 计算总金额
    totalMoney() {
      // 每次调用前把总金额清零
      this.total = 0;

      // 计算总金额
      this.shopcartData.forEach(v => {
        if (v.isCheck) {
          this.total += v.price * v.count * 100;
        }
      });
    },

    // =====================================================

    // 获取热门推荐类型的商品
    getHotGoods() {
      // 开启加载提示
      this.toastLoad();

      // 调用 axios
      this.axios({
        method: "GET",
        url: "/typeProducts",
        params: {
          appkey: this.appkey,
          key: "isHot",
          value: 1
        }
      })
        .then(res => {
          this.$toast.clear();
          

          if (res.data.code == 500) {
            this.hotGoodsData = res.data.result;
            
          }
        })
        .catch(err => {
          this.$toast.clear();
          
        });
    },

    // =====================================================

    // 跳转到商品详情页面
    goDetail(pid) {
      this.$router.push({ name: "Detail", query: { pid } });
    },

    // =====================================================

    // 提交订单
    submitOrder() {
      // 获取选择的商品的 sid
      let sids = [];

      // 遍历购物车数据
      this.shopcartData.forEach(v => {
        if (v.isCheck) {
          // 把选中的商品放入 sids数组内
          sids.push(v.sid);
        }
      });
      // 

      // 路由跳转到结算页面
      this.$router.push({
        name: "Pay",
        query: {
          sids: sids.join("-")
        }
      });
    }
  }
};
</script>