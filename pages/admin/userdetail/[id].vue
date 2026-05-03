<script setup>
import { ArrowLeft, Refresh } from '@element-plus/icons-vue';

const { $msg, $myFetch, $decryptPhone } = useNuxtApp();

definePageMeta({
  layout: 'admin',
});

const route = useRoute();
const userId = computed(() => String(route.params.id || ''));

const loading = ref(false);
const userInfo = ref(null);
const editDialogVisible = ref(false);
const editLoading = ref(false);
const roleList = ref([]);
const bindRoleInfo = ref([]);
const userRoleRecords = ref([]);
const userRoleLoading = ref(false);
const editUserInfo = ref({
  id: '',
  username: '',
  password: '',
  mail: '',
  phone: '',
  balance: 0,
  status: '',
});

const rechargeRecords = ref([]);
const rechargeLoading = ref(false);
const rechargePage = ref(1);
const rechargePageSize = ref(10);
const rechargeTotalRecords = ref(0);

const buyPackageRecords = ref([]);
const buyPackageLoading = ref(false);
const buyPackagePage = ref(1);
const buyPackagePageSize = ref(10);
const buyPackageTotalRecords = ref(0);

const callRecords = ref([]);
const callRecordLoading = ref(false);
const callRecordPage = ref(1);
const callRecordPageSize = ref(25);
const callRecordMaxPage = ref(1);

const invoiceTitleRecords = ref([]);
const invoiceTitleLoading = ref(false);
const invoiceTitlePage = ref(1);
const invoiceTitlePageSize = ref(25);
const invoiceTitleTotalRecords = ref(0);

const userCallStats = ref({
  day1: 0,
  day3: 0,
  day7: 0,
  month1: 0,
});
const userTopApis = ref([]);

const cacheKey = computed(() => `admin-user-detail-${userId.value}`);

const goBack = () => {
  navigateTo('/admin/userlist');
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(Number(timestamp));
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const formatStatus = (status) => {
  if (status === '0' || status === 0 || status === '启用') return '启用';
  if (status === '1' || status === 1 || status === '停用') return '停用';
  return '-';
};

const normalizeUser = (user) => {
  if (!user) return null;

  const token = useCookie('token').value;
  const phone =
    user.__phoneDecrypted || !user.phone || !token
      ? user.phone
      : $decryptPhone(user.phone, token);

  return {
    ...user,
    __phoneDecrypted: undefined,
    phone: phone || '-',
    status: formatStatus(user.status),
    create_time: formatDateTime(user.create_time),
    login_time: formatDateTime(user.login_time),
  };
};

const decryptInvoiceTitleValue = (value, token) => {
  if (!value || !token) return value || '';

  try {
    return $decryptPhone(value, token) || '';
  } catch {
    return value || '';
  }
};

const mapInvoiceTitle = (item, token) => ({
  id: item.id,
  uid: item.uid,
  title: decryptInvoiceTitleValue(item.invoice_title, token),
  tax_id: decryptInvoiceTitleValue(item.tax_number, token),
  type: item.title_type === 'personal' ? '个人' : '企业',
  company_address: decryptInvoiceTitleValue(
    item.company_address || item.companyAddress,
    token,
  ),
  company_phone: decryptInvoiceTitleValue(
    item.company_phone || item.companyPhone,
    token,
  ),
  bank_name: decryptInvoiceTitleValue(item.bank_name, token),
  bank_account: decryptInvoiceTitleValue(item.bank_account, token),
  is_default: Boolean(item.is_default),
  create_time: formatTimestamp(item.create_time),
  update_time: formatTimestamp(item.update_time),
});

const loadCachedUser = () => {
  if (!import.meta.client || !userId.value) return;

  try {
    const cached = sessionStorage.getItem(cacheKey.value);
    if (!cached) return;

    const parsed = JSON.parse(cached);
    if (String(parsed.id) === userId.value) {
      userInfo.value = normalizeUser(parsed);
    }
  } catch (error) {
    sessionStorage.removeItem(cacheKey.value);
  }
};

const fetchUserInfo = async () => {
  if (!userId.value) return;

  try {
    const res = await $myFetch('UserList', {
      params: {
        page: 1,
        limit: 10,
        keyword: userId.value,
        id: userId.value,
      },
    });

    if (res.code !== 200) {
      $msg(res.msg || '获取用户信息失败', 'error');
      return;
    }

    const userList = res.data?.userList || [];
    const exactUser = userList.find((item) => String(item.id) === userId.value);

    if (exactUser) {
      userInfo.value = normalizeUser(exactUser);
      return;
    }

    if (!userInfo.value) {
      $msg('未找到用户基础信息', 'warning');
    }
  } catch (error) {
    $msg('获取用户信息失败', 'error');
  }
};

const fetchUserRoles = async () => {
  userRoleLoading.value = true;
  try {
    const res = await $myFetch('UserBindRoleList', {
      params: {
        id: userId.value,
      },
    });

    if (res.code === 200) {
      userRoleRecords.value =
        typeof res.data === 'string' ? [] : res.data || [];
    } else {
      $msg(res.msg || '获取用户角色失败', 'error');
    }
  } catch (error) {
    $msg('获取用户角色失败', 'error');
  } finally {
    userRoleLoading.value = false;
  }
};

const openEditDialog = async () => {
  if (!userInfo.value) {
    $msg('用户信息未加载完成', 'warning');
    return;
  }

  editUserInfo.value = {
    id: userInfo.value.id || userId.value,
    username: userInfo.value.username || '',
    password: '',
    mail: userInfo.value.mail || '',
    phone: userInfo.value.phone === '-' ? '' : userInfo.value.phone || '',
    balance: userInfo.value.balance || 0,
    status: userInfo.value.status || '启用',
  };
  bindRoleInfo.value = [];
  editDialogVisible.value = true;

  try {
    const res = await $myFetch('RoleList');
    roleList.value = res.data || [];
  } catch (error) {
    roleList.value = [];
    $msg('获取角色列表失败', 'error');
  }
};

const updateUser = async () => {
  if (!editUserInfo.value.username || !editUserInfo.value.mail) {
    $msg('请填写内容', 'error');
    return;
  }

  const balance = Number(editUserInfo.value.balance);
  if (Number.isNaN(balance)) {
    $msg('余额格式不正确', 'error');
    return;
  }

  if (balance > 4294967295) {
    $msg('余额过大，超出限制', 'error');
    return;
  }

  if (balance < 0) {
    $msg('余额不能小于0', 'error');
    return;
  }

  editLoading.value = true;
  try {
    if (bindRoleInfo.value.length > 0) {
      const roleRes = await $myFetch('UserBindRole', {
        params: {
          info: JSON.stringify(bindRoleInfo.value),
          userId: editUserInfo.value.id,
        },
      });
      if (roleRes.code !== 200) {
        $msg(roleRes.msg, 'error');
      }
    }

    const apiBodyValue = new URLSearchParams();
    apiBodyValue.append('id', editUserInfo.value.id);
    if (editUserInfo.value.password) {
      apiBodyValue.append('password', editUserInfo.value.password);
    }
    apiBodyValue.append('mail', editUserInfo.value.mail);
    if (editUserInfo.value.phone && editUserInfo.value.phone.trim() !== '') {
      apiBodyValue.append('phone', editUserInfo.value.phone.trim());
    }
    apiBodyValue.append('balance', String(balance));
    apiBodyValue.append('status', editUserInfo.value.status);

    const res = await $myFetch('UpdateUser', {
      method: 'POST',
      body: apiBodyValue,
    });

    if (res.code === 200) {
      $msg(res.msg, 'success');
      editDialogVisible.value = false;
      await fetchUserInfo();
    } else {
      $msg(res.msg, 'error');
    }
  } catch (error) {
    $msg('修改用户失败', 'error');
  } finally {
    editLoading.value = false;
  }
};

const deleteUser = async () => {
  loading.value = true;
  try {
    const res = await $myFetch('DeleteUser', {
      params: {
        id: userId.value,
      },
    });

    if (res.code === 200) {
      $msg(res.msg, 'success');
      navigateTo('/admin/userlist');
    } else {
      $msg(res.msg, 'error');
    }
  } catch (error) {
    $msg('删除用户失败', 'error');
  } finally {
    loading.value = false;
  }
};

const fetchUserRechargeRecords = async () => {
  rechargeLoading.value = true;
  try {
    const res = await $myFetch('GetRechargeRecords', {
      params: {
        page: rechargePage.value,
        limit: rechargePageSize.value,
        uid: userId.value,
      },
    });

    if (res.code === 200) {
      rechargeRecords.value = res.data?.data || [];
      rechargeTotalRecords.value = res.data?.total_records || 0;
    } else {
      $msg(res.msg || '获取充值记录失败', 'error');
    }
  } catch (error) {
    $msg('获取充值记录失败', 'error');
  } finally {
    rechargeLoading.value = false;
  }
};

const formatAction = (action) => {
  switch (Number(action)) {
    case 1:
      return '购买';
    case 2:
      return '续费';
    case 3:
      return '自动续费';
    case 4:
      return '赠送';
    default:
      return '-';
  }
};

const actionTagType = (action) => {
  switch (Number(action)) {
    case 1:
      return 'success';
    case 2:
      return 'warning';
    case 3:
      return 'info';
    case 4:
      return 'primary';
    default:
      return '';
  }
};

const formatTypeLabel = (type) => {
  const t = Number(type);
  if (t === 4) return '直接扣费';
  if (t === 2) return '包月';
  if (t === 3) return '点数';
  return '-';
};

const fetchUserBuyPackageRecords = async () => {
  buyPackageLoading.value = true;
  try {
    const res = await $myFetch('GetBuyPackageRecords', {
      params: {
        page: buyPackagePage.value,
        limit: buyPackagePageSize.value,
        uid: userId.value,
      },
    });

    if (res.code === 200) {
      buyPackageRecords.value = res.data?.data || [];
      buyPackageTotalRecords.value = res.data?.total_records || 0;
    } else {
      $msg(res.msg || '获取购买记录失败', 'error');
    }
  } catch (error) {
    $msg('获取购买记录失败', 'error');
  } finally {
    buyPackageLoading.value = false;
  }
};

const formatPath = (url = '') => {
  const parts = url.split(' ');
  const path = parts[1]?.split('clientIP=')[0] || '';
  return path.replace(/[?&]$/, '');
};

const applyCallData = (data = {}) => {
  const callStat = data.call_stat || {};
  userCallStats.value = {
    day1: callStat.day_1 || 0,
    day3: callStat.day_3 || 0,
    day7: callStat.day_7 || 0,
    month1: callStat.day_30 || 0,
  };

  const topList = Array.isArray(data.top_apis) ? data.top_apis : [];
  const max = topList.length > 0 ? topList[0].count : 0;
  userTopApis.value = topList.slice(0, 5).map((item) => ({
    name: item.name,
    count: item.count,
    percentage: max > 0 ? Math.round((item.count / max) * 100) : 0,
  }));

  callRecords.value = (data.logs || []).map((item, index) => ({
    ...item,
    key: index + 1,
    timestamp: formatDateTime(item.timestamp),
    method: item.url?.split(' ')[0] || '',
    path: formatPath(item.url),
  }));
  callRecordMaxPage.value = data.max_page_count || 1;
};

const fetchUserCallRecords = async () => {
  callRecordLoading.value = true;
  try {
    const res = await $myFetch('ApiLogList', {
      params: {
        page: callRecordPage.value,
        size: callRecordPageSize.value,
        uid: userId.value,
      },
    });

    if (res.code === 200) {
      applyCallData(res.data);
    }
  } catch (error) {
    $msg('获取调用记录失败', 'error');
  } finally {
    callRecordLoading.value = false;
  }
};

const fetchUserInvoiceTitles = async () => {
  invoiceTitleLoading.value = true;
  try {
    const res = await $myFetch('AdminInvoiceTitleList', {
      params: {
        page: invoiceTitlePage.value,
        limit: invoiceTitlePageSize.value,
        uid: userId.value,
      },
    });

    if (res.code === 200) {
      const token = useCookie('token').value;
      invoiceTitleRecords.value = (res.data?.list || []).map((item) =>
        mapInvoiceTitle(item, token),
      );
      invoiceTitleTotalRecords.value = res.data?.totalRecords || 0;
    } else {
      $msg(res.msg || '获取发票抬头失败', 'error');
    }
  } catch (error) {
    $msg('获取发票抬头失败', 'error');
  } finally {
    invoiceTitleLoading.value = false;
  }
};

const refreshAll = async () => {
  loading.value = true;
  try {
    await Promise.all([
      fetchUserInfo(),
      fetchUserRoles(),
      fetchUserRechargeRecords(),
      fetchUserBuyPackageRecords(),
      fetchUserCallRecords(),
      fetchUserInvoiceTitles(),
    ]);
  } finally {
    loading.value = false;
  }
};

const handleRechargePageChange = (newPage) => {
  rechargePage.value = newPage;
  fetchUserRechargeRecords();
};

const handleRechargeSizeChange = (newSize) => {
  rechargePageSize.value = newSize;
  rechargePage.value = 1;
  fetchUserRechargeRecords();
};

const handleBuyPackagePageChange = (newPage) => {
  buyPackagePage.value = newPage;
  fetchUserBuyPackageRecords();
};

const handleBuyPackageSizeChange = (newSize) => {
  buyPackagePageSize.value = newSize;
  buyPackagePage.value = 1;
  fetchUserBuyPackageRecords();
};

const handleCallRecordPageChange = (newPage) => {
  callRecordPage.value = newPage;
  fetchUserCallRecords();
};

const handleCallRecordSizeChange = (newSize) => {
  callRecordPageSize.value = newSize;
  callRecordPage.value = 1;
  fetchUserCallRecords();
};

const handleInvoiceTitlePageChange = (newPage) => {
  invoiceTitlePage.value = newPage;
  fetchUserInvoiceTitles();
};

const handleInvoiceTitleSizeChange = (newSize) => {
  invoiceTitlePageSize.value = newSize;
  invoiceTitlePage.value = 1;
  fetchUserInvoiceTitles();
};

onMounted(async () => {
  if (!userId.value) {
    $msg('缺少用户ID', 'error');
    goBack();
    return;
  }

  loadCachedUser();
  await refreshAll();
});

useHead({
  title: '用户详情',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
});
</script>

<template>
  <div class="user-detail-page" v-loading="loading">
    <div class="detail-card">
      <div class="page-header">
        <div class="page-header-left">
          <el-button :icon="ArrowLeft" class="back-button" @click="goBack">
            返回
          </el-button>
        </div>
        <div class="page-header-actions">
          <el-button :icon="Refresh" type="primary" plain @click="refreshAll">
            刷新
          </el-button>
          <el-button type="primary" @click="openEditDialog">编辑用户</el-button>
          <el-popconfirm
            confirm-button-text="确定"
            cancel-button-text="取消"
            title="确定要删除该用户吗？"
            @confirm="deleteUser"
          >
            <template #reference>
              <el-button type="danger">删除用户</el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>

      <div class="profile-header">
        <div class="avatar">
          {{ userInfo?.username?.slice(0, 1)?.toUpperCase() || 'U' }}
        </div>
        <div class="profile-main">
          <div class="profile-title">
            <span>{{ userInfo?.username || `用户 #${userId}` }}</span>
            <el-tag
              :type="userInfo?.status === '启用' ? 'success' : 'danger'"
              size="small"
            >
              {{ userInfo?.status || '-' }}
            </el-tag>
          </div>
          <div class="profile-subtitle">
            {{ userInfo?.mail || '-' }}
          </div>
        </div>
        <div class="balance-card">
          <span class="balance-label">账户余额</span>
          <span class="balance-value">{{ userInfo?.balance ?? '-' }}</span>
        </div>
      </div>

      <section class="detail-section">
        <div class="section-title">基础信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">用户ID</span>
            <span class="value">#{{ userInfo?.id || userId }}</span>
          </div>
          <div class="info-item">
            <span class="label">用户名</span>
            <span class="value">{{ userInfo?.username || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">邮箱</span>
            <span class="value">{{ userInfo?.mail || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">手机号</span>
            <span class="value">{{ userInfo?.phone || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">IP</span>
            <span class="value">{{ userInfo?.ip || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Key</span>
            <span class="value">{{ userInfo?.key || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">注册时间</span>
            <span class="value">{{ userInfo?.create_time || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">上次登录</span>
            <span class="value">{{ userInfo?.login_time || '-' }}</span>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <div class="section-title">调用概览</div>
        <el-row :gutter="16">
          <el-col :xs="12" :sm="6">
            <div class="stat-card">
              <span>近1天调用</span>
              <strong>{{ userCallStats.day1 }}</strong>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-card">
              <span>近3天调用</span>
              <strong>{{ userCallStats.day3 }}</strong>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-card">
              <span>近7天调用</span>
              <strong>{{ userCallStats.day7 }}</strong>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-card">
              <span>近30天调用</span>
              <strong>{{ userCallStats.month1 }}</strong>
            </div>
          </el-col>
        </el-row>

        <div class="top-api-list" v-if="userTopApis.length > 0">
          <div
            v-for="(api, index) in userTopApis"
            :key="`${api.name}-${index}`"
            class="top-api-item"
          >
            <div class="api-info">
              <span>{{ api.name }}</span>
              <span>{{ api.count }}次</span>
            </div>
            <el-progress
              :percentage="api.percentage"
              :show-text="false"
              :stroke-width="8"
            />
          </div>
        </div>
      </section>

      <section class="detail-section">
        <client-only>
          <el-tabs>
            <el-tab-pane label="用户角色">
              <div v-loading="userRoleLoading">
                <el-table
                  :data="userRoleRecords"
                  style="width: 100%"
                  empty-text="暂无用户角色"
                >
                  <el-table-column prop="role_id" label="ID" width="100" />
                  <el-table-column
                    prop="role_name"
                    label="角色名称"
                    min-width="160"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="description"
                    label="描述"
                    min-width="240"
                    show-overflow-tooltip
                  />
                </el-table>
              </div>
            </el-tab-pane>

            <el-tab-pane label="充值记录">
              <div v-loading="rechargeLoading">
                <el-table
                  :data="rechargeRecords"
                  style="width: 100%"
                  empty-text="暂无充值记录"
                >
                  <el-table-column prop="id" label="ID" min-width="180" />
                  <el-table-column prop="amount" label="充值金额" width="120">
                    <template #default="scope">
                      <span class="amount">¥{{ scope.row.amount }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="method" label="支付方式" width="120">
                    <template #default="scope">
                      <el-tag
                        :type="
                          scope.row.method === 'alipay' ? 'primary' : 'success'
                        "
                        size="small"
                      >
                        {{ scope.row.method === 'alipay' ? '支付宝' : '微信' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                      <el-tag
                        :type="scope.row.status === '2' ? 'success' : 'warning'"
                        size="small"
                      >
                        {{ scope.row.status === '2' ? '已支付' : '未支付' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="创建时间" min-width="180">
                    <template #default="scope">
                      {{ formatTimestamp(scope.row.create_time) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="支付时间" min-width="180">
                    <template #default="scope">
                      {{
                        scope.row.pay_time && scope.row.pay_time !== 0
                          ? formatTimestamp(scope.row.pay_time)
                          : '-'
                      }}
                    </template>
                  </el-table-column>
                </el-table>

                <div class="pagination">
                  <el-pagination
                    v-model:page-size="rechargePageSize"
                    v-model:current-page="rechargePage"
                    :page-sizes="[10, 20, 30, 50]"
                    :pager-count="5"
                    :total="rechargeTotalRecords"
                    :disabled="rechargeLoading"
                    background
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleRechargePageChange"
                    @size-change="handleRechargeSizeChange"
                  />
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="购买记录">
              <div v-loading="buyPackageLoading">
                <el-table
                  :data="buyPackageRecords"
                  style="width: 100%"
                  empty-text="暂无购买记录"
                >
                  <el-table-column prop="id" label="ID" min-width="100" />
                  <el-table-column prop="aid" label="接口ID" min-width="100" />
                  <el-table-column
                    prop="package_name"
                    label="套餐名称"
                    min-width="150"
                    show-overflow-tooltip
                  />
                  <el-table-column prop="price" label="金额" width="100">
                    <template #default="scope">
                      <span class="amount">¥{{ scope.row.price }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="type" label="套餐类型" width="120">
                    <template #default="scope">
                      <el-tag
                        :type="
                          Number(scope.row.type) === 2 ? 'primary' : 'success'
                        "
                        size="small"
                      >
                        {{ formatTypeLabel(scope.row.type) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="action" label="操作类型" width="120">
                    <template #default="scope">
                      <el-tag
                        :type="actionTagType(scope.row.action)"
                        size="small"
                      >
                        {{ formatAction(scope.row.action) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="points" label="点数" width="100" />
                  <el-table-column label="创建时间" min-width="180">
                    <template #default="scope">
                      {{ formatTimestamp(scope.row.create_time) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="过期时间" min-width="180">
                    <template #default="scope">
                      {{ formatTimestamp(scope.row.expire_after) }}
                    </template>
                  </el-table-column>
                </el-table>

                <div class="pagination">
                  <el-pagination
                    v-model:page-size="buyPackagePageSize"
                    v-model:current-page="buyPackagePage"
                    :page-sizes="[10, 20, 30, 50]"
                    :pager-count="5"
                    :total="buyPackageTotalRecords"
                    :disabled="buyPackageLoading"
                    background
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleBuyPackagePageChange"
                    @size-change="handleBuyPackageSizeChange"
                  />
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="调用记录">
              <div v-loading="callRecordLoading">
                <el-table
                  :data="callRecords"
                  style="width: 100%"
                  height="520"
                  empty-text="暂无调用记录"
                >
                  <el-table-column prop="key" label="序号" width="70" />
                  <el-table-column
                    prop="id"
                    label="请求ID"
                    min-width="180"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="alias"
                    label="接口名称"
                    width="120"
                    show-overflow-tooltip
                  />
                  <el-table-column prop="method" label="请求方法" width="90">
                    <template #default="scope">
                      <el-tag
                        :type="
                          scope.row.method === 'GET' ? 'success' : 'warning'
                        "
                        size="small"
                      >
                        {{ scope.row.method }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="path"
                    label="请求路径"
                    min-width="200"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="response_time"
                    label="响应时间"
                    width="90"
                  />
                  <el-table-column prop="status_code" label="状态码" width="80">
                    <template #default="scope">
                      <el-tag
                        :type="
                          scope.row.status_code === 200
                            ? 'success'
                            : scope.row.status_code === 302 ||
                                scope.row.status_code === 301
                              ? 'primary'
                              : 'danger'
                        "
                        size="small"
                      >
                        {{ scope.row.status_code }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="client_ip" label="IP" width="140" />
                  <el-table-column
                    prop="address"
                    label="归属地"
                    width="130"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="timestamp"
                    label="请求时间"
                    width="180"
                  />
                </el-table>

                <div class="pagination">
                  <el-pagination
                    v-model:page-size="callRecordPageSize"
                    v-model:current-page="callRecordPage"
                    :page-sizes="[10, 25, 50, 100]"
                    :pager-count="5"
                    :page-count="callRecordMaxPage"
                    :disabled="callRecordLoading"
                    background
                    layout="sizes, prev, pager, next, jumper"
                    @current-change="handleCallRecordPageChange"
                    @size-change="handleCallRecordSizeChange"
                  />
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="发票抬头">
              <div v-loading="invoiceTitleLoading">
                <el-table
                  :data="invoiceTitleRecords"
                  style="width: 100%"
                  empty-text="暂无发票抬头"
                >
                  <el-table-column prop="id" label="ID" width="80" />
                  <el-table-column
                    prop="title"
                    label="抬头名称"
                    min-width="180"
                  >
                    <template #default="scope">
                      <div class="invoice-title-name">
                        <span>{{ scope.row.title || '-' }}</span>
                        <el-tag
                          v-if="scope.row.is_default"
                          type="warning"
                          size="small"
                        >
                          默认
                        </el-tag>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="type" label="类型" width="90">
                    <template #default="scope">
                      <el-tag
                        :type="
                          scope.row.type === '个人' ? 'success' : 'primary'
                        "
                        size="small"
                      >
                        {{ scope.row.type }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="tax_id"
                    label="纳税人识别号"
                    min-width="180"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="company_address"
                    label="企业地址"
                    min-width="180"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="company_phone"
                    label="企业电话"
                    min-width="140"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="bank_name"
                    label="开户银行"
                    min-width="160"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="bank_account"
                    label="银行账号"
                    min-width="180"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="create_time"
                    label="创建时间"
                    width="180"
                  />
                  <el-table-column
                    prop="update_time"
                    label="更新时间"
                    width="180"
                  />
                </el-table>

                <div class="pagination">
                  <el-pagination
                    v-model:page-size="invoiceTitlePageSize"
                    v-model:current-page="invoiceTitlePage"
                    :page-sizes="[10, 25, 50, 100]"
                    :pager-count="5"
                    :total="invoiceTitleTotalRecords"
                    :disabled="invoiceTitleLoading"
                    background
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleInvoiceTitlePageChange"
                    @size-change="handleInvoiceTitleSizeChange"
                  />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </client-only>
      </section>

      <el-dialog
        v-model="editDialogVisible"
        title="编辑用户"
        width="500px"
        destroy-on-close
      >
        <el-form :model="editUserInfo" label-width="90px">
          <el-form-item label="用户名称" required>
            <el-input
              v-model="editUserInfo.username"
              disabled
              placeholder="请输入用户名称"
            />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="editUserInfo.password"
              type="password"
              show-password
              placeholder="留空则不修改密码"
            />
          </el-form-item>
          <el-form-item label="邮箱地址" required>
            <el-input
              v-model="editUserInfo.mail"
              placeholder="请输入邮箱地址"
            />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input
              v-model="editUserInfo.phone"
              placeholder="留空则不修改当前手机号"
            />
          </el-form-item>
          <el-form-item label="账户余额">
            <el-input
              v-model="editUserInfo.balance"
              placeholder="请输入账户余额"
            />
          </el-form-item>
          <el-form-item label="用户状态">
            <el-select
              v-model="editUserInfo.status"
              placeholder="请选择用户状态"
              class="full-width"
            >
              <el-option label="启用" value="启用" />
              <el-option label="停用" value="停用" />
            </el-select>
          </el-form-item>
          <el-form-item label="绑定角色">
            <el-select
              v-model="bindRoleInfo"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择要绑定的角色"
              class="full-width"
            >
              <el-option
                v-for="item in roleList"
                :key="item.role_id"
                :label="item.role_name"
                :value="item.role_id"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              :loading="editLoading"
              @click="updateUser"
            >
              保存
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style lang="less" scoped>
.user-detail-page {
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;
}

.detail-card {
  padding: 24px 26px 28px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.page-header {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.page-header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.back-button {
  color: #606266;
  border: none;
  background: transparent;

  &:hover,
  &:focus {
    color: #409eff;
    background: #ecf5ff;
  }
}

.profile-header {
  display: flex;
  gap: 18px;
  align-items: center;
  padding: 22px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #eef6ff 0%, #f8fbff 100%);
  border: 1px solid #d9ecff;
  border-radius: 10px;
}

.avatar {
  display: flex;
  flex: 0 0 64px;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  background: #409eff;
  border-radius: 50%;
}

.profile-main {
  flex: 1;
  min-width: 0;
}

.profile-title {
  display: flex;
  gap: 10px;
  align-items: center;
  color: #303133;
  font-size: 22px;
  font-weight: 700;
}

.profile-subtitle {
  margin-top: 8px;
  color: #606266;
  word-break: break-all;
}

.balance-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  min-width: 140px;
}

.balance-label {
  color: #909399;
  font-size: 13px;
}

.balance-value {
  color: #f56c6c;
  font-size: 24px;
  font-weight: 700;
}

.detail-section {
  margin-top: 22px;
}

.section-title {
  padding-left: 10px;
  margin-bottom: 14px;
  color: #303133;
  font-size: 16px;
  font-weight: 700;
  border-left: 4px solid #409eff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

.info-item {
  min-width: 0;
  padding: 14px 16px;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.label {
  display: block;
  margin-bottom: 6px;
  color: #909399;
  font-size: 13px;
}

.value {
  color: #303133;
  word-break: break-all;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  margin-bottom: 12px;
  background: #f8fafc;
  border: 1px solid #ebeef5;
  border-radius: 8px;

  span {
    color: #909399;
    font-size: 13px;
  }

  strong {
    color: #303133;
    font-size: 24px;
  }
}

.top-api-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 18px;
  margin-top: 10px;
}

.top-api-item {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.api-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #606266;
  font-size: 13px;
}

.amount {
  color: #f56c6c;
  font-weight: 700;
}

.invoice-title-name {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.full-width {
  width: 100%;
}

.dialog-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .profile-header {
    align-items: flex-start;
  }

  .balance-card {
    align-items: flex-start;
  }

  .info-grid,
  .top-api-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .user-detail-page {
    padding: 12px;
  }

  .detail-card {
    padding: 16px;
  }

  .profile-header {
    flex-direction: column;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-header-actions {
    justify-content: flex-start;
  }

  .info-grid,
  .top-api-list {
    grid-template-columns: 1fr;
  }

  .pagination {
    justify-content: flex-start;
    overflow-x: auto;
  }
}
</style>
