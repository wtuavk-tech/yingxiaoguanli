import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Bell, 
  Activity, 
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Plus,
  RefreshCw,
  FileText,
  MessageSquare,
  AlertCircle,
  MoreHorizontal,
  Upload,
  RotateCcw,
  Clock,
  Flame,
  Volume2,
  ArrowUpDown,
  ChevronUp,
  Shield,
  Layout,
  Radio,
  List,
  CheckSquare
} from 'lucide-react';

// --- 常量定义 ---

const MENU_ITEMS = [
  "投诉管理", "标签管理", "短信区域", "短信模板", "短信营销渠道",
  "短信任务", "派单超时短信", "短信过滤日志", "微信小程序链接"
] as const;

type MenuType = typeof MENU_ITEMS[number];

// --- Mock Data Generators ---

const NAMES = ["许仙", "李毅", "丁方", "邢师傅", "阿迪", "王安石", "苏东坡", "张三丰"];
const ADMINS = ["管理员", "客服01", "客服02", "张主管"];
const STATUS_MAP = {
  "待处理": "bg-orange-50 text-orange-600",
  "已解决": "bg-green-50 text-green-600",
  "驳回": "bg-red-50 text-red-600",
  "处理中": "bg-blue-50 text-blue-600",
  "启用": "bg-green-50 text-green-600",
  "禁用": "bg-slate-100 text-slate-500",
  "发送完成": "bg-green-50 text-green-600",
  "发送失败": "bg-red-50 text-red-600",
};

const generateRandomId = (prefix: string) => `${prefix}${Math.floor(Math.random() * 10000000000)}`;
const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = () => `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;

// --- 页面配置定义 ---

interface FilterConfig {
  label?: string; // Optional for history view where we just show inputs
  type: 'select' | 'input' | 'date-range' | 'custom-date-row'; // Added custom-date-row for history view
  placeholder?: string;
  options?: string[];
  width?: string;
  isSecondary?: boolean; // If true, placed after buttons
}

interface ColumnConfig {
  header: string;
  key: string;
  width?: string;
  sortable?: boolean;
  isMono?: boolean; // New: Apply monospace font for numbers/codes
  render?: (row: any) => React.ReactNode;
}

interface PageConfig {
  filters: FilterConfig[];
  columns: ColumnConfig[];
  actions?: string[]; // "add", "export", "upload"
  generateData: () => any[];
}

const PAGE_CONFIGS: Record<MenuType, PageConfig> = {
  "投诉管理": {
    filters: [
      { label: "处理状态", type: "select", options: ["全部", "待处理", "已解决", "驳回"] },
      { label: "投诉类型", type: "select", options: ["全部", "问题处理", "业务流程", "员工态度"] },
      { label: "用户类型", type: "select", options: ["全部", "签约师傅", "普通用户", "线下师傅"] },
      { label: "创建时间", type: "date-range", isSecondary: true },
    ],
    actions: ["add"],
    columns: [
      { header: "投诉编号", key: "code", isMono: true },
      { header: "投诉人", key: "name" },
      { header: "用户类型", key: "userType" },
      { header: "投诉佐证", key: "proof", render: () => <span className="text-blue-500 cursor-pointer flex items-center gap-1"><FileText size={14}/> 图片</span> },
      { header: "投诉类型", key: "type" },
      { header: "内容", key: "content", width: "20%" },
      { header: "创建时间", key: "createTime", isMono: true },
      { header: "状态", key: "status", render: (row) => <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_MAP[row.status as keyof typeof STATUS_MAP] || 'bg-gray-100'}`}>{row.status}</span> },
      { header: "关联订单号", key: "orderNo", isMono: true },
      { header: "处理人", key: "handler" },
      { header: "处理意见", key: "opinion" },
      { header: "处理时间", key: "handleTime", isMono: true },
      { header: "操作", key: "ops", render: () => <button className="text-blue-600 hover:text-blue-700 font-medium">处理</button> },
    ],
    generateData: () => Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      code: generateRandomId("TS2025"),
      name: getRandom(NAMES),
      userType: getRandom(["签约师傅", "普通用户", "线下师傅"]),
      type: getRandom(["问题处理", "业务流程", "员工态度"]),
      content: getRandom(["新增一笔数据投诉", "觉得很有问题", "态度恶劣", "乱收费", "无法接单"]),
      createTime: getRandomDate(),
      status: getRandom(["待处理", "已解决", "驳回"]),
      orderNo: generateRandomId("2509"),
      handler: getRandom(ADMINS),
      opinion: Math.random() > 0.5 ? "已核实，无误" : "",
      handleTime: Math.random() > 0.5 ? getRandomDate() : "",
    }))
  },
  "标签管理": {
    filters: [
      { label: "标签名称或编码", type: "input", placeholder: "请输入内容" },
      { label: "分组", type: "select", options: ["全部", "用户管理", "订单管理"] },
      { label: "状态", type: "select", options: ["全部", "启用", "禁用"] },
    ],
    actions: ["add"],
    columns: [
      { header: "标签ID", key: "tagId", isMono: true },
      { header: "标签编码", key: "code", width: "15%", isMono: true },
      { header: "标签名称", key: "name" },
      { header: "标签分组", key: "group" },
      { header: "标签说明", key: "desc", width: "20%" },
      { header: "状态", key: "status", render: (row) => <span className={`px-2 py-0.5 rounded text-xs font-medium ${row.status === '启用' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{row.status}</span> },
      { header: "标签简码", key: "shortCode", isMono: true },
      { header: "创建时间", key: "createTime", isMono: true },
      { header: "操作", key: "ops", render: () => <div className="flex gap-3 text-blue-600 font-medium"><button className="hover:text-blue-700">修改</button><button className="text-red-500 hover:text-red-600">删除</button><button className="hover:text-blue-700">禁用</button></div> },
    ],
    generateData: () => Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      tagId: 100 + i,
      code: `TAG_${Math.random().toString(36).substring(7).toUpperCase()}`,
      name: getRandom(["未录单", "测试企业", "小程序", "已下单", "VIP客户"]),
      group: "用户管理",
      desc: "这是标签的详细说明描述...",
      status: i % 5 === 0 ? "禁用" : "启用",
      shortCode: `v${i}`,
      createTime: getRandomDate(),
    }))
  },
  "短信区域": {
    filters: [
      { label: "渠道名称", type: "input", placeholder: "请输入内容" },
      { label: "区域名称", type: "input", placeholder: "请输入内容" },
      { label: "订单来源", type: "select", options: ["全部", "美团", "京东", "微信"] },
      { label: "创建时间", type: "date-range", isSecondary: true },
    ],
    actions: ["add"],
    columns: [
      { header: "渠道名称", key: "channel" },
      { header: "创建时间", key: "createTime", isMono: true },
      { header: "订单来源", key: "source" },
      { header: "区域全称", key: "fullRegion" },
      { header: "区域名称", key: "region" },
      { header: "操作", key: "ops", render: () => <button className="text-red-500 hover:text-red-600 hover:underline font-medium">删除</button> },
    ],
    generateData: () => Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      channel: getRandom(["美团店", "请问", "日常", "33"]),
      createTime: getRandomDate(),
      source: getRandom(["美团", "急修预约单", "JSAPP", "彩"]),
      fullRegion: getRandom(["江西省南昌市新建区", "天津市河西区", "北京市东城区", "湖北省鄂州市"]),
      region: getRandom(["新建区", "河西区", "东城区", "鄂城区"]),
    }))
  },
  "短信模板": {
    filters: [
      { label: "类型", type: "select", options: ["全部", "业务通知", "营销推广"] },
      { label: "模板代码", type: "input", placeholder: "请输入内容" },
      { label: "模板名称", type: "select", options: ["全部", "日报预警", "验证码", "用户登录"] },
      { label: "状态", type: "select", options: ["全部", "启用", "禁用"] },
    ],
    actions: ["add"],
    columns: [
      { header: "类型", key: "type" },
      { header: "模板名称", key: "name" },
      { header: "状态", key: "status", render: (row) => <span className={`font-medium ${row.status === '启用' ? 'text-green-600' : 'text-slate-400'}`}>{row.status}</span> },
      { header: "模板代码", key: "code", isMono: true },
      { header: "内容", key: "content", width: "25%" },
      { header: "渠道", key: "channel" },
      { header: "参数", key: "params", isMono: true },
      { header: "创建时间", key: "createTime", isMono: true },
      { header: "操作", key: "ops", render: () => <div className="flex gap-3 text-blue-600 font-medium"><button className="hover:text-blue-700">修改</button><button className="text-red-500 hover:text-red-600">删除</button></div> },
    ],
    generateData: () => Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      type: "业务通知",
      name: getRandom(["日报预警", "APP更新短信", "用户登录"]),
      status: getRandom(["启用", "禁用"]),
      code: Math.floor(Math.random() * 100000000),
      content: "您好，您的验证码是{code}，5分钟内有效...",
      channel: getRandom(["联蕾", "助通", "阿里云"]),
      params: "{code}",
      createTime: getRandomDate(),
    }))
  },
  "短信营销渠道": {
    filters: [
      { label: "来源", type: "select", options: ["全部", "淘宝", "京东", "美团"] },
      { label: "平台", type: "select", options: ["全部", "淘宝", "美团", "京东"] },
    ],
    actions: ["add"],
    columns: [
      { header: "菜单渠道名称", key: "name" },
      { header: "平台", key: "platform" },
      { header: "店铺名称", key: "shopName" },
      { header: "店铺名称简写", key: "abbr" },
      { header: "客服电话", key: "phone", isMono: true },
      { header: "负责人", key: "manager" },
      { header: "是否可安排短信", key: "canSend" },
      { header: "短信关键词", key: "keywords" },
      { header: "操作", key: "ops", render: () => <div className="flex gap-3 text-blue-600 font-medium"><button className="hover:text-blue-700">修改</button><button className="text-red-500 hover:text-red-600">删除</button></div> },
    ],
    generateData: () => Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      name: getRandom(["好", "9", "急修预约单", "威"]),
      platform: getRandom(["淘宝", "美团", "京东"]),
      shopName: getRandom(["饿了么", "淘宝店铺", "急修到家", "威修乐"]),
      abbr: getRandom(["饿了么", "淘店", "急修", "威修"]),
      phone: Math.random() > 0.5 ? "400123456" : "",
      manager: getRandom(["张三", "李四", ""]),
      canSend: getRandom(["是", "否"]),
      keywords: getRandom(["店铺", "平台"]),
    }))
  },
  "短信任务": {
    filters: [
      { label: "任务名称", type: "input", placeholder: "请输入内容" },
    ],
    actions: ["add", "upload"],
    columns: [
      { header: "任务名称", key: "name" },
      { header: "发送时间", key: "sendTime", isMono: true },
      { header: "号码数量", key: "count", isMono: true },
      { header: "失败数量", key: "failCount", isMono: true },
      { header: "发送状态", key: "status", render: (row) => <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_MAP[row.status as keyof typeof STATUS_MAP] || ''}`}>{row.status}</span> },
      { header: "操作", key: "ops", render: () => <div className="flex gap-3 text-blue-600 font-medium"><button className="hover:text-blue-700">详情</button><button className="text-orange-500 hover:text-orange-600">失败补发</button></div> },
    ],
    generateData: () => Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      name: getRandom(["测测测", "双11大促", "召回计划", "测试发送"]),
      sendTime: getRandomDate(),
      count: Math.floor(Math.random() * 10),
      failCount: Math.floor(Math.random() * 3),
      status: getRandom(["发送完成", "发送失败", "处理中"]),
    }))
  },
  "派单超时短信": {
    filters: [
      { label: "订单号", type: "input", placeholder: "请输入内容" },
      { label: "手机号", type: "input", placeholder: "请输入内容" },
      { label: "发送类型", type: "select", options: ["全部", "普通", "加急"] },
      { label: "发送状态", type: "select", options: ["全部", "成功", "失败"] },
    ],
    actions: [], // No add button usually for logs
    columns: [
      { header: "订单号", key: "orderNo", isMono: true },
      { header: "手机号", key: "phone", isMono: true },
      { header: "业务类型", key: "bizType" },
      { header: "发送类型", key: "sendType" },
      { header: "发送时间", key: "sendTime", isMono: true },
      { header: "状态", key: "status", render: (row) => <span className={`font-medium ${row.status === '成功' ? 'text-green-600' : 'text-red-600'}`}>{row.status}</span> },
      { header: "发送人", key: "sender" },
      { header: "失败原因", key: "failReason" },
      { header: "操作", key: "ops", render: () => <div className="flex gap-3 text-blue-600 font-medium"><button className="hover:text-blue-700">查看内容</button><button className="hover:text-blue-700">重发</button></div> },
    ],
    generateData: () => Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      orderNo: generateRandomId("2512"),
      phone: `15${Math.floor(Math.random() * 1000000000)}`,
      bizType: "普通",
      sendType: Math.random() > 0.7 ? "手动发送" : "自动发送",
      sendTime: getRandomDate(),
      status: Math.random() > 0.8 ? "失败" : "成功",
      sender: Math.random() > 0.8 ? "管理员" : "",
      failReason: "",
    }))
  },
  "短信过滤日志": {
    filters: [
      { label: "订单号", type: "input", placeholder: "请输入内容" },
      { label: "手机号", type: "input", placeholder: "请输入内容" },
      { label: "过滤原因", type: "select", options: ["全部", "不支持发送", "黑名单"] },
    ],
    actions: [],
    columns: [
      { header: "订单号", key: "orderNo", isMono: true },
      { header: "手机号", key: "phone", isMono: true },
      { header: "业务类型", key: "bizType" },
      { header: "过滤原因", key: "reason", width: "30%" },
      { header: "过滤时间", key: "time", isMono: true },
    ],
    generateData: () => Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      orderNo: generateRandomId("2512"),
      phone: `18${Math.floor(Math.random() * 1000000000)}`,
      bizType: "普通",
      reason: "该订单来源不支持发送派单超时短信",
      time: getRandomDate(),
    }))
  },
  "微信小程序链接": {
    filters: [
      { label: "小程序页面名称", type: "input", placeholder: "请输入内容" },
    ],
    actions: ["add"],
    columns: [
      { header: "创建人", key: "creator" },
      { header: "创建时间", key: "createTime", isMono: true },
      { header: "小程序版本", key: "version" },
      { header: "自动续期", key: "autoRenew" },
      { header: "有效天数", key: "days", isMono: true },
      { header: "失效时间", key: "expireTime", isMono: true },
      { header: "小程序scheme码", key: "scheme", width: "15%", render: (r) => <div className="truncate w-32 font-mono" title={r.scheme}>{r.scheme}</div> },
      { header: "小程序页面名称", key: "pageName" },
      { header: "页面路径", key: "path", width: "15%", render: (r) => <div className="truncate w-32 font-mono" title={r.path}>{r.path}</div> },
      { header: "标签", key: "tags" },
      { header: "操作", key: "ops", render: () => <div className="flex gap-3 text-blue-600 text-xs font-medium"><button className="hover:text-blue-700">重新生成</button><button className="hover:text-blue-700">修改</button><button className="text-red-500 hover:text-red-600">删除</button></div> },
    ],
    generateData: () => Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      creator: "管理员",
      createTime: getRandomDate(),
      version: "体验版",
      autoRenew: Math.random() > 0.3 ? "是" : "否",
      days: Math.floor(Math.random() * 30),
      expireTime: getRandomDate(),
      scheme: `weixin://dl/business/?t=${Math.random().toString(36).substring(7)}`,
      pageName: getRandom(["测试页面", "自动刷新", "元旦活动", "圣诞节大促"]),
      path: "pages/index/getCoupon",
      tags: i % 3 === 0 ? "abc" : "",
    }))
  }
};

// --- Special Config for History View in Tag Management ---
const HISTORY_PAGE_CONFIG: PageConfig = {
  filters: [
    { type: "custom-date-row", label: "" }
  ],
  columns: [
    { header: "操作时间", key: "time", sortable: true, isMono: true },
    { header: "操作人", key: "operator", sortable: true },
    { header: "操作类型", key: "type", sortable: true },
    { header: "涉及标签", key: "tag", isMono: true },
    { header: "操作详情", key: "details", width: "40%" },
  ],
  generateData: () => Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    time: getRandomDate(),
    operator: "管理员",
    type: getRandom(["修改", "创建", "启用", "删除"]),
    tag: `etqvMOZwAA${Math.random().toString(36).substring(2, 10)}...`,
    details: Math.random() > 0.5 ? "修改: 标签简称 qvfl改为v049" : "将标签状态从“禁用”修改为“启用”",
  }))
};


// --- 子组件：通知栏 (New Style: White BG, Blue Label) ---

const NotificationBar = () => (
  <div className="flex items-center gap-4 mb-4 px-3 py-3 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">
    <div className="flex items-center gap-2 shrink-0">
      <div className="bg-[#1890ff] text-white text-sm px-3 py-1 rounded font-medium flex items-center gap-1 shadow-sm">
        主要公告 <Bell size={14} className="text-white fill-white" />
      </div>
    </div>
    
    <div className="flex-1 overflow-hidden relative h-7 flex items-center">
      <div className="whitespace-nowrap flex items-center gap-8 text-sm text-slate-600">
        <span className="flex items-center gap-2">级晋升评审的通知: 点击下方详情以阅读完整公告内容。</span>
        <span className="flex items-center gap-2 text-slate-500"><span className="w-2 h-2 rounded-full bg-orange-400"></span> <Volume2 size={14}/> 系统升级通知: 今晚 24:00 将进行系统维护。</span>
        <span className="flex items-center gap-2 text-slate-500"><span className="text-red-500 font-bold">⚑</span> <Flame size={14} className="text-orange-500"/> 10月业绩pk赛圆满结束，恭喜华东大区获得冠军！</span>
      </div>
    </div>

    <div className="flex items-center gap-6 shrink-0 text-sm pl-2">
      <div className="border border-slate-200 px-2 py-0.5 rounded text-slate-400 font-mono bg-slate-50">
        2025-11-19
      </div>
    </div>
  </div>
);

// --- 子组件：菜单网格 (New Style: White Buttons with Colored Borders) ---

// Icons mapped to menu items for variety
const MENU_ICONS = [
  Shield,       // 投诉
  Layout,       // 标签
  Radio,        // 区域
  List,         // 模板
  CheckSquare,  // 渠道
  MessageSquare,// 任务
  Clock,        // 超时
  AlertCircle,  // 过滤
  RotateCcw     // 小程序
];

// Specific colors for the buttons
const BUTTON_STYLES = [
  { border: 'border-red-400', text: 'text-slate-700', iconColor: 'text-white', bgIcon: 'bg-red-500' },
  { border: 'border-orange-400', text: 'text-slate-700', iconColor: 'text-white', bgIcon: 'bg-orange-400' },
  { border: 'border-blue-400', text: 'text-slate-700', iconColor: 'text-white', bgIcon: 'bg-blue-500' },
  { border: 'border-green-500', text: 'text-slate-700', iconColor: 'text-white', bgIcon: 'bg-green-600' },
  { border: 'border-cyan-400', text: 'text-slate-700', iconColor: 'text-white', bgIcon: 'bg-cyan-500' },
  { border: 'border-purple-400', text: 'text-slate-700', iconColor: 'text-white', bgIcon: 'bg-purple-500' },
  // Repeat or similar for others
  { border: 'border-rose-400', text: 'text-slate-700', iconColor: 'text-white', bgIcon: 'bg-rose-500' },
  { border: 'border-yellow-500', text: 'text-slate-700', iconColor: 'text-white', bgIcon: 'bg-yellow-500' },
  { border: 'border-indigo-400', text: 'text-slate-700', iconColor: 'text-white', bgIcon: 'bg-indigo-500' },
];

const MenuGrid = ({ active, onSelect }: { active: string, onSelect: (t: string) => void }) => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between w-full gap-3">
        {MENU_ITEMS.map((item, index) => {
          const style = BUTTON_STYLES[index % BUTTON_STYLES.length];
          const Icon = MENU_ICONS[index % MENU_ICONS.length];
          const isActive = active === item;
          
          return (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className={`h-11 text-xs font-bold rounded-lg border transition-all duration-200 flex items-center justify-center whitespace-nowrap flex-1 gap-2 group ${
                isActive 
                  ? `${style.border} bg-white shadow-md transform scale-[1.02]` 
                  : `${style.border} bg-white hover:bg-slate-50`
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${style.iconColor} ${style.bgIcon} group-hover:scale-110 transition-transform`}>
                 <Icon size={12} strokeWidth={3} />
              </div>
              <span className="text-slate-700">{item}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- 子组件：Filter Section ---

const FilterSection = ({ config, isHistoryView }: { config: PageConfig, isHistoryView?: boolean }) => {
  const primaryFilters = config.filters.filter(f => !f.isSecondary);
  const secondaryFilters = config.filters.filter(f => f.isSecondary);
  const hasActions = config.actions && config.actions.length > 0;

  // Special layout for History View: Just date range and search/reset buttons in one line
  if (isHistoryView) {
    return (
       <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
         <div className="flex items-center gap-2 text-slate-400">
           <Clock size={18} />
         </div>
         <div className="flex items-center gap-2">
             <input type="text" placeholder="开始日期" className="bg-slate-50 border border-slate-200 rounded-md px-3 h-9 text-sm w-36 outline-none focus:bg-white focus:border-blue-400 transition-all" />
             <span className="text-slate-400 text-sm">至</span>
             <input type="text" placeholder="结束日期" className="bg-slate-50 border border-slate-200 rounded-md px-3 h-9 text-sm w-36 outline-none focus:bg-white focus:border-blue-400 transition-all" />
         </div>
         <button className="bg-[#1890ff] text-white px-5 h-9 rounded-md text-sm font-medium ml-2 hover:bg-blue-600 shadow-sm transition-all">搜索</button>
         <button className="border border-slate-200 text-slate-600 px-5 h-9 rounded-md text-sm font-medium hover:bg-slate-50 transition-all">重置</button>
       </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
      <div className="flex flex-wrap items-center gap-4">
        {primaryFilters.map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            {f.label && <label className="text-sm font-medium text-slate-700 whitespace-nowrap">{f.label}</label>}
            {f.type === 'select' ? (
              <div className="relative">
                <select className="bg-slate-50 border border-slate-200 rounded-md px-3 h-9 text-sm w-32 outline-none focus:bg-white focus:border-blue-400 appearance-none transition-all cursor-pointer">
                  {f.options?.map(opt => <option key={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-2 top-2.5 pointer-events-none text-slate-400">▼</div>
              </div>
            ) : f.type === 'input' ? (
              <input type="text" placeholder={f.placeholder} className="bg-slate-50 border border-slate-200 rounded-md px-3 h-9 text-sm w-40 outline-none focus:bg-white focus:border-blue-400 transition-all" />
            ) : null}
          </div>
        ))}

        <div className="flex gap-2 ml-2">
          <button className="bg-[#1890ff] text-white px-5 h-9 rounded-md text-sm font-medium hover:bg-blue-600 shadow-blue-100 shadow-md transition-all">搜索</button>
          <button className="border border-slate-200 text-slate-600 px-4 h-9 rounded-md text-sm font-medium hover:bg-slate-50 transition-all">重置</button>
        </div>

        {/* Secondary filters appear after buttons */}
        {secondaryFilters.map((f, i) => (
          <div key={`sec-${i}`} className="flex items-center gap-2 pl-4 border-l border-slate-200">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">{f.label}</label>
            {f.type === 'date-range' ? (
               <div className="flex items-center gap-2">
                 <div className="relative">
                   <Clock size={14} className="absolute left-2.5 top-2.5 text-slate-400"/>
                   <input type="text" placeholder="开始日期" className="bg-slate-50 border border-slate-200 rounded-md px-3 pl-8 h-9 text-sm w-28 outline-none focus:bg-white focus:border-blue-400 transition-all" />
                 </div>
                 <span className="text-slate-400 text-sm">至</span>
                 <input type="text" placeholder="结束日期" className="bg-slate-50 border border-slate-200 rounded-md px-3 h-9 text-sm w-28 outline-none focus:bg-white focus:border-blue-400 transition-all" />
               </div>
            ) : null}
          </div>
        ))}

        {/* 动作按钮 (Add/Upload) - 移动到最后 */}
        {hasActions && (
          <div className="flex gap-2 ml-2 pl-4 border-l border-slate-200">
            {config.actions?.includes("add") && (
              <button className="bg-[#1890ff] text-white px-4 h-9 rounded-md text-sm font-medium flex items-center gap-1.5 hover:bg-blue-600 shadow-blue-100 shadow-md transition-all">
                <Plus size={16} /> 新增
              </button>
            )}
            {config.actions?.includes("upload") && (
              <button className="bg-[#52c41a] text-white px-4 h-9 rounded-md text-sm font-medium flex items-center gap-1.5 hover:bg-green-600 shadow-green-100 shadow-md transition-all">
                <Upload size={16} /> 上传文件
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- 子组件：Table List ---

const TableList = ({ type, subTab }: { type: MenuType, subTab: 'manage' | 'history' }) => {
  const isHistoryView = type === '标签管理' && subTab === 'history';
  const config = isHistoryView ? HISTORY_PAGE_CONFIG : PAGE_CONFIGS[type];
  const data = useMemo(() => config.generateData(), [type, subTab]);

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      {/* 1. 筛选区域 (圆角矩形) */}
      <FilterSection config={config} isHistoryView={isHistoryView} />

      {/* 2. 表格区域 (圆角矩形) */}
      <div className="flex-1 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col overflow-hidden relative">
        {/* Special 'Collapse' tag for history view */}
        {isHistoryView && (
          <div className="absolute top-0 right-0 bg-[#3b82f6] text-white text-[11px] px-3 py-1.5 rounded-bl-xl font-semibold cursor-pointer flex items-center gap-1 z-20 shadow-sm hover:bg-blue-600 transition-colors">
             收起
          </div>
        )}

        {/* 表格内容 */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#f8fafc] sticky top-0 z-10 text-[13px] font-semibold text-slate-700 tracking-wide border-b border-slate-200">
              <tr>
                <th className="p-4 border-b border-slate-200 text-center w-14 font-medium whitespace-nowrap">序号</th>
                {config.columns.map(col => (
                  <th key={col.key} className="p-4 border-b border-slate-200 whitespace-nowrap" style={{ width: col.width }}>
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {col.sortable && <ArrowUpDown size={13} className="text-slate-400 cursor-pointer hover:text-blue-500" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[13px] text-slate-700">
              {data.map((row, i) => (
                // Added specific color for even rows: #FFF0F0
                // Added border-b border-[#cbd5e1] as requested
                <tr key={i} className="hover:bg-blue-50/40 transition-colors group even:bg-[#FFF0F0] border-b border-[#cbd5e1]">
                  <td className="p-4 text-center text-slate-400 group-hover:text-slate-500">{i + 1}</td>
                  {config.columns.map(col => (
                    <td key={col.key} className="p-4">
                      {col.render ? col.render(row) : <span className={`text-slate-700 font-normal ${col.isMono ? 'font-mono' : ''}`}>{row[col.key]}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 底部页码 */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-center gap-4 bg-white shrink-0 rounded-b-xl">
          <span className="text-sm text-slate-500">共 <span className="font-mono">{data.length}</span> 条</span>
          
          <select className="border border-slate-200 rounded px-2 h-8 text-sm outline-none text-slate-600 cursor-pointer hover:border-blue-400 transition-colors bg-white">
            <option>20条/页</option>
            <option>50条/页</option>
            <option>100条/页</option>
          </select>

          <div className="flex items-center gap-1">
            <button className="w-8 h-8 border border-slate-200 rounded bg-white flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 disabled:opacity-50 transition-all"><ChevronLeft size={16} /></button>
            <button className="w-8 h-8 border border-[#1890ff] rounded bg-[#1890ff] text-white text-sm font-medium shadow-sm transition-all font-mono">1</button>
            {[2, 3, 4, 5, 6, 7].map(num => (
              <button key={num} className="w-8 h-8 border border-slate-200 rounded bg-white text-sm text-slate-600 hover:border-blue-400 hover:text-blue-500 font-medium transition-all font-mono">{num}</button>
            ))}
            <button className="w-8 h-8 border border-slate-200 rounded bg-white flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 transition-all"><ChevronRight size={16} /></button>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>前往</span>
            <input type="text" defaultValue="1" className="w-12 h-8 border border-slate-200 rounded text-center text-sm focus:border-blue-400 outline-none transition-all font-mono" />
            <span>页</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 主应用组件 ---

const App = () => {
  const [activeTab, setActiveTab] = useState<MenuType>(MENU_ITEMS[0]);
  const [subTab, setSubTab] = useState<'manage' | 'history'>('manage');

  // Reset subTab when activeTab changes
  useEffect(() => {
    setSubTab('manage');
  }, [activeTab]);

  return (
    <div className="h-screen bg-[#f1f5f9] p-4 flex flex-col overflow-hidden font-sans text-slate-800 antialiased">
      <NotificationBar />
      
      <MenuGrid active={activeTab} onSelect={(t) => setActiveTab(t as MenuType)} />
      
      {/* 运营效能概览 - Updated style to match 'Total Points' card in reference (White, Clean, Shadow) */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 flex items-center h-16 mb-4 shrink-0 px-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2 mr-2 shrink-0">
            <div className="w-8 h-8 bg-[#1890ff] rounded-full flex items-center justify-center text-white">
               <Activity size={16} />
            </div>
            <span className="text-sm font-bold text-slate-800">数据概览</span>
          </div>

          {/* Sub Navigation for 'Tag Management' - Only show if active */}
          {activeTab === '标签管理' && (
             <div className="flex gap-2 mr-4 border-l pl-4">
               <button 
                onClick={() => setSubTab('manage')}
                className={`text-xs font-semibold px-3 py-1 rounded transition-all ${subTab === 'manage' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 标签管理
               </button>
               <button 
                onClick={() => setSubTab('history')}
                className={`text-xs font-semibold px-3 py-1 rounded transition-all ${subTab === 'history' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 历史操作记录
               </button>
             </div>
          )}

          <div className="flex items-center gap-4 ml-2 overflow-hidden">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">其它类400客户量</span>
              <span className="text-red-500 font-bold font-mono">158</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">正常类400客户量</span>
              <span className="text-[#1890ff] font-bold font-mono">342</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
               <span className="text-slate-500">400总接听量</span>
               <span className="text-green-600 font-bold font-mono">500</span>
            </div>
             <div className="flex items-center gap-2 text-sm">
               <span className="text-slate-500">其它类占比</span>
               <span className="text-purple-600 font-bold font-mono">31.6%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
               <span className="text-slate-500">正常类占比</span>
               <span className="text-teal-500 font-bold font-mono">68.4%</span>
            </div>
             <div className="flex items-center gap-2 text-sm">
               <span className="text-slate-500">预约转化率</span>
               <span className="text-blue-600 font-bold font-mono">94.1%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l pl-4 border-slate-100">
             <button className="text-[#1890ff] hover:text-blue-700 text-xs flex items-center gap-1">
                <Search size={14}/> 点击高级筛选
             </button>
        </div>
      </div>

      {/* 核心内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TableList type={activeTab} subTab={subTab} />
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) { const root = createRoot(container); root.render(<App />); }