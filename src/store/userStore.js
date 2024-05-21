import { defineStore } from 'pinia';
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
            this.user = null;
            this.roles = [];
            this.permissions = [];
            this.clearToken();
        }
    }
});