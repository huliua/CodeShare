import { createRouter, createWebHistory } from 'vue-router';
import Index from '@/views/index/index.vue';
import { useUserStore } from '@/store/userStore';
import { getUserInfo } from '@/api/user';
import { isRelogin } from '@/utils/request';

// 静态路由
const constantRoutes = [
    {
        path: '/',
        component: Index,
        redirect: '/index',
        meta: {
            title: '首页-CodeShare',
            permission: []
        },
        children: [
            {
                name: 'index',
                path: '/index',
                component: () => import('@/views/new/index.vue'),
                meta: {
                    keepAlive: true,
                    title: '新建-CodeShare',
                    permission: []
                }
            },
            {
                name: 'list',
                path: '/list',
                component: () => import('@/views/list/index.vue'),
                meta: {
                    needRecordIsBack: true,
                    isBack: false,
                    keepAlive: true,
                    title: '代码库-CodeShare',
                    permission: []
                }
            },
            {
                name: 'my',
                path: '/my',
                component: () => import('@/views/myCode/index.vue'),
                meta: {
                    needRecordIsBack: true,
                    isBack: false,
                    keepAlive: true,
                    title: '我的代码-CodeShare',
                    permission: []
                }
            },
            {
                name: 'favour',
                path: '/favour',
                component: () => import('@/views/favour/index.vue'),
                meta: {
                    needRecordIsBack: true,
                    isBack: false,
                    keepAlive: true,
                    title: '我的收藏-CodeShare',
                    permission: []
                }
            },
            {
                name: 'user',
                path: '/user',
                component: () => import('@/views/user/index.vue'),
                meta: {
                    title: '个人中心-CodeShare',
                    permission: []
                }
            },
            {
                name: 'detail',
                path: '/detail/:id',
                component: () => import('@/views/detail/detail.vue'),
                meta: {
                    keepAlive: true,
                    title: '详情',
                    permission: []
                }
            },
            {
                name: 'edit',
                path: '/edit/:id',
                component: () => import('@/views/detail/detail.vue'),
                meta: {
                    keepAlive: true,
                    title: '编辑',
                    permission: []
                }
            }
        ]
    },
    {
        name: 'login',
        path: '/login',
        component: () => import('@/views/login/index.vue'),
        meta: {
            title: '登录-CodeShare'
        }
    },
    {
        name: 'register',
        path: '/register',
        component: () => import('@/views/register/index.vue'),
        meta: {
            title: '注册-CodeShare',
            permission: []
        }
    }
];
const router = createRouter({
    history: createWebHistory(),
    routes: constantRoutes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0 };
        }
    }
});

router.beforeEach((to, from, next) => {
    const title = to.meta && to.meta.title;
    if (title) {
        document.title = title;
    }
    // 如果是详情页或者编辑页跳转来，且去往的页面需要记录isBack,则设置isBack为true
    if ((from.name == 'detail' || from.name == 'edit') && to.meta.needRecordIsBack == true) {
        to.meta.isBack = true;
    }
    // 如果从需要记录isBack的页面跳转到别的页面，就把isBack重置为false
    if (from.meta.needRecordIsBack == true) {
        from.meta.isBack = false;
    }
    // 跳转注册页
    if (to.path == '/register') {
        next();
        return;
    }
    // 判断是否登录
    if (to.path != '/login' && useUserStore().userInfo === null) {
        // 先获取用户信息
        isRelogin.show = true;
        getUserInfo()
            .then(res => {
                useUserStore().saveUser(res.data);
                next();
            })
            .catch(err => {
                next({
                    path: '/login',
                    query: {
                        redirectUrl: to.fullPath
                    }
                });
            })
            .finally(() => {
                isRelogin.show = false;
            });
        return;
    }
    next();
});
export default router;
