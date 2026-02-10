export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const page = Math.max(1, Number.parseInt(query.page, 10) || 1)
  const pageSize = Math.min(50, Math.max(1, Number.parseInt(query.pageSize, 10) || 10))

  try {
    return await $fetch('https://api.yunque.cc/changelog', {
      method: 'GET',
      query: {
        page,
        pageSize,
      },
    })
  } catch (error) {
    const statusCode = error?.response?.status || 500
    const errorData = error?.response?._data

    throw createError({
      statusCode,
      statusMessage: errorData?.message || '获取更新日志失败',
      data: errorData || null,
    })
  }
})
