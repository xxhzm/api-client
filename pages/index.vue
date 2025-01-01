<template>
  <div class="index-container">
    <IndexNotice></IndexNotice>
    <div class="container">
      <client-only>
        <div class="section">
          <h2 class="section-title">广告商</h2>
          <Ad></Ad>
        </div>

        <div class="section">
          <h2 class="section-title" style="margin-bottom: 10px;">系统信息</h2>
          <SystemInfo></SystemInfo>
        </div>
      </client-only>

      <div class="section">
        <div class="section-header">
          <h2 class="section-title">API搜索</h2>
        </div>
        <div class="search-box">
          <el-input
            v-model="search"
            placeholder="请输入搜寻的API关键词..."
            clearable
            class="search-box__input"
          >
            <template #suffix>
              <i class="el-icon-search"></i>
            </template>
          </el-input>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2 class="section-title">API列表</h2>
          <a href="https://jq.qq.com/?_wv=1027&k=92BF8Ndr" target="_blank" class="feedback-btn">
            <i class="el-icon-chat-dot-round"></i>
            <span>问题反馈</span>
            <i class="el-icon-right feedback-btn__arrow"></i>
          </a>
        </div>
        <IndexApiList></IndexApiList>
      </div>
    </div>
    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<script setup>
const { $myFetch } = useNuxtApp()

// 配置项
const options = ref({})

const {
  data: { value: res },
} = await useAsyncData('Options', () => $myFetch('Options'))

options.value = res.data

useHead({
  title: options.value.title + ' - ' + options.value.subheading,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    { name: 'description', content: options.value.description },
    { name: 'keywords', content: options.value.keywords },
  ],
})

// 添加搜索相关的数据和方法
const search = ref('')
const list = useState('list')
const listSearch = useState('listSearch')

watch(
  () => search.value,
  () => {
    listSearch.value = list.value.filter(
      (data) =>
        !search.value ||
        data.name.toLowerCase().includes(search.value.toLowerCase())
    )
  }
)
</script>

<style lang="less" scoped>
.index-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #f7f9fe, #ffffff);
  
  .container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .section {
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 0 4px;
  }

  .section-title {
    position: relative;
    color: #1f2f3d;
    font-size: 16px;
    font-weight: normal;
    margin: 0;
    padding-left: 12px;
    line-height: 1.4;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 16px;
      background: #409eff;
      border-radius: 3px;
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

  .search-box,
  .api-card,
  .system-info {
    margin-top: 4px;
  }

  .search-box {
    background: #fff;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

    &__input {
      :deep(.el-input__wrapper) {
        background: #f5f7fa;
        border-radius: 8px;
        box-shadow: none;
        transition: all 0.25s ease;

        &.is-focus {
          background: #fff;
          box-shadow: 0 0 0 1px #dcdfe6;
        }
      }

      :deep(.el-input__inner) {
        height: 40px;
        font-size: 14px;
        color: #606266;

        &::placeholder {
          color: #909399;
        }
      }

      :deep(.el-input__suffix) {
        color: #909399;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .index-container {
    .container {
      width: 95%;
    }

    .section-title {
      font-size: 15px;

      &::before {
        height: 14px;
      }
    }

    .search-box {
      padding: 12px 16px;
    }

    .section-header {
      margin-bottom: 16px;
    }
  }
}
</style>
