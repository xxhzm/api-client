<script setup>
import {
  Document,
  User,
  Service,
  Timer,
  Message,
  Phone,
  Location,
} from '@element-plus/icons-vue';

const options = useState('options');

useHead({
  title: '服务条款' + ' - ' + options.value.title,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    {
      name: 'description',
      content: options.value.website_name + ' - 服务条款',
    },
    {
      name: 'keywords',
      content: '服务条款,用户协议,API服务,使用条款',
    },
  ],
  style: [
    {
      children: options.value.css,
    },
  ],
});

const platformName =
  options.value?.website_name || options.value?.title || '本平台';

const termsData = ref([
  {
    id: 'agreement-effect',
    title: '协议的生效',
    color: '#3b82f6',
    content: `
      <p>欢迎您使用${platformName}提供的API服务。本服务条款（以下简称"本协议"）是您（"用户"）与${platformName}（"服务商"）之间，就服务商为您提供的API接口服务（"本服务"）所达成的合法协议。</p>
      <ol class="numbered-list">
        <li><span class="highlight">用户确认而生效</span>：本协议由服务商以在线方式提供。用户在购买、订阅或开通本服务时，应认真阅读本协议，并在保持本协议勾选/同意状态下进入下一步流程。一经用户确认，本协议即具有合同效力，对用户及服务商双方均具有法律约束力。</li>
        <li><span class="highlight">用户使用而生效</span>：用户通过注册账号、调用接口、下载SDK、在线访问等任一方式使用本服务，即表示用户已阅读、理解并同意接受本协议项下的全部条款。如您不接受本协议任一条款，请立即停止使用本服务。</li>
        <li><span class="highlight">未成年人使用</span>：若您为未满十八周岁的未成年人，请在法定监护人陪同下阅读并同意本协议后使用本服务。</li>
      </ol>
    `,
  },
  {
    id: 'definitions',
    title: '服务说明与定义',
    color: '#10b981',
    content: `
      <p>除本协议另有约定外，本协议下列术语具有以下含义：</p>
      <ul class="bullet-list">
        <li><span class="highlight">本服务 / API服务</span>：指服务商通过${platformName}面向用户提供的应用程序编程接口（API）及相关技术支持、文档、SDK等配套服务。</li>
        <li><span class="highlight">用户 / 您</span>：指阅读并同意本协议、合法注册账户、购买或调用本服务的个人或企业。</li>
        <li><span class="highlight">服务商 / 我们</span>：指${platformName}的运营主体及其关联方。</li>
        <li><span class="highlight">账户</span>：指用户在平台完成注册后获得的、用于访问本服务的唯一身份凭证，包括账号、密码、AppKey、AppSecret等认证信息。</li>
        <li><span class="highlight">调用数据</span>：指用户在使用本服务过程中通过API提交或从API返回的全部信息。</li>
      </ul>
    `,
  },
  {
    id: 'license',
    title: '使用许可',
    color: '#8b5cf6',
    content: `
      <p>本服务受《中华人民共和国网络安全法》《个人信息保护法》《数据安全法》《中华人民共和国电信条例》《互联网信息服务管理办法》以及其他相关知识产权法律、法规和条约的保护。本服务为授权用户使用许可，而非出售。</p>
      <ol class="numbered-list">
        <li><span class="highlight">权利归属</span>：本服务的全部版权、商标、专利及其他知识产权均归服务商或其合法权利人所有。</li>
        <li><span class="highlight">授权范围</span>：在用户遵守本协议的前提下，服务商授予用户一项<strong>非排他的、不可转让、不可分许可</strong>的使用权，用户仅可在所购买的套餐额度和期限内调用本服务。</li>
        <li><span class="highlight">权利限制</span>：用户不得转售、出租、出借、分许可或以其他方式将本服务的使用权转让给第三方以牟取商业利益；未经服务商书面同意，不得将API接口集成或嵌入到与服务商具有竞争关系的产品中。</li>
        <li><span class="highlight">逆向禁止</span>：除法律明确允许的情形外，用户不得对本服务进行逆向工程、反编译、反汇编，或以任何方式尝试获取本服务的源代码及底层实现。</li>
      </ol>
    `,
  },
  {
    id: 'fees',
    title: '费用与支付',
    color: '#f59e0b',
    content: `
      <p>用户使用本服务须按照本服务的价格体系支付相应费用。</p>
      <ol class="numbered-list">
        <li><span class="highlight">计费方式</span>：本服务按照调用次数、数据量、并发量或订阅周期等方式进行计费，具体以用户所购买套餐及平台公示的价格为准。</li>
        <li><span class="highlight">付款义务</span>：服务商保留在用户未按约定支付全部费用前不予提供服务和/或技术支持，或者终止服务和/或技术支持的权利。</li>
        <li><span class="highlight">续费规则</span>：用户如对本服务进行续费时，若本服务的名称、规格或价格已调整，用户同意按照届时有效的新名称、规格或价格履行；用户不同意的，可选择不续费，本服务到期后自动终止。</li>
        <li><span class="highlight">退款政策</span>：用户一经同意本协议并完成支付，因本服务的特殊性（虚拟产品、按量消耗），<strong>原则上不支持退款</strong>；如确因服务商原因无法继续提供服务的，将按实际未使用额度退还相应费用。</li>
        <li><span class="highlight">发票服务</span>：用户可在平台申请开具合规发票，具体流程及税率以平台公示为准。</li>
      </ol>
      <p class="notice">注意：付费服务一旦开通，费用将根据实际调用量扣除，请合理规划使用并及时关注额度消耗情况。</p>
    `,
  },
  {
    id: 'user-obligations',
    title: '用户的权利义务',
    color: '#3b82f6',
    content: `
      <p>用户在使用本服务过程中，应遵守以下权利与义务：</p>
      <ol class="numbered-list">
        <li><span class="highlight">合法合规</span>：用户保证其使用本服务的各项行为均符合国家法律法规的规定，合法真实且不侵害任何第三方的合法权益。</li>
        <li><span class="highlight">按时付费</span>：用户应按时足额支付本服务的费用，否则服务商保留随时终止用户使用本服务的权利，用户应自行承担因此造成的全部损害。</li>
        <li><span class="highlight">账户安全</span>：用户应妥善保管账号、密码、AppKey、AppSecret等认证信息，因泄露、转借、出售导致的一切后果由用户自行承担。</li>
        <li><span class="highlight">授权前提</span>：用户在使用涉及个人信息、企业信息或第三方数据的接口时，应事先获得被核验信息主体的充分、明确授权，方可进行信息查询或核验，并承担相应的合规责任。</li>
        <li><span class="highlight">禁止行为</span>：用户不得利用本服务从事任何违法、违规、攻击性或滥用行为，包括但不限于：恶意刷量、压力测试、绕过限流、抓取/转售数据、传播恶意程序、侵犯他人隐私或知识产权等。</li>
        <li><span class="highlight">风险自担</span>：因现有技术限制，服务商提供的服务可能存在瑕疵，并不能保证在任何情况下都能正常执行或达到用户所期望的结果，用户应自行评估并承担使用风险。</li>
      </ol>
      <p class="notice"><strong>严禁一切违法行为。</strong>用户在使用本服务过程中，不得从事任何违反中华人民共和国法律、法规、规章及政策的活动；一经发现，服务商有权立即中止或终止服务，冻结相关账户，配合有权机关进行调查，并保留追究用户法律责任的权利，由此造成的全部后果及损失由用户自行承担。</p>
    `,
  },
  {
    id: 'provider-obligations',
    title: '服务商的权利义务',
    color: '#10b981',
    content: `
      <p>服务商在提供本服务过程中，享有以下权利并承担以下义务：</p>
      <ol class="numbered-list">
        <li><span class="highlight">合法提供</span>：服务商保证其有合法权利向用户提供本服务的使用许可，并保证其版权的合法性。</li>
        <li><span class="highlight">运维支持</span>：服务商负责及时对本服务进行升级、维护和管理，并通过在线客服、工单、邮件等方式向用户提供咨询及技术支持。</li>
        <li><span class="highlight">稳定性承诺</span>：服务商承诺保证本服务的稳定性和延续性。如因服务商原因导致用户对本服务的使用许可需提前终止的，服务商应向用户履行相应的退款义务（如有）。</li>
        <li><span class="highlight">安全承诺</span>：服务商承诺其向用户提供的服务中不含有：(1) 蓄意毁坏、恶意干扰、秘密截取或侵占任何系统、数据或个人资料的病毒、木马、蠕虫、逻辑炸弹或其他恶意程序；(2) 任何已知的后门、漏洞；(3) 其他可能对用户系统安全造成损害的不安全内容。</li>
        <li><span class="highlight">监督权利</span>：服务商有权对用户的使用行为进行合理监督，若发现用户存在违法或违反本协议的行为，有权立即暂停或终止服务，并保留追究法律责任的权利。</li>
        <li><span class="highlight">责任限制</span>：在适用法律所允许的最大范围内，服务商不会对因使用或不能使用本服务所引起的或有关的任何间接的、意外的、直接的、特殊的、惩罚性的或其他任何损害（包括但不限于人身伤害、财产损坏、利润损失、数据损失、营业中断、计算机瘫痪或故障、商业信息遗失、隐私泄露、因疏忽造成的损害或任何其他金钱损失）承担赔偿责任，即使服务商事先被告知该损害发生的可能性。服务商对用户的最大赔偿责任，累计不超过用户就引起赔偿责任事项已向服务商支付的服务费用。</li>
      </ol>
    `,
  },
  {
    id: 'data-privacy',
    title: '用户数据的使用和披露',
    color: '#8b5cf6',
    content: `
      <p>服务商高度重视用户数据和隐私保护，在数据的收集、存储、使用及披露过程中严格遵守法律法规：</p>
      <div class="terms-subsection">
        <h4>数据使用</h4>
        <ul class="bullet-list">
          <li>为向用户提供服务，服务商可能使用用户数据，包括但不限于向用户发送产品和服务信息、统计分析、服务改进等。</li>
          <li>服务商采用HTTPS加密传输、访问控制、身份鉴权等措施保护用户数据安全。</li>
          <li>遵循数据最小化原则，仅收集为提供本服务所必需的信息。</li>
        </ul>
      </div>
      <div class="terms-subsection">
        <h4>数据披露</h4>
        <p>未经用户许可，服务商不会擅自披露用户数据。但在下述情况下，用户数据将部分或全部被披露：</p>
        <ol class="numbered-list">
          <li>经用户同意，向第三方披露；</li>
          <li>根据法律法规的规定，或者行政、司法机构的要求，向第三方或者行政、司法机构披露；</li>
          <li>用户出现违反中国有关法律法规的情况，需要向第三方披露；</li>
          <li>为提供用户所要求的软件或服务，而必须和第三方（如支付机构、物流、上游数据方等）分享用户数据。</li>
        </ol>
      </div>
      <p class="highlight">服务商承诺不会将用户数据出售给任何第三方。</p>
    `,
  },
  {
    id: 'service-availability',
    title: '服务可用性',
    color: '#3b82f6',
    content: `
      <p>服务商致力于提供稳定可靠的服务，但需特别说明以下情形：</p>
      <ol class="numbered-list">
        <li><span class="highlight">服务时间</span>：服务商努力提供7×24小时不间断服务，目标可用性为99.9%。</li>
        <li><span class="highlight">计划维护</span>：定期维护可能导致短暂的服务中断，服务商将尽可能提前通过站内消息、邮件或公告通知。</li>
        <li><span class="highlight">不可抗力</span>：因自然灾害、战争、疫情、政府行为、网络攻击、电信故障或其他不可抗力因素导致的服务中断，服务商不承担责任。</li>
        <li><span class="highlight">服务升级</span>：为提升服务质量，服务商可能对API进行升级、变更或下线，将按合理期限提前通知，并在可行时提供迁移指导。</li>
      </ol>
    `,
  },
  {
    id: 'term-termination',
    title: '期限与终止',
    color: '#ef4444',
    content: `
      <p>本协议的期限及终止条件如下：</p>
      <ol class="numbered-list">
        <li><span class="highlight">协议期限</span>：本协议自用户同意之日起生效，持续至本服务终止或用户注销账户之日止。</li>
        <li><span class="highlight">服务商终止</span>：出现下列情况之一的，服务商有权终止继续提供本服务，而无需承担任何责任：
          <ul class="bullet-list" style="margin-top:8px">
            <li>用户购买的服务已到期且未续费的；</li>
            <li>用户严重违反本协议项下条款的约定，且自服务商通知其纠正后仍未纠正的；</li>
            <li>用户被有权机关认定存在违法违规行为的；</li>
            <li>法律法规规定的其他情形。</li>
          </ul>
        </li>
        <li><span class="highlight">用户终止</span>：用户可随时停止使用本服务，但已产生的费用不予退还（法律另有规定或本协议另有约定的除外）。</li>
        <li><span class="highlight">条款存续</span>：本协议因任何原因终止后，关于知识产权、责任限制、保密、法律适用与争议解决等条款在其性质允许的范围内继续有效。</li>
      </ol>
    `,
  },
  {
    id: 'terms-modification',
    title: '协议修改',
    color: '#8b5cf6',
    content: `
      <p>服务商保留修改本协议的权利，修改时将遵循以下原则：</p>
      <ul class="bullet-list">
        <li>如本协议的任何内容发生变动，服务商将通过站内公告、邮件或其他适当方式向用户提示修改内容；</li>
        <li>如用户不同意服务商对本协议相关条款所做的修改，用户有权停止使用本服务。此等情况下，服务商应向用户退回剩余费用（如有），并在终止服务前给予用户一定的合理期限，进行数据备份、下载、保存、迁移及其他必要工作；</li>
        <li>如用户在修改通知后继续使用本服务，则视为用户接受服务商对本协议相关条款所做的修改；</li>
        <li>修改后的条款将在公布后生效，不具有追溯力。</li>
      </ul>
      <p>建议用户定期查看本协议，以了解最新的规定和要求。</p>
    `,
  },
  {
    id: 'law-dispute',
    title: '法律及争议解决',
    color: '#10b981',
    content: `
      <p>本协议的法律适用与争议解决条款如下：</p>
      <ol class="numbered-list">
        <li><span class="highlight">法律适用</span>：本协议的订立、执行和解释及争议的解决均适用<strong>中华人民共和国法律</strong>（不包括冲突法规则）。</li>
        <li><span class="highlight">争议解决</span>：因双方就本协议的签订、履行或解释发生争议，双方应努力友好协商解决。如协商不成，任何一方均应向<strong>本公司所在地人民法院</strong>提起诉讼。</li>
        <li><span class="highlight">条款独立</span>：如本协议的任何条款被视作无效或无法执行，则上述条款可被分离，其余部分仍具有法律效力。</li>
        <li><span class="highlight">标题说明</span>：本协议的标题仅为方便阅读所设，非对条款的定义、限制、解释或描述其范围或界限。</li>
      </ol>
    `,
  },
  {
    id: 'compliance-commitment',
    title: '业务合规承诺',
    color: '#f59e0b',
    content: `
      <p>为保障合法、合规的信息服务，用户在使用本服务（含但不限于短信、语音、AI内容生成、数据核验等接口）过程中，应严格遵守国家相关法律、法规，并承诺遵守以下条款：</p>
      <ol class="numbered-list">
        <li>建立健全的信息安全责任制度和信息发布审批制度、信息安全保密制度，严格审查所发布的信息。</li>
        <li>严格遵守国家、地方关于信息安全管理的各项规定和知识产权的有关规定，不侵犯其他任何个人和单位的知识产权利益。</li>
        <li>严格遵守《互联网信息服务管理办法》对使用本服务发送的通信内容进行把关，并保证严格按照业务规范执行。</li>
        <li>保证发布的信息来源可靠、真实，信息内容健康、合法，不制作、复制、发布、传播《中华人民共和国电信条例》禁止的有害信息。</li>
      </ol>
      <div class="terms-subsection">
        <h4>禁止传播的信息</h4>
        <p>用户不得利用本服务或通信通道发布、传播含有下列内容的信息：</p>
        <ul class="bullet-list">
          <li>反对宪法所确定的基本原则的；危害国家安全、泄露国家秘密、颠覆国家政权、破坏国家统一的；</li>
          <li>损害国家荣誉和利益的；煽动民族仇恨、民族歧视、破坏民族团结的；</li>
          <li>破坏国家宗教政策，宣扬邪教和封建迷信的；</li>
          <li>散布谣言、淫秽、色情、赌博、暴力、诈骗、凶杀、恐怖或者教唆犯罪的；</li>
          <li>侮辱或者诽谤他人，有损社会公德和侵犯他人合法权益的；扰乱社会秩序、破坏社会稳定的；</li>
          <li>含有诈骗信息（包括"套路贷"等司法解释明令禁止的内容）的；</li>
          <li>含有恶意软件、病毒、木马或非法产品/服务的；</li>
          <li>含有虚假、欺诈、诱导性内容的；</li>
          <li>法律、行政法规禁止的其他内容。</li>
        </ul>
      </div>
      <p class="notice">一旦发现上述违法犯罪活动和有害信息，用户应立即采取措施制止并及时向有关主管部门报告。服务商有权立即暂停或终止服务，并保留追究法律责任的权利。</p>
    `,
  },
]);

const contactInfo = ref({
  email: options.value?.contact_email || '',
  phone: options.value?.contact_phone || '',
  address: options.value?.contact_address || '',
  workTime: options.value?.working_hours || '',
});
</script>

<template>
  <div class="terms-page">
    <IndexNavbar></IndexNavbar>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg-pattern"></div>
      <div class="container hero-container">
        <div class="hero-content">
          <div class="badge"><span class="badge-dot"></span> 法律条款</div>
          <h1 class="hero-title">服务条款</h1>
          <p class="hero-subtitle">
            欢迎使用我们的API服务平台。在使用我们的服务之前，请仔细阅读并理解以下服务条款。
            这些条款构成您与我们之间的法律协议，使用我们的服务即表示您同意遵守这些条款。
          </p>
          <div class="update-time">
            <el-icon><Timer /></el-icon>
            最后更新时间：{{ new Date().toLocaleDateString('zh-CN') }}
          </div>
        </div>
      </div>
    </section>

    <!-- Terms Content -->
    <section class="section terms-list-section">
      <div class="container">
        <div class="terms-layout">
          <!-- Sidebar Nav -->
          <aside class="terms-nav">
            <div class="nav-sticky">
              <h3 class="nav-title">目录</h3>
              <a
                v-for="(term, index) in termsData"
                :key="term.id"
                :href="`#${term.id}`"
                class="nav-item"
              >
                <span class="nav-num">{{
                  String(index + 1).padStart(2, '0')
                }}</span>
                <span class="nav-text">{{ term.title }}</span>
              </a>
            </div>
          </aside>

          <!-- Main Content -->
          <div class="terms-main">
            <div
              v-for="(term, index) in termsData"
              :key="term.id"
              :id="term.id"
              class="terms-block"
            >
              <div class="block-header">
                <div class="block-num">
                  {{ String(index + 1).padStart(2, '0') }}
                </div>
                <div class="block-meta">
                  <h2>{{ term.title }}</h2>
                  <div
                    class="block-divider"
                    :style="{ backgroundColor: term.color }"
                  ></div>
                </div>
              </div>
              <div class="block-body" v-html="term.content"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Important Notice -->
    <section class="section notice-section">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">重要提醒</h2>
          <p class="section-desc">请在使用服务前务必了解以下事项</p>
        </div>
        <div class="notice-grid">
          <div class="notice-card">
            <div
              class="icon-box"
              style="background-color: #fef3c715; color: #f59e0b"
            >
              <el-icon><Document /></el-icon>
            </div>
            <h3>法律效力</h3>
            <p>本服务条款具有法律约束力，请在使用服务前仔细阅读。</p>
          </div>
          <div class="notice-card">
            <div
              class="icon-box"
              style="background-color: #fef3c715; color: #f59e0b"
            >
              <el-icon><User /></el-icon>
            </div>
            <h3>用户责任</h3>
            <p>用户应对自己的行为负责，遵守相关法律法规。</p>
          </div>
          <div class="notice-card">
            <div
              class="icon-box"
              style="background-color: #fef3c715; color: #f59e0b"
            >
              <el-icon><Service /></el-icon>
            </div>
            <h3>服务变更</h3>
            <p>我们可能会根据业务需要调整服务内容和条款。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="section contact-section">
      <div class="container">
        <div class="contact-bar">
          <div class="contact-left">
            <h3>对条款有疑问？</h3>
            <p>
              如果您对服务条款有任何疑问，请通过以下方式联系我们，我们将尽快为您解答。
            </p>
          </div>
          <div class="contact-right">
            <div class="contact-item" v-if="contactInfo.email">
              <el-icon><Message /></el-icon>
              <div>
                <span class="label">邮箱</span>
                <a :href="`mailto:${contactInfo.email}`">{{
                  contactInfo.email
                }}</a>
              </div>
            </div>
            <div class="contact-item" v-if="contactInfo.phone">
              <el-icon><Phone /></el-icon>
              <div>
                <span class="label">电话</span>
                <span>{{ contactInfo.phone }}</span>
              </div>
            </div>
            <div class="contact-item" v-if="contactInfo.address">
              <el-icon><Location /></el-icon>
              <div>
                <span class="label">地址</span>
                <span>{{ contactInfo.address }}</span>
              </div>
            </div>
            <div class="contact-item" v-if="contactInfo.workTime">
              <el-icon><Timer /></el-icon>
              <div>
                <span class="label">工作时间</span>
                <span>{{ contactInfo.workTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<style lang="less" scoped>
.terms-page {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  color: #1e293b;
  background-color: #ffffff;
  overflow-x: hidden;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero Section */
.hero-section {
  position: relative;
  padding: 120px 0 80px;
  background-color: #f8fafc;
  overflow: hidden;

  .hero-bg-pattern {
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 100%;
    background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
    background-size: 32px 32px;
    opacity: 0.5;
    z-index: 0;
    mask-image: linear-gradient(to left, black, transparent);
  }

  .hero-container {
    position: relative;
    z-index: 1;
  }

  .hero-content {
    max-width: 800px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    background-color: #eff6ff;
    color: #2563eb;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 24px;

    .badge-dot {
      width: 6px;
      height: 6px;
      background-color: #2563eb;
      border-radius: 50%;
      margin-right: 8px;
    }
  }

  .hero-title {
    font-size: 48px;
    line-height: 1.15;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 20px;
    color: #0f172a;
  }

  .hero-subtitle {
    font-size: 17px;
    line-height: 1.8;
    color: #64748b;
    margin-bottom: 24px;
  }

  .update-time {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: white;
    border-radius: 8px;
    font-size: 14px;
    color: #64748b;
    border: 1px solid #e2e8f0;

    .el-icon {
      font-size: 16px;
      color: #3b82f6;
    }
  }
}

/* Sections */
.section {
  padding: 80px 0;

  .section-header {
    margin-bottom: 60px;

    &.text-center {
      text-align: center;
    }

    .section-title {
      font-size: 36px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }

    .section-desc {
      font-size: 18px;
      color: #64748b;
    }
  }
}

/* Terms List */
.terms-list-section {
  padding-top: 60px;
  background: #f8fafc;

  .terms-layout {
    display: flex;
    gap: 48px;
    align-items: flex-start;
  }

  .terms-nav {
    width: 240px;
    flex-shrink: 0;

    .nav-sticky {
      position: sticky;
      top: 100px;
    }

    .nav-title {
      font-size: 12px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin: 0 0 16px;
      padding-left: 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s ease;
      margin-bottom: 4px;

      &:hover {
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);

        .nav-num {
          color: #2563eb;
        }

        .nav-text {
          color: #0f172a;
        }
      }

      .nav-num {
        font-size: 13px;
        font-weight: 700;
        color: #cbd5e1;
        font-variant-numeric: tabular-nums;
        transition: color 0.2s;
      }

      .nav-text {
        font-size: 14px;
        color: #64748b;
        font-weight: 500;
        transition: color 0.2s;
      }
    }
  }

  .terms-main {
    flex: 1;
    min-width: 0;
  }

  .terms-block {
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    margin-bottom: 28px;
    transition: all 0.3s ease;
    overflow: hidden;

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.1);
      border-color: transparent;
    }

    .block-header {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      padding: 32px 40px 20px;

      .block-num {
        font-size: 48px;
        font-weight: 800;
        color: #f1f5f9;
        line-height: 1;
        letter-spacing: -0.04em;
        flex-shrink: 0;
        user-select: none;
        width: 56px;
      }

      .block-meta {
        padding-top: 10px;
      }

      h2 {
        font-size: 22px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 10px;
        letter-spacing: -0.01em;
      }

      .block-divider {
        width: 40px;
        height: 3px;
        border-radius: 2px;
        opacity: 0.6;
      }
    }

    .block-body {
      padding: 4px 40px 36px 116px;

      :deep(p) {
        color: #475569;
        font-size: 15px;
        line-height: 1.85;
        margin: 0 0 18px;

        &:last-child {
          margin-bottom: 0;
        }

        &.notice {
          position: relative;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-left: 3px solid #f59e0b;
          border-radius: 10px;
          padding: 14px 18px;
          color: #92400e;
          font-size: 14px;
          line-height: 1.75;
          margin-top: 22px;

          strong {
            color: #b45309;
            font-weight: 700;
          }
        }
      }

      :deep(strong) {
        color: #0f172a;
        font-weight: 700;
      }

      :deep(.highlight) {
        color: #2563eb;
        font-weight: 600;
        white-space: nowrap;
      }

      :deep(.numbered-list) {
        margin: 0 0 20px;
        padding-left: 0;
        counter-reset: item;
        list-style: none;

        li {
          position: relative;
          padding-left: 40px;
          margin-bottom: 14px;
          line-height: 1.85;
          color: #475569;
          font-size: 15px;

          &::before {
            content: counter(item);
            counter-increment: item;
            position: absolute;
            left: 0;
            top: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 26px;
            height: 26px;
            background: #eff6ff;
            color: #2563eb;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 700;
          }

          &:last-child {
            margin-bottom: 0;
          }

          .bullet-list,
          .numbered-list {
            margin-top: 10px;
            margin-bottom: 0;
          }
        }
      }

      :deep(.bullet-list) {
        margin: 0 0 20px;
        padding-left: 0;
        list-style: none;

        li {
          margin-bottom: 10px;
          line-height: 1.85;
          color: #475569;
          font-size: 15px;
          padding-left: 22px;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            left: 4px;
            top: 12px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #3b82f6;
          }

          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      :deep(.terms-subsection) {
        margin: 22px 0;
        padding: 24px 26px;
        background: #f8fafc;
        border-radius: 12px;
        border: 1px solid #eef2f7;

        &:first-child {
          margin-top: 6px;
        }

        &:last-child {
          margin-bottom: 0;
        }

        h4 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #0f172a;
          font-size: 15px;
          margin: 0 0 14px;
          font-weight: 700;
          letter-spacing: 0.2px;

          &::before {
            content: '';
            width: 3px;
            height: 14px;
            background: #2563eb;
            border-radius: 2px;
          }
        }

        p {
          margin-bottom: 12px;

          &:last-child {
            margin-bottom: 0;
          }
        }

        .bullet-list,
        .numbered-list {
          margin-bottom: 0;
        }
      }
    }
  }
}

/* Notice Section */
.notice-section {
  background: #f8fafc;

  .notice-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }

  .notice-card {
    padding: 32px;
    background: white;
    border-radius: 16px;
    border: 1px solid #f1f5f9;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.1);
      border-color: transparent;
    }

    .icon-box {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      margin-bottom: 20px;
    }

    h3 {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 10px;
    }

    p {
      font-size: 15px;
      color: #64748b;
      line-height: 1.6;
      margin: 0;
    }
  }
}

/* Contact Section */
.contact-section {
  background: white;

  .contact-bar {
    display: flex;
    background: #0f172a;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
  }

  .contact-left {
    flex: 1;
    padding: 48px;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);

    h3 {
      font-size: 28px;
      font-weight: 700;
      color: white;
      margin: 0 0 14px;
    }

    p {
      font-size: 15px;
      color: #94a3b8;
      line-height: 1.7;
      margin: 0;
    }
  }

  .contact-right {
    flex: 1;
    padding: 48px;
    background: white;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .contact-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover {
      background: #f1f5f9;
    }

    .el-icon {
      font-size: 20px;
      color: #3b82f6;
      margin-top: 2px;
    }

    .label {
      display: block;
      font-size: 12px;
      color: #94a3b8;
      font-weight: 500;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    a {
      color: #2563eb;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.2s;

      &:hover {
        color: #3b82f6;
      }
    }

    span:not(.label) {
      color: #334155;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

/* Responsive - Tablet */
@media (max-width: 1024px) {
  .terms-list-section {
    .terms-nav {
      display: none;
    }

    .terms-layout {
      gap: 0;
    }
  }

  .notice-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .contact-section {
    .contact-bar {
      flex-direction: column;
    }

    .contact-left {
      padding: 36px;
    }

    .contact-right {
      padding: 36px;
    }
  }
}

/* Responsive - Mobile */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .section {
    padding: 60px 0;

    .section-header {
      margin-bottom: 40px;

      .section-title {
        font-size: 28px;
      }

      .section-desc {
        font-size: 15px;
      }
    }
  }

  .hero-section {
    padding: 80px 0 60px;

    .hero-title {
      font-size: 32px;
    }

    .hero-subtitle {
      font-size: 15px;
    }

    .badge {
      margin-bottom: 16px;
    }
  }

  .terms-list-section {
    padding-top: 40px;

    .terms-block {
      margin-bottom: 20px;

      .block-header {
        padding: 20px 24px 16px;
        gap: 14px;

        .block-num {
          font-size: 36px;
          width: 42px;
        }

        h2 {
          font-size: 17px;
          margin-bottom: 6px;
        }

        .block-divider {
          width: 32px;
          height: 2px;
        }
      }

      .block-body {
        padding: 4px 24px 24px 24px;

        :deep(p) {
          font-size: 14px;
          margin-bottom: 14px;
        }

        :deep(.numbered-list) {
          margin-bottom: 16px;

          li {
            font-size: 14px;
            padding-left: 34px;
            margin-bottom: 12px;

            &::before {
              width: 22px;
              height: 22px;
              font-size: 12px;
              top: 2px;
            }
          }
        }

        :deep(.bullet-list) {
          margin-bottom: 16px;

          li {
            font-size: 14px;
          }
        }

        :deep(.terms-subsection) {
          padding: 18px 20px;

          h4 {
            font-size: 14px;
          }
        }
      }
    }
  }

  .notice-section {
    .notice-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .notice-card {
      padding: 24px;

      .icon-box {
        width: 44px;
        height: 44px;
        font-size: 22px;
        margin-bottom: 16px;
      }

      h3 {
        font-size: 16px;
      }

      p {
        font-size: 14px;
      }
    }
  }

  .contact-section {
    .contact-left {
      padding: 28px 24px;

      h3 {
        font-size: 22px;
        margin-bottom: 10px;
      }

      p {
        font-size: 14px;
      }
    }

    .contact-right {
      padding: 24px;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .contact-item {
      padding: 14px;

      .el-icon {
        font-size: 18px;
      }

      a,
      span:not(.label) {
        font-size: 13px;
      }
    }
  }
}

/* Responsive - Small Mobile */
@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }

  .section {
    padding: 48px 0;

    .section-header {
      margin-bottom: 32px;

      .section-title {
        font-size: 24px;
      }

      .section-desc {
        font-size: 14px;
      }
    }
  }

  .hero-section {
    padding: 70px 0 48px;

    .hero-title {
      font-size: 26px;
      margin-bottom: 14px;
    }

    .hero-subtitle {
      font-size: 14px;
    }

    .badge {
      font-size: 12px;
      padding: 5px 10px;
    }

    .update-time {
      font-size: 13px;
      padding: 6px 12px;
    }
  }

  .terms-list-section {
    .terms-block {
      .block-header {
        padding: 16px 20px 12px;
        gap: 10px;

        .block-num {
          font-size: 28px;
          width: 34px;
        }

        .block-meta {
          padding-top: 2px;
        }

        h2 {
          font-size: 15px;
          margin-bottom: 4px;
        }

        .block-divider {
          width: 24px;
          height: 2px;
        }
      }

      .block-body {
        padding: 4px 20px 20px 20px;

        :deep(p) {
          font-size: 13px;
        }

        :deep(.numbered-list li) {
          font-size: 13px;
          padding-left: 30px;
          margin-bottom: 10px;

          &::before {
            width: 20px;
            height: 20px;
            font-size: 11px;
            top: 2px;
          }
        }

        :deep(.bullet-list li) {
          font-size: 13px;
        }

        :deep(.terms-subsection) {
          padding: 14px;
          border-radius: 10px;

          h4 {
            font-size: 14px;
          }
        }
      }
    }
  }

  .notice-section .notice-card {
    padding: 20px;

    .icon-box {
      width: 40px;
      height: 40px;
      font-size: 20px;
    }

    h3 {
      font-size: 15px;
    }

    p {
      font-size: 13px;
    }
  }

  .contact-section {
    .contact-bar {
      border-radius: 14px;
    }

    .contact-left {
      padding: 24px 20px;

      h3 {
        font-size: 20px;
      }

      p {
        font-size: 13px;
      }
    }

    .contact-right {
      padding: 20px 16px;
      gap: 10px;
    }

    .contact-item {
      padding: 12px;

      .label {
        font-size: 11px;
      }
    }
  }
}
</style>
