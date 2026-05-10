<script setup>
definePageMeta({
  layout: 'admin',
});
const { $msg, $myFetch } = useNuxtApp();

const tableData = ref([]);
const groupData = ref([]);
const search = ref('');
const groupSearch = ref('');
const loading = ref(false);
const activeTab = ref('packages');
const isMobile = ref(false);

// 弹窗显示状态
const dialogStatus = ref(false);
const updatePackageStatus = ref(false);
const groupDialogStatus = ref(false);
const updateGroupStatus = ref(false);
const apiNameDialogStatus = ref(false);
const currentApiList = ref([]);
const currentPackageName = ref('');

// 套餐信息
const packageInfo = ref({
  id: 0,
  name: '',
  type: 2,
  price: 0,
  duration: 30,
  points: 0,
  status: 1,
  shared: 0,
  description: '',
});

const groupInfo = ref({
  id: 0,
  name: '',
  description: '',
  status: 1,
  package_ids: [],
});

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// 获取数据信息
const getData = async () => {
  loading.value = true;
  const [res, groupRes] = await Promise.all([
    $myFetch('PackageList'),
    $myFetch('PackageGroupList'),
  ]);

  if (res.code === 200) {
    res.data.forEach((element, key) => {
      res.data[key].create_time = new Date(
        element.created_time,
      ).toLocaleString();
      res.data[key].update_time = new Date(
        element.updated_time,
      ).toLocaleString();
    });
    tableData.value = res.data;
  } else {
    $msg(res.msg, 'error');
  }
  if (groupRes.code === 200) {
    groupData.value = groupRes.data || [];
  } else {
    $msg(groupRes.msg, 'error');
  }
  loading.value = false;
};

onMounted(() => {
  updateIsMobile();
  window.addEventListener('resize', updateIsMobile);
  getData();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsMobile);
});

// 搜索框
const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      data.name.toLowerCase().includes(search.value.toLowerCase()) ||
      formatApiName(data.api_name)
        .toLowerCase()
        .includes(search.value.toLowerCase()),
  ),
);

const filterGroupData = computed(() =>
  groupData.value.filter(
    (data) =>
      !groupSearch.value ||
      data.name.toLowerCase().includes(groupSearch.value.toLowerCase()),
  ),
);

const packageOptions = computed(() =>
  tableData.value
    .filter((item) => item.type === 2 || item.type === 3)
    .map((item) => ({
      label: `${item.name}（${getSharedText(item.shared)}）`,
      value: Number(item.id),
      type: item.type,
      price: item.price,
      shared: Number(item.shared || 0),
    })),
);

const apiNameTableData = computed(() => {
  if (isMobile.value) {
    return currentApiList.value;
  }

  const rows = [];

  for (let i = 0; i < currentApiList.value.length; i += 2) {
    rows.push({
      left: currentApiList.value[i] || null,
      right: currentApiList.value[i + 1] || null,
    });
  }

  return rows;
});

// 获取类型文字
const getTypeText = (type) => {
  const types = {
    4: '直接扣费',
    2: '包月计费',
    3: '点数包',
  };
  return types[type] || '未知';
};

// 获取类型标签样式
const getTypeTag = (type) => {
  const types = {
    4: 'warning',
    2: 'success',
    3: 'primary',
  };
  return types[type] || '';
};

const getSharedText = (shared) =>
  Number(shared) === 1 ? '共享套餐' : '独立套餐';

const getSharedTag = (shared) => (Number(shared) === 1 ? 'success' : 'info');

const splitApiNames = (apiName = '') =>
  String(apiName || '')
    .split(/[|｜]/)
    .map((item) => item.trim())
    .filter(Boolean);

const formatApiName = (apiName) => {
  const names = splitApiNames(apiName);
  return names.length ? names.join('|') : '暂无绑定接口';
};

// 编辑套餐
const handleEdit = (index, row) => {
  dialogStatus.value = true;
  updatePackageStatus.value = true;

  packageInfo.value = { ...row, shared: Number(row.shared || 0) };
};

const handleViewApiName = (row) => {
  currentPackageName.value = row.name || '';
  currentApiList.value = splitApiNames(row.api_name).map((name, index) => ({
    index: index + 1,
    name,
  }));
  apiNameDialogStatus.value = true;
};

const handleGroupEdit = (index, row) => {
  groupDialogStatus.value = true;
  updateGroupStatus.value = true;
  groupInfo.value = {
    id: row.id,
    name: row.name,
    description: row.description || '',
    status: row.status,
    package_ids: String(row.package_ids || '')
      .split('|')
      .filter(Boolean)
      .map((id) => Number(id)),
  };
};

// 删除套餐
const handleDelete = async (index, row) => {
  loading.value = true;
  const res = await $myFetch('DeletePackage', {
    params: {
      id: row.id,
    },
  });

  if (res.code === 200) {
    $msg(res.msg, 'success');
    await getData();
  } else {
    $msg(res.msg, 'error');
  }
  loading.value = false;
};

const handleGroupDelete = async (index, row) => {
  loading.value = true;
  const res = await $myFetch('DeletePackageGroup', {
    params: {
      id: row.id,
    },
  });

  if (res.code === 200) {
    $msg(res.msg, 'success');
    await getData();
  } else {
    $msg(res.msg, 'error');
  }
  loading.value = false;
};

// 修改状态
const handleStatusChange = async (row) => {
  loading.value = true;
  const body = new URLSearchParams();
  body.append('id', row.id);
  body.append('name', row.name);
  body.append('type', row.type);
  body.append('price', row.price);
  body.append('duration', row.duration);
  body.append('points', row.points || 0);
  body.append('status', row.status === 1 ? 0 : 1);
  body.append('shared', row.shared || 0);
  body.append('description', row.description || '');

  const res = await $myFetch('UpdatePackage', {
    method: 'POST',
    body,
  });

  if (res.code === 200) {
    row.status = row.status === 1 ? 0 : 1;
    $msg(res.msg, 'success');
  } else {
    $msg(res.msg, 'error');
  }
  loading.value = false;
};

const handleGroupStatusChange = async (row) => {
  loading.value = true;
  const body = new URLSearchParams();
  body.append('id', row.id);
  body.append('name', row.name);
  body.append('description', row.description || '');
  body.append('status', row.status === 1 ? 0 : 1);
  body.append('packageIds', row.package_ids || '');

  const res = await $myFetch('UpdatePackageGroup', {
    method: 'POST',
    body,
  });

  if (res.code === 200) {
    row.status = row.status === 1 ? 0 : 1;
    $msg(res.msg, 'success');
  } else {
    $msg(res.msg, 'error');
  }
  loading.value = false;
};

// 提交
const submit = async () => {
  // 验证必填信息
  if (!packageInfo.value.name) {
    $msg('请输入套餐名称', 'error');
    return;
  }
  if (packageInfo.value.price < 0) {
    $msg('价格不能小于0', 'error');
    return;
  }
  if (packageInfo.value.type === 2 && packageInfo.value.duration < 1) {
    $msg('有效期不能小于1天', 'error');
    return;
  }
  if (packageInfo.value.type === 3 && packageInfo.value.points <= 0) {
    $msg('请输入正确的点数', 'error');
    return;
  }

  loading.value = true;
  const body = new URLSearchParams();
  body.append('name', packageInfo.value.name);
  body.append('type', packageInfo.value.type);
  body.append('price', packageInfo.value.price);
  body.append('duration', packageInfo.value.duration);
  body.append('points', packageInfo.value.points || 0);
  body.append('status', packageInfo.value.status);
  body.append('shared', packageInfo.value.shared || 0);
  body.append('description', packageInfo.value.description || '');

  const url = updatePackageStatus.value ? 'UpdatePackage' : 'CreatePackage';
  if (updatePackageStatus.value) {
    body.append('id', packageInfo.value.id);
  }

  const res = await $myFetch(url, {
    method: 'POST',
    body,
  });

  if (res.code === 200) {
    $msg(res.msg, 'success');
    dialogStatus.value = false;
    await getData();
  } else {
    $msg(res.msg, 'error');
  }
  loading.value = false;
};

const submitGroup = async () => {
  if (!groupInfo.value.name) {
    $msg('请输入套餐组名称', 'error');
    return;
  }

  loading.value = true;
  const body = new URLSearchParams();
  body.append('name', groupInfo.value.name);
  body.append('description', groupInfo.value.description || '');
  body.append('status', groupInfo.value.status);
  body.append('packageIds', groupInfo.value.package_ids.join('|'));

  const url = updateGroupStatus.value
    ? 'UpdatePackageGroup'
    : 'CreatePackageGroup';
  if (updateGroupStatus.value) {
    body.append('id', groupInfo.value.id);
  }

  const res = await $myFetch(url, {
    method: 'POST',
    body,
  });

  if (res.code === 200) {
    $msg(res.msg, 'success');
    groupDialogStatus.value = false;
    await getData();
  } else {
    $msg(res.msg, 'error');
  }
  loading.value = false;
};

// 监听弹窗关闭，重置表单
watch(dialogStatus, (newValue) => {
  if (!newValue) {
    updatePackageStatus.value = false;
    packageInfo.value = {
      id: 0,
      name: '',
      type: 2,
      price: 0,
      duration: 30,
      points: 0,
      status: 1,
      shared: 0,
      description: '',
    };
  }
});

watch(groupDialogStatus, (newValue) => {
  if (!newValue) {
    updateGroupStatus.value = false;
    groupInfo.value = {
      id: 0,
      name: '',
      description: '',
      status: 1,
      package_ids: [],
    };
  }
});

// 数字验证
// 自定义金额
const handleCustomAmount = (field) => {
  if (packageInfo.value[field]) {
    // 允许输入数字和小数点，但限制只能有一个小数点
    const numVal = packageInfo.value[field]
      .toString()
      .replace(/[^\d.]/g, '')
      .replace(/(\..*)\./g, '$1');
    // 只更新显示值，不立即转换为数字
    packageInfo.value[field] = numVal;
  } else {
    // 当输入框为空时，设置金额为0
    packageInfo.value[field] = '';
  }
};

const validateNumber = (field) => {
  // 移除非数字字符
  packageInfo.value[field] = packageInfo.value[field]
    .toString()
    .replace(/[^\d]/g, '');

  // 转换为数字
  if (packageInfo.value[field] !== '') {
    packageInfo.value[field] = parseInt(packageInfo.value[field]);
  }
};

useHead({
  title: '套餐管理',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
});
</script>

<template>
  <div class="package-container" v-loading="loading">
    <div class="package-card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <span class="title">{{
            activeTab === 'groups' ? '套餐组' : '套餐管理'
          }}</span>
        </div>
        <div class="header-right">
          <el-button
            v-if="activeTab === 'packages'"
            type="primary"
            @click="dialogStatus = true"
          >
            <span>新增套餐</span>
          </el-button>
          <el-button v-else type="primary" @click="groupDialogStatus = true">
            <span>新增套餐组</span>
          </el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="套餐管理" name="packages">
          <!-- 表格区域 -->
          <div class="table-container">
            <client-only>
              <el-table :data="filterTableData" style="width: 100%">
                <el-table-column width="220" fixed="right">
                  <template #header>
                    <div class="search-wrapper">
                      <el-input v-model="search" placeholder="搜索" clearable>
                      </el-input>
                    </div>
                  </template>
                  <template #default="scope">
                    <div class="table-actions">
                      <el-button
                        type="success"
                        link
                        @click="handleViewApiName(scope.row)"
                      >
                        查看接口
                      </el-button>
                      <el-button
                        type="primary"
                        link
                        @click="handleEdit(scope.$index, scope.row)"
                      >
                        编辑
                      </el-button>
                      <el-popconfirm
                        confirm-button-text="确定"
                        cancel-button-text="取消"
                        title="确定要删除吗？"
                        @confirm="handleDelete(scope.$index, scope.row)"
                      >
                        <template #reference>
                          <el-button type="danger" link> 删除 </el-button>
                        </template>
                      </el-popconfirm>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="套餐名称" min-width="120" />
                <el-table-column prop="type" label="类型" width="120">
                  <template #default="scope">
                    <el-tag :type="getTypeTag(scope.row.type)">
                      {{ getTypeText(scope.row.type) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="price" label="价格" width="100">
                  <template #default="scope">
                    <span class="price">¥{{ scope.row.price }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="duration" label="有效期" width="100">
                  <template #default="scope">
                    <span class="duration">{{ scope.row.duration }}天</span>
                  </template>
                </el-table-column>
                <el-table-column prop="points" label="点数" width="80">
                  <template #default="scope">
                    <span class="points">{{ scope.row.points }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="shared" label="使用范围" width="110">
                  <template #default="scope">
                    <el-tag :type="getSharedTag(scope.row.shared)">
                      {{ getSharedText(scope.row.shared) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.status === 1 ? 'success' : 'danger'"
                      class="status-tag"
                      @click="handleStatusChange(scope.row)"
                      style="cursor: pointer"
                    >
                      {{ scope.row.status === 1 ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="create_time"
                  label="创建时间"
                  width="180"
                />
                <el-table-column
                  prop="update_time"
                  label="修改时间"
                  width="180"
                />
              </el-table>
            </client-only>
          </div>
        </el-tab-pane>

        <el-tab-pane label="套餐组" name="groups">
          <div class="table-container">
            <client-only>
              <el-table :data="filterGroupData" style="width: 100%">
                <el-table-column width="160" fixed="right">
                  <template #header>
                    <div class="search-wrapper">
                      <el-input
                        v-model="groupSearch"
                        placeholder="搜索"
                        clearable
                      />
                    </div>
                  </template>
                  <template #default="scope">
                    <div class="table-actions">
                      <el-button
                        type="primary"
                        link
                        @click="handleGroupEdit(scope.$index, scope.row)"
                      >
                        编辑
                      </el-button>
                      <el-popconfirm
                        confirm-button-text="确定"
                        cancel-button-text="取消"
                        title="确定要删除吗？"
                        @confirm="handleGroupDelete(scope.$index, scope.row)"
                      >
                        <template #reference>
                          <el-button type="danger" link> 删除 </el-button>
                        </template>
                      </el-popconfirm>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column
                  prop="name"
                  label="套餐组名称"
                  min-width="140"
                />
                <el-table-column
                  prop="description"
                  label="描述"
                  min-width="180"
                />
                <el-table-column label="包含套餐" min-width="260">
                  <template #default="scope">
                    <div class="package-tags">
                      <el-tag
                        v-for="pkg in scope.row.packages || []"
                        :key="pkg.id"
                        size="small"
                        class="package-tag"
                      >
                        {{ pkg.name }}（{{ getSharedText(pkg.shared) }}）
                      </el-tag>
                      <span v-if="!(scope.row.packages || []).length"
                        >未选择套餐</span
                      >
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.status === 1 ? 'success' : 'danger'"
                      class="status-tag"
                      @click="handleGroupStatusChange(scope.row)"
                      style="cursor: pointer"
                    >
                      {{ scope.row.status === 1 ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="created_time"
                  label="创建时间"
                  width="180"
                >
                  <template #default="scope">
                    {{
                      new Date(Number(scope.row.created_time)).toLocaleString()
                    }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="updated_time"
                  label="修改时间"
                  width="180"
                >
                  <template #default="scope">
                    {{
                      new Date(Number(scope.row.updated_time)).toLocaleString()
                    }}
                  </template>
                </el-table-column>
              </el-table>
            </client-only>
          </div>
        </el-tab-pane>
      </el-tabs>

      <el-dialog
        v-model="apiNameDialogStatus"
        :title="`${currentPackageName} - 绑定接口`"
        :width="isMobile ? '92%' : '760px'"
        destroy-on-close
        class="package-dialog"
      >
        <client-only>
          <el-table :data="apiNameTableData" style="width: 100%">
            <el-table-column v-if="isMobile" label="接口名称">
              <template #default="scope">
                <span>{{ scope.row.index }}. {{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column v-else label="接口 1">
              <template #default="scope">
                <span v-if="scope.row.left">
                  {{ scope.row.left.index }}. {{ scope.row.left.name }}
                </span>
              </template>
            </el-table-column>
            <el-table-column v-if="!isMobile" label="接口 2">
              <template #default="scope">
                <span v-if="scope.row.right">
                  {{ scope.row.right.index }}. {{ scope.row.right.name }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </client-only>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="apiNameDialogStatus = false">
              关闭
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 新增/编辑套餐对话框 -->
      <el-dialog
        v-model="dialogStatus"
        :title="updatePackageStatus ? '修改套餐' : '新增套餐'"
        width="600px"
        destroy-on-close
        class="package-dialog"
      >
        <div class="dialog-content">
          <el-form :model="packageInfo" label-width="100px">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="套餐名称" required>
                  <el-input
                    v-model="packageInfo.name"
                    placeholder="请输入套餐名称"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="套餐类型" required>
                  <el-select
                    v-model="packageInfo.type"
                    placeholder="请选择套餐类型"
                    class="full-width"
                  >
                    <el-option label="包月计费" :value="2" />
                    <el-option label="点数包" :value="3" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="套餐价格" required>
                  <el-input
                    v-model="packageInfo.price"
                    placeholder="请输入价格"
                    class="full-width"
                    @input="handleCustomAmount('price')"
                  >
                    <template #suffix>¥</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="包含点数"
                  v-if="packageInfo.type === 3"
                  required
                >
                  <el-input
                    v-model="packageInfo.points"
                    placeholder="请输入点数"
                    class="full-width"
                    @input="validateNumber('points')"
                  >
                    <template #suffix>点</template>
                  </el-input>
                </el-form-item>
                <el-form-item
                  label="有效期"
                  required
                  v-if="packageInfo.type === 2"
                >
                  <el-input
                    v-model="packageInfo.duration"
                    placeholder="请输入有效期(天)"
                    class="full-width"
                    @input="validateNumber('duration')"
                  >
                    <template #suffix>天</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="有效期" v-if="packageInfo.type === 3">
                  <el-input
                    v-model="packageInfo.duration"
                    placeholder="请输入有效期(天)"
                    class="full-width"
                    @input="validateNumber('duration')"
                  >
                    <template #suffix>天</template>
                  </el-input>
                  <div style="margin-top: 4px; font-size: 12px; color: #909399">
                    输入0表示永久有效
                  </div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="状态">
              <el-switch
                v-model="packageInfo.status"
                :active-value="1"
                :inactive-value="0"
              />
            </el-form-item>

            <el-form-item label="共享套餐">
              <el-switch
                v-model="packageInfo.shared"
                :active-value="1"
                :inactive-value="0"
              />
              <div class="form-tip">
                开启后，用户购买一次可使用该套餐绑定的所有接口；关闭后需按接口分别购买。
              </div>
            </el-form-item>

            <el-form-item label="描述">
              <el-input
                v-model="packageInfo.description"
                type="textarea"
                :rows="3"
                placeholder="请输入套餐描述"
              />
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogStatus = false">取消</el-button>
            <el-button type="primary" @click="submit">
              {{ updatePackageStatus ? '修改' : '创建' }}
            </el-button>
          </div>
        </template>
      </el-dialog>

      <el-dialog
        v-model="groupDialogStatus"
        :title="updateGroupStatus ? '修改套餐组' : '新增套餐组'"
        width="640px"
        destroy-on-close
        class="package-dialog"
      >
        <div class="dialog-content">
          <el-form :model="groupInfo" label-width="100px">
            <el-form-item label="套餐组名称" required>
              <el-input
                v-model="groupInfo.name"
                placeholder="请输入套餐组名称"
              />
            </el-form-item>
            <el-form-item label="包含套餐">
              <el-select
                v-model="groupInfo.package_ids"
                multiple
                filterable
                clearable
                collapse-tags
                collapse-tags-tooltip
                class="full-width"
                placeholder="请选择套餐"
              >
                <el-option
                  v-for="item in packageOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-switch
                v-model="groupInfo.status"
                :active-value="1"
                :inactive-value="0"
              />
            </el-form-item>
            <el-form-item label="描述">
              <el-input
                v-model="groupInfo.description"
                type="textarea"
                :rows="3"
                placeholder="请输入套餐组描述"
              />
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="groupDialogStatus = false">取消</el-button>
            <el-button type="primary" @click="submitGroup">
              {{ updateGroupStatus ? '修改' : '创建' }}
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style lang="less" scoped>
.package-container {
  position: relative;
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;

  .package-card {
    width: 100%;
    padding: 16px 20px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 8px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      .header-left {
        display: flex;
        align-items: flex-start;

        .title {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          line-height: 1.3;
        }
      }

      .header-right {
        .el-button {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      }
    }

    .table-container {
      padding: 8px 0 0;

      :deep(.el-table) {
        border: none;

        .search-wrapper {
          padding: 0;
          margin: 0;
          line-height: 1;
        }

        .el-input {
          width: 140px;
          margin: 0;
        }

        .el-table__header-wrapper {
          th {
            background: #f8fafc;
            color: #1f2937;
            font-weight: 600;
          }
        }
      }

      .table-actions {
        display: flex;
        gap: 4px;
        margin: 0;
        padding: 0;
      }
    }
  }
}

// 表格中的价格样式
.price {
  color: #f56c6c;
  font-weight: 500;
}

.duration,
.points {
  color: #67c23a;
  font-weight: 500;
}

.package-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.form-tip {
  width: 100%;
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.5;
  color: #909399;
}

// 对话框样式
:deep(.package-dialog) {
  border-radius: 12px;
  overflow: hidden;

  .el-dialog__header {
    margin: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #eaecf0;
    background: #f8fafc;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1f36;
    }
  }

  .el-dialog__body {
    padding: 24px;

    .dialog-content {
      .el-form {
        .el-form-item__label {
          font-weight: 500;
          color: #374151;
          padding-bottom: 8px;
        }

        .el-input__wrapper,
        .el-textarea__inner {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          border: 1px solid #d1d5db;
          border-radius: 6px;

          &:hover {
            border-color: #9ca3af;
          }

          &.is-focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
        }

        .el-input-number.full-width {
          width: 100%;

          .el-input__wrapper {
            padding-left: 8px;
          }
        }

        .el-select.full-width {
          width: 100%;
        }
      }
    }
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #eaecf0;
    background: #f8fafc;

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .el-button {
        padding: 8px 20px;
        font-weight: 500;
        min-width: 88px;

        &.el-button--primary {
          background: #3b82f6;
          border-color: #3b82f6;

          &:hover {
            background: #2563eb;
            border-color: #2563eb;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .package-container {
    padding: 20px;
  }
}

@media screen and (max-width: 768px) {
  .package-container {
    padding: 12px;

    .package-card {
      padding: 14px;

      .card-header {
        flex-direction: column;
        gap: 12px;
      }
    }
  }
}

.status-tag {
  padding: 4px 12px;
  font-size: 13px;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    opacity: 0.8;
  }
}
</style>
