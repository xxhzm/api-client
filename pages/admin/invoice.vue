<script setup>
import { Search, Plus, Edit, Delete } from "@element-plus/icons-vue";

definePageMeta({
  layout: "admin",
});

const { $msg, $myFetch, $decryptPhone } = useNuxtApp();

// 标签页状态
const activeName = ref("apply");

// 加载状态
const loading = ref(false);
const applyTableRef = ref();
const invoicePreviewVisible = ref(false);
const invoiceDocumentPanelRef = ref();
const invoicePreviewScale = ref(0.82);
let invoicePreviewResizeObserver = null;

// === 索取发票数据 ===
// 按明细数据
const applyData = ref([
  {
    id: "ORD202310010001",
    amount: 199.0,
    create_time: "2023-10-01 10:23:00",
    type: "消费",
    status: "可开票",
  },
  {
    id: "ORD202310150002",
    amount: 500.0,
    create_time: "2023-10-15 14:30:00",
    type: "充值",
    status: "可开票",
  },
]);

const selectedApply = ref([]);
const totalApplyAmountValue = computed(() => {
  return selectedApply.value.reduce((sum, item) => sum + item.amount, 0);
});
const totalApplyAmount = computed(() => {
  return totalApplyAmountValue.value.toFixed(2);
});

const invoiceTaxRate = 0.01;
const invoiceAmountWithoutTax = computed(() => {
  return totalApplyAmountValue.value / (1 + invoiceTaxRate);
});
const invoiceTaxAmount = computed(() => {
  return totalApplyAmountValue.value - invoiceAmountWithoutTax.value;
});
const formatLocalDate = (date = new Date(), separator = "-") => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return [year, month, day].join(separator);
};
const invoicePreviewNumber = computed(() => {
  return `INV${formatLocalDate(new Date(), "")}0001`;
});
const invoicePreviewDate = computed(() => {
  return formatLocalDate();
});
const invoiceTypeOptions = ["数字化电子普票 (电子)", "数字化电子专票 (电子)"];
const maxInvoiceTitleCount = 3;
const specModelOptions = [
  { label: "空白(发票上空白，不显示内容)", value: "blank" },
  { label: "无(发票上显示为“无”)", value: "无" },
];

const handleSelectionChange = (val) => {
  selectedApply.value = val;
};

// === 开票记录数据 ===
const recordsData = ref([
  {
    id: "INV202310200001",
    amount: 699.0,
    title: "广州某某科技有限公司",
    type: "数字化电子普票 (电子)",
    status: "已开具",
    create_time: "2023-10-20 16:00:00",
  },
]);

const showInvoiceRecordDetail = (row) => {
  navigateTo(`/admin/invoicedetail/${row.id}`);
};

// === 发票抬头数据 ===
const infoData = ref([]);

const invoiceTitleDialogVisible = ref(false);
const invoiceTitleSubmitting = ref(false);
const invoiceTitleFormRef = ref();
const invoiceTitleMode = ref("create");
const invoiceTitleDeletingId = ref(null);
const invoiceTitleForm = reactive({
  id: null,
  title: "",
  type: "企业",
  tax_id: "",
  company_address: "",
  company_phone: "",
  bank_name: "",
  bank_account: "",
  is_default: false,
});

const isCompanyInvoiceTitle = () => invoiceTitleForm.type === "企业";

const commonNamePattern =
  /^[\u4e00-\u9fa5A-Za-z0-9（）()【】\[\]《》·.&＆、\-\s]+$/;
const addressPattern =
  /^[\u4e00-\u9fa5A-Za-z0-9（）()【】\[\]《》·.,，、:：;；/#号\-\s]+$/;
const taxNumberPattern = /^[0-9A-Z]+$/;
const bankAccountPattern = /^\d+$/;
const mobilePhonePattern = /^1[3-9]\d{9}$/;
const fixedPhonePattern = /^(?:0\d{2,3}-?)?\d{7,8}(?:-\d{1,6})?$/;

const getTrimmedValue = (value) => String(value || "").trim();

const validateInvoiceTitle = (_rule, value, callback) => {
  const text = getTrimmedValue(value);

  if (!text) {
    callback(new Error("请输入发票抬头"));
    return;
  }

  if (!isCompanyInvoiceTitle()) {
    if (!/^[\u4e00-\u9fa5]{2,8}$/.test(text)) {
      callback(new Error("个人抬头仅支持 2-8 个汉字"));
      return;
    }

    callback();
    return;
  }

  if (text.length < 2 || text.length > 100 || !commonNamePattern.test(text)) {
    callback(new Error("企业名称需为 2-100 位中文、字母、数字或常用名称符号"));
    return;
  }

  callback();
};

const validateCompanyField = ({
  requiredMessage,
  invalidMessage,
  validate,
}) => (_rule, value, callback) => {
  if (!isCompanyInvoiceTitle()) {
    callback();
    return;
  }

  const text = getTrimmedValue(value);

  if (!text) {
    callback(new Error(requiredMessage));
    return;
  }

  if (!validate(text)) {
    callback(new Error(invalidMessage));
    return;
  }

  callback();
};

const invoiceTitleRules = {
  title: [
    {
      required: true,
      validator: validateInvoiceTitle,
      trigger: "blur",
    },
  ],
  type: [{ required: true, message: "请选择抬头类型", trigger: "change" }],
  tax_id: [
    {
      required: true,
      validator: validateCompanyField({
        requiredMessage: "请输入纳税人识别号",
        invalidMessage: "税号需为 15、18 或 20 位数字/大写字母",
        validate: (text) =>
          [15, 18, 20].includes(text.length) && taxNumberPattern.test(text),
      }),
      trigger: "blur",
    },
  ],
  company_address: [
    {
      required: true,
      validator: validateCompanyField({
        requiredMessage: "请输入企业地址",
        invalidMessage: "地址需为 5-120 位常用地址字符",
        validate: (text) =>
          text.length >= 5 && text.length <= 120 && addressPattern.test(text),
      }),
      trigger: "blur",
    },
  ],
  company_phone: [
    {
      required: true,
      validator: validateCompanyField({
        requiredMessage: "请输入企业电话",
        invalidMessage: "电话需为中国大陆手机号或固定电话",
        validate: (text) =>
          mobilePhonePattern.test(text) || fixedPhonePattern.test(text),
      }),
      trigger: "blur",
    },
  ],
  bank_name: [
    {
      required: true,
      validator: validateCompanyField({
        requiredMessage: "请输入开户银行",
        invalidMessage: "开户行需为 2-64 位中文、字母、数字或常用名称符号",
        validate: (text) =>
          text.length >= 2 &&
          text.length <= 64 &&
          commonNamePattern.test(text),
      }),
      trigger: "blur",
    },
  ],
  bank_account: [
    {
      required: true,
      validator: validateCompanyField({
        requiredMessage: "请输入银行账号",
        invalidMessage: "银行账号需为 8-30 位数字",
        validate: (text) =>
          text.length >= 8 &&
          text.length <= 30 &&
          bankAccountPattern.test(text),
      }),
      trigger: "blur",
    },
  ],
};

const decryptInvoiceTitleValue = (value, token) => {
  if (!value || !token) return value || "";

  try {
    return $decryptPhone(value, token) || "";
  } catch {
    return value || "";
  }
};

const mapInvoiceTitle = (item, token) => ({
  id: item.id,
  title: decryptInvoiceTitleValue(item.invoice_title, token),
  tax_id: decryptInvoiceTitleValue(item.tax_number, token),
  type: item.title_type === "personal" ? "个人" : "企业",
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
});

const sortInvoiceTitles = (list) => {
  return [...list].sort((a, b) => {
    if (a.is_default !== b.is_default) {
      return a.is_default ? -1 : 1;
    }

    return Number(a.id || 0) - Number(b.id || 0);
  });
};

const invoiceTitleDialogTitle = computed(() =>
  invoiceTitleMode.value === "edit" ? "编辑发票抬头" : "新增发票抬头",
);
const canCreateInvoiceTitle = computed(
  () => infoData.value.length < maxInvoiceTitleCount,
);
const invoiceTitleCountText = computed(
  () => `${infoData.value.length}/${maxInvoiceTitleCount}`,
);

const fetchInvoiceTitleList = async () => {
  try {
    const res = await $myFetch("InvoiceTitleList");

    if (res.code === 200) {
      const token = useCookie("token").value;

      infoData.value = sortInvoiceTitles(
        (res.data?.list || []).map((item) => mapInvoiceTitle(item, token)),
      );
      return;
    }

    $msg(res.msg || "获取发票抬头失败", "error");
  } catch (error) {
    $msg("获取发票抬头失败", "error");
  }
};

const resetInvoiceTitleForm = () => {
  invoiceTitleForm.id = null;
  invoiceTitleForm.title = "";
  invoiceTitleForm.type = "企业";
  invoiceTitleForm.tax_id = "";
  invoiceTitleForm.company_address = "";
  invoiceTitleForm.company_phone = "";
  invoiceTitleForm.bank_name = "";
  invoiceTitleForm.bank_account = "";
  invoiceTitleForm.is_default = false;
  invoiceTitleFormRef.value?.clearValidate?.();
};

const openInvoiceTitleDialog = () => {
  if (!canCreateInvoiceTitle.value) {
    $msg(`每个用户最多创建 ${maxInvoiceTitleCount} 个发票抬头`, "warning");
    return;
  }

  invoiceTitleMode.value = "create";
  resetInvoiceTitleForm();
  invoiceTitleDialogVisible.value = true;
};

const openEditInvoiceTitleDialog = (row) => {
  invoiceTitleMode.value = "edit";
  invoiceTitleForm.id = row.id;
  invoiceTitleForm.title = row.title || "";
  invoiceTitleForm.type = row.type || "企业";
  invoiceTitleForm.tax_id = row.tax_id || "";
  invoiceTitleForm.company_address = row.company_address || "";
  invoiceTitleForm.company_phone = row.company_phone || "";
  invoiceTitleForm.bank_name = row.bank_name || "";
  invoiceTitleForm.bank_account = row.bank_account || "";
  invoiceTitleForm.is_default = Boolean(row.is_default);
  invoiceTitleDialogVisible.value = true;
  nextTick(() => {
    invoiceTitleFormRef.value?.clearValidate?.();
  });
};

const handleInvoiceTitleTypeChange = () => {
  if (!isCompanyInvoiceTitle()) {
    invoiceTitleForm.tax_id = "";
    invoiceTitleForm.company_address = "";
    invoiceTitleForm.company_phone = "";
    invoiceTitleForm.bank_name = "";
    invoiceTitleForm.bank_account = "";
  }
  invoiceTitleFormRef.value?.clearValidate?.([
    "title",
    "tax_id",
    "company_address",
    "company_phone",
    "bank_name",
    "bank_account",
  ]);
};

const handleTaxIdInput = (value) => {
  invoiceTitleForm.tax_id = String(value || "").toUpperCase();
};

const submitInvoiceTitle = async () => {
  if (!invoiceTitleFormRef.value) return;

  if (invoiceTitleMode.value === "create" && !canCreateInvoiceTitle.value) {
    $msg(`每个用户最多创建 ${maxInvoiceTitleCount} 个发票抬头`, "warning");
    return;
  }

  try {
    await invoiceTitleFormRef.value.validate();
  } catch {
    return;
  }

  invoiceTitleSubmitting.value = true;
  try {
    const body = new URLSearchParams();
    const titleType = isCompanyInvoiceTitle() ? "company" : "personal";
    const requestName =
      invoiceTitleMode.value === "edit"
        ? "UpdateInvoiceTitle"
        : "CreateInvoiceTitle";

    if (invoiceTitleMode.value === "edit") {
      if (!invoiceTitleForm.id) {
        $msg("缺少发票抬头 ID", "error");
        return;
      }
      body.append("id", String(invoiceTitleForm.id));
    }
    if (invoiceTitleMode.value === "create") {
      body.append("titleType", titleType);
    }
    body.append("invoiceTitle", invoiceTitleForm.title.trim());
    body.append("isDefault", String(invoiceTitleForm.is_default));

    if (titleType === "company") {
      body.append("taxNumber", invoiceTitleForm.tax_id.trim().toUpperCase());
      body.append("companyAddress", invoiceTitleForm.company_address.trim());
      body.append("companyPhone", invoiceTitleForm.company_phone.trim());
      body.append("bankName", invoiceTitleForm.bank_name.trim());
      body.append("bankAccount", invoiceTitleForm.bank_account.trim());
    }

    const res = await $myFetch(requestName, {
      method: "POST",
      body,
    });

    if (res.code !== 200) {
      $msg(
        res.msg ||
          (invoiceTitleMode.value === "edit"
            ? "发票抬头修改失败"
            : "发票抬头新增失败"),
        "error",
      );
      return;
    }

    await fetchInvoiceTitleList();

    invoiceTitleDialogVisible.value = false;
    $msg(
      res.msg ||
        (invoiceTitleMode.value === "edit"
          ? "发票抬头修改成功"
          : "发票抬头新增成功"),
      "success",
    );
  } catch (error) {
    $msg(
      invoiceTitleMode.value === "edit"
        ? "发票抬头修改失败"
        : "发票抬头新增失败",
      "error",
    );
  } finally {
    invoiceTitleSubmitting.value = false;
  }
};

const deleteInvoiceTitle = async (row) => {
  invoiceTitleDeletingId.value = row.id;
  try {
    const res = await $myFetch("DeleteInvoiceTitle", {
      params: {
        id: row.id,
      },
    });

    if (res.code !== 200) {
      $msg(res.msg || "发票抬头删除失败", "error");
      return;
    }

    await fetchInvoiceTitleList();
    $msg(res.msg || "发票抬头删除成功", "success");
  } catch (error) {
    $msg("发票抬头删除失败", "error");
  } finally {
    invoiceTitleDeletingId.value = null;
  }
};

const invoiceApplySubmitting = ref(false);
const invoiceApplyFormRef = ref();
const invoiceApplyForm = reactive({
  title_id: null,
  invoice_type: invoiceTypeOptions[0],
  content: "软件服务费",
  spec_model: "blank",
  email: "",
  remark: "",
});

const invoiceApplyRules = {
  title_id: [{ required: true, message: "请选择发票抬头", trigger: "change" }],
  email: [
    { required: true, message: "请输入接收邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
};

const defaultInvoiceTitle = computed(() => {
  return (
    infoData.value.find((item) => item.is_default) || infoData.value[0] || null
  );
});

const selectedInvoiceTitle = computed(() => {
  return (
    infoData.value.find((item) => item.id === invoiceApplyForm.title_id) || null
  );
});
const formatInvoiceTitleSelectLabel = (item) => {
  if (!item) return "";

  const identity =
    item.type === "企业" && item.tax_id ? `税号：${item.tax_id}` : item.type;

  return `${item.title || "-"}（${identity}）`;
};
const formatInvoiceTitleMeta = (item) => {
  if (!item) return "-";

  const meta = [item.type];

  if (item.tax_id) {
    meta.push(`税号：${item.tax_id}`);
  }

  if (item.company_address) {
    meta.push(`地址：${item.company_address}`);
  }

  if (item.company_phone) {
    meta.push(`电话：${item.company_phone}`);
  }

  if (item.bank_name) {
    meta.push(`开户行：${item.bank_name}`);
  }

  if (item.bank_account) {
    meta.push(`账号：${item.bank_account}`);
  }

  return meta.join(" / ");
};
const isSpecialInvoice = computed(() => {
  return invoiceApplyForm.invoice_type.includes("专票");
});
const selectedTitleBankText = computed(() => {
  const bankName = selectedInvoiceTitle.value?.bank_name;
  const bankAccount = selectedInvoiceTitle.value?.bank_account;

  if (!bankName && !bankAccount) {
    return "购方开户银行：-；银行账号：-；";
  }

  return `购方开户银行：${bankName || "-"}；银行账号：${bankAccount || "-"}；`;
});
const invoiceSpecModelText = computed(() => {
  return invoiceApplyForm.spec_model === "blank"
    ? ""
    : invoiceApplyForm.spec_model;
});

const resetInvoiceApplyForm = () => {
  invoiceApplyForm.title_id = defaultInvoiceTitle.value?.id ?? null;
  invoiceApplyForm.invoice_type = invoiceTypeOptions[0];
  invoiceApplyForm.content = "软件服务费";
  invoiceApplyForm.spec_model = "blank";
  invoiceApplyForm.email = "";
  invoiceApplyForm.remark = "";
  invoiceApplyFormRef.value?.clearValidate?.();
};

const formatMoney = (value) => Number(value || 0).toFixed(2);

const toChineseCurrency = (value) => {
  const fraction = ["角", "分"];
  const digit = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
  const unit = [
    ["元", "万", "亿"],
    ["", "拾", "佰", "仟"],
  ];
  const head = value < 0 ? "负" : "";
  let amount = Math.abs(Number(value || 0));
  let suffix = "";

  fraction.forEach((item, index) => {
    suffix += (
      digit[Math.floor(amount * 10 * 10 ** index) % 10] + item
    ).replace(/零./, "");
  });
  suffix = suffix || "整";
  amount = Math.floor(amount);

  let integerText = "";
  for (let i = 0; i < unit[0].length && amount > 0; i += 1) {
    let partText = "";
    for (let j = 0; j < unit[1].length && amount > 0; j += 1) {
      partText = digit[amount % 10] + unit[1][j] + partText;
      amount = Math.floor(amount / 10);
    }
    integerText =
      partText.replace(/(零.)*零$/, "").replace(/^$/, "零") +
      unit[0][i] +
      integerText;
  }

  return (
    head +
    integerText
      .replace(/(零.)*零元/, "元")
      .replace(/(零.)+/g, "零")
      .replace(/^整$/, "零元整") +
    suffix
  );
};

const openInvoicePreview = async () => {
  if (!selectedApply.value.length) {
    $msg("请先选择开票明细", "warning");
    return;
  }

  if (totalApplyAmountValue.value < 100) {
    $msg("开票金额需满 100 元", "warning");
    return;
  }

  if (!infoData.value.length) {
    activeName.value = "info";
    $msg("请先新增发票抬头", "warning");
    return;
  }

  resetInvoiceApplyForm();
  invoicePreviewVisible.value = true;
  await nextTick();
  invoiceApplyFormRef.value?.clearValidate?.();
  updateInvoicePreviewScale();
};

const backToInvoiceApplyList = () => {
  invoicePreviewVisible.value = false;
};

const updateInvoicePreviewScale = async () => {
  await nextTick();

  const panelWidth = invoiceDocumentPanelRef.value?.clientWidth || 0;
  if (!panelWidth) return;

  const previewBaseWidth = 980;
  const previewHorizontalPadding = 28;
  const availableWidth = Math.max(panelWidth - previewHorizontalPadding, 1);
  const nextScale = Math.min(
    1.15,
    Math.max(0.1, availableWidth / previewBaseWidth),
  );

  invoicePreviewScale.value = Number(nextScale.toFixed(3));
};

const stopInvoicePreviewObserver = () => {
  invoicePreviewResizeObserver?.disconnect();
  invoicePreviewResizeObserver = null;
};

const startInvoicePreviewObserver = async () => {
  await nextTick();
  stopInvoicePreviewObserver();

  if (typeof ResizeObserver === "undefined" || !invoiceDocumentPanelRef.value) {
    updateInvoicePreviewScale();
    return;
  }

  invoicePreviewResizeObserver = new ResizeObserver(updateInvoicePreviewScale);
  invoicePreviewResizeObserver.observe(invoiceDocumentPanelRef.value);
  updateInvoicePreviewScale();
};

const submitInvoiceApply = async () => {
  if (!invoiceApplyFormRef.value) return;

  try {
    await invoiceApplyFormRef.value.validate();
  } catch {
    return;
  }

  if (
    isSpecialInvoice.value &&
    (!selectedInvoiceTitle.value?.bank_name ||
      !selectedInvoiceTitle.value?.bank_account)
  ) {
    $msg("申请专票请先在发票抬头中设置开户银行和银行账号", "warning");
    activeName.value = "info";
    invoicePreviewVisible.value = false;
    return;
  }

  invoiceApplySubmitting.value = true;
  try {
    const nextNumber = recordsData.value.length + 1;
    const nextId = `INV${formatLocalDate(new Date(), "")}${String(
      nextNumber,
    ).padStart(4, "0")}`;

    recordsData.value.unshift({
      id: nextId,
      amount: totalApplyAmountValue.value,
      title: selectedInvoiceTitle.value?.title || "-",
      type: invoiceApplyForm.invoice_type,
      status: "审核中",
      create_time: new Date().toLocaleString("zh-CN", {
        hour12: false,
      }),
    });

    const selectedIds = new Set(selectedApply.value.map((item) => item.id));
    applyData.value = applyData.value.filter(
      (item) => !selectedIds.has(item.id),
    );
    selectedApply.value = [];
    applyTableRef.value?.clearSelection?.();

    invoicePreviewVisible.value = false;
    activeName.value = "records";
    $msg("开票申请已提交", "success");
  } finally {
    invoiceApplySubmitting.value = false;
  }
};

// 模拟获取数据
const fetchData = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

onMounted(() => {
  fetchData();
  fetchInvoiceTitleList();
  window.addEventListener("resize", updateInvoicePreviewScale);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateInvoicePreviewScale);
  stopInvoicePreviewObserver();
});

watch(invoicePreviewVisible, (visible) => {
  if (visible) {
    startInvoicePreviewObserver();
    return;
  }

  stopInvoicePreviewObserver();
});

useHead({
  title: "发票管理",
  viewport:
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0",
  charset: "utf-8",
});
</script>

<template>
  <div class="invoice-container">
    <div class="invoice-card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <span class="title">发票管理</span>
        </div>
        <span class="header-meta">开票金额需满 100 元</span>
      </div>

      <!-- 内容区域 -->
      <div class="card-content">
        <el-tabs
          v-model="activeName"
          class="invoice-tabs"
          @tab-change="fetchData"
        >
          <!-- 索取发票 -->
          <el-tab-pane label="索取发票" name="apply">
            <div class="tab-pane-content" v-loading="loading">
              <template v-if="!invoicePreviewVisible">
                <el-alert
                  title="温馨提示：当前仅支持按消费明细申请发票。电子发票开具后将发送至您的邮箱，纸质发票将通过快递寄送。开票金额需满100元。"
                  type="info"
                  show-icon
                  :closable="false"
                  class="invoice-alert"
                />

                <div class="action-bar">
                  <div class="action-left">
                    <span class="selected-info">
                      已选金额：<span class="amount"
                        >¥{{ totalApplyAmount }}</span
                      >
                    </span>
                    <el-button
                      type="primary"
                      :disabled="selectedApply.length === 0"
                      @click="openInvoicePreview"
                    >
                      下一步
                    </el-button>
                  </div>
                  <div class="action-right">
                    <el-date-picker
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      class="date-range"
                    />
                    <el-button type="primary">
                      <el-icon><Search /></el-icon>
                      查询
                    </el-button>
                  </div>
                </div>

                <el-table
                  ref="applyTableRef"
                  :data="applyData"
                  @selection-change="handleSelectionChange"
                  class="invoice-table"
                  style="width: 100%"
                  empty-text="暂无可开票明细"
                >
                  <el-table-column type="selection" width="55" />
                  <el-table-column
                    prop="id"
                    label="订单号/流水号"
                    width="180"
                  />
                  <el-table-column prop="type" label="业务类型" width="100" />
                  <el-table-column
                    prop="create_time"
                    label="交易时间"
                    width="180"
                  />
                  <el-table-column prop="amount" label="可开票金额" width="150">
                    <template #default="scope">
                      <span class="table-amount"
                        >¥{{ scope.row.amount.toFixed(2) }}</span
                      >
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态">
                    <template #default="scope">
                      <el-tag type="success" size="small">{{
                        scope.row.status
                      }}</el-tag>
                    </template>
                  </el-table-column>
                </el-table>

                <div class="pagination">
                  <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :total="applyData.length"
                  />
                </div>
              </template>

              <template v-else>
                <div class="preview-step-header">
                  <div class="preview-step-title">
                    <span>确认开票信息</span>
                    <strong>¥{{ totalApplyAmount }}</strong>
                  </div>
                  <div class="preview-step-actions">
                    <el-button @click="backToInvoiceApplyList">
                      返回选择
                    </el-button>
                    <el-button
                      type="primary"
                      :loading="invoiceApplySubmitting"
                      @click="submitInvoiceApply"
                    >
                      提交申请
                    </el-button>
                  </div>
                </div>

                <div class="invoice-preview-layout">
                  <div class="invoice-config-panel">
                    <el-form
                      ref="invoiceApplyFormRef"
                      :model="invoiceApplyForm"
                      :rules="invoiceApplyRules"
                      label-width="90px"
                      class="invoice-preview-form"
                    >
                      <el-form-item label="发票抬头" prop="title_id">
                        <el-select
                          v-model="invoiceApplyForm.title_id"
                          placeholder="请选择发票抬头"
                          class="full-width"
                          popper-class="invoice-title-select-popper"
                        >
                          <el-option
                            v-for="item in infoData"
                            :key="item.id"
                            :label="formatInvoiceTitleSelectLabel(item)"
                            :value="item.id"
                          >
                            <div class="invoice-title-option">
                              <div class="invoice-title-option__main">
                                <span class="invoice-title-option__name">
                                  {{ item.title || "-" }}
                                </span>
                                <el-tag
                                  size="small"
                                  :type="
                                    item.type === '个人' ? 'success' : undefined
                                  "
                                >
                                  {{ item.type }}
                                </el-tag>
                                <el-tag
                                  v-if="item.is_default"
                                  type="warning"
                                  size="small"
                                >
                                  默认
                                </el-tag>
                              </div>
                              <div class="invoice-title-option__meta">
                                {{ formatInvoiceTitleMeta(item) }}
                              </div>
                            </div>
                          </el-option>
                        </el-select>
                        <div
                          v-if="selectedInvoiceTitle"
                          class="selected-title-meta"
                        >
                          {{ formatInvoiceTitleMeta(selectedInvoiceTitle) }}
                        </div>
                      </el-form-item>
                      <el-form-item label="发票类型">
                        <el-select
                          v-model="invoiceApplyForm.invoice_type"
                          placeholder="请选择发票类型"
                          class="full-width"
                        >
                          <el-option
                            v-for="item in invoiceTypeOptions"
                            :key="item"
                            :label="item"
                            :value="item"
                          />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="接收邮箱" prop="email">
                        <el-input
                          v-model="invoiceApplyForm.email"
                          placeholder="请输入接收发票的邮箱"
                        />
                      </el-form-item>
                      <el-form-item label="开票内容">
                        <el-input v-model="invoiceApplyForm.content" disabled />
                      </el-form-item>
                      <el-form-item label="规格型号">
                        <div class="spec-model-field">
                          <el-select
                            v-model="invoiceApplyForm.spec_model"
                            placeholder="请选择规格型号"
                            class="full-width"
                          >
                            <el-option
                              v-for="item in specModelOptions"
                              :key="item.label"
                              :label="item.label"
                              :value="item.value"
                            />
                          </el-select>
                          <div class="field-tip">
                            选择“空白”时发票上不显示内容；选择“无”时发票上显示“无”。
                          </div>
                        </div>
                      </el-form-item>
                      <el-form-item label="备注">
                        <el-input
                          v-model="invoiceApplyForm.remark"
                          type="textarea"
                          :rows="4"
                          maxlength="120"
                          show-word-limit
                          resize="none"
                          placeholder="选填，填写开票备注"
                        />
                      </el-form-item>
                    </el-form>
                  </div>

                  <div
                    ref="invoiceDocumentPanelRef"
                    class="invoice-document-panel"
                  >
                    <div
                      class="invoice-document-wrap"
                      :style="{
                        '--invoice-preview-scale': invoicePreviewScale,
                      }"
                    >
                      <div class="invoice-document">
                        <div class="invoice-doc-top">
                          <div class="invoice-doc-title">
                            {{ invoiceApplyForm.invoice_type }}
                          </div>
                          <div class="invoice-doc-meta">
                            <div>
                              <span>发票号码：</span>
                              <strong>{{ invoicePreviewNumber }}</strong>
                            </div>
                            <div>
                              <span>开票日期：</span>
                              <strong>{{ invoicePreviewDate }}</strong>
                            </div>
                          </div>
                        </div>

                        <div class="invoice-doc-party">
                          <div class="party-label">购买方信息</div>
                          <div class="party-content">
                            <div>
                              <span>名称：</span>
                              <strong>{{
                                selectedInvoiceTitle?.title || "-"
                              }}</strong>
                            </div>
                            <div>
                              <span>统一社会信用代码/纳税人识别号：</span>
                              <strong>{{
                                selectedInvoiceTitle?.tax_id || "-"
                              }}</strong>
                            </div>
                          </div>
                          <div class="party-label">销售方信息</div>
                          <div class="party-content">
                            <div>
                              <span>名称：</span>
                              <strong>xxxxxxxxxxxxxxxx</strong>
                            </div>
                            <div>
                              <span>统一社会信用代码/纳税人识别号：</span>
                              <strong>xxxxxxxxxxxxxxxx</strong>
                            </div>
                          </div>
                        </div>

                        <div class="invoice-doc-items">
                          <div class="doc-cell doc-head">
                            货物或应税劳务、服务名称
                          </div>
                          <div class="doc-cell doc-head">规格型号</div>
                          <div class="doc-cell doc-head">单位</div>
                          <div class="doc-cell doc-head">数量</div>
                          <div class="doc-cell doc-head">金 额</div>
                          <div class="doc-cell doc-head">税率</div>
                          <div class="doc-cell doc-head">税额</div>

                          <div class="doc-cell doc-value">
                            {{ invoiceApplyForm.content || "-" }}
                          </div>
                          <div class="doc-cell doc-value">
                            {{ invoiceSpecModelText }}
                          </div>
                          <div class="doc-cell doc-value">套</div>
                          <div class="doc-cell doc-value">1</div>
                          <div class="doc-cell doc-value">
                            ¥ {{ formatMoney(invoiceAmountWithoutTax) }}
                          </div>
                          <div class="doc-cell doc-value">1.00%</div>
                          <div class="doc-cell doc-value">
                            ¥ {{ formatMoney(invoiceTaxAmount) }}
                          </div>

                          <div class="doc-cell doc-total-label">合计</div>
                          <div class="doc-cell doc-total"></div>
                          <div class="doc-cell doc-total"></div>
                          <div class="doc-cell doc-total"></div>
                          <div class="doc-cell doc-total">
                            ¥ {{ formatMoney(invoiceAmountWithoutTax) }}
                          </div>
                          <div class="doc-cell doc-total"></div>
                          <div class="doc-cell doc-total">
                            ¥ {{ formatMoney(invoiceTaxAmount) }}
                          </div>
                        </div>

                        <div class="invoice-doc-amount">
                          <div class="amount-label">价税合计（大写）</div>
                          <div class="amount-cn">
                            {{ toChineseCurrency(totalApplyAmountValue) }}
                          </div>
                          <div class="amount-small">
                            （小写）¥ {{ totalApplyAmount }}
                          </div>
                        </div>

                        <div class="invoice-doc-remark">
                          <div class="remark-label">备 注</div>
                          <div class="remark-content">
                            <div>
                              {{ selectedTitleBankText }}
                            </div>
                            <div v-if="invoiceApplyForm.remark">
                              {{ invoiceApplyForm.remark }}
                            </div>
                          </div>
                        </div>

                        <div class="invoice-doc-footer">
                          <span>开票人：</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </el-tab-pane>

          <!-- 开票记录 -->
          <el-tab-pane label="开票记录" name="records">
            <div class="tab-pane-content" v-loading="loading">
              <div class="action-bar action-bar--right">
                <el-input
                  placeholder="请输入发票流水号/抬头"
                  class="search-input"
                >
                  <template #append>
                    <el-button :icon="Search" />
                  </template>
                </el-input>
              </div>

              <el-table
                :data="recordsData"
                class="invoice-table"
                style="width: 100%"
                empty-text="暂无开票记录"
              >
                <el-table-column prop="id" label="发票流水号" width="180" />
                <el-table-column
                  prop="title"
                  label="发票抬头"
                  show-overflow-tooltip
                />
                <el-table-column prop="type" label="发票类型" width="160" />
                <el-table-column prop="amount" label="开票金额" width="120">
                  <template #default="scope">
                    <span class="table-amount"
                      >¥{{ scope.row.amount.toFixed(2) }}</span
                    >
                  </template>
                </el-table-column>
                <el-table-column
                  prop="create_time"
                  label="申请时间"
                  width="180"
                />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag type="success" size="small">{{
                      scope.row.status
                    }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" fixed="right">
                  <template #default="scope">
                    <el-button
                      type="primary"
                      link
                      @click="showInvoiceRecordDetail(scope.row)"
                      >查看详情</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination">
                <el-pagination
                  background
                  layout="total, prev, pager, next"
                  :total="recordsData.length"
                />
              </div>
            </div>
          </el-tab-pane>

          <!-- 发票信息管理 -->
          <el-tab-pane label="发票信息管理" name="info">
            <div class="tab-pane-content" v-loading="loading">
              <div class="action-bar action-bar--left">
                <el-button
                  type="primary"
                  :disabled="!canCreateInvoiceTitle"
                  @click="openInvoiceTitleDialog"
                >
                  <el-icon><Plus /></el-icon>
                  新增发票抬头
                </el-button>
                <span
                  class="invoice-title-count"
                  :class="{ 'is-limit': !canCreateInvoiceTitle }"
                >
                  已创建 {{ invoiceTitleCountText }}，最多
                  {{ maxInvoiceTitleCount }} 个
                </span>
              </div>

              <div v-if="infoData.length" class="invoice-title-list">
                <div
                  v-for="(item, index) in infoData"
                  :key="item.id"
                  class="invoice-title-card"
                  :class="{ 'is-default': item.is_default }"
                >
                  <div class="invoice-title-card__top">
                    <div class="invoice-title-card__rank">
                      {{ index + 1 }}
                    </div>
                    <div class="invoice-title-card__heading">
                      <div class="invoice-title-card__name">
                        {{ item.title || "-" }}
                      </div>
                      <div class="invoice-title-card__tags">
                        <el-tag
                          size="small"
                          :type="item.type === '个人' ? 'success' : undefined"
                        >
                          {{ item.type }}
                        </el-tag>
                        <el-tag
                          v-if="item.is_default"
                          type="warning"
                          size="small"
                        >
                          默认抬头
                        </el-tag>
                      </div>
                    </div>
                    <div class="invoice-title-card__actions">
                      <el-button
                        type="primary"
                        link
                        :icon="Edit"
                        @click="openEditInvoiceTitleDialog(item)"
                      >
                        编辑
                      </el-button>
                      <el-popconfirm
                        confirm-button-text="确定"
                        cancel-button-text="取消"
                        title="确定要删除该发票抬头吗？"
                        @confirm="deleteInvoiceTitle(item)"
                      >
                        <template #reference>
                          <el-button
                            type="danger"
                            link
                            :icon="Delete"
                            :loading="invoiceTitleDeletingId === item.id"
                          >
                            删除
                          </el-button>
                        </template>
                      </el-popconfirm>
                    </div>
                  </div>

                  <div class="invoice-title-card__details">
                    <div class="invoice-title-card__detail">
                      <span>纳税人识别号</span>
                      <strong>{{ item.tax_id || "-" }}</strong>
                    </div>
                    <div class="invoice-title-card__detail">
                      <span>企业地址</span>
                      <strong>{{ item.company_address || "-" }}</strong>
                    </div>
                    <div class="invoice-title-card__detail">
                      <span>企业电话</span>
                      <strong>{{ item.company_phone || "-" }}</strong>
                    </div>
                    <div class="invoice-title-card__detail">
                      <span>开户银行</span>
                      <strong>{{ item.bank_name || "-" }}</strong>
                    </div>
                    <div class="invoice-title-card__detail">
                      <span>银行账号</span>
                      <strong>{{ item.bank_account || "-" }}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无发票抬头" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <el-dialog
      v-model="invoiceTitleDialogVisible"
      :title="invoiceTitleDialogTitle"
      width="520px"
      class="invoice-title-dialog"
      @closed="resetInvoiceTitleForm"
    >
      <el-form
        ref="invoiceTitleFormRef"
        :model="invoiceTitleForm"
        :rules="invoiceTitleRules"
        label-width="110px"
        class="invoice-title-form"
      >
        <el-form-item label="抬头类型" prop="type">
          <el-radio-group
            v-model="invoiceTitleForm.type"
            :disabled="invoiceTitleMode === 'edit'"
            @change="handleInvoiceTitleTypeChange"
          >
            <el-radio-button value="企业">企业</el-radio-button>
            <el-radio-button value="个人">个人</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="发票抬头" prop="title">
          <el-input
            v-model="invoiceTitleForm.title"
            :maxlength="isCompanyInvoiceTitle() ? 100 : 8"
            show-word-limit
            placeholder="请输入发票抬头"
          />
        </el-form-item>
        <el-form-item
          v-if="invoiceTitleForm.type === '企业'"
          label="纳税人识别号"
          prop="tax_id"
        >
          <el-input
            v-model="invoiceTitleForm.tax_id"
            maxlength="20"
            placeholder="请输入纳税人识别号"
            @input="handleTaxIdInput"
          />
        </el-form-item>
        <el-form-item
          v-if="invoiceTitleForm.type === '企业'"
          label="企业地址"
          prop="company_address"
        >
          <el-input
            v-model="invoiceTitleForm.company_address"
            maxlength="120"
            show-word-limit
            placeholder="请输入企业地址"
          />
        </el-form-item>
        <el-form-item
          v-if="invoiceTitleForm.type === '企业'"
          label="企业电话"
          prop="company_phone"
        >
          <el-input
            v-model="invoiceTitleForm.company_phone"
            maxlength="20"
            placeholder="请输入企业电话"
          />
        </el-form-item>
        <el-form-item
          v-if="invoiceTitleForm.type === '企业'"
          label="开户银行"
          prop="bank_name"
        >
          <el-input
            v-model="invoiceTitleForm.bank_name"
            maxlength="64"
            placeholder="请输入开户银行"
          />
        </el-form-item>
        <el-form-item
          v-if="invoiceTitleForm.type === '企业'"
          label="银行账号"
          prop="bank_account"
        >
          <el-input
            v-model="invoiceTitleForm.bank_account"
            maxlength="30"
            placeholder="请输入银行账号"
          />
        </el-form-item>
        <el-form-item label="默认抬头">
          <el-switch v-model="invoiceTitleForm.is_default" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="invoiceTitleDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="invoiceTitleSubmitting"
            @click="submitInvoiceTitle"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.invoice-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.invoice-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  padding: 16px 20px;
}

.card-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: flex-start;
}

.header-left .title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.header-meta {
  position: absolute;
  top: 0;
  right: 0;
  padding: 3px 8px;
  background: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 4px;
  font-size: 12px;
  color: #e6a23c;
  white-space: nowrap;
}

.card-content {
  min-width: 0;
}

.invoice-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }

  :deep(.el-tabs__item) {
    color: #606266;
    font-weight: 500;
  }

  :deep(.el-tabs__item.is-active) {
    color: #409eff;
  }
}

.tab-pane-content {
  min-height: 260px;
}

.invoice-alert {
  margin-bottom: 16px;
  border-radius: 8px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.action-bar--left {
  justify-content: flex-start;
}

.action-bar--right {
  justify-content: flex-end;
}

.action-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.action-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.invoice-title-count {
  color: #606266;
  font-size: 13px;
}

.invoice-title-count.is-limit {
  color: #e6a23c;
}

.selected-info {
  font-size: 14px;
  color: #606266;

  .amount {
    color: #f56c6c;
    font-size: 18px;
    font-weight: 600;
    margin-left: 5px;
  }
}

.date-range {
  width: 260px;
}

.search-input {
  width: 280px;
}

.invoice-table {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;

  :deep(.el-table__header th) {
    background: #f5f7fa;
    color: #606266;
    font-weight: 600;
  }

  :deep(.el-table__row:hover > td.el-table__cell) {
    background: #f5f7fa;
  }
}

.invoice-title-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.invoice-title-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 260px;
  padding: 14px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.invoice-title-card:hover {
  border-color: #c6e2ff;
  box-shadow: 0 6px 18px rgba(48, 49, 51, 0.08);
}

.invoice-title-card.is-default {
  border-color: #f3d19e;
  background: linear-gradient(180deg, #fffaf2 0%, #fff 42%);
}

.invoice-title-card__top {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  align-items: flex-start;
  min-width: 0;
}

.invoice-title-card__rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #ecf5ff;
  color: #409eff;
  font-size: 16px;
  font-weight: 700;
}

.invoice-title-card.is-default .invoice-title-card__rank {
  background: #fdf6ec;
  color: #e6a23c;
}

.invoice-title-card__heading {
  min-width: 0;
}

.invoice-title-card__name {
  overflow: hidden;
  color: #303133;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invoice-title-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.invoice-title-card__actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f2f5;
}

.invoice-title-card__details {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.invoice-title-card__detail {
  min-width: 0;
  padding: 9px 10px;
  border-radius: 6px;
  background: #f7f8fa;

  span {
    display: block;
    margin-bottom: 4px;
    color: #909399;
    font-size: 12px;
    line-height: 1.2;
  }

  strong {
    display: block;
    overflow: hidden;
    color: #303133;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.45;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.table-amount {
  color: #f56c6c;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.invoice-title-form {
  padding: 4px 4px 0 0;
}

.full-width {
  width: 100%;
}

.preview-step-header {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.preview-step-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #303133;
  font-size: 14px;
  font-weight: 600;

  strong {
    color: #f56c6c;
    font-size: 20px;
    font-weight: 600;
  }
}

.preview-step-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}

.invoice-preview-layout {
  display: grid;
  grid-template-columns: clamp(360px, 28vw, 560px) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.invoice-config-panel,
.invoice-document-panel {
  min-width: 0;
}

.invoice-preview-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.spec-model-field {
  width: 100%;
}

.field-tip {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
}

.selected-title-meta {
  margin-top: 6px;
  color: #606266;
  font-size: 12px;
  line-height: 1.5;
  word-break: break-all;
}

.invoice-title-option {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  min-width: 0;
  padding: 5px 0;
  line-height: 1.4;
}

.invoice-title-option__main {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.invoice-title-option__name {
  overflow: hidden;
  min-width: 0;
  color: #303133;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invoice-title-option__meta {
  overflow: hidden;
  color: #909399;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.invoice-title-select-popper .el-select-dropdown__item) {
  height: auto;
  min-height: 48px;
  padding-top: 4px;
  padding-bottom: 4px;
}

.invoice-document-wrap {
  overflow: hidden;
  display: flex;
  justify-content: flex-end;
  padding: 18px 14px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.invoice-document {
  width: 980px;
  box-sizing: border-box;
  padding: 14px;
  background: #fff;
  border: 1px solid #d8d8d8;
  color: #1f2933;
  zoom: var(--invoice-preview-scale, 0.82);
}

.invoice-doc-top {
  position: relative;
  min-height: 72px;
  padding-top: 4px;
}

.invoice-doc-title {
  width: 420px;
  margin: 0 auto;
  padding-bottom: 8px;
  border-bottom: 2px solid #b45309;
  color: #b45309;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0;
}

.invoice-doc-meta {
  position: absolute;
  top: 6px;
  right: 72px;
  color: #b45309;
  font-size: 13px;
  line-height: 1.8;

  strong {
    color: #303133;
    font-weight: 600;
  }
}

.invoice-doc-party {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) 46px minmax(0, 1fr);
  border: 1px solid #ea580c;
  color: #303133;
  font-size: 13px;
}

.party-label {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 92px;
  padding: 8px 0;
  border-right: 1px solid #ea580c;
  color: #b45309;
  font-weight: 600;
  line-height: 1.2;
  writing-mode: vertical-rl;
}

.party-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  padding: 14px 12px;
  border-right: 1px solid #ea580c;
  word-break: break-all;

  span {
    color: #b45309;
    font-weight: 600;
  }

  strong {
    font-weight: 500;
  }
}

.party-content:last-child {
  border-right: none;
}

.invoice-doc-items {
  display: grid;
  grid-template-columns:
    minmax(240px, 1.8fr) minmax(120px, 0.8fr) minmax(78px, 0.5fr)
    minmax(78px, 0.5fr) minmax(120px, 0.8fr) minmax(90px, 0.6fr)
    minmax(110px, 0.7fr);
  border-right: 1px solid #ea580c;
  border-left: 1px solid #ea580c;
  color: #303133;
  font-size: 13px;
}

.doc-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 8px 10px;
  word-break: break-all;
}

.doc-head {
  min-height: 40px;
  color: #b45309;
  font-weight: 600;
}

.doc-value {
  min-height: 74px;
}

.doc-total,
.doc-total-label {
  min-height: 38px;
  border-bottom: 1px solid #ea580c;
  color: #b45309;
}

.doc-total-label {
  justify-content: flex-start;
  padding-left: 56px;
  letter-spacing: 28px;
  font-weight: 600;
}

.invoice-doc-amount {
  display: grid;
  grid-template-columns: 300px 1fr 370px;
  min-height: 36px;
  border-right: 1px solid #ea580c;
  border-bottom: 1px solid #ea580c;
  border-left: 1px solid #ea580c;
  color: #b45309;
  font-size: 13px;
}

.amount-label,
.amount-cn,
.amount-small {
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.amount-label {
  font-weight: 600;
}

.amount-cn {
  border-left: 1px solid #ea580c;
  color: #303133;
  font-weight: 600;
}

.amount-small {
  justify-content: center;
  color: #b45309;
}

.invoice-doc-remark {
  display: grid;
  grid-template-columns: 46px 1fr;
  min-height: 90px;
  border-right: 1px solid #ea580c;
  border-bottom: 1px solid #ea580c;
  border-left: 1px solid #ea580c;
}

.remark-label {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ea580c;
  color: #b45309;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  writing-mode: vertical-rl;
}

.remark-content {
  padding: 12px;
  color: #303133;
  font-size: 13px;
  line-height: 1.7;
  word-break: break-all;
}

.invoice-doc-footer {
  padding: 12px 0 4px 62px;
  color: #b45309;
  font-size: 13px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.invoice-title-dialog) {
  border-radius: 8px;

  .el-dialog__header {
    margin-right: 0;
    padding: 18px 20px 14px;
    border-bottom: 1px solid #ebeef5;
  }

  .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .el-dialog__body {
    padding: 20px 20px 8px;
  }

  .el-dialog__footer {
    padding: 12px 20px 18px;
  }
}

@media screen and (max-width: 1200px) {
  .invoice-title-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media screen and (max-width: 768px) {
  .invoice-container {
    padding: 12px;
  }

  .invoice-card {
    padding: 14px;
  }

  .card-header {
    position: static;
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .header-meta {
    position: static;
    white-space: normal;
  }

  .action-bar,
  .action-left,
  .action-right {
    align-items: stretch;
    flex-direction: column;
  }

  .date-range,
  .search-input {
    width: 100%;
  }

  .pagination {
    justify-content: flex-start;
    overflow-x: auto;
  }

  .invoice-title-list {
    grid-template-columns: minmax(0, 1fr);
  }

  .invoice-title-card {
    min-height: 0;
  }

  :deep(.invoice-title-dialog) {
    width: calc(100vw - 24px) !important;

    .el-dialog__body {
      padding: 16px 16px 4px;
    }
  }

  .preview-step-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .preview-step-actions {
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .invoice-preview-form {
    gap: 14px;
  }

  .invoice-preview-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .invoice-document-wrap {
    justify-content: flex-start;
    padding: 12px;
  }

  .invoice-title-form {
    :deep(.el-form-item) {
      display: block;
    }

    :deep(.el-form-item__label) {
      justify-content: flex-start;
      width: 100% !important;
      margin-bottom: 6px;
    }

    :deep(.el-form-item__content) {
      margin-left: 0 !important;
    }
  }

  .invoice-preview-form {
    :deep(.el-form-item) {
      display: block;
    }

    :deep(.el-form-item__label) {
      justify-content: flex-start;
      width: 100% !important;
      margin-bottom: 6px;
    }

    :deep(.el-form-item__content) {
      margin-left: 0 !important;
    }
  }
}
</style>
