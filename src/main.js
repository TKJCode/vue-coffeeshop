import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 导入 axios
import axios from 'axios'
import VueAxios from 'vue-axios'

// 导入用于设置 rem 基准值模块
import 'lib-flexible'

// 导入配置 font-awesome字体图标库
import 'font-awesome/css/font-awesome.min.css'

// 导入 vant框架
import {
  NavBar,
  Form,
  Field,
  Button,
  Toast,
  Tabbar,
  TabbarItem,
  Swipe, 
  SwipeItem,
  Lazyload,
  Stepper,
  GoodsAction, 
  GoodsActionIcon, 
  GoodsActionButton,
  Empty,
  SwipeCell,
  Checkbox, 
  CheckboxGroup,
  SubmitBar,
  List,
  AddressEdit,
  AddressList,
  Popup,
  Tab,
  Tabs,
  Icon,
  Cell, 
  CellGroup,
  Uploader,
  Dialog,
  ActionSheet,
} from 'vant'

// 注册 vant框架的组件
Vue
  .use(NavBar)
  .use(Form)
  .use(Field)
  .use(Button)
  .use(Toast)
  .use(Tabbar)
  .use(TabbarItem)
  .use(Swipe)
  .use(SwipeItem)
  .use(Lazyload)
  .use(Stepper)
  .use(GoodsAction)
  .use(GoodsActionIcon)
  .use(GoodsActionButton)
  .use(Empty)
  .use(SwipeCell)
  .use(Checkbox)
  .use(CheckboxGroup)
  .use(SubmitBar)
  .use(List)
  .use(AddressEdit)
  .use(AddressList)
  .use(Popup)
  .use(Tab)
  .use(Tabs)
  .use(Icon)
  .use(Cell)
  .use(CellGroup)
  .use(Uploader)
  .use(Dialog)
  .use(ActionSheet)

// 注册 axios
Vue.use(VueAxios, axios)

// ==========================================
// 配置请求基础路径
axios.defaults.baseURL = 'http://www.kangliuyong.com:10002'

// 配置 post请求头
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'

// 发起请求之前处理
axios.interceptors.request.use(config => {
  // 

  if(config.method === 'post') {
    // 定义空字符串
    let paramsString = '';

    // post请求参数序列化,把数据 data转成字符串类型
    for(let key in config.data) {
      paramsString += key + '=' + config.data[key] + '&';
    }

    // 去掉字符串最后多余的 "&"
    config.data = paramsString.slice(0, -1);

    // 查看控制台数据
    // 
    // 
  }

  return config;
})
// ==========================================

// 添加 appkey属性保存 appkey
Vue.prototype.appkey = 'U2FsdGVkX19WSQ59Cg+Fj9jNZPxRC5y0xB1iV06BeNA='

// ==========================================

// 添加全局过滤器(过滤订单日期)
Vue.filter('formatDate', (value, format) => {
  // value：2020-07-08T08:13:59.000Z
  // format：yyyy-MM-dd hh:mm:ss

  let currentDate = new Date(value);
  //
  
  // 获取年份
  let year = currentDate.getFullYear();

  // 用正则表达式来匹配、替换原年份数据
  if(/(y+)/.test(format)) {
    // y+的意思是匹配 1个到多个 y
    // (y+)的意思是 y+匹配到的内容可以通过分组来取到(这里是通过第一个分组来取到)
    // RegExp.$1就是取到的 y+第一个组匹配到的内容

    // 获取匹配组的内容
    let yearContent = RegExp.$1;
    //

    // /(y+)/.test(format)就是拿 yyyy变成对应 format的四个数字的年份
    format = format.replace(yearContent, year);
  }
  //

  // 处理月日时分秒
  let dateObj = {
    M: currentDate.getMonth() + 1,
    d: currentDate.getDate(),
    h: currentDate.getHours(),
    m: currentDate.getMinutes(),
    s: currentDate.getSeconds()
  };
  //

  // 遍历判断
  for(let key in dateObj) {
    // 创建动态正则表达式
    let reg = new RegExp(`(${key}+)`);
    // 

    // 用正则表达式来匹配、替换原日期数据
    if(reg.test(format)) {
      // 获取匹配组的内容(RegExp.$n必须要 test验证通过才可以获取)
      let dateContent = RegExp.$1;
      // 

      // 控制补零
      // 判断日期对象的 key值是否大于等于 10,如果大于等于 10就直接等于日期对象的 key值,如果小于 10则还要判断日期组的内容长度是否等于 2(即 hh之类),等于 2则补上一个 0,否则还是等于日期对象的 key值
      let val = dateObj[key] >= 10 ? dateObj[key] : dateContent.length == 2 ? '0' + dateObj[key] : dateObj[key];

      // 替换掉匹配组的内容
      format = format.replace(dateContent, val);
    }
  }
  //onsole.log('format =>', format); //2020-07-08 16:13:59

  // 返回计算后的最终结果 format
  return format;
})

// ==========================================

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
