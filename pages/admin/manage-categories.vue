<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="container" v-loading="loading">
        <div class="cont">
          <el-table :data="filterTableData" style="width: 100%" height="96%">
            <el-table-column width="150">
              <template #header>
                <el-input
                  v-model="search"
                  size="small"
                  placeholder="Type to search"
                />
              </template>
              <template #default="scope">
                <el-popconfirm
                  confirm-button-text="Yes"
                  cancel-button-text="No"
                  title="你确定要删除吗?"
                  @confirm="handleDelete(scope.$index, scope.row)"
                >
                  <template #reference>
                    <el-button size="small" type="danger">Delete</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
            <el-table-column prop="id" label="id" width="100" />
            <el-table-column prop="name" label="分类名称" width="180" />
            <el-table-column prop="alias" label="别名" width="100" />
            <el-table-column prop="count" label="接口数" width="100" />
            <el-table-column prop="createTime" label="创建时间" width="250" />
            <el-table-column prop="default" label="默认分类" width="250" />
          </el-table>
        </div>
      </div>

      <div class="container">
        <div class="cont">
          <div class="form">
            <el-form :model="addcategoryInfo" label-width="120px">
              <el-form-item label="分类名称">
                <el-input
                  v-model="addcategoryInfo.name"
                  maxlength="32"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="分类别名">
                <el-input
                  v-model="addcategoryInfo.alias"
                  maxlength="32"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="onSubmit">提交</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios"

const token = useCookie('token')

const { $msg } = useNuxtApp()
const msg = $msg

const loading = ref(false)
const tableData = ref([])
const search = ref('')

const getData = async () => {
  const { data: res } = await axios.get('CategoryList')

  res.data = res.data.map(item => {
    return {
      id: item.id,
      alias: item.alias,
      name: item.name,
      default: item.default === 1 ? '是' : '否',
      count: item.count,
      createTime: item.createTime
    }
  })

  tableData.value = res.data
}

getData()

const filterTableData = computed(() =>
  tableData.value.filter((data) =>
    !search.value ||
    data.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

const handleDelete = async (index, row) => {
  loading.value = true

  const { data: res } = await axios.get('CategoryDelete', {
    params: {
      id: row.id
    }
  })

  if (res.code === 200) {
    msg(res.msg, 'success')
  }

  await getData()

  loading.value = false
}

const addcategoryInfo = reactive({
  name: '',
  alias: '',
})

const onSubmit = async () => {
  if (!addcategoryInfo.name || !addcategoryInfo.alias) {
    msg('请填写内容', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('name', addcategoryInfo.name)
  bodyValue.append('alias', addcategoryInfo.alias)

  const { data: res } = await axios.post('CategoryCreate', bodyValue)
  if (res.code === 200) {
    msg(res.msg, 'success')
  }

  getData()
}
</script>

<style lang="less" scoped>
.container {
  display: flex;
  .right {
    width: 100%;
    overflow-x: hidden;
    .container {
      padding: 10px;
      background-color: #f7f7f7;
      .cont {
        width: 100%;
        padding: 20px 20px;
        background: #fff;
        box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
        .form {
          width: 60%;
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .container {
    .right {
      .container {
        .cont {
          .form {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>