/**
 * 统一的 Token Cookie 配置
 * 注意：httpOnly 无法使用，因为前端需要读取 token 来设置 Authorization header
 * 如果需要 httpOnly，应该改为后端直接从 cookie 中读取 token，而不是通过 header
 */
export const useTokenCookie = () => {
  return useCookie('token', {
    // 防止 CSRF 攻击
    sameSite: 'strict',
    // 仅在 HTTPS 下发送（生产环境）
    secure: process.env.NODE_ENV === 'production',
    // Cookie 有效路径
    path: '/',
    // 过期时间：7 天
    maxAge: 60 * 60 * 24 * 7,
  })
}
