<script setup>
import { InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  message: {
    type: String,
    default: '请仔细检查信息后再提交',
  },
})
</script>

<template>
  <div class="submit-footer">
    <div class="footer-content">
      <div class="left-info">
        <el-icon><InfoFilled /></el-icon>
        <span>{{ props.message }}</span>
      </div>
      <div class="right-buttons">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.submit-footer {
  position: fixed;
  left: 220px;
  right: 0;
  bottom: 0;
  padding: 0 20px 20px;
  background: transparent;
  z-index: 999;
  pointer-events: none;

  .footer-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    padding: 14px 16px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    pointer-events: auto;
  }

  .left-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--el-text-color-secondary);
    font-size: 14px;

    .el-icon {
      color: var(--el-color-warning);
    }
  }

  .right-buttons {
    display: flex;
    gap: 12px;

    :deep(.el-button) {
      min-width: 96px;
      font-weight: 500;
    }
  }
}

@media screen and (max-width: 768px) {
  .submit-footer {
    left: 0;
    padding: 0 12px 12px;

    .footer-content {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .right-buttons {
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      flex-wrap: wrap;

      :deep(.el-button) {
        width: auto;
        margin-left: 0 !important;
      }
    }
  }
}
</style>
