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
  ChevronUp
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
      { header: "投诉编号", key: "code" },
      { header: "投诉人", key: "name" },
      { header: "用户类型", key: "userType" },
      { header: "投诉佐证", key: "proof", render: () => <span className="text-blue-500 cursor-pointer flex items-center gap-1"><FileText size={14}/> 图片</span> },
      { header: "投诉类型", key: "type" },
      { header: "内容", key: "content", width: "20%" },
      { header: "创建时间", key: "createTime" },
      { header: "状态", key: "status", render: (row) => <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_MAP[row.status as keyof typeof STATUS_MAP] || 'bg-gray-100'}`}>{row.status}</span> },
      { header: "关联订单号", key: "orderNo" },
      { header: "处理人", key: "handler" },
      { header: "处理意见", key: "opinion" },
      { header: "处理时间", key: "handleTime" },
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
      { header: "标签ID", key: "tagId" },
      { header: "标签编码", key: "code", width: "15%" },
      { header: "标签名称", key: "name" },
      { header: "标签分组", key: "group" },
      { header: "标签说明", key: "desc", width: "20%" },
      { header: "状态", key: "status", render: (row) => <span className={`px-2 py-0.5 rounded text-xs font-medium ${row.status === '启用' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{row.status}</span> },
      { header: "标签简码", key: "shortCode" },
      { header: "创建时间", key: "createTime" },
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
      { header: "创建时间", key: "createTime" },
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
      { header: "模板代码", key: "code" },
      { header: "内容", key: "content", width: "25%" },
      { header: "渠道", key: "channel" },
      { header: "参数", key: "params" },
      { header: "创建时间", key: "createTime" },
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
      { header: "客服电话", key: "phone" },
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
      { header: "发送时间", key: "sendTime" },
      { header: "号码数量", key: "count" },
      { header: "失败数量", key: "failCount" },
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
      { header: "订单号", key: "orderNo" },
      { header: "手机号", key: "phone" },
      { header: "业务类型", key: "bizType" },
      { header: "发送类型", key: "sendType" },
      { header: "发送时间", key: "sendTime" },
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
      { header: "订单号", key: "orderNo" },
      { header: "手机号", key: "phone" },
      { header: "业务类型", key: "bizType" },
      { header: "过滤原因", key: "reason", width: "30%" },
      { header: "过滤时间", key: "time" },
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
      { header: "创建时间", key: "createTime" },
      { header: "小程序版本", key: "version" },
      { header: "自动续期", key: "autoRenew" },
      { header: "有效天数", key: "days" },
      { header: "失效时间", key: "expireTime" },
      { header: "小程序scheme码", key: "scheme", width: "15%", render: (r) => <div className="truncate w-32" title={r.scheme}>{r.scheme}</div> },
      { header: "小程序页面名称", key: "pageName" },
      { header: "页面路径", key: "path", width: "15%", render: (r) => <div className="truncate w-32" title={r.path}>{r.path}</div> },
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
    { header: "操作时间", key: "time", sortable: true },
    { header: "操作人", key: "operator", sortable: true },
    { header: "操作类型", key: "type", sortable: true },
    { header: "涉及标签", key: "tag" },
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


// --- 子组件：通知栏 (New Dark Theme) ---

const NotificationBar = () => (
  <div className="flex items-center gap-4 mb-4 px-4 py-3 bg-[#0f172a] rounded-lg shadow-sm overflow-hidden shrink-0 text-white border-l-4 border-red-500">
    <div className="flex items-center gap-2 shrink-0">
      <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-bold">重要公告</div>
      <Bell size={14} className="text-slate-400" />
    </div>
    
    <div className="flex-1 overflow-hidden relative h-5 flex items-center border-r border-slate-700 pr-4">
      <div className="whitespace-nowrap animate-[marquee_30s_linear_infinite] flex items-center gap-8 text-xs text-slate-200">
        <span className="flex items-center gap-2"><Volume2 size={12}/> 关于 2025 年度秋季职级晋升评审的通知: 点击下方详情以阅读完整公告内容。请所有相关人员务必在截止日期前完成确认。</span>
      </div>
    </div>

    <div className="flex items-center gap-6 shrink-0 text-xs pl-2">
      <div className="bg-[#1e293b] px-2 py-1 rounded text-slate-400 font-mono">
        2025-11-19
      </div>
    </div>
    <style>{`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>
  </div>
);

// --- 子组件：新的 5x2 菜单网格 (Colorful Theme) ---

// Defining color themes to cycle through
const BUTTON_THEMES = [
  { name: 'red', solid: 'bg-red-500 text-white border-red-500 shadow-red-200', light: 'bg-red-50 text-red-500 border-red-200 hover:border-red-400' },
  { name: 'orange', solid: 'bg-orange-400 text-white border-orange-400 shadow-orange-200', light: 'bg-[#fff7e6] text-[#fa8c16] border-[#ffe7ba] hover:border-[#ffd591]' },
  { name: 'blue', solid: 'bg-blue-500 text-white border-blue-500 shadow-blue-200', light: 'bg-[#e6f7ff] text-[#1890ff] border-[#bae7ff] hover:border-[#91d5ff]' },
  { name: 'green', solid: 'bg-[#a0d911] text-white border-[#a0d911] shadow-lime-200', light: 'bg-[#fcffe6] text-[#7cb305] border-[#eaff8f] hover:border-[#d3f261]' },
  { name: 'cyan', solid: 'bg-cyan-400 text-white border-cyan-400 shadow-cyan-200', light: 'bg-[#e6fffb] text-[#13c2c2] border-[#87e8de] hover:border-[#5cdbd3]' },
  { name: 'purple', solid: 'bg-purple-500 text-white border-purple-500 shadow-purple-200', light: 'bg-[#f9f0ff] text-[#722ed1] border-[#d3adf7] hover:border-[#b37feb]' },
  { name: 'pink', solid: 'bg-[#ff85c0] text-white border-[#ff85c0] shadow-pink-200', light: 'bg-[#fff0f6] text-[#eb2f96] border-[#ffadd2] hover:border-[#ff85c0]' },
];

const MenuGrid = ({ active, onSelect }: { active: string, onSelect: (t: string) => void }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 mb-4 shadow-sm">
      <div className="grid grid-cols-5 gap-3">
        {MENU_ITEMS.map((item, index) => {
          // Force blue theme for all items as requested (Complaint, Tag, Templates, Channels, Tasks, Timeout, Logs, MiniProgram)
          // "短信区域" is naturally blue (index 2). 
          // The user requested all other specific items to match "短信区域".
          // Since this covers the entire list, we use the blue theme for everything.
          const theme = BUTTON_THEMES[2]; 

          const isActive = active === item;
          
          return (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className={`h-9 text-sm font-bold rounded-lg border transition-all duration-200 flex items-center justify-center ${
                isActive 
                  ? `${theme.solid} shadow-md transform scale-[1.02]` 
                  : `${theme.light} border bg-opacity-60`
              }`}
            >
              {item}
            </button>
          );
        })}
        {/* 占位符，保证网格整齐 */}
        <div className="hidden sm:block"></div> 
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
            <thead className="bg-[#f8fafc] sticky top-0 z-10 text-[13px] font-semibold text-slate-600 tracking-wide border-b border-slate-200">
              <tr>
                <th className="p-4 border-b border-slate-200 text-center w-14 text-slate-400 font-medium">序号</th>
                {config.columns.map(col => (
                  <th key={col.key} className="p-4 border-b border-slate-200" style={{ width: col.width }}>
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {col.sortable && <ArrowUpDown size={13} className="text-slate-400 cursor-pointer hover:text-blue-500" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[13px] text-slate-700">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50/40 transition-colors group even:bg-blue-50">
                  <td className="p-4 text-center text-slate-400 group-hover:text-slate-500">{i + 1}</td>
                  {config.columns.map(col => (
                    <td key={col.key} className="p-4">
                      {col.render ? col.render(row) : <span className="text-slate-700 font-normal">{row[col.key]}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 底部页码 */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-white shrink-0 rounded-b-xl">
          <span className="text-xs text-slate-500 font-medium">共 {data.length} 条数据</span>
          <div className="flex items-center gap-2">
            <select className="border border-slate-200 rounded-md text-xs h-7 px-2 bg-white outline-none text-slate-600 cursor-pointer hover:border-blue-400 transition-colors">
              <option>10条/页</option>
              <option>20条/页</option>
            </select>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 border border-slate-200 rounded-md bg-white flex items-center justify-center hover:border-blue-400 hover:text-blue-500 disabled:opacity-50 transition-all text-slate-500"><ChevronLeft size={14} /></button>
              <button className="w-7 h-7 border border-[#1890ff] rounded-md bg-[#1890ff] text-white text-xs font-bold shadow-sm">1</button>
              <button className="w-7 h-7 border border-slate-200 rounded-md bg-white text-xs text-slate-600 hover:border-blue-400 hover:text-blue-500 font-medium transition-all">2</button>
              <button className="w-7 h-7 border border-slate-200 rounded-md bg-white flex items-center justify-center hover:border-blue-400 hover:text-blue-500 transition-all text-slate-500"><ChevronRight size={14} /></button>
            </div>
            <span className="text-xs text-slate-500 ml-2">前往 <input type="text" defaultValue="1" className="w-9 border border-slate-200 rounded-md text-center h-6 text-xs focus:border-blue-400 outline-none transition-all" /> 页</span>
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
      
      {/* 运营效能概览 - Updated style to match 'Total Points' card in reference (Cleaner, White, Shadow) */}
      <div className="bg-white rounded-xl border border-slate-100 flex items-center shadow-sm h-14 mb-4 shrink-0 px-1">
        <div className="flex items-center gap-4 px-4 flex-1">
          <div className="flex items-center gap-2 mr-2 shrink-0 bg-blue-50 px-3 py-1.5 rounded-lg">
            <Activity size={18} className="text-[#1890ff]" />
            <span className="text-sm font-bold text-[#003a8c]">运营效能概览</span>
          </div>

          {/* Sub Navigation for 'Tag Management' */}
          {activeTab === '标签管理' && (
             <div className="flex gap-2 mr-8">
               <button 
                onClick={() => setSubTab('manage')}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${subTab === 'manage' ? 'bg-[#1890ff] text-white shadow-md shadow-blue-200' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`}
               >
                 标签管理
               </button>
               <button 
                onClick={() => setSubTab('history')}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${subTab === 'history' ? 'bg-[#1890ff] text-white shadow-md shadow-blue-200' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`}
               >
                 历史操作记录
               </button>
             </div>
          )}

          <div className="flex items-center gap-6 ml-4">
            {[['今日单量', '2,482', '#333333'], ['异常预警', '3', '#f5222d'], ['榜单第一', '廖林峰', '#52c41a'], ['全网GMV', '¥85.4w', '#1890ff']].map(([label, val, color]) => (
              <div key={label} className="flex items-baseline gap-1.5">
                 <span className="text-[12px] text-slate-500 font-medium">{label}</span>
                 <span className="text-base font-bold font-mono" style={{ color }}>{val}</span>
              </div>
            ))}
          </div>
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