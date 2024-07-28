<script setup>
// 获取url的路径参数

import { useRoute } from 'vue-router';
const route = useRoute();
const id = route.params.id;
</script>

<template>
    <h1>{{ route.meta.title }}</h1>
</template>

<style scoped></style>