<script setup>
const { $myFetch } = useNuxtApp()

const list = useState('list')
const listSearch = useState('listSearch')

const {
  data: { value: res },
} = await useAsyncData('List', () => $myFetch('List'))

list.value = res.data
listSearch.value = res.data
</script>

<template>
  <div class="apilist">
    <el-row :gutter="20">
      <el-col
        :xs="24"
        :sm="12"
        :md="12"
        :lg="6"
        :xl="6"
        v-for="item in listSearch"
        :key="item.id"
      >
        <nuxt-link :to="'/doc/' + item.alias" class="item">
          <div class="api-card">
            <div
              class="api-card__category"
              :class="{ 'is-top': item.category === '置顶' }"
            >
              {{ item.category }}
            </div>
            <div class="api-card__content">
              <h2 class="api-card__title">{{ item.name }}</h2>
              <p class="api-card__desc">{{ item.description }}</p>
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
  border-radius: 8px;
  height: 100px;
  padding: 16px;
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #1890ff;

    .api-card__category {
      background: #1890ff;
      color: #fff;

      &.is-top {
        background: #f56c6c;
      }
    }
  }

  &__category {
    position: absolute;
    right: -28px;
    top: 12px;
    background: #e6f7ff;
    color: #1890ff;
    padding: 4px 30px;
    font-size: 12px;
    transform: rotate(45deg);
    transition: all 0.3s ease;

    &.is-top {
      background: #fef0f0;
      color: #f56c6c;
    }
  }

  &__content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  &__title {
    font-size: 15px;
    font-weight: 500;
    color: #1f2f3d;
    margin: 0;
    padding-right: 40px;
  }

  &__desc {
    font-size: 12px;
    color: #606266;
    margin: 0;
    line-height: 1.5;
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
