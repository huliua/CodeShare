import { defineStore } from 'pinia';
import { clearToken } from '@/utils/auth';
import { logout } from '@/api/auth';

export const useUserStore = defineStore('user', {
    state: () => {
        return {
            userInfo: null,
            roles: [],
            permissions: []
        };
    },
    actions: {
        saveUser(user) {
            this.roles = user.roles || [];
            this.permissions = user.permissions || [];
            delete user.roles;
            delete user.permissions;
            this.userInfo = user;
        },
        clearUser() {
            this.roles = [];
            this.permissions = [];
            this.userInfo = null;
            clearToken();
        },
        updateUser(user) {
            this.userInfo = user;
        },
        logout() {
            return new Promise(resolve => {
                logout()
                    .then(() => {
                        ElNotification({
                            title: 'Success',
                            message: '退出成功',
                            type: 'success'
                        });
                        this.clearUser();
                        resolve();
                    })
                    .catch(() => {
                        reject();
                    });
            });
        }
    }
});
