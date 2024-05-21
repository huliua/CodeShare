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
        children: [{
            name: 'index',
            path: '/index',
            component: () => import("@/views/new/index.vue"),
            meta: {
                title: '新建-CodeShare',
                permission: []
            }
        }, {
            name: 'list',
            path: '/list',
            component: () => import("@/views/list/index.vue"),
            meta: {
                title: '代码库-CodeShare',
                permission: []
            }
        }, {
            name: 'my',
            path: '/my',
            component: () => import("@/views/my/index.vue"),
            meta: {
                title: '我的代码-CodeShare',
                permission: []
            }
        }, {
            name: 'favour',
            path: '/favour',
            component: () => import("@/views/favour/index.vue"),
            meta: {
                title: '我的收藏-CodeShare',
                permission: []
            }
        }, {
            name: 'user',
            path: '/user',
            component: () => import("@/views/user/index.vue"),
            meta: {
                title: '个人中心-CodeShare',
                permission: []
            }
        }]
    },
    {
        name: 'login',
        path: '/login',
        component: () => import('@/views/login/index.vue'),
        meta: {
            title: '登录-CodeShare'
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
    // 判断是否登录
    if (to.path != "/login" && useUserStore().userInfo === null) {
        // 先获取用户信息
        isRelogin.show = true;
        getUserInfo().then(res => {
            useUserStore().saveUser(res.data);
            next();
        }).catch(err => {
            next({
                path: '/login',
                query: {
                    redirectUrl: to.fullPath
                }
            });
        }).finally(() => {
            isRelogin.show = false;
        });
        return;
    }
    next();
});
export default router;
