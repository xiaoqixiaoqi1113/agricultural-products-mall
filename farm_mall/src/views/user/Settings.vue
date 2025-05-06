<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>账号设置</span>
            </div>
        </template>
        <el-form label-width="100px">
            <el-form-item label="头像">
                <el-upload class="avatar-uploader" action="#" :show-file-list="false">
                    <img v-if="false" src="" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
            </el-form-item>
            <el-form-item label="用户名">
                <el-input placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="手机号">
                <el-input placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="邮箱">
                <el-input placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="收货地址">
                <el-button type="primary" plain>管理收货地址</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="primary">保存修改</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<script setup>
    import { Plus } from '@element-plus/icons-vue';
</script>

<style scoped lang="scss">
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .avatar-uploader {
        :deep(.el-upload) {
            border: 1px dashed #d9d9d9;
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: var(--el-transition-duration-fast);

            &:hover {
                border-color: var(--el-color-primary);
            }
        }
    }

    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 100px;
        height: 100px;
        text-align: center;
        line-height: 100px;
    }

    .avatar {
        width: 100px;
        height: 100px;
        display: block;
    }
</style>
