// 客户端TinyMCE插件
export default defineNuxtPlugin((nuxtApp) => {
    // 仅在客户端执行
    if (process.client) {
        // 在页面加载完成后预加载TinyMCE
        window.addEventListener('load', () => {
            // 检查是否已加载
            if (window.tinymce) return

            // 动态加载TinyMCE脚本
            const script = document.createElement('script')
            script.src = '/tinymce/tinymce.min.js'
            script.async = true
            script.defer = true
            document.head.appendChild(script)
        })
    }
}) 