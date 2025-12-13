<script setup>
const listSearch = useState('listSearch')

// 根据 ID 获取图标索引，确保同一个项目始终显示相同的图标
const getIconIndex = (item) => {
  if (!item) return 0
  const id = item.id || 0
  const num = typeof id === 'number' ? id : String(id).charCodeAt(0)
  return num % 24
}
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
            <div
              class="api-card__icon"
              :class="'icon-style-' + getIconIndex(item)"
            >
              <!-- Icon 0: API/Code (Blue) -->
              <svg
                v-if="getIconIndex(item) === 0"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M8.7 13.3a1 1 0 0 1-1.4 1.4l-4-4a1 1 0 0 1 0-1.4l4-4a1 1 0 1 1 1.4 1.4L5.4 10l3.3 3.3zm6.6 0l3.3-3.3-3.3-3.3a1 1 0 1 1 1.4-1.4l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-1.4-1.4zm-2.1 2.9a1 1 0 0 1-1.9-.6l3-10a1 1 0 1 1 1.9.6l-3 10z"
                />
              </svg>
              <!-- Icon 1: Data/Cube (Green) -->
              <svg
                v-if="getIconIndex(item) === 1"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M12 2l-9.5 5.5 9.5 5.5 9.5-5.5L12 2zm0 2.8l6 3.5-6 3.5-6-3.5 6-3.5zM2.5 9v5.5L12 20l9.5-5.5V9L12 14.5 2.5 9zm9.5 9.2l-7.7-4.4v-3l7.7 4.4 7.7-4.4v3L12 18.2z"
                />
              </svg>
              <!-- Icon 2: Cloud/Server (Orange) -->
              <svg
                v-if="getIconIndex(item) === 2"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M12 2a8 8 0 0 0-7.9 7 6 6 0 0 0-1.1 11.9 4 4 0 0 0 1 0h12a5 5 0 0 0 0-10 8 8 0 0 0-4-6.9zm0 2a6 6 0 0 1 5.9 5.1 1 1 0 0 0 .9.8 3 3 0 0 1 0 6H4a4 4 0 0 1-1.1-7.8 1 1 0 0 0 .9-.6 6 6 0 0 1 8.2-3.5z"
                />
              </svg>
              <!-- Icon 3: Tool/Settings (Purple/Grey) -->
              <svg
                v-if="getIconIndex(item) === 3"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M19.4 12.6l.8 2.3-2.4.9-.7-2.2a6 6 0 0 0-2.3 0l-.7 2.2-2.4-.9.8-2.3a6 6 0 0 0-1.8-1.8l-2.3.8-.9-2.4 2.2-.7a6 6 0 0 0 0-2.3l-2.2-.7.9-2.4 2.3.8a6 6 0 0 0 1.8-1.8l-.8-2.3 2.4-.9.7 2.2a6 6 0 0 0 2.3 0l.7-2.2 2.4.9-.8 2.3a6 6 0 0 0 1.8 1.8l2.3-.8.9 2.4-2.2.7a6 6 0 0 0 0 2.3l2.2.7-.9 2.4-2.3-.8a6 6 0 0 0-1.8 1.8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
                />
              </svg>
              <!-- Icon 4: Security/Lock (Red/Pink) -->
              <svg
                v-if="getIconIndex(item) === 4"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v3H9V7zm3 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
                />
              </svg>
              <!-- Icon 5: Analytics/Chart (Indigo/Purple) -->
              <svg
                v-if="getIconIndex(item) === 5"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M3 3v18h18v-2H5V3H3zm4 10v4h2v-4H7zm4-6v10h2V7h-2zm4 3v7h2v-7h-2zm4-5v12h2V5h-2z"
                />
              </svg>
              <!-- Icon 6: AI/Robot (Cyan) -->
              <svg
                v-if="getIconIndex(item) === 6"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A1.5 1.5 0 0 0 6 14.5 1.5 1.5 0 0 0 7.5 16 1.5 1.5 0 0 0 9 14.5 1.5 1.5 0 0 0 7.5 13m9 0a1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5 1.5 1.5 0 0 0-1.5-1.5"
                />
              </svg>
              <!-- Icon 7: Mobile/Device (Teal) -->
              <svg
                v-if="getIconIndex(item) === 7"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"
                />
              </svg>
              <!-- Icon 8: Globe/Web (No Background) -->
              <svg
                v-if="getIconIndex(item) === 8"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                />
              </svg>
              <!-- Icon 9: User/Account (Orange/Red) -->
              <svg
                v-if="getIconIndex(item) === 9"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
              <!-- Icon 10: Star/Favorite (Yellow) -->
              <svg
                v-if="getIconIndex(item) === 10"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                />
              </svg>
              <!-- Icon 11: Bolt/Energy (Electric Blue) -->
              <svg
                v-if="getIconIndex(item) === 11"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"
                />
              </svg>
              <!-- Icon 12: Database/Storage (Cyan) -->
              <svg
                v-if="getIconIndex(item) === 12"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 4.24 2 7v10c0 2.76 4.48 5 10 5s10-2.24 10-5V7c0-2.76-4.48-5-10-5zm0 2c3.87 0 7 1.34 7 3s-3.13 3-7 3-7-1.34-7-3 3.13-3 7-3zm0 16c-3.87 0-7-1.34-7-3v-2.1c1.65 1.25 4.2 2.1 7 2.1s5.35-.85 7-2.1V17c0 1.66-3.13 3-7 3zm0-5c-3.87 0-7-1.34-7-3v-2.1c1.65 1.25 4.2 2.1 7 2.1s5.35-.85 7-2.1V12c0 1.66-3.13 3-7 3z"
                />
              </svg>
              <!-- Icon 13: Terminal/Code (Blue Grey) -->
              <svg
                v-if="getIconIndex(item) === 13"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM7.5 15l4.5-4.5L7.5 6v9zM12 15h6v-2h-6v2z"
                />
              </svg>
              <!-- Icon 14: Folder/File (Amber) -->
              <svg
                v-if="getIconIndex(item) === 14"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
                />
              </svg>
              <!-- Icon 15: Link/Connection (Purple) -->
              <svg
                v-if="getIconIndex(item) === 15"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
                />
              </svg>
              <!-- Icon 16: Bug/Issue (Red) -->
              <svg
                v-if="getIconIndex(item) === 16"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M19 8h-1.81a6 6 0 0 0-1.82-3.6l1.64-1.63L15.6 1.36 13.5 3.5C13.01 3.33 12.51 3.25 12 3.25c-3.19 0-5.83 2.5-6.09 5.64l-1.64-1.64L2.85 8.65l1.82 1.82A6 6 0 0 0 4 14c0 3.31 2.69 6 6 6h2v-2h-2a4 4 0 0 1-4-4c0-1.55.91-2.91 2.26-3.6l.85-.43L9.67 9.5l1.41-1.41-.6-1.1c.21-.08.43-.13.65-.17V7h2.24c1.55.3 2.8 1.48 3.21 2.97l.18.66.66.17A4 4 0 0 1 14 14h2c0-3.31-2.69-6-6-6v-1.1c.51 0 1.01.08 1.5.25l2.1-2.1 1.41 1.41-1.64 1.63A6 6 0 0 0 17.19 8H19v2h-2v-2z"
                />
                <circle cx="14" cy="16" r="2" fill="currentColor" />
                <circle cx="10" cy="16" r="2" fill="currentColor" />
              </svg>
              <!-- Icon 17: Lightbulb/Idea (Orange) -->
              <svg
                v-if="getIconIndex(item) === 17"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"
                />
              </svg>
              <!-- Icon 18: Notification/Bell (Deep Orange) -->
              <svg
                v-if="getIconIndex(item) === 18"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"
                />
              </svg>
              <!-- Icon 19: Time/Clock (Blue) -->
              <svg
                v-if="getIconIndex(item) === 19"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
                />
              </svg>
              <!-- Icon 20: Calendar/Date (Indigo) -->
              <svg
                v-if="getIconIndex(item) === 20"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
                />
              </svg>
              <!-- Icon 21: Search/Magnify (Green) -->
              <svg
                v-if="getIconIndex(item) === 21"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                />
              </svg>
              <!-- Icon 22: Home/House (Deep Purple) -->
              <svg
                v-if="getIconIndex(item) === 22"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
                />
              </svg>
              <!-- Icon 23: UserGroup/Team (Orange) -->
              <svg
                v-if="getIconIndex(item) === 23"
                viewBox="0 0 24 24"
                width="36"
                height="36"
              >
                <path
                  fill="currentColor"
                  d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
                />
              </svg>
            </div>
            <div class="api-card__content">
              <h2 class="api-card__title">{{ item.name }}</h2>
              <p class="api-card__desc">{{ item.description }}</p>
              <!-- 新增：费用与权限信息（文本标签） -->
              <div class="api-card__meta">
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
  display: flex;
  align-items: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #409eff;

    .api-card__icon {
      color: #409eff;
    }
  }

  &__icon {
    width: 48px;
    height: 48px;
    margin-right: 16px;
    flex-shrink: 0;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    /* 统一图标颜色为深灰色，hover时变蓝 */
    background: transparent;
    color: #606266;
    transition: color 0.2s ease;
  }

  &__content {
    flex: 1;
    min-width: 0;
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
    padding-right: 36px;
    line-height: 1.4;
  }

  /* 重新设计：右上角标签样式 */
  &__badge {
    position: absolute;
    top: 0;
    right: 0;
    padding: 4px 12px;
    border-bottom-left-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    z-index: 1;

    &.is-free {
      background: #f0f9eb; /* 浅绿色背景 */
      color: #67c23a; /* 绿色文本 */
    }

    &.is-paid {
      background: #fef0f0; /* 浅红色背景 */
      color: #f56c6c; /* 红色文本 */
    }
  }

  /* 新增：费用与权限信息（文本标签）样式 */
  &__meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }
  .meta-item {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 6px;
    background: #f4f4f5;
    color: #909399;
    font-weight: 400;
    line-height: 1.2;
    transition: all 0.2s ease;

    &.need-login {
      background: #ecf5ff;
      color: #409eff;
    }

    &.no-login {
      background: #f4f4f5;
      color: #909399;
    }
  }
  .meta-sep {
    color: #c0c4cc;
  }
  /* 移除原有的多色定义，仅保留统一灰色风格，或仅做微调 */
  .need-login {
    /* 需登录：使用橙色，起到警示/注意作用，与蓝绿区分 */
    background: #fdf6ec;
    color: #e6a23c;
  }
  .no-login {
    /* 无需登录：保持灰色，表示默认/无门槛 */
    background: #f4f4f5;
    color: #909399;
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
