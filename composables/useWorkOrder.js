export const useWorkOrder = () => {
  const typeMap = {
    1: '业务咨询',
    2: '故障报修',
    3: '产品建议',
    4: '其他事务',
  }

  const priorityMap = {
    1: '普通',
    2: '重要',
    3: '紧急',
  }

  const statusMap = {
    0: '待处理',
    1: '处理中',
    2: '已完结',
  }

  const getStatusTagType = (status) => {
    switch (String(status)) {
      case '0':
        return 'danger'
      case '1':
        return 'warning'
      case '2':
        return 'success'
      default:
        return ''
    }
  }

  const getPriorityTagType = (p) => {
    switch (String(p)) {
      case '3':
        return 'danger'
      case '2':
        return 'warning'
      case '1':
        return 'success'
      default:
        return 'info'
    }
  }

  const formatTime = (time) => {
    if (!time) return '-'
    return new Date(time).toLocaleString()
  }

  return {
    typeMap,
    priorityMap,
    statusMap,
    getStatusTagType,
    getPriorityTagType,
    formatTime,
  }
}
