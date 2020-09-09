export const routes = [
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/main',
        name: 'Main',
        component: () => import('../views/Main.vue'),

        children: [
            {
                path: 'home',
                name: 'Home',
                component: () => import('../views/mainViews/Home.vue')
            },
            {
                path: 'orders',
                name: 'Orders',
                component: () => import('../views/mainViews/Orders.vue')
            },
            {
                path: 'shopcart',
                name: 'Shopcart',
                component: () => import('../views/mainViews/Shopcart.vue')
            },
            {
                path: 'my',
                name: 'My',
                component: () => import('../views/mainViews/My.vue')
            }
        ]
    },
    {
        path: '/detail',
        name: 'Detail',
        component: () => import('../views/Detail.vue')
    },
    {
        path: '/address/:aid?',
        name: 'Address',
        component: () => import('../views/Address.vue')
    },
    {
        path: '/myaddress',
        name: 'MyAddress',
        component: () => import('../views/MyAddress.vue')
    },
    {
        path: '/pay',
        name: 'Pay',
        component: () => import('../views/Pay.vue')
    },
    {
        path: '/accountmanage',
        name: 'AccountManage',
        component: () => import('../views/AccountManage.vue')
    },
    {
        path: '/mycollect',
        name: 'MyCollect',
        component: () => import('../views/MyCollect.vue')
    },
    {
        path: '/safecenter',
        name: 'SafeCenter',
        component: () => import('../views/SafeCenter.vue')
    },
    {
        path: '/forgotpwd',
        name: 'ForgotPwd',
        component: () => import('../views/ForgotPwd.vue')
    },

    // 重定向路由
    {
        path: '*',
        redirect: {
            name: 'Register'
        }
    }
]