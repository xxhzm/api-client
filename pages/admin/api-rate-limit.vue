<script setup>
import { Warning, Clock, Remove, Timer } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

// 限频规则信息
const loading = ref(false)
const limitInfo = ref({
  RequestLimit: '60',
  TimeFrame: '60',
  BlacklistDuration: '300',
})

// 验证输入为数字
const validateNumber = (field) => {
  // 移除非数字字符
  limitInfo.value[field] = limitInfo.value[field]
    .toString()
    .replace(/[^\d]/g, '')
  // 确保不为空
  if (limitInfo.value[field] === '') {
    limitInfo.value[field] = '0'
  }
}

// 获取限频规则
const getRateLimitSettings = async () => {
  loading.value = true

  try {
    const res = await $myFetch('GetRateLimitSettings', {
      method: 'GET',
    })

    if (res.code === 200 && res.data) {
      limitInfo.value = {
        RequestLimit: (res.data.request_limit || 60).toString(),
        TimeFrame: (res.data.time_frame || 60).toString(),
        BlacklistDuration: (res.data.blacklist_duration || 300).toString(),
      }
    } else {
      $msg('获取限频规则设置失败', 'error')
    }
  } catch (error) {
    $msg('获取限频规则设置失败', 'error')
  } finally {
    loading.value = false
  }
}

// 保存限频规则
const handleSaveLimit = async () => {
  if (!limitInfo.value.RequestLimit || limitInfo.value.RequestLimit === '0') {
    return $msg('请输入限制次数', 'warning')
  }

  if (!limitInfo.value.TimeFrame || limitInfo.value.TimeFrame === '0') {
    return $msg('请输入时间窗口', 'warning')
  }

  if (
    !limitInfo.value.BlacklistDuration ||
    limitInfo.value.BlacklistDuration === '0'
  ) {
    return $msg('请输入拉黑时长', 'warning')
  }

  loading.value = true

  try {
    // 准备请求参数
    const body = new URLSearchParams()

    body.append('requestLimit', limitInfo.value.RequestLimit)
    body.append('timeFrame', limitInfo.value.TimeFrame)
    body.append('blacklistDuration', limitInfo.value.BlacklistDuration)

    // 实际API调用
    const res = await $myFetch('UpdateRateLimitSettings', {
      method: 'POST',
      body,
    })

    if (res.code === 200) {
      $msg('保存设置成功', 'success')
    } else {
      $msg(res.msg || '保存设置失败', 'error')
    }
  } catch (error) {
    $msg('保存设置失败', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getRateLimitSettings()
})

useHead({
  title: '接口限频设置',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="ratelimit_container">
    <div class="cont">
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon"><Timer /></el-icon>
          <span class="title">接口限频设置</span>
        </div>
      </div>

      <div class="tip-description">
        设置全站API接口的访问频率限制，当用户请求频率超出限制时，系统将自动拉黑IP一段时间。
      </div>

      <el-form :model="limitInfo" label-position="top" v-loading="loading">
        <!-- 限制次数 -->
        <el-form-item label="限制次数">
          <el-input
            v-model="limitInfo.RequestLimit"
            placeholder="请输入单位时间内最大请求次数"
            class="custom-input"
            @input="validateNumber('RequestLimit')"
          >
            <template #prefix>
              <el-icon><Warning /></el-icon>
            </template>
          </el-input>
          <div class="preset-buttons">
            <span
              v-for="count in [20, 50, 100, 200]"
              :key="count"
              class="preset-button"
              :class="{ active: Number(limitInfo.RequestLimit) === count }"
              @click="limitInfo.RequestLimit = count"
            >
              {{ count }}
            </span>
          </div>
          <div class="item-tip">在指定时间窗口内允许的最大请求次数</div>
        </el-form-item>

        <!-- 时间窗口 -->
        <el-form-item label="时间窗口">
          <el-input
            v-model="limitInfo.TimeFrame"
            placeholder="请输入时间窗口(秒)"
            class="custom-input"
            @input="validateNumber('TimeFrame')"
          >
            <template #prefix>
              <el-icon><Clock /></el-icon>
            </template>
            <template #suffix>
              <span class="input-suffix">秒</span>
            </template>
          </el-input>
          <div class="preset-buttons">
            <span
              v-for="(time, label) in {
                '1分钟': 60,
                '5分钟': 300,
                '1小时': 3600,
                '1天': 86400,
              }"
              :key="time"
              class="preset-button"
              :class="{ active: Number(limitInfo.TimeFrame) === time }"
              @click="limitInfo.TimeFrame = time"
            >
              {{ label }}
            </span>
          </div>
          <div class="item-tip">计算请求频率的时间窗口长度</div>
        </el-form-item>

        <!-- 拉黑时长 -->
        <el-form-item label="拉黑时长">
          <el-input
            v-model="limitInfo.BlacklistDuration"
            placeholder="请输入拉黑时长(秒)"
            class="custom-input"
            @input="validateNumber('BlacklistDuration')"
          >
            <template #prefix>
              <el-icon><Remove /></el-icon>
            </template>
            <template #suffix>
              <span class="input-suffix">秒</span>
            </template>
          </el-input>
          <div class="preset-buttons">
            <span
              v-for="(time, label) in {
                '5分钟': 300,
                '1小时': 3600,
                '1天': 86400,
                '7天': 604800,
              }"
              :key="time"
              class="preset-button"
              :class="{
                active: Number(limitInfo.BlacklistDuration) === time,
              }"
              @click="limitInfo.BlacklistDuration = time"
            >
              {{ label }}
            </span>
          </div>
          <div class="item-tip">超出限制后的拉黑时长</div>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSaveLimit" :loading="loading">
            保存设置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ratelimit_container {
  min-height: 100vh;
  padding: 10px;
  background-color: #f7f7f7;

  .cont {
    width: 100%;
    height: 100%;
    padding: 20px;
    background: #fff;
    box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
    border-radius: 8px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #edf1f7;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .icon {
          font-size: 20px;
          color: #4096ff;
        }

        .title {
          font-size: 16px;
          font-weight: 600;
          color: #2e3033;
        }
      }
    }

    .tip-description {
      color: #6b7280;
      margin-bottom: 24px;
      line-height: 1.5;
    }

    :deep(.el-form) {
      width: 60%;

      .el-form-item {
        margin-bottom: 18px;

        .el-form-item__label {
          font-weight: 500;
          padding-bottom: 8px;
          color: #303133;
          font-size: 14px;
          line-height: 1;
        }
      }
    }
  }
}

.custom-input {
  :deep(.el-input__wrapper) {
    padding: 0 12px;
    box-shadow: 0 0 0 1px #dcdfe6 inset;
    transition: all 0.2s;

    &:hover {
      box-shadow: 0 0 0 1px #c0c4cc inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 1px #409eff inset;
    }
  }

  :deep(.el-input__prefix) {
    color: #909399;
    margin-right: 8px;
  }

  .input-suffix {
    color: #909399;
    font-size: 14px;
  }
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;

  .preset-button {
    display: inline-block;
    padding: 3px 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    font-size: 13px;
    color: #606266;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
    border: 1px solid transparent;

    &:hover {
      background-color: #e6f1fc;
      color: #409eff;
    }

    &.active {
      background-color: #ecf5ff;
      color: #409eff;
      border-color: #d9ecff;
    }
  }
}

.item-tip {
  margin-top: 8px;
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

@media screen and (max-width: 1200px) {
  .ratelimit_container {
    .cont {
      :deep(.el-form) {
        width: 100%;
      }
    }
  }
}
</style>
