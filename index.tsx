import React, { useState, useMemo } from 'react';
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
  Clock
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
  label: string;
  type: 'select' | 'input' | 'date-range';
  placeholder?: string;
  options?: string[];
  width?: string;
  isSecondary?: boolean; // If true, placed after buttons
}

interface ColumnConfig {
  header: string;
  key: string;
  width?: string;
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
      { header: "投诉佐证", key: "proof", render: () => <span className="text-blue-500 cursor-pointer flex items-center gap-1"><FileText size={12}/> 图片</span> },
      { header: "投诉类型", key: "type" },
      { header: "内容", key: "content", width: "20%" },
      { header: "创建时间", key: "createTime" },
      { header: "状态", key: "status", render: (row) => <span className={`px-2 py-0.5 rounded text-xs ${STATUS_MAP[row.status as keyof typeof STATUS_MAP] || 'bg-gray-100'}`}>{row.status}</span> },
      { header: "关联订单号", key: "orderNo" },
      { header: "处理人", key: "handler" },
      { header: "处理意见", key: "opinion" },
      { header: "处理时间", key: "handleTime" },
      { header: "操作", key: "ops", render: () => <button className="text-blue-600 hover:underline">处理</button> },
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
      { header: "状态", key: "status", render: (row) => <span className={`px-2 py-0.5 rounded text-xs ${row.status === '启用' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{row.status}</span> },
      { header: "标签简码", key: "shortCode" },
      { header: "创建时间", key: "createTime" },
      { header: "操作", key: "ops", render: () => <div className="flex gap-2 text-blue-600"><button>修改</button><button className="text-red-500">删除</button><button>禁用</button></div> },
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
      { header: "操作", key: "ops", render: () => <button className="text-red-500 hover:underline">删除</button> },
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
      { header: "状态", key: "status", render: (row) => <span className={row.status === '启用' ? 'text-green-600' : 'text-slate-400'}>{row.status}</span> },
      { header: "模板代码", key: "code" },
      { header: "内容", key: "content", width: "25%" },
      { header: "渠道", key: "channel" },
      { header: "参数", key: "params" },
      { header: "创建时间", key: "createTime" },
      { header: "操作", key: "ops", render: () => <div className="flex gap-2 text-blue-600"><button>修改</button><button className="text-red-500">删除</button></div> },
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
      { header: "操作", key: "ops", render: () => <div className="flex gap-2 text-blue-600"><button>修改</button><button className="text-red-500">删除</button></div> },
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
      { header: "发送状态", key: "status", render: (row) => <span className={`px-2 py-0.5 rounded text-xs ${STATUS_MAP[row.status as keyof typeof STATUS_MAP] || ''}`}>{row.status}</span> },
      { header: "操作", key: "ops", render: () => <div className="flex gap-2 text-blue-600"><button>详情</button><button className="text-orange-500">失败补发</button></div> },
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
      { header: "状态", key: "status", render: (row) => <span className={row.status === '成功' ? 'text-green-600' : 'text-red-600'}>{row.status}</span> },
      { header: "发送人", key: "sender" },
      { header: "失败原因", key: "failReason" },
      { header: "操作", key: "ops", render: () => <div className="flex gap-2 text-blue-600"><button>查看内容</button><button>重发</button></div> },
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
      { header: "操作", key: "ops", render: () => <div className="flex gap-2 text-blue-600 text-xs"><button>重新生成</button><button>修改</button><button className="text-red-500">删除</button></div> },
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

// --- 子组件：通知栏 (保持不变) ---

const NotificationBar = () => (
  <div className="flex items-center gap-4 mb-2 px-4 py-2 bg-[#fff7e6] border border-[#ffd591] rounded-lg shadow-sm overflow-hidden shrink-0">
    <div className="flex items-center gap-2 text-[#d46b08] shrink-0">
      <Bell size={14} className="animate-pulse" />
      <span className="text-xs font-bold">系统公告</span>
    </div>
    <div className="flex-1 overflow-hidden relative h-5 flex items-center">
      <div className="whitespace-nowrap animate-[marquee_30s_linear_infinite] flex items-center gap-8 text-[11px] text-[#d46b08]">
        <span>📢 数据看板已更新：店铺统计增加“门市单量占比”视图，天梯榜排名逻辑已优化，请各位负责人知悉。</span>
      </div>
    </div>
    <style>{`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>
  </div>
);

// --- 子组件：新的 5x2 菜单网格 ---

const MenuGrid = ({ active, onSelect }: { active: string, onSelect: (t: string) => void }) => {
  return (
    <div className="grid grid-cols-5 gap-2 mb-2">
      {MENU_ITEMS.map((item) => (
        <button
          key={item}
          onClick={() => onSelect(item)}
          className={`h-9 text-[12px] font-bold rounded-lg border transition-all shadow-sm flex items-center justify-center ${
            active === item 
              ? 'bg-[#1890ff] text-white border-[#1890ff] ring-2 ring-blue-100' 
              : 'bg-white text-slate-600 border-slate-200 hover:border-[#1890ff] hover:text-[#1890ff]'
          }`}
        >
          {item}
        </button>
      ))}
      {/* 占位符，保证第二行填满或留空 */}
      <div className="hidden sm:block"></div> 
    </div>
  );
};

// --- 子组件：Filter Section ---

const FilterSection = ({ config }: { config: PageConfig }) => {
  const primaryFilters = config.filters.filter(f => !f.isSecondary);
  const secondaryFilters = config.filters.filter(f => f.isSecondary);
  const hasActions = config.actions && config.actions.length > 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
      <div className="flex flex-wrap items-center gap-4">
        {primaryFilters.map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-700 whitespace-nowrap">{f.label}</label>
            {f.type === 'select' ? (
              <div className="relative">
                <select className="border border-slate-300 rounded px-2 h-7 text-xs w-28 outline-none focus:border-blue-400 bg-white appearance-none">
                  {f.options?.map(opt => <option key={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-2 top-2 pointer-events-none text-slate-400">▼</div>
              </div>
            ) : f.type === 'input' ? (
              <input type="text" placeholder={f.placeholder} className="border border-slate-300 rounded px-2 h-7 text-xs w-32 outline-none focus:border-blue-400" />
            ) : null}
          </div>
        ))}

        <div className="flex gap-2 ml-2">
          <button className="bg-[#1890ff] text-white px-4 h-7 rounded text-xs hover:bg-blue-600 transition-colors">搜索</button>
          <button className="border border-slate-300 text-slate-600 px-3 h-7 rounded text-xs hover:bg-slate-50 transition-colors">重置</button>
        </div>

        {/* Secondary filters appear after buttons */}
        {secondaryFilters.map((f, i) => (
          <div key={`sec-${i}`} className="flex items-center gap-2 pl-4 border-l border-slate-200">
            <label className="text-xs font-medium text-slate-700 whitespace-nowrap">{f.label}</label>
            {f.type === 'date-range' ? (
               <div className="flex items-center gap-1">
                 <div className="relative">
                   <Clock size={12} className="absolute left-2 top-2 text-slate-400"/>
                   <input type="text" placeholder="开始日期" className="border border-slate-300 rounded px-2 pl-6 h-7 text-xs w-24 outline-none focus:border-blue-400" />
                 </div>
                 <span className="text-slate-400 text-xs">至</span>
                 <input type="text" placeholder="结束日期" className="border border-slate-300 rounded px-2 h-7 text-xs w-24 outline-none focus:border-blue-400" />
               </div>
            ) : null}
          </div>
        ))}

        {/* 动作按钮 (Add/Upload) - 移动到最后 */}
        {hasActions && (
          <div className="flex gap-2 ml-2 pl-4 border-l border-slate-200">
            {config.actions?.includes("add") && (
              <button className="bg-[#1890ff] text-white px-3 h-7 rounded text-xs font-medium flex items-center gap-1 hover:bg-blue-600">
                <Plus size={12} /> 新增
              </button>
            )}
            {config.actions?.includes("upload") && (
              <button className="bg-[#52c41a] text-white px-3 h-7 rounded text-xs font-medium flex items-center gap-1 hover:bg-green-600">
                <Upload size={12} /> 上传文件(号码过滤)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- 子组件：Table List ---

const TableList = ({ type }: { type: MenuType }) => {
  const config = PAGE_CONFIGS[type];
  const data = useMemo(() => config.generateData(), [type]);

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      {/* 1. 筛选区域 (圆角矩形) */}
      <FilterSection config={config} />

      {/* 2. 表格区域 (圆角矩形) */}
      <div className="flex-1 bg-white border border-slate-100 rounded-lg shadow-sm flex flex-col overflow-hidden">
        {/* 工具栏 (Actions) - 已移除，按钮移动到了 FilterSection */}
        
        {/* 表格内容 */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm text-xs font-bold text-slate-600">
              <tr>
                <th className="p-3 border-b text-center w-12">序号</th>
                {config.columns.map(col => (
                  <th key={col.key} className="p-3 border-b" style={{ width: col.width }}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-3 text-center text-slate-400">{i + 1}</td>
                  {config.columns.map(col => (
                    <td key={col.key} className="p-3">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 底部页码 */}
        <div className="px-4 py-2 border-t border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <span className="text-[11px] text-slate-500">共 {data.length} 条</span>
          <div className="flex items-center gap-1">
            <select className="border border-slate-200 rounded text-xs h-6 px-1 bg-white outline-none">
              <option>10条/页</option>
              <option>20条/页</option>
            </select>
            <button className="w-6 h-6 border border-slate-200 rounded bg-white flex items-center justify-center hover:border-blue-400 disabled:opacity-50"><ChevronLeft size={12} className="text-slate-400" /></button>
            <button className="w-6 h-6 border border-[#1890ff] rounded bg-[#1890ff] text-white text-[11px] font-bold">1</button>
            <button className="w-6 h-6 border border-slate-200 rounded bg-white text-[11px] text-slate-600 hover:border-blue-400 hover:text-blue-500">2</button>
            <button className="w-6 h-6 border border-slate-200 rounded bg-white flex items-center justify-center hover:border-blue-400"><ChevronRight size={12} className="text-slate-400" /></button>
            <span className="text-[11px] text-slate-500 ml-2">前往 <input type="text" defaultValue="1" className="w-8 border border-slate-200 rounded text-center h-5" /> 页</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 主应用组件 ---

const App = () => {
  const [activeTab, setActiveTab] = useState<MenuType>(MENU_ITEMS[0]);

  return (
    <div className="h-screen bg-[#f8fafc] p-3 flex flex-col overflow-hidden font-sans text-slate-800">
      <NotificationBar />
      
      <MenuGrid active={activeTab} onSelect={(t) => setActiveTab(t as MenuType)} />
      
      {/* 运营效能概览 (保持不变) */}
      <div className="bg-[#f0f7ff] rounded-lg border border-[#d9d9d9] overflow-hidden flex items-center shadow-sm h-12 mb-2 shrink-0">
        <div className="flex items-center gap-3 px-4 flex-1">
          <div className="flex items-center gap-2 mr-8 shrink-0">
            <Activity size={18} className="text-[#1890ff]" />
            <span className="text-sm font-bold text-[#003a8c]">运营效能概览</span>
          </div>
          <div className="flex gap-12">
            {[['今日单量', '2,482', '#262626'], ['异常预警', '3', '#f5222d'], ['榜单第一', '廖林峰', '#52c41a'], ['全网GMV', '¥85.4w', '#1890ff']].map(([label, val, color]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-[12px] text-[#8c8c8c]">{label}:</span>
                <span className="text-base font-bold font-mono" style={{ color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 核心内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TableList type={activeTab} />
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) { const root = createRoot(container); root.render(<App />); }