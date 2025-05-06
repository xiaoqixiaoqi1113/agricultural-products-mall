<template>
    <router-view></router-view>
</template>

<script setup></script>

<style>
    html,
    body {
        margin: 0;
        padding: 0;
        height: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    #app {
        height: 100%;
    }

    /* 自定义主题色 */
    :root {
        --el-color-primary: #67c23a; /* 绿色主题，适合农产品商城 */
    }
</style>
