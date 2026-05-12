<script setup>
// 引入加密算法
const { $enCode, $msg, $myFetch } = useNuxtApp();

const router = useRouter();

const username = useCookie('username');
const token = useTokenCookie();
const policyConsent = useCookie('policyConsent', {
  default: () => 'false',
  maxAge: 60 * 60 * 24 * 365,
});
const isPolicyAgreed = computed({
  get: () => String(policyConsent.value).toLowerCase() === 'true',
  set: (v) => {
    policyConsent.value = v ? 'true' : 'false';
  },
});

if (username.value != undefined && token.value != undefined) {
  navigateTo('/admin');
} else {
  username.value = undefined;
  token.value = undefined;
}

const info = reactive({
  username: '',
  password: '',
  mail: '',
  captcha: '',
  mailCode: '',
  sign: '',
});

const LoginIsRegister = ref(true);
const isForgotPassword = ref(false);
const isEmailLogin = ref(false);
const isOAuthBindEmail = ref(false);
const loginAndRegisterButtonStatus = ref(false);
const availableLoginMethods = ref([]); // 可用的登录方式数组
const currentLoginMethod = ref('email'); // 当前选择的登录方式
const isLoginDisabled = ref(false); // 是否禁用所有登录方式
const oauthBindToken = ref('');

const goBack = () => {
  navigateTo('/');
};

const markAdminHomePopupPending = () => {
  if (process.client) {
    sessionStorage.setItem('admin_home_popup_pending', '1');
  }
};

const routeInfo = useCookie('routeInfo');

const firstQueryValue = (value) => (Array.isArray(value) ? value[0] : value);

const applyLoginSuccess = (data, successMessage) => {
  username.value = data.username;
  token.value = data.token;

  const authorization = useCookie('token');
  authorization.value = data.token;

  $msg(successMessage, 'success');

  routeInfo.value = data.routeInfo;
  markAdminHomePopupPending();
  navigateTo('/admin');
};

const login = async () => {
  if (!isPolicyAgreed.value) {
    $msg('请阅读并同意隐私政策和用户协议', 'error');
    return false;
  }
  if (info.username === '' || info.password === '' || info.captcha === '') {
    $msg('请填写完整的登录信息', 'error');
    return false;
  }

  const bodyValue = new URLSearchParams();
  bodyValue.append('username', info.username);
  bodyValue.append('id', captchaInfo.value.id);
  bodyValue.append('key', info.captcha);

  // 使用加密算法对数据进行加密
  bodyValue.append('password', $enCode(info.password));
  const res = await $myFetch('Login', {
    method: 'POST',
    body: bodyValue,
  });

  if (res.code === 200) {
    applyLoginSuccess(res.data, '登录成功');
    return false;
  }

  $msg(res.msg, 'error');
  // 验证码错误时重新获取验证码
  getCaptchaInfo();
  info.captcha = '';
};

// 登录注册切换
const LoginIsRegisterChange = () => {
  LoginIsRegister.value = !LoginIsRegister.value;
  // 切换时重置其他登录状态
  isOAuthBindEmail.value = false;
  isEmailLogin.value = false;
  isForgotPassword.value = false;
  // 切换到注册时获取登录方式配置
  if (!LoginIsRegister.value) {
    getLoginMethodConfig();
  }
};

// 以下全部为注册

// 获取验证码按钮的状态
const getVerifyCodeButtonState = ref(false);
// 邮箱登录验证码按钮状态
const getEmailVerifyCodeButtonState = ref(false);
// 注册验证码倒计时
const smsCountdown = ref(0);
let smsCountdownTimer = null;
// 登录验证码倒计时
const smsLoginCountdown = ref(0);
let smsLoginCountdownTimer = null;
// 第三方绑定邮箱验证码按钮状态
const getOAuthBindVerifyCodeButtonState = ref(false);
const oauthBindCountdown = ref(0);
let oauthBindCountdownTimer = null;

const startSmsCountdown = () => {
  smsCountdown.value = 60;
  clearInterval(smsCountdownTimer);
  smsCountdownTimer = setInterval(() => {
    smsCountdown.value--;
    if (smsCountdown.value <= 0) {
      clearInterval(smsCountdownTimer);
    }
  }, 1000);
};

const startSmsLoginCountdown = () => {
  smsLoginCountdown.value = 60;
  clearInterval(smsLoginCountdownTimer);
  smsLoginCountdownTimer = setInterval(() => {
    smsLoginCountdown.value--;
    if (smsLoginCountdown.value <= 0) {
      clearInterval(smsLoginCountdownTimer);
    }
  }, 1000);
};

const startOAuthBindCountdown = () => {
  oauthBindCountdown.value = 60;
  clearInterval(oauthBindCountdownTimer);
  oauthBindCountdownTimer = setInterval(() => {
    oauthBindCountdown.value--;
    if (oauthBindCountdown.value <= 0) {
      clearInterval(oauthBindCountdownTimer);
    }
  }, 1000);
};

// 图片验证码信息
const captchaInfo = ref({
  id: '',
  url: '',
});

// 获取图片验证码
const getCaptchaInfo = async () => {
  const res = await $myFetch('Captcha', {
    method: 'GET',
  });
  captchaInfo.value = res.data;
};

// 监听用户是否切换了显示
watch(
  LoginIsRegister,
  (newValue) => {
    info.captcha = '';
    getCaptchaInfo();
  },
  {
    immediate: true,
  },
);

// 获取邮箱验证码
const rule =
  /^[A-Za-z\d]+[A-Za-z\d\-_\.]*@([A-Za-z\d]+[A-Za-z\d\-]*\.)+[A-Za-z]{2,4}$/;

const getMailCode = async () => {
  getVerifyCodeButtonState.value = true;

  // 注册模式始终使用邮箱，登录模式根据配置判断
  const isRegisterMode =
    !LoginIsRegister.value && !isForgotPassword.value && !isEmailLogin.value;
  const useEmail = isRegisterMode || currentLoginMethod.value === 'email';

  // 根据使用的方式验证输入格式
  if (useEmail) {
    // 邮箱格式验证
    if (rule.test(info.mail) === false) {
      $msg('请填写正确的邮箱地址', 'error');
      getVerifyCodeButtonState.value = false;
      return false;
    }
  } else {
    // 手机号格式验证
    const phoneRule = /^1[3-9]\d{9}$/;
    if (!phoneRule.test(info.mail)) {
      $msg('请填写正确的手机号', 'error');
      getVerifyCodeButtonState.value = false;
      return false;
    }
  }

  let body, apiEndpoint;

  if (useEmail) {
    // 邮箱验证码
    apiEndpoint = 'MailCode';
    body = new URLSearchParams();
    body.append('id', captchaInfo.value.id);
    body.append('key', info.captcha);
    body.append('mail', info.mail);
  } else {
    // 短信验证码
    apiEndpoint = 'SendLoginSMS';
    body = new URLSearchParams();
    body.append('phone', info.mail); // 手机号存储在mail字段中
    body.append('id', captchaInfo.value.id); // 验证码ID
    body.append('key', info.captcha); // 验证码key
  }

  const res = await $myFetch(apiEndpoint, {
    method: 'POST',
    body,
  });

  if (res.code != 200) {
    $msg(res.msg, 'error');
    getCaptchaInfo();

    getVerifyCodeButtonState.value = false;
    return false;
  }

  const message = useEmail ? '邮件验证码已发送' : '短信验证码已发送';
  $msg(message, 'success');

  info.sign = res.data;
  getVerifyCodeButtonState.value = false;
  startSmsCountdown();
};

const register = async () => {
  if (!isPolicyAgreed.value) {
    $msg('请阅读并同意隐私政策和用户协议', 'error');
    return false;
  }
  if (
    info.username === '' ||
    info.password === '' ||
    info.mail === '' ||
    info.mailCode === ''
  ) {
    $msg('请正确填写账号信息', 'error');
    return false;
  }

  if (info.username.length <= 6 || info.password.length <= 6) {
    $msg('用户名或密码不能小于6位', 'error');
    return false;
  }
  if (info.username.length >= 32 || info.password.length >= 32) {
    $msg('用户名或密码不能大于6位', 'error');
    return false;
  }

  // 注册始终使用邮箱验证
  if (rule.test(info.mail) === false) {
    $msg('请填写正确的邮箱地址', 'error');
    return false;
  }

  const body = new URLSearchParams();
  body.append('username', info.username);
  body.append('password', $enCode(info.password));
  body.append('mail', info.mail);
  body.append('mailCode', info.mailCode);
  body.append('sign', info.sign);

  const res = await $myFetch('Register', {
    method: 'POST',
    body,
  });

  if (res.code === 200) {
    $msg('注册成功，请登录', 'success');
    setTimeout(() => {
      router.go(0);
    }, 500);
  } else {
    $msg(res.msg, 'error');
  }
};

// 切换到忘记密码卡片
const toggleForgotPassword = () => {
  isForgotPassword.value = !isForgotPassword.value;
  LoginIsRegister.value = true;
  isOAuthBindEmail.value = false;
  isEmailLogin.value = false;
  info.captcha = '';
  getCaptchaInfo();
};

// 获取登录方式配置
const getLoginMethodConfig = async () => {
  try {
    const res = await $myFetch('LoginMethodInfo', {
      method: 'GET',
    });

    if (res.code === 200 && res.data) {
      let methods = [];

      const loginMethodData =
        typeof res.data === 'object' && !Array.isArray(res.data)
          ? res.data.method
          : res.data;
      const chjhProviders =
        typeof res.data === 'object' && !Array.isArray(res.data)
          ? res.data.chjhProviders
          : '';

      if (!options.value) {
        options.value = {};
      }

      if (typeof loginMethodData === 'string') {
        methods = loginMethodData.split('|').filter((method) => method.trim());
      } else if (Array.isArray(loginMethodData)) {
        methods = loginMethodData.filter((method) => method && method.trim());
      }

      if (typeof chjhProviders === 'string') {
        options.value.chjhProviders = chjhProviders
          ? chjhProviders.split('|').filter((provider) => provider.trim())
          : [];
      } else if (Array.isArray(chjhProviders)) {
        options.value.chjhProviders = chjhProviders.filter(
          (provider) => provider && provider.trim(),
        );
      }

      // 设置登录方式配置
      if (methods.length > 0) {
        availableLoginMethods.value = methods;
        currentLoginMethod.value = methods[0];
        isLoginDisabled.value = false;
      } else {
        // 没有可用的登录方式
        availableLoginMethods.value = [];
        currentLoginMethod.value = '';
        isLoginDisabled.value = true;
      }
    } else {
      // 接口返回失败或数据为空，禁用登录
      availableLoginMethods.value = [];
      currentLoginMethod.value = '';
      isLoginDisabled.value = true;
    }
  } catch (error) {
    console.error('获取登录方式配置失败:', error);
    // 发生错误时，设置默认的登录方式以确保功能可用
    availableLoginMethods.value = ['email'];
    currentLoginMethod.value = 'email';
    isLoginDisabled.value = false;
  }
};

// 切换登录方式
const toggleEmailLogin = (targetMethod = false) => {
  if (isEmailLogin.value) {
    if (
      targetMethod &&
      typeof targetMethod === 'string' &&
      availableLoginMethods.value.includes(targetMethod)
    ) {
      // 切换到指定的登录方式
      currentLoginMethod.value = targetMethod;
    } else if (targetMethod && availableLoginMethods.value.length > 1) {
      // 在可用的登录方式之间切换
      const currentIndex = availableLoginMethods.value.indexOf(
        currentLoginMethod.value,
      );
      const nextIndex = (currentIndex + 1) % availableLoginMethods.value.length;
      currentLoginMethod.value = availableLoginMethods.value[nextIndex];
    } else {
      // 返回账号登录
      isEmailLogin.value = false;
      LoginIsRegister.value = true;
      isForgotPassword.value = false;
      info.captcha = '';
      info.mail = '';
      info.mailCode = '';
      getCaptchaInfo();
    }
  } else {
    // 从账号登录切换到验证码登录模式
    isEmailLogin.value = true;
    isOAuthBindEmail.value = false;
    LoginIsRegister.value = true;
    isForgotPassword.value = false;
    info.captcha = '';
    info.mail = '';
    info.mailCode = '';
    getCaptchaInfo();

    // 设置登录方式
    if (
      targetMethod &&
      typeof targetMethod === 'string' &&
      availableLoginMethods.value.includes(targetMethod)
    ) {
      // 使用指定的登录方式
      currentLoginMethod.value = targetMethod;
    } else if (availableLoginMethods.value.length > 0) {
      // 设置默认的登录方式为第一个可用方式
      currentLoginMethod.value = availableLoginMethods.value[0];
    }
  }
};

// 发送重置密码邮件
const resetPassword = async () => {
  if (info.username === '' || info.mail === '' || info.captcha === '') {
    $msg('请填写完整信息', 'error');
    return false;
  }

  if (rule.test(info.mail) === false) {
    $msg('请填写正确的邮箱地址', 'error');
    return false;
  }

  loginAndRegisterButtonStatus.value = true;

  const body = new URLSearchParams();
  body.append('username', info.username);
  body.append('mail', info.mail);
  body.append('id', captchaInfo.value.id);
  body.append('key', info.captcha);

  try {
    const res = await $myFetch('ResetPassword', {
      method: 'POST',
      body,
    });

    if (res.code === 200) {
      $msg('重置密码邮件已发送，请查收邮件', 'success');
      toggleForgotPassword();
    } else {
      $msg(res.msg, 'error');
      getCaptchaInfo();
      info.captcha = '';
    }
  } catch (error) {
    $msg('请求失败，请稍后重试', 'error');
  } finally {
    loginAndRegisterButtonStatus.value = false;
  }
};

// 监听忘记密码状态变化
watch(isForgotPassword, (newValue) => {
  if (newValue) {
    isOAuthBindEmail.value = false;
    info.username = '';
    info.password = '';
    info.mail = '';
    info.captcha = '';
    getCaptchaInfo();
  }
});

// 监听邮箱登录状态变化
watch(isEmailLogin, (newValue) => {
  if (newValue) {
    isOAuthBindEmail.value = false;
    info.username = '';
    info.password = '';
    info.mail = '';
    info.captcha = '';
    info.mailCode = '';
    getCaptchaInfo();
  }
});

// 获取邮箱登录验证码
const getMailLoginCode = async () => {
  getEmailVerifyCodeButtonState.value = true;

  // 根据登录方式验证输入格式
  if (currentLoginMethod.value === 'sms') {
    // 手机号格式验证
    const phoneRule = /^1[3-9]\d{9}$/;
    if (!phoneRule.test(info.mail)) {
      $msg('请填写正确的手机号', 'error');
      getEmailVerifyCodeButtonState.value = false;
      return false;
    }
  } else {
    // 邮箱格式验证
    if (rule.test(info.mail) === false) {
      $msg('请填写正确的邮箱地址', 'error');
      getEmailVerifyCodeButtonState.value = false;
      return false;
    }
  }

  if (info.captcha === '') {
    $msg('请填写图片验证码', 'error');
    getEmailVerifyCodeButtonState.value = false;
    return false;
  }

  try {
    let body, apiEndpoint;

    if (currentLoginMethod.value === 'email') {
      // 邮箱登录验证码
      apiEndpoint = 'MailLoginCode';
      body = new URLSearchParams();
      body.append('id', captchaInfo.value.id);
      body.append('key', info.captcha);
      body.append('mail', info.mail);
    } else {
      // 短信验证码
      apiEndpoint = 'SendLoginSMS';
      body = new URLSearchParams();
      body.append('phone', info.mail); // 手机号存储在mail字段中
      body.append('id', captchaInfo.value.id); // 验证码ID
      body.append('key', info.captcha); // 验证码key
    }

    const res = await $myFetch(apiEndpoint, {
      method: 'POST',
      body,
    });

    if (res.code === 200) {
      $msg(res.data, 'success');
      info.sign = res.data;
      startSmsLoginCountdown();
    } else {
      $msg(res.msg, 'error');
      getCaptchaInfo();
      info.captcha = '';
    }
  } catch (error) {
    $msg('发送验证码失败，请稍后重试', 'error');
  } finally {
    getEmailVerifyCodeButtonState.value = false;
  }
};

// 邮箱登录
const mailLogin = async () => {
  if (!isPolicyAgreed.value) {
    $msg('请阅读并同意隐私政策和用户协议', 'error');
    return false;
  }
  if (info.mail === '' || info.mailCode === '') {
    $msg('请填写完整的登录信息', 'error');
    return false;
  }

  // 根据登录方式验证输入格式
  if (currentLoginMethod.value === 'sms') {
    // 手机号格式验证
    const phoneRule = /^1[3-9]\d{9}$/;
    if (!phoneRule.test(info.mail)) {
      $msg('请填写正确的手机号', 'error');
      return false;
    }
  } else {
    // 邮箱格式验证
    if (rule.test(info.mail) === false) {
      $msg('请填写正确的邮箱地址', 'error');
      return false;
    }
  }

  loginAndRegisterButtonStatus.value = true;

  try {
    const body = new URLSearchParams();

    // 根据配置选择不同的登录接口和参数
    let apiEndpoint;
    if (currentLoginMethod.value === 'email') {
      apiEndpoint = 'MailLogin';
      body.append('mail', info.mail);
      body.append('code', info.mailCode);
    } else {
      apiEndpoint = 'SmsLogin';
      body.append('phone', info.mail); // 手机号存储在mail字段中
      body.append('code', info.mailCode);
    }

    const res = await $myFetch(apiEndpoint, {
      method: 'POST',
      body,
    });

    if (res.code === 200 && res.data.username) {
      // 设置cookie
      username.value = res.data.username;
      token.value = res.data.token;

      // 将 token 同时保存到 usestate
      const authorization = useCookie('token');
      authorization.value = res.data.token;

      $msg('登录成功', 'success');

      routeInfo.value = res.data.routeInfo;
      markAdminHomePopupPending();
      navigateTo('/admin');
    } else {
      $msg(res.msg, 'error');
    }
  } catch (error) {
    $msg('登录失败，请稍后重试', 'error');
  } finally {
    loginAndRegisterButtonStatus.value = false;
  }
};

// 获取配置信息
const options = useState('options');

// GitHub 登录
const githubLoginLoading = ref(false);
const chjhLoginLoading = ref('');
const chjhLoginProviders = [
  {
    type: 'qq',
    label: 'QQ',
    short: 'QQ',
    color: '#12b7f5',
    icon: '/icons/chjh/qq.svg',
  },
  {
    type: 'wx',
    label: '微信',
    short: '微',
    color: '#07c160',
    icon: '/icons/chjh/wx.svg',
  },
  {
    type: 'wxmp',
    label: '公众号',
    short: '公',
    color: '#1aad19',
    icon: '/icons/chjh/wxmp.svg',
  },
  {
    type: 'alipay',
    label: '支付宝',
    short: '支',
    color: '#1677ff',
    icon: '/icons/chjh/alipay.svg',
  },
  {
    type: 'sina',
    label: '微博',
    short: '微',
    color: '#e6162d',
    icon: '/icons/chjh/sina.svg',
  },
  {
    type: 'baidu',
    label: '百度',
    short: '百',
    color: '#2932e1',
    icon: '/icons/chjh/baidu.svg',
  },
  {
    type: 'douyin',
    label: '抖音',
    short: '抖',
    color: '#111827',
    icon: '/icons/chjh/douyin.png',
  },
  {
    type: 'huawei',
    label: '华为',
    short: '华',
    color: '#cf0a2c',
    icon: '/icons/chjh/huawei.svg',
  },
  {
    type: 'xiaomi',
    label: '小米',
    short: '米',
    color: '#ff6900',
    icon: '/icons/chjh/xiaomi.svg',
  },
  {
    type: 'google',
    label: '谷歌',
    short: 'G',
    color: '#4285f4',
    icon: '/icons/chjh/google.svg',
  },
  {
    type: 'microsoft',
    label: '微软',
    short: 'M',
    color: '#00a4ef',
    icon: '/icons/chjh/microsoft.svg',
  },
  {
    type: 'wework',
    label: '企业微信',
    short: '企',
    color: '#2f86f6',
    icon: '/icons/chjh/wework.svg',
  },
  {
    type: 'dingtalk',
    label: '钉钉',
    short: '钉',
    color: '#1677ff',
    icon: '/icons/chjh/dingtalk.png',
  },
  {
    type: 'gitee',
    label: 'Gitee',
    short: 'G',
    color: '#c71d23',
    icon: '/icons/chjh/gitee.svg',
  },
  {
    type: 'github',
    label: 'GitHub',
    short: 'GH',
    color: '#24292f',
    icon: '/icons/chjh/github.svg',
  },
  {
    type: 'appleid',
    label: 'Apple',
    short: 'A',
    color: '#111827',
    icon: '/icons/chjh/appleid.svg',
  },
  {
    type: 'bilibili',
    label: '哔哩哔哩',
    short: 'B',
    color: '#00aeec',
    icon: '/icons/chjh/bilibili.svg',
  },
  {
    type: 'gitlab',
    label: 'Gitlab',
    short: 'GL',
    color: '#fc6d26',
    icon: '/icons/chjh/gitlab.svg',
  },
  {
    type: 'kuaishou',
    label: '快手',
    short: '快',
    color: '#ff4906',
    icon: '/icons/chjh/kuaishou.svg',
  },
];

const enabledChjhProviders = computed(() => {
  const configuredProviders = options.value?.chjhProviders;
  if (!Array.isArray(configuredProviders) || configuredProviders.length === 0) {
    return chjhLoginProviders;
  }

  const enabledTypes = new Set(configuredProviders);
  return chjhLoginProviders.filter((provider) =>
    enabledTypes.has(provider.type),
  );
});

const githubLogin = async () => {
  if (!isPolicyAgreed.value) {
    $msg('请阅读并同意隐私政策和用户协议', 'error');
    return;
  }
  githubLoginLoading.value = true;
  try {
    const res = await $myFetch('GitHubLogin', {
      method: 'GET',
    });
    if (res.code === 200 && res.data && res.data.url) {
      window.location.href = res.data.url;
    } else {
      $msg(res.msg || 'GitHub 登录暂不可用', 'error');
    }
  } catch (error) {
    $msg('获取 GitHub 授权地址失败', 'error');
  } finally {
    githubLoginLoading.value = false;
  }
};

// 彩虹聚合登录
const chjhLogin = async (providerType = 'qq') => {
  if (!isPolicyAgreed.value) {
    $msg('请阅读并同意隐私政策和用户协议', 'error');
    return;
  }
  chjhLoginLoading.value = providerType;
  try {
    const res = await $myFetch(
      `ChjhLogin?type=${encodeURIComponent(providerType)}`,
      {
        method: 'GET',
      },
    );
    if (res.code === 200 && res.data && res.data.url) {
      if (process.client) {
        sessionStorage.setItem('chjh_login_pending', providerType);
      }
      window.location.href = res.data.url;
    } else {
      $msg(res.msg || '彩虹聚合登录暂不可用', 'error');
    }
  } catch (error) {
    $msg('获取彩虹聚合登录地址失败', 'error');
  } finally {
    chjhLoginLoading.value = '';
  }
};

// 处理 GitHub OAuth 回调
const handleGithubCallback = async (code, state) => {
  githubLoginLoading.value = true;
  try {
    const body = new URLSearchParams();
    body.append('code', code);
    body.append('state', state);
    const res = await $myFetch('GitHubCallback', {
      method: 'POST',
      body,
    });
    if (res.code === 200 && res.data.username) {
      username.value = res.data.username;
      token.value = res.data.token;

      const authorization = useCookie('token');
      authorization.value = res.data.token;

      $msg('GitHub 登录成功', 'success');

      routeInfo.value = res.data.routeInfo;
      markAdminHomePopupPending();
      navigateTo('/admin');
    } else {
      $msg(res.msg || 'GitHub 登录失败', 'error');
    }
  } catch (error) {
    $msg('GitHub 登录失败，请稍后重试', 'error');
  } finally {
    githubLoginLoading.value = false;
  }
};

// 处理彩虹聚合登录回调
const handleChjhCallback = async (code, type) => {
  const providerType = String(type || '').toLowerCase();
  chjhLoginLoading.value = providerType;
  try {
    if (
      process.client &&
      sessionStorage.getItem('chjh_login_pending') !== providerType
    ) {
      $msg('彩虹聚合登录请求已过期，请重新登录', 'error');
      return;
    }
    if (process.client) {
      sessionStorage.removeItem('chjh_login_pending');
    }

    const body = new URLSearchParams();
    body.append('code', code);
    body.append('type', providerType);
    const res = await $myFetch('ChjhCallback', {
      method: 'POST',
      body,
    });
    if (res.code === 200 && res.data?.needBindEmail && res.data?.bindToken) {
      oauthBindToken.value = res.data.bindToken;
      isOAuthBindEmail.value = true;
      LoginIsRegister.value = true;
      isEmailLogin.value = false;
      isForgotPassword.value = false;
      info.mail = '';
      info.mailCode = '';
      $msg('请先绑定邮箱后继续登录', 'warning');
      return;
    }
    if (res.code === 200 && res.data.username) {
      applyLoginSuccess(res.data, '彩虹聚合登录成功');
    } else {
      $msg(res.msg || '彩虹聚合登录失败', 'error');
    }
  } catch (error) {
    $msg('彩虹聚合登录失败，请稍后重试', 'error');
  } finally {
    chjhLoginLoading.value = '';
  }
};

const resetOAuthBindEmail = () => {
  isOAuthBindEmail.value = false;
  oauthBindToken.value = '';
  info.mail = '';
  info.mailCode = '';
  LoginIsRegister.value = true;
};

const getOAuthBindMailCode = async () => {
  if (!oauthBindToken.value) {
    $msg('绑定会话已过期，请重新登录', 'error');
    resetOAuthBindEmail();
    return;
  }
  if (rule.test(info.mail) === false) {
    $msg('请填写正确的邮箱地址', 'error');
    return;
  }

  getOAuthBindVerifyCodeButtonState.value = true;
  try {
    const body = new URLSearchParams();
    body.append('bindToken', oauthBindToken.value);
    body.append('mail', info.mail);
    const res = await $myFetch('OAuthBindMailCode', {
      method: 'POST',
      body,
    });

    if (res.code === 200) {
      $msg(res.data || res.msg || '验证码已发送，请查收邮箱', 'success');
      startOAuthBindCountdown();
    } else {
      $msg(res.msg || '验证码发送失败', 'error');
    }
  } catch (error) {
    $msg('验证码发送失败，请稍后重试', 'error');
  } finally {
    getOAuthBindVerifyCodeButtonState.value = false;
  }
};

const oauthBindMail = async () => {
  if (!isPolicyAgreed.value) {
    $msg('请阅读并同意隐私政策和用户协议', 'error');
    return;
  }
  if (!oauthBindToken.value) {
    $msg('绑定会话已过期，请重新登录', 'error');
    resetOAuthBindEmail();
    return;
  }
  if (rule.test(info.mail) === false) {
    $msg('请填写正确的邮箱地址', 'error');
    return;
  }
  if (info.mailCode === '') {
    $msg('请填写邮箱验证码', 'error');
    return;
  }

  loginAndRegisterButtonStatus.value = true;
  try {
    const body = new URLSearchParams();
    body.append('bindToken', oauthBindToken.value);
    body.append('mail', info.mail);
    body.append('code', info.mailCode);
    const res = await $myFetch('OAuthBindMail', {
      method: 'POST',
      body,
    });

    if (res.code === 200 && res.data.username) {
      resetOAuthBindEmail();
      applyLoginSuccess(res.data, '邮箱绑定成功');
    } else {
      $msg(res.msg || '邮箱绑定失败', 'error');
    }
  } catch (error) {
    $msg('邮箱绑定失败，请稍后重试', 'error');
  } finally {
    loginAndRegisterButtonStatus.value = false;
  }
};

// 组件挂载时获取登录方式配置
onMounted(() => {
  getLoginMethodConfig();

  // 检测第三方登录回调
  const route = useRoute();
  const code = firstQueryValue(route.query.code);
  const state = firstQueryValue(route.query.state);
  const type = firstQueryValue(route.query.type);
  if (code && type) {
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);
    handleChjhCallback(code, type);
  } else if (code && state) {
    // 清除 URL 中的 code 和 state 参数
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);
    handleGithubCallback(code, state);
  }
});

useHead({
  title: '用户登录',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  style: [
    {
      children: options.value.css,
    },
  ],
});
</script>

<template>
  <div class="login-container">
    <div
      class="login-card"
      :class="{
        'is-register': !LoginIsRegister && !isForgotPassword && !isEmailLogin,
        'is-forgot': isForgotPassword,
        'is-email': isEmailLogin,
        'is-oauth-bind': isOAuthBindEmail,
      }"
    >
      <div class="card-header">
        <span
          class="back-btn"
          @click="
            isOAuthBindEmail
              ? resetOAuthBindEmail()
              : isForgotPassword
                ? toggleForgotPassword()
                : isEmailLogin
                  ? toggleEmailLogin()
                  : goBack()
          "
        >
          <img src="@/assets/images/goback.svg" alt="返回" />
          {{
            isOAuthBindEmail
              ? '返回登录'
              : isForgotPassword
                ? '返回登录'
                : isEmailLogin
                  ? '返回登录'
                  : '返回首页'
          }}
        </span>
        <div class="header-content">
          <h2 class="title">
            {{
              isOAuthBindEmail
                ? '绑定邮箱'
                : isForgotPassword
                  ? '找回密码'
                  : isEmailLogin
                    ? currentLoginMethod === 'sms'
                      ? '手机号登录'
                      : '邮箱登录'
                    : LoginIsRegister
                      ? '账号登录'
                      : '注册账号'
            }}
          </h2>
          <p class="subtitle">
            {{
              isOAuthBindEmail
                ? '第三方登录需要先绑定邮箱'
                : isForgotPassword
                  ? '输入您的用户名和邮箱找回密码'
                  : isEmailLogin
                    ? currentLoginMethod === 'sms'
                      ? '使用手机号验证码快速登录'
                      : '使用邮箱验证码快速登录'
                    : LoginIsRegister
                      ? '欢迎使用' + options.website_name + '，请登录您的账号'
                      : '欢迎加入' + options.website_name + '，请完成注册'
            }}
          </p>
        </div>
      </div>

      <div v-if="isOAuthBindEmail" class="form-container">
        <el-form :model="info" size="large">
          <div class="register-notice">
            <el-alert
              title="请输入邮箱并完成验证"
              description="如果邮箱已在平台注册，验证后会直接绑定该平台账号；如果未注册，将自动创建账号并绑定。"
              type="info"
              :closable="false"
            />
          </div>
          <el-form-item>
            <el-input
              v-model="info.mail"
              placeholder="请输入电子邮箱"
              prefix-icon="el-icon-message"
              @keyup.enter="oauthBindMail"
            />
          </el-form-item>
          <el-form-item>
            <div class="verify-code-container">
              <el-input
                v-model="info.mailCode"
                placeholder="邮件验证码"
                prefix-icon="el-icon-key"
                @keyup.enter="oauthBindMail"
              />
              <el-button
                @click="getOAuthBindMailCode"
                :loading="getOAuthBindVerifyCodeButtonState"
                :disabled="oauthBindCountdown > 0"
                class="verify-code-btn"
              >
                {{
                  oauthBindCountdown > 0
                    ? oauthBindCountdown + 's 后重新获取'
                    : '获取验证码'
                }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="isPolicyAgreed">
              我已阅读并同意
              <a href="/privacy" target="_blank">隐私政策</a>
              和
              <a href="/terms" target="_blank">用户协议</a>
            </el-checkbox>
          </el-form-item>
          <el-button
            type="primary"
            class="submit-btn"
            @click="oauthBindMail"
            :loading="loginAndRegisterButtonStatus"
          >
            绑定并登录
          </el-button>
        </el-form>
      </div>
      <div
        v-else-if="LoginIsRegister && !isForgotPassword && !isEmailLogin"
        class="form-container"
      >
        <el-form :model="info" size="large">
          <el-form-item>
            <el-input
              v-model="info.username"
              placeholder="请输入用户名/邮箱/手机号"
              prefix-icon="el-icon-user"
              @keyup.enter="login"
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="info.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              show-password
              @keyup.enter="login"
            />
          </el-form-item>
          <el-form-item>
            <div class="captcha-container">
              <el-input
                v-model="info.captcha"
                placeholder="计算图片验证码"
                prefix-icon="el-icon-picture"
                @keyup.enter="login"
              />
              <img
                :src="captchaInfo.url"
                alt="验证码"
                class="captcha-img"
                @click="getCaptchaInfo()"
              />
            </div>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="isPolicyAgreed">
              我已阅读并同意
              <a href="/privacy" target="_blank">隐私政策</a>
              和
              <a href="/terms" target="_blank">用户协议</a>
            </el-checkbox>
          </el-form-item>
          <el-button
            type="primary"
            class="submit-btn"
            @click="login"
            :loading="loginAndRegisterButtonStatus"
          >
            登录
          </el-button>
        </el-form>
        <div
          v-if="
            availableLoginMethods.includes('github') ||
            (availableLoginMethods.includes('chjh') &&
              enabledChjhProviders.length > 0)
          "
          class="third-party-login"
        >
          <div class="divider">
            <span>或使用第三方登录</span>
          </div>
          <div
            v-if="
              availableLoginMethods.includes('chjh') &&
              enabledChjhProviders.length > 0
            "
            class="chjh-provider-grid"
            :class="{ 'is-single': enabledChjhProviders.length === 1 }"
          >
            <el-button
              v-for="provider in enabledChjhProviders"
              :key="provider.type"
              class="chjh-provider-btn"
              :style="{ '--chjh-color': provider.color }"
              @click="chjhLogin(provider.type)"
              :loading="chjhLoginLoading === provider.type"
              :disabled="
                chjhLoginLoading !== '' && chjhLoginLoading !== provider.type
              "
            >
              <span class="chjh-icon">
                <img
                  v-if="provider.icon"
                  :src="provider.icon"
                  :alt="provider.label"
                  @error="
                    $event.target.parentElement.classList.add('is-fallback')
                  "
                />
                <span class="chjh-icon-fallback">{{ provider.short }}</span>
              </span>
              <span class="chjh-label">{{ provider.label }}</span>
            </el-button>
          </div>
          <el-button
            v-if="availableLoginMethods.includes('github')"
            class="github-btn"
            @click="githubLogin"
            :loading="githubLoginLoading"
          >
            <svg
              class="github-icon"
              viewBox="0 0 16 16"
              width="20"
              height="20"
              fill="currentColor"
            >
              <path
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
            GitHub 登录
          </el-button>
        </div>
        <div class="form-footer">
          <span>还没有账号？</span>
          <a @click="LoginIsRegisterChange">立即注册</a>
          <div class="forgot-link">
            <a @click="toggleForgotPassword">忘记密码？</a>
            <!-- 当同时支持邮箱和短信登录时，显示两个独立的选项 -->
            <template
              v-if="
                availableLoginMethods.includes('email') &&
                availableLoginMethods.includes('sms')
              "
            >
              <span class="separator">|</span>
              <a @click="toggleEmailLogin('email')">邮箱登录</a>
              <span class="separator">|</span>
              <a @click="toggleEmailLogin('sms')">手机号登录</a>
            </template>
            <!-- 当只支持单种验证码登录方式时，显示对应的选项 -->
            <template
              v-else-if="
                availableLoginMethods.length > 0 &&
                (availableLoginMethods.includes('email') ||
                  availableLoginMethods.includes('sms'))
              "
            >
              <span class="separator">|</span>
              <a @click="toggleEmailLogin">
                <template v-if="availableLoginMethods.includes('email')">
                  邮箱登录
                </template>
                <template v-else-if="availableLoginMethods.includes('sms')">
                  手机号登录
                </template>
              </a>
            </template>
          </div>
        </div>
      </div>
      <div v-else-if="isEmailLogin && !isForgotPassword" class="form-container">
        <!-- 登录方式被禁用的提示 -->
        <div v-if="isLoginDisabled" class="login-disabled-notice">
          <el-alert
            title="登录功能暂时不可用"
            description="管理员已禁用所有登录方式，请联系管理员或稍后再试。"
            type="warning"
            :closable="false"
            show-icon
          />
        </div>
        <el-form v-else :model="info" size="large">
          <div class="register-notice">
            <el-alert
              :title="
                currentLoginMethod === 'sms'
                  ? '手机号需与注册账号绑定，新用户请先注册'
                  : '邮箱需与注册账号绑定，新用户请先注册'
              "
              type="info"
              :closable="false"
            />
          </div>
          <el-form-item>
            <el-input
              v-model="info.mail"
              :placeholder="
                currentLoginMethod === 'sms' ? '请输入手机号' : '请输入电子邮箱'
              "
              :prefix-icon="
                currentLoginMethod === 'sms'
                  ? 'el-icon-phone'
                  : 'el-icon-message'
              "
              @keyup.enter="mailLogin"
            >
              <template #prepend v-if="currentLoginMethod === 'sms'">
                <span>+86</span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <div class="captcha-container">
              <el-input
                v-model="info.captcha"
                placeholder="图片验证码"
                prefix-icon="el-icon-picture"
              />
              <img
                :src="captchaInfo.url"
                alt="验证码"
                class="captcha-img"
                @click="getCaptchaInfo()"
              />
            </div>
          </el-form-item>
          <el-form-item>
            <div class="verify-code-container">
              <el-input
                v-model="info.mailCode"
                :placeholder="
                  currentLoginMethod === 'sms' ? '短信验证码' : '邮件验证码'
                "
                prefix-icon="el-icon-key"
                @keyup.enter="mailLogin"
              />
              <el-button
                @click="getMailLoginCode"
                :loading="getEmailVerifyCodeButtonState"
                :disabled="smsLoginCountdown > 0"
                class="verify-code-btn"
              >
                {{
                  smsLoginCountdown > 0
                    ? smsLoginCountdown + 's 后重新获取'
                    : '获取验证码'
                }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="isPolicyAgreed">
              我已阅读并同意
              <a href="/privacy" target="_blank">隐私政策</a>
              和
              <a href="/terms" target="_blank">用户协议</a>
            </el-checkbox>
          </el-form-item>
          <el-button
            type="primary"
            class="submit-btn"
            @click="mailLogin"
            :loading="loginAndRegisterButtonStatus"
          >
            登录
          </el-button>
        </el-form>
        <div class="form-footer">
          <span>还没有账号？</span>
          <a @click="LoginIsRegisterChange">立即注册</a>
          <br /><br />
          <span>使用其他方式？</span>
          <a @click="toggleEmailLogin(false)">账号登录</a>
          <!-- 只有当支持多种验证码登录方式时才显示切换链接 -->
          <template
            v-if="
              availableLoginMethods.length > 1 &&
              availableLoginMethods.includes('email') &&
              availableLoginMethods.includes('sms')
            "
          >
            <span class="separator">|</span>
            <a @click="toggleEmailLogin(true)">
              切换到{{
                currentLoginMethod === 'sms' ? '邮箱登录' : '手机号登录'
              }}
            </a>
          </template>
        </div>
      </div>
      <div v-else-if="isForgotPassword" class="form-container">
        <el-form :model="info" size="large">
          <el-form-item>
            <el-input
              v-model="info.username"
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="info.mail"
              placeholder="请输入注册时使用的电子邮箱"
              prefix-icon="el-icon-message"
            />
          </el-form-item>
          <el-form-item>
            <div class="captcha-container">
              <el-input
                v-model="info.captcha"
                placeholder="图片验证码"
                prefix-icon="el-icon-picture"
              />
              <img
                :src="captchaInfo.url"
                alt="验证码"
                class="captcha-img"
                @click="getCaptchaInfo()"
              />
            </div>
          </el-form-item>
          <el-button
            type="primary"
            class="submit-btn"
            @click="resetPassword"
            :loading="loginAndRegisterButtonStatus"
          >
            发送重置链接
          </el-button>
        </el-form>
        <div class="form-footer">
          <span>记起密码了？</span>
          <a @click="toggleForgotPassword">返回登录</a>
        </div>
      </div>
      <div
        v-else-if="!LoginIsRegister && !isForgotPassword && !isEmailLogin"
        class="form-container"
      >
        <el-form :model="info" size="large">
          <el-form-item>
            <el-input
              v-model="info.username"
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="info.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="info.mail"
              placeholder="请输入电子邮箱"
              prefix-icon="el-icon-message"
            />
          </el-form-item>
          <el-form-item>
            <div class="captcha-container">
              <el-input
                v-model="info.captcha"
                placeholder="图片验证码"
                prefix-icon="el-icon-picture"
              />
              <img
                :src="captchaInfo.url"
                alt="验证码"
                class="captcha-img"
                @click="getCaptchaInfo()"
              />
            </div>
          </el-form-item>
          <el-form-item>
            <div class="verify-code-container">
              <el-input
                v-model="info.mailCode"
                placeholder="邮件验证码"
                prefix-icon="el-icon-key"
              />
              <el-button
                @click="getMailCode"
                :loading="getVerifyCodeButtonState"
                :disabled="smsCountdown > 0"
                class="verify-code-btn"
              >
                {{
                  smsCountdown > 0
                    ? smsCountdown + 's 后重新获取'
                    : '获取验证码'
                }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="isPolicyAgreed">
              我已阅读并同意
              <a href="/privacy" target="_blank">隐私政策</a>
              和
              <a href="/terms" target="_blank">用户协议</a>
            </el-checkbox>
          </el-form-item>
          <el-button type="primary" class="submit-btn" @click="register">
            注册
          </el-button>
        </el-form>
        <div class="form-footer">
          <span>已有账号？</span>
          <a @click="LoginIsRegisterChange">立即登录</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  padding: 20px;
  a {
    color: #409eff;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    min-height: 560px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: height 0.3s ease;
    display: flex;
    flex-direction: column;

    &.is-register {
      height: 650px;
    }

    &.is-forgot {
      height: 450px;
    }

    &.is-email {
      height: 600px;
    }

    &.is-oauth-bind {
      height: 470px;
    }

    .card-header {
      padding: 32px 32px 24px;
      position: relative;
      background: #fff;
      flex-shrink: 0;

      .back-btn {
        display: inline-flex;
        align-items: center;
        color: #98a6ad;
        font-size: 13px;
        font-weight: bold;
        cursor: pointer;
        transition: color 0.3s;
        position: absolute;
        left: 32px;
        top: 32px;

        img {
          width: 13px;
          height: 13px;
          margin-right: 2px;
          opacity: 0.8;
        }

        &:hover {
          color: #409eff;
          img {
            opacity: 1;
          }
        }
      }

      .header-content {
        text-align: center;
        padding-top: 48px;

        .title {
          margin: 0 0 12px;
          font-size: 24px;
          font-weight: 600;
          color: #606266;
        }

        .subtitle {
          margin: 0;
          font-size: 14px;
          color: #909399;
        }
      }
    }

    .form-container {
      padding: 0 32px 32px;
      flex: 1;

      .register-notice {
        margin-bottom: 16px;

        :deep(.el-alert) {
          padding: 8px 12px;

          .el-alert__title {
            font-size: 13px;
          }
        }
      }

      .el-form-item {
        margin-bottom: 20px;
      }

      .el-input {
        --el-input-height: 40px;

        :deep(.el-input__wrapper) {
          box-shadow: 0 0 0 1px #dcdfe6 inset;

          &.is-focus {
            box-shadow: 0 0 0 1px #409eff inset;
          }
        }

        :deep(.el-input__inner) {
          font-size: 14px;
        }
      }

      .captcha-container {
        display: flex;
        gap: 12px;

        .captcha-img {
          height: 40px;
          border-radius: 4px;
          cursor: pointer;
        }
      }

      .verify-code-container {
        display: flex;
        gap: 12px;

        .el-input {
          flex: 1;
        }

        .verify-code-btn {
          width: 120px;
          height: 40px;
        }
      }

      .submit-btn {
        width: 100%;
        height: 40px;
        font-size: 15px;
      }
    }

    .third-party-login {
      padding: 0 32px;

      .divider {
        display: flex;
        align-items: center;
        margin: 16px 0;

        &::before,
        &::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #dcdfe6;
        }

        span {
          padding: 0 12px;
          font-size: 12px;
          color: #909399;
          white-space: nowrap;
        }
      }

      .github-btn {
        width: 100%;
        height: 40px;
        font-size: 14px;
        margin-left: 0;
        border: none;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: background-color 0.3s;
      }

      .chjh-provider-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        margin-bottom: 12px;

        &.is-single {
          grid-template-columns: minmax(0, 1fr);

          .chjh-provider-btn,
          .chjh-provider-btn :deep(> span) {
            justify-content: center;
          }
        }
      }

      .chjh-provider-btn {
        --chjh-color: #409eff;
        width: 100%;
        height: 44px;
        margin-left: 0;
        padding: 0 10px;
        color: #303133;
        background: #fff;
        border: 1px solid #e7edf3;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(28, 35, 49, 0.04);
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease,
          border-color 0.2s ease,
          color 0.2s ease;

        &:hover,
        &:focus {
          transform: translateY(-2px);
          border-color: var(--chjh-color);
          color: var(--chjh-color);
          box-shadow: 0 8px 18px rgba(28, 35, 49, 0.1);
        }

        &:active {
          transform: translateY(0);
        }

        &.is-disabled {
          transform: none;
          box-shadow: none;
        }

        :deep(.el-loading-spinner .path) {
          stroke: var(--chjh-color);
        }

        :deep(> span) {
          width: 100%;
          min-width: 0;
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
        }

        .chjh-icon {
          flex: 0 0 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          color: #fff;
          background: #fff;
          font-size: 10px;
          font-weight: 700;
          line-height: 1;

          img {
            display: block;
            width: 16px;
            height: 16px;
          }

          .chjh-icon-fallback {
            display: none;
          }

          &.is-fallback {
            background: var(--chjh-color);

            img {
              display: none;
            }

            .chjh-icon-fallback {
              display: inline;
            }
          }
        }

        .chjh-label {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .github-btn {
        color: #fff;
        background-color: #24292e;

        &:hover,
        &:focus {
          background-color: #3b4045;
          color: #fff;
        }

        &:active {
          background-color: #1b1f23;
        }

        .github-icon {
          flex-shrink: 0;
        }
      }

      .chjh-provider-grid + .github-btn {
        margin-top: 10px;
      }
    }

    .form-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: #606266;

      a {
        color: #409eff;
        margin-left: 4px;
        margin-right: 4px;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }

      .forgot-link {
        margin-top: 12px;

        a {
          color: #909399;

          &:hover {
            color: #409eff;
          }
        }

        .separator {
          margin: 0 8px;
          color: #dcdfe6;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .login-container {
    padding: 16px;

    .login-card {
      height: auto;
      min-height: 560px;

      &.is-register {
        height: 580px;
      }

      &.is-email {
        height: 530px;
      }

      &.is-oauth-bind {
        height: 500px;
      }

      .card-header {
        padding: 24px 24px 16px;

        .back-btn {
          left: 24px;
          top: 24px;
        }

        .header-content {
          padding-top: 40px;

          .title {
            font-size: 20px;
          }
        }
      }

      .form-container {
        padding: 0 24px 24px;

        .el-form-item {
          margin-bottom: 16px;
        }
      }

      .third-party-login {
        padding: 0 24px 24px;

        .chjh-provider-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));

          &.is-single {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      }
    }
  }
}
</style>
