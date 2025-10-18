export const useLinks = () => {
  const { $myFetch } = useNuxtApp()

  // 全局状态存储友情链接列表
  const linksList = useState('globalLinksList', () => null)

  // 获取友情链接数据
  const fetchLinks = async () => {
    if (linksList.value) {
      return linksList.value
    }

    try {
      const response = await $myFetch('LinkList')
      if (response && response.data) {
        linksList.value = response.data
        return response.data
      }
    } catch (error) {
      console.error('获取友情链接失败:', error)
    }

    return []
  }

  // 初始化友情链接数据
  const initLinks = async () => {
    const data = await fetchLinks()
    return data
  }

  // 检查是否有友情链接数据
  const hasLinks = computed(() => {
    return linksList.value && linksList.value.length > 0
  })

  // 获取指定数量的友情链接
  const getLinks = (count = null) => {
    if (!linksList.value) return []
    
    if (count && count > 0) {
      return linksList.value.slice(0, count)
    }
    
    return linksList.value
  }

  return {
    linksList: readonly(linksList),
    fetchLinks,
    initLinks,
    hasLinks,
    getLinks
  }
}