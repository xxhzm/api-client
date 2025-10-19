<script setup>
const list = useState('list')
const listSearch = useState('listSearch')
</script>

<template>
  <div class="apilist">
    <el-row :gutter="20">
      <el-col
        :xs="24"
        :sm="12"
        :md="12"
        :lg="8"
        :xl="8"
        v-for="item in listSearch"
        :key="item.id"
      >
        <nuxt-link :to="'/doc/' + item.alias" class="item">
          <div class="api-card">
            <div class="api-card__content">
              <h2 class="api-card__title">{{ item.name }}</h2>
              <p class="api-card__desc">{{ item.description }}</p>
              <!-- 新增：费用与权限信息（文本标签） -->
              <div class="api-card__meta">
                <span
                  class="meta-item"
                  :class="item.isPaid ? 'is-paid' : 'is-free'"
                >
                  {{ item.isPaid ? '付费' : '免费' }}
                </span>
                <!-- <span class="meta-sep">·</span> -->
                <span
                  class="meta-item"
                  :class="item.key_state === '开启' ? 'need-login' : 'no-login'"
                >
                  {{ item.key_state === '开启' ? '需登录' : '无需登录' }}
                </span>
              </div>
            </div>
          </div>
        </nuxt-link>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="less" scoped>
.apilist {
  width: 100%;
  padding-bottom: 20px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  &__title {
    font-size: 20px;
    font-weight: 500;
    color: #1f2f3d;
    margin: 0;
  }
}

.feedback-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  color: #606266;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.3s ease;

  i {
    font-size: 14px;
  }

  &__arrow {
    font-size: 12px !important;
    margin-left: 2px;
    transition: transform 0.3s ease;
  }

  &:hover {
    color: #409eff;
    border-color: #409eff;
    background: #fff;

    .feedback-btn__arrow {
      transform: translateX(3px);
    }
  }
}

.item {
  display: block;
  text-decoration: none;
  margin-bottom: 20px;
}

.api-card {
  position: relative;
  background: #fff;
  border-radius: 12px;
  height: 120px;
  padding: 16px;
  transition: all 0.2s ease;
  border: 1px solid #ebeef5;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #409eff;
  }

  &__content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-top: 0;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2f3d;
    margin: 0;
    padding-right: 16px;
    line-height: 1.4;
  }

  /* 新增：费用与权限信息（文本标签）样式 */
  &__meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    font-size: 12px;
    color: #606266;
  }
  .meta-item {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 6px;
    border: 1px solid #e6e8eb;
    background: #f5f7fa;
    color: #606266;
    font-weight: 500;
    line-height: 1.2;
    transition: all 0.2s ease;
  }
  .meta-sep {
    color: #c0c4cc;
  }
  .is-paid {
    color: #c45656; /* danger text */
    background: #fef0f0; /* danger bg */
    border-color: #fbc4c4; /* danger border */
  }
  .is-free {
    color: #3e7b27; /* success text */
    background: #f0f9eb; /* success bg */
    border-color: #c2e7b0; /* success border */
  }
  .need-login {
    color: #b88230; /* warning text */
    background: #fdf6ec; /* warning bg */
    border-color: #f5dab1; /* warning border */
  }
  .no-login {
    color: #606266; /* info-muted text */
    background: #f4f4f5; /* info-muted bg */
    border-color: #e6e8eb; /* info-muted border */
  }

  &__desc {
    font-size: 13px;
    color: #606266;
    margin: 0;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

@media screen and (max-width: 768px) {
  .api-card {
    height: 90px;
    padding: 14px;

    &__title {
      font-size: 14px;
    }

    &__desc {
      font-size: 12px;
    }
  }
}
</style>
