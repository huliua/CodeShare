module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: ['plugin:vue/vue3-recommended', 'plugin:prettier/recommended'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    plugins: ['vue', 'prettier'],
    rules: {
        'prettier/prettier': 'error'
    },
    overrides: [{
        "vue/multi-word-component-names":"off"
    }]
};
