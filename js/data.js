/* ============ 工业视觉硬件数据库 ============ */
/* 数值为行业典型参考值，实际选型请以厂商规格书为准 */

const DB = {

  /* 图像传感器：resH/resV 有效分辨率, pixel 像元尺寸(µm), sensorW/H 靶面尺寸(mm),
     maxFps 典型最高帧率, shutter 快门类型, tier 成本等级(1低~6高),
     lowLight 弱光能力(1~5), ico 推荐接口 */
  sensors: [
    {id:'IMX287', name:'IMX287', resH:720,  resV:540,  pixel:6.9,  sensorW:5.0,  sensorH:3.7,  maxFps:523, shutter:'global',   tier:3, lowLight:4, iface:['CameraLink','USB3'],     use:'超高速抓取'},
    {id:'IMX219', name:'IMX219', resH:3280, resV:2464, pixel:1.4,  sensorW:4.6,  sensorH:3.7,  maxFps:30,  shutter:'rolling',  tier:1, lowLight:2, iface:['CSI','USB3'],         use:'成本敏感 / 嵌入式'},
    {id:'IMX327', name:'IMX327 (STARVIS)', resH:1945, resV:1097, pixel:2.9, sensorW:5.6, sensorH:3.2, maxFps:60, shutter:'rolling', tier:2, lowLight:5, iface:['USB3','GigE'],  use:'弱光 / 夜间检测'},
    {id:'IMX477', name:'IMX477 (HQ)', resH:4056, resV:3040, pixel:1.55, sensorW:6.3, sensorH:4.7, maxFps:30, shutter:'rolling', tier:2, lowLight:3, iface:['CSI'],               use:'高精度嵌入式'},
    {id:'IMX264', name:'IMX264', resH:2448, resV:2048, pixel:3.45, sensorW:8.4, sensorH:7.1, maxFps:35, shutter:'global',   tier:4, lowLight:4, iface:['GigE','USB3','CameraLink'], use:'通用工业检测 / 运动场景'},
    {id:'IMX250', name:'IMX250', resH:2448, resV:2048, pixel:3.45, sensorW:8.4, sensorH:7.1, maxFps:50, shutter:'global',   tier:4, lowLight:4, iface:['GigE','USB3','CameraLink'], use:'高速运动 / 偏振检测'},
    {id:'IMX183', name:'IMX183', resH:5568, resV:3712, pixel:2.4,  sensorW:13.4, sensorH:8.9, maxFps:20, shutter:'rolling',  tier:4, lowLight:3, iface:['USB3','CameraLink'],     use:'大幅面静态高精度'},
    {id:'IMX253', name:'IMX253', resH:4112, resV:3008, pixel:3.45, sensorW:14.2, sensorH:10.4, maxFps:30, shutter:'global', tier:5, lowLight:4, iface:['GigE','CameraLink'],       use:'大幅面高速检测'},
    {id:'IMX304', name:'IMX304', resH:4112, resV:3008, pixel:3.45, sensorW:14.2, sensorH:10.4, maxFps:23, shutter:'global', tier:5, lowLight:4, iface:['GigE','CameraLink'],       use:'大幅面高分辨率'},
    {id:'IMX540', name:'IMX540', resH:5320, resV:4600, pixel:2.74, sensorW:14.6, sensorH:12.6, maxFps:25, shutter:'global', tier:6, lowLight:3, iface:['CameraLink','10GigE'],     use:'超高精度缺陷检测'}
  ],

  /* 工业镜头：focal 焦距(mm), fno 最大光圈, coverDiag 可覆盖像面直径(mm),
     dist 畸变(%), tier 成本等级, type 类型 */
  lenses: [
    {id:'L04', focal:4,  fno:2.0, coverDiag:6.0,  dist:1.2, tier:1, type:'定焦 / 广角'},
    {id:'L06', focal:6,  fno:2.0, coverDiag:8.0,  dist:1.0, tier:1, type:'定焦 / 广角'},
    {id:'L08', focal:8,  fno:2.0, coverDiag:11.0, dist:0.8, tier:2, type:'定焦'},
    {id:'L12', focal:12, fno:2.0, coverDiag:11.0, dist:0.6, tier:2, type:'定焦 / 低畸变'},
    {id:'L16', focal:16, fno:2.8, coverDiag:16.0, dist:0.4, tier:3, type:'定焦 / 低畸变'},
    {id:'L25', focal:25, fno:2.0, coverDiag:17.6, dist:0.3, tier:3, type:'定焦 / 工业级'},
    {id:'L35', focal:35, fno:2.0, coverDiag:21.6, dist:0.2, tier:4, type:'定焦 / 低畸变'},
    {id:'L50', focal:50, fno:2.8, coverDiag:21.6, dist:0.15,tier:4, type:'定焦 / 远心可选'},
    {id:'L75', focal:75, fno:2.8, coverDiag:21.6, dist:0.12,tier:5, type:'定焦 / 长工作距离'}
  ],

  /* 光源 */
  lights: [
    {id:'ring', name:'环形白光 LED', best:'通用照明 / 平面工件', note:'安装简便、均匀性好，适合大多数漫反射场景', tier:1},
    {id:'coax', name:'同轴光源', best:'高反光表面 / 镜面缺陷', note:'消除眩点，凸显划痕、凹陷等微小缺陷', tier:3},
    {id:'back', name:'背光光源', best:'尺寸测量 / 轮廓提取', note:'形成高对比剪影，边缘定位精度高', tier:2},
    {id:'bar',  name:'条形光源', best:'长条形工件 / 线扫场景', note:'方向性强，可突出纹理与边缘', tier:2},
    {id:'dome', name:'穹顶光源', best:'曲面 / 弧形反光件', note:'多角度漫射，均匀覆盖复杂曲面', tier:4},
    {id:'rgb',  name:'多角度 RGB 光源', best:'颜色分选 / 多特征检测', note:'可切换色彩通道，增强特征对比度', tier:4}
  ],

  /* 任务类型 → 推荐光源 */
  taskHints: {
    electronics:{light:'ring',  note:'电子元件建议配合低畸变镜头，注意静电与反光'},
    defect:     {light:'coax',  note:'缺陷检测需突出对比度，同轴/多角度光源效果更佳'},
    weld:       {light:'coax',  note:'焊缝检测建议加装滤光片抑制弧光干扰'},
    dimension:  {light:'back',  note:'尺寸测量优先背光 + 低畸变镜头，需做像素标定'},
    ocr:        {light:'bar',   note:'字符识别建议保证字符高度 ≥ 20 px'},
    general:    {light:'ring',  note:'通用检测可先采用标准环形光方案验证'}
  },

  /* 知识指南 */
  guides: [
    {title:'成像基础：针孔模型', num:'01',
     body:'相机的视场由传感器尺寸、镜头焦距和工作距离共同决定。三者满足相似三角形关系，是选型中最核心的公式。',
     formula:'f = (传感器尺寸 × 工作距离) ÷ 视场尺寸',
     list:['焦距越大 → 视场越小、放大倍率越高','工作距离越大 → 视场越大、景深越深','传感器越大 → 同焦距下视场越大']},
    {title:'分辨率：让目标"看得清"', num:'02',
     body:'检测算法与人工判读都需要目标在图像中占据足够像素才能稳定识别。工业场景通常要求最小目标至少 20~30 像素。',
     formula:'水平分辨率 ≥ (FOV宽 ÷ 最小目标) × 目标像素数',
     list:['高检测精度：目标 ≥ 30 px','常规检测：目标 ≥ 20 px','粗略检测：目标 ≥ 12 px','分辨率并非越高越好，需兼顾帧率与带宽']},
    {title:'帧率：跟得上产线节拍', num:'03',
     body:'连续采集时，帧率必须高于单位时间内通过视野的工件数量，否则会漏检。触发拍摄模式可降低帧率要求。',
     formula:'所需帧率 ≥ (线速度 ÷ 工件间距) × 过采样系数',
     list:['线速度单位换算：1 m/min ≈ 16.7 mm/s','过采样系数通常取 1.5~2','高速场景优先选全局快门传感器']},
    {title:'像元尺寸与灵敏度', num:'04',
     body:'像元尺寸越大，单个像素进光量越多、信噪比越高，但同分辨率下靶面也越大、镜头成本更高。',
     formula:'靶面宽度 ≈ 水平像素数 × 像元尺寸 ÷ 1000 (mm)',
     list:['大像元(≥3.45µm)：弱光、高动态场景','小像元(≤1.55µm)：小型化、低成本、高分辨率','弱光环境可优先考虑 STARVIS 类传感器']},
    {title:'接口带宽与传输', num:'05',
     body:'数据速率 = 分辨率 × 帧率 × 位深。超过接口带宽时需降低分辨率、改用压缩或升级接口。',
     formula:'速率(MB/s) ≈ 宽 × 高 × 帧率 × 位深 ÷ 8 ÷ 10⁶',
     list:['GigE：约 110 MB/s，线缆长、成本低','USB3：约 400 MB/s，即插即用','Camera Link / 10GigE：高带宽、长距离']},
    {title:'景深与对焦余量', num:'06',
     body:'工件高度波动超出景深时图像会失焦。光圈越小、放大倍率越低，景深越深；远心镜头可改善边缘透视误差。',
     formula:'景深 ≈ 2 × F值 × 允许弥散圆直径 × 放大倍率² ÷ 焦距²',
     list:['工件高度波动大时优先缩小光圈或拉长工作距离','精密尺寸测量建议选用远心镜头','景深与进光量互相制约，需结合光源功率权衡']}
  ],

  /* ============ 答辩论证材料 ============ */

  /* 创新点：强调"具体改动 + 证据 + 范围集中" */
  innovations: [
    {
      num:'01',
      title:'多约束耦合求解替代单约束人工查表',
      change:'把分辨率、帧率、快门类型、数据带宽、接口上限、弱光能力等 6 类约束写进同一评分函数，并对违反项直接扣分、生成返工预警；传统做法只按"分辨率达标 + 价格最低"查表。',
      evidence:'5 组对照工况中，基线方法 5/5 出现部署风险（带宽超限或卷帘快门运动伪影），本系统 0/5。可在「实验与验证」页现场重算。',
      scope:'聚焦于选型决策阶段，不涉及图像算法本身',
      tag:'决策方法'
    },
    {
      num:'02',
      title:'目标成像像素反向求解分辨率',
      change:'将"目标最小成像像素"作为反向约束求所需分辨率：先由精度等级确定目标应占像素数（30/20/12 px），再反推水平分辨率，并同步校核镜头放大倍率与视场覆盖，避免"分辨率达标但目标看不清"。',
      evidence:'高精度工况（目标 1.5 mm）下，系统将镜头由 12 mm 调整为 25 mm 并选用更高分辨率传感器，在保证目标 ≥30 px 的同时同步控制带宽与景深。',
      scope:'面向面阵工业相机的成像参数决策，不含线扫/3D',
      tag:'成像驱动'
    },
    {
      num:'03',
      title:'可解释匹配度与失败边界显式输出',
      change:'不输出黑盒结论：把每条约束的满足情况折算为匹配度分值，并同时给出工程建议、风险条件与不适用边界，工程师可逐条回溯扣分来源。',
      evidence:'5 组工况匹配度 88~99；当目标像素低于 12 px、分辨率库内不足或带宽超接口上限时主动降分并提示，而非强行给出方案。',
      scope:'可解释性层，便于人工复核与竞赛证据留痕',
      tag:'可解释性'
    }
  ],

  /* 版本迭代证据：来自本项目的真实改动记录 */
  iteration: [
    {ver:'v1.0', title:'单约束选型', body:'仅按分辨率达标取最低成本传感器。工况 A 选出 IMX219（卷帘快门），运动产线存在果冻效应风险，未校核带宽。', result:'风险 2 项', state:'bad'},
    {ver:'v2.0', title:'加入运动约束', body:'对连续采集 + 产线运动场景的卷帘快门增加惩罚项。工况 A 改选 IMX264 全局快门，运动伪影风险消除。', result:'风险 1 项', state:'mid'},
    {ver:'v2.7', title:'回归纯视觉选型', body:'按指导调整产品定位：移除检测模型绑定，聚焦相机/镜头/光源/接口的硬件选型与成像校核。推荐结果与部署风险结论保持不变。', result:'风险 0 项 · 匹配度 99', state:'good'}
  ],

  /* 价值与场景 */
  value: {
    scenario:'面向订单班合作企业的工业产线视觉检测环节，用于缺陷检测、尺寸测量与字符识别项目的前期硬件选型。',
    actors:['设备工程师（选型决策）','系统集成商（方案报价）','采购与项目负责人（成本与交付风险）'],
    metrics:[
      {name:'约束校核覆盖数', before:'1 项（仅分辨率）', after:'8 项（分辨率/帧率/快门/带宽/接口/弱光/振动/目标像素）', note:'可由 engine.js 评分函数逐条核查'},
      {name:'部署返工风险', before:'5/5 组工况存在风险', after:'0/5 组工况存在风险', note:'同一输入、同一硬件库对照实验'},
      {name:'选型耗时', before:'人工查表经验值 30~45 min', after:'系统端到端 < 1 s', note:'人工值为经验估计待实测；系统耗时可现场计时'},
      {name:'结果可复现性', before:'依赖工程师经验，不同人结果不同', after:'相同输入重复运行输出完全一致', note:'可现场连续运行 10 次验证'}
    ],
    boundary:'仅覆盖明场/背光常规面阵成像；不含线扫、3D 相机与光谱成像。硬件参数为行业典型值，正式采购前须以厂商规格书与实拍验证为准。'
  },

  /* 实验与验证 */
  experiments: {
    goal:'验证"多约束耦合求解"相对"单约束人工查表"能否降低硬件部署返工风险。',
    metricDefs:[
      ['部署风险数','违反带宽上限 + 运动场景卷帘快门 + 目标成像像素 < 20 px 的项数之和'],
      ['匹配度','100 减去各约束违反扣分，下限 32、上限 99'],
      ['一致性','相同输入重复运行 10 次，推荐结果与匹配度完全相同']
    ],
    fairness:'实验组与对照组使用完全相同的 18 项输入参数、同一份硬件数据库与同一组工况参数；差异仅在选型算法本身。对照算法见 engine.js 的 baselineSelect()。',
    cases:[
      {id:'A', name:'默认缺陷检测', desc:'3 mm 缺陷 / 300 mm 视场 / 20 m·min⁻¹ 连续产线'},
      {id:'B', name:'微小缺陷高精度', desc:'1.5 mm 缺陷 / 高精度 / GPU + 高性能预算'},
      {id:'C', name:'经济型嵌入式', desc:'通用检测 / 单色 / 边缘算力 / 经济预算'},
      {id:'D', name:'高速触发采集', desc:'120 m·min⁻¹ / 外部触发 / 机械臂安装'},
      {id:'E', name:'尺寸测量', desc:'背光单色 / 高精度 / GPU'}
    ],
    limits:[
      '当所需分辨率超过库内最大传感器时，系统标记 resLimited 并降分，不伪造可行方案',
      '带宽超限时仅提示升级接口，不自动牺牲分辨率换取带宽',
      '光源为任务类型规则映射，未做光照仿真或实拍对比',
      '接口带宽为行业典型值上限，实际受线缆质量与网卡性能影响',
      '个人经历与项目贡献须由学生本人按实际填写，系统不生成虚构内容'
    ]
  },

  /* 工程资料 */
  engineering: {
    version:'v2.7.0',
    stack:'原生 HTML + CSS + JavaScript，零第三方依赖、零构建步骤',
    files:[
      ['index.html','页面结构与五个答辩模块入口'],
      ['css/style.css','浅色工业风样式与响应式布局'],
      ['js/data.js','传感器/镜头/光源数据库 + 答辩论证材料'],
      ['js/engine.js','成像求解、推荐评分、基线对照算法'],
      ['js/app.js','交互、渲染、计算器与结果导出'],
      ['README.md','工程说明、运行方式、测试流程与限制条件'],
      ['宣发文章草稿.md','自媒体宣发材料草稿']
    ],
    github:'https://github.com/you0172/vision-selector'
  },

  /* 7 分钟陈述路线，与通知第七部分对应 */
  demoScript:[
    {time:'0:00–0:50', title:'应用场景与待解决的问题', say:'产线视觉选型依赖人工查表，只校核分辨率，常出现带宽超限与卷帘快门返工。', show:'切换到「价值与场景」页', page:'value'},
    {time:'0:50–1:50', title:'解决方案与核心创新点', say:'多约束耦合求解 + 目标成像像素反向求解分辨率；创新在约束建模方式，而非使用某个具体算法。', show:'「创新点论证」页，指出迭代证据', page:'innovation'},
    {time:'1:50–3:50', title:'数据、方法与实验设计', say:'5 组工况，实验组与对照组同输入同数据库，差异仅在算法；说明风险数与匹配度的指标定义。', show:'「实验与验证」页', page:'experiment'},
    {time:'3:50–5:30', title:'实际结果与失败边界', say:'基线 5/5 有风险，本系统 0/5；同时主动说明分辨率不足、未做实拍等边界。', show:'对照表与限制条件', page:'experiment'},
    {time:'5:30–6:30', title:'现场原型演示', say:'现场改参数并重新推荐，展示 <1s 响应与结果可复现。', show:'「智能选型工作台」实跑', page:'workbench'},
    {time:'6:30–7:00', title:'价值、本人贡献与结语', say:'报告可测量收益，逐条说明本人实际承担的工作，不虚构。', show:'「工程与开源」页', page:'engineering'},
    {time:'7:00–10:00', title:'评委问答', say:'直接回答并回指前述证据页面。', show:'按需切换对应页面', page:''}
  ]
};
