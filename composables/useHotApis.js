export const useHotApis = (count = 4) => {
  const { $myFetch } = useNuxtApp()

  // 全局状态存储API列表
  const apiList = useState('globalApiList', () => null)

  // 生成随机数的函数
  const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // 格式化数字为带逗号的字符串
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // 获取API列表数据
  const fetchApiList = async () => {
    if (apiList.value) {
      return apiList.value
    }

    try {
      const response = await $myFetch('List')
      if (response && response.data) {
        apiList.value = response.data
        return response.data
      }
    } catch (error) {
      console.error('获取API列表失败:', error)
    }

    return []
  }

  // 生成热门API数据
  const generateHotApis = async (apiCount = count) => {
    const list = await fetchApiList()

    if (!list || list.length === 0) {
      return []
    }

    // 确保请求的数量不超过可用的API数量
    const actualCount = Math.min(apiCount, list.length)
    
    // 随机打乱数组并取指定数量
    const randomApis = [...list].sort(() => Math.random() - 0.5).slice(0, actualCount)

    // 为每个API添加随机的调用量和收藏数
    return randomApis.map((api) => ({
      name: api.name,
      desc: api.description || api.desc || '暂无描述',
      views: formatNumber(getRandomNumber(100000, 1000000)), // 10万到200万之间
      stars: formatNumber(getRandomNumber(1000, 5000)), // 1千到5千之间
      alias: api.alias, // 添加alias用于跳转
    }))
  }

  // 热门API的响应式数据
  const hotApis = ref([])

  // 初始化热门API数据
  const initHotApis = async (apiCount = count) => {
    if (hotApis.value.length === 0) {
      hotApis.value = await generateHotApis(apiCount)
    }
    return hotApis.value
  }

  // 刷新热门API数据
  const refreshHotApis = async (apiCount = count) => {
    hotApis.value = await generateHotApis(apiCount)
    return hotApis.value
  }

  return {
    hotApis: readonly(hotApis),
    initHotApis,
    refreshHotApis,
    fetchApiList,
  }
}
