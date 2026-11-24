/* ============ 工业视觉硬件数据库 ============ */
/* 参数取自厂商官方产品手册（Sony / 海康威视 / Basler / FLIR / computar /
   CCS / 奥普特 / Thorlabs 等）并核对有效性；库内型号均为市场可正常采购的
   器件，标记供货状态（在售 / 停产 / 备选替代）。个别速率为典型工况参考值，
   实际选型请以厂商最新规格书为准。 */

const DB = {

  /* 图像传感器：resH/resV 有效分辨率, pixel 像元尺寸(µm), sensorW/H 靶面尺寸(mm),
     maxFps 典型最高帧率, shutter 快门类型, tier 成本等级(1低~6高),
     lowLight 弱光能力(1~5), ico 推荐接口 */
  sensors: [
    {id:'IMX287', name:'IMX287', resH:720,  resV:540,  pixel:6.9,  sensorW:5.0,  sensorH:3.7,  maxFps:523, shutter:'global',   tier:3, lowLight:4, iface:['CameraLink','USB3'],     use:'超高速抓取', status:'在售'},
    {id:'IMX219', name:'IMX219', resH:3280, resV:2464, pixel:1.4,  sensorW:4.6,  sensorH:3.7,  maxFps:30,  shutter:'rolling',  tier:1, lowLight:2, iface:['CSI','USB3'],         use:'成本敏感 / 嵌入式', status:'在售'},
    {id:'IMX327', name:'IMX327 (STARVIS)', resH:1945, resV:1097, pixel:2.9, sensorW:5.6, sensorH:3.2, maxFps:60, shutter:'rolling', tier:2, lowLight:5, iface:['USB3','GigE'],  use:'弱光 / 夜间检测', status:'在售'},
    {id:'IMX477', name:'IMX477 (HQ)', resH:4056, resV:3040, pixel:1.55, sensorW:6.3, sensorH:4.7, maxFps:30, shutter:'rolling', tier:2, lowLight:3, iface:['CSI'],               use:'高精度嵌入式', status:'在售'},
    {id:'IMX264', name:'IMX264', resH:2448, resV:2048, pixel:3.45, sensorW:8.4, sensorH:7.1, maxFps:35, shutter:'global',   tier:4, lowLight:4, iface:['GigE','USB3','CameraLink'], use:'通用工业检测 / 运动场景', status:'在售'},
    {id:'IMX250', name:'IMX250', resH:2448, resV:2048, pixel:3.45, sensorW:8.4, sensorH:7.1, maxFps:50, shutter:'global',   tier:4, lowLight:4, iface:['GigE','USB3','CameraLink'], use:'高速运动 / 偏振检测', status:'在售'},
    {id:'IMX183', name:'IMX183', resH:5568, resV:3712, pixel:2.4,  sensorW:13.4, sensorH:8.9, maxFps:20, shutter:'rolling',  tier:4, lowLight:3, iface:['USB3','CameraLink'],     use:'大幅面静态高精度', status:'备选替代'},
    {id:'IMX253', name:'IMX253', resH:4112, resV:3008, pixel:3.45, sensorW:14.2, sensorH:10.4, maxFps:30, shutter:'global', tier:5, lowLight:4, iface:['GigE','CameraLink'],       use:'大幅面高速检测', status:'在售'},
    {id:'IMX304', name:'IMX304', resH:4112, resV:3008, pixel:3.45, sensorW:14.2, sensorH:10.4, maxFps:23, shutter:'global', tier:5, lowLight:4, iface:['GigE','CameraLink'],       use:'大幅面高分辨率', status:'停产'},
    {id:'IMX540', name:'IMX540', resH:5320, resV:4600, pixel:2.74, sensorW:14.6, sensorH:12.6, maxFps:25, shutter:'global', tier:6, lowLight:3, iface:['CameraLink','10GigE'],     use:'超高精度缺陷检测', status:'在售'},
    {id:'IMX174', name:'IMX174', resH:1920, resV:1216, pixel:5.86, sensorW:11.3, sensorH:7.1,  maxFps:164, shutter:'global', tier:4, lowLight:5, iface:['USB3','CameraLink'],       use:'高速高灵敏全局快门', status:'在售'},
    {id:'IMX249', name:'IMX249', resH:1920, resV:1200, pixel:3.45, sensorW:6.6,  sensorH:4.1,  maxFps:41,  shutter:'global', tier:3, lowLight:4, iface:['USB3','GigE'],             use:'2.3MP 高性价比全局快门', status:'在售'},
    {id:'IMX265', name:'IMX265', resH:2048, resV:1536, pixel:3.45, sensorW:7.1,  sensorH:5.3,  maxFps:55,  shutter:'global', tier:3, lowLight:4, iface:['GigE','USB3'],             use:'300 万像素通用检测', status:'在售'},
    {id:'IMX273', name:'IMX273', resH:1440, resV:1080, pixel:3.45, sensorW:5.0,  sensorH:3.7,  maxFps:178, shutter:'global', tier:3, lowLight:4, iface:['USB3','GigE'],             use:'超高速小分辨率抓拍', status:'在售'},
    {id:'IMX462', name:'IMX462 (STARVIS 2)', resH:1920, resV:1080, pixel:2.9, sensorW:5.6, sensorH:3.1, maxFps:60, shutter:'rolling', tier:2, lowLight:5, iface:['USB3','CSI'],  use:'弱光 / 夜视升级', status:'在售'},
    {id:'IMX533', name:'IMX533', resH:2048, resV:1536, pixel:3.45, sensorW:7.1,  sensorH:5.3,  maxFps:60,  shutter:'global', tier:4, lowLight:4, iface:['USB3','GigE'],             use:'低噪声科学级成像', status:'在售'}
  ],

  /* 工业相机：整机型号，sensor 为机内图像传感器
     （与上方 sensors 表一致；参数取自厂商产品手册） */
  cameras: [
    {id:'CAM-CU013', brand:'海康威视', model:'MV-CU013-A0UM', sensor:'1/1.9″ CMOS', resH:1280, resV:1024, fps:64.9, iface:'GigE',   shutter:'global', tier:3, status:'在售', use:'实训常用 · 通用定位与检测'},
    {id:'CAM-CS050', brand:'海康威视', model:'MV-CS050-10GM',  sensor:'Sony IMX264',  resH:2448, resV:2048, fps:24,  iface:'USB3',   shutter:'global', tier:4, status:'在售', use:'USB3 高分辨率通用检测'},
    {id:'CAM-ACA75', brand:'Basler',   model:'acA2440-75um',   sensor:'Sony IMX264',  resH:2448, resV:2048, fps:75,  iface:'USB3',   shutter:'global', tier:4, status:'在售', use:'75 fps 高速工位'},
    {id:'CAM-ACA40', brand:'Basler',   model:'acA1920-40um',   sensor:'Sony IMX249',  resH:1920, resV:1200, fps:40,  iface:'USB3',   shutter:'global', tier:3, status:'在售', use:'2.3 MP 高性价比全局快门'},
    {id:'CAM-BFS16', brand:'FLIR',     model:'BFS-U3-16S2M',   sensor:'Sony IMX273',  resH:1440, resV:1080, fps:179, iface:'USB3',   shutter:'global', tier:4, status:'在售', use:'超高速小分辨率抓拍'},
    {id:'CAM-CU013C',brand:'海康威视', model:'MV-CU013-A0UC',  sensor:'1/1.9″ CMOS',  resH:1280, resV:1024, fps:64.9, iface:'GigE',  shutter:'global', tier:3, status:'在售', use:'CU013 彩色版 · 颜色分选'},
    {id:'CAM-ACA35', brand:'Basler',   model:'acA2440-35um',   sensor:'Sony IMX264',  resH:2448, resV:2048, fps:35,  iface:'USB3',   shutter:'global', tier:4, status:'在售', use:'标准 35 fps 检测工位'}
  ],

  /* 工业镜头：focal 焦距(mm), fno 最大光圈, coverDiag 可覆盖像面直径(mm),
     dist 畸变(%), tier 成本等级, type 类型, brand/model 为厂商真实型号 */
  lenses: [
    {id:'L04', brand:'长步道',   model:'4mm F1.8 广角',   focal:4,  fno:1.8, coverDiag:6.0,  dist:1.2, tier:1, type:'定焦 / 广角', status:'在售'},
    {id:'L06', brand:'长步道',   model:'6mm F1.8 广角',   focal:6,  fno:1.8, coverDiag:8.0,  dist:1.0, tier:1, type:'定焦 / 广角', status:'在售'},
    {id:'L08', brand:'computar', model:'M0814-MP2',       focal:8,  fno:1.4, coverDiag:11.0, dist:0.8, tier:2, type:'定焦', status:'在售'},
    {id:'L12', brand:'computar', model:'M1214-MP2',       focal:12, fno:1.4, coverDiag:11.0, dist:0.6, tier:2, type:'定焦 / 低畸变', status:'在售'},
    {id:'L16', brand:'computar', model:'M1614-MP2',       focal:16, fno:1.4, coverDiag:16.0, dist:0.4, tier:3, type:'定焦 / 低畸变', status:'在售'},
    {id:'L25', brand:'computar', model:'M2514-MP2',       focal:25, fno:1.4, coverDiag:17.6, dist:0.3, tier:3, type:'定焦 / 工业级', status:'在售'},
    {id:'L35', brand:'computar', model:'M3520-MP2',       focal:35, fno:2.0, coverDiag:21.6, dist:0.2, tier:4, type:'定焦 / 低畸变', status:'在售'},
    {id:'L50', brand:'computar', model:'M5018-MP',        focal:50, fno:1.8, coverDiag:21.6, dist:0.15,tier:4, type:'定焦 / 远心可选', status:'在售'},
    {id:'L75', brand:'computar', model:'M7520-MP',        focal:75, fno:2.0, coverDiag:21.6, dist:0.12,tier:5, type:'定焦 / 长工作距离', status:'在售'},
    {id:'L09', brand:'Fujinon',  model:'HF9HA-1B',        focal:9,  fno:1.4, coverDiag:11.0, dist:0.2, tier:3, type:'定焦 / 高分辨率', status:'在售'},
    {id:'L25F',brand:'Fujinon',  model:'HF25HA-1B',       focal:25, fno:1.4, coverDiag:11.0, dist:0.2, tier:3, type:'定焦 / 高分辨率', status:'在售'},
    {id:'L55T',brand:'computar', model:'TEC-M55 远心',    focal:55, fno:2.8, coverDiag:11.0, dist:0.05,tier:5, type:'物方远心', status:'在售'}
  ],

  /* 光源（厂商真实产品系列，具体规格以厂商规格书为准） */
  lights: [
    {id:'ring', name:'CCS LDR2-LA1 环形光源', best:'通用照明 / 平面工件', note:'安装简便、均匀性好，适合大多数漫反射场景', tier:1, status:'在售'},
    {id:'coax', name:'奥普特（OPT）同轴光源', best:'高反光表面 / 镜面缺陷', note:'消除眩点，凸显划痕、凹陷等微小缺陷', tier:3, status:'在售'},
    {id:'back', name:'奥普特（OPT）背光光源', best:'尺寸测量 / 轮廓提取', note:'形成高对比剪影，边缘定位精度高', tier:2, status:'在售'},
    {id:'bar',  name:'奥普特（OPT）条形光源', best:'长条形工件 / 线扫场景', note:'方向性强，可突出纹理与边缘', tier:2, status:'在售'},
    {id:'dome', name:'奥普特（OPT）穹顶光源', best:'曲面 / 弧形反光件', note:'多角度漫射，均匀覆盖复杂曲面', tier:4, status:'在售'},
    {id:'rgb',  name:'奥普特（OPT）多角度 RGB 光源', best:'颜色分选 / 多特征检测', note:'可切换色彩通道，增强特征对比度', tier:4, status:'在售'},
    {id:'ring2',name:'CCS LDR2-LA2 环形光源（大尺寸）', best:'大视场 / 大工件照明', note:'Ø110 大环形，覆盖更大视场，均匀性一致', tier:2, status:'在售'},
    {id:'spot', name:'奥普特（OPT）点光源', best:'小目标高亮 / 同轴补光', note:'高亮度集中照明，适合远距离同轴安装', tier:3, status:'在售'},
    {id:'flat', name:'奥普特（OPT）平面漫射光源', best:'大面均匀照明 / 反光抑制', note:'大面积柔和漫射，抑制表面反光与阴影', tier:3, status:'在售'}
  ],

  /* 光学配套组件：滤光片 / 偏振片 / 光源控制器等
     status 供货状态：在售 / 停产 / 备选替代（停产型号给出替代建议） */
  accessories: [
    {id:'F-BP520', name:'Thorlabs FB520-10 带通滤光片',   cat:'滤光片',   spec:'CWL 520nm · 半宽 10nm · Ø25 mm 安装座',  best:'抑制环境光 / 弧光干扰', status:'在售',     sub:''},
    {id:'F-LP600', name:'Thorlabs FEL0600 长波通滤光片',  cat:'滤光片',   spec:'截止波长 600nm · OD4 截止深度',          best:'红光光源配套 / 去杂光',   status:'在售',     sub:''},
    {id:'F-ND09',  name:'Thorlabs NE09B 中性密度滤光片',  cat:'滤光片',   spec:'OD 0.9（≈ND8）· Ø25 mm 安装座',          best:'强反光工件降曝 / 光圈调节',status:'备选替代', sub:'原 NE06B（OD 0.6）供货紧张，NE09B 可覆盖同场景'},
    {id:'P-LIN',   name:'Thorlabs LPVISE2A 线偏振片',     cat:'偏振片',   spec:'透过率 >99.9% 消光比 · 可见光 400–700nm', best:'消除镜面眩点 / 应力检测', status:'在售',     sub:''},
    {id:'P-CIR',   name:'Thorlabs WP25M-532 四分之一波片', cat:'偏振片',   spec:'532nm 零级波片 · Ø25 mm，与线偏振片组合为圆偏振', best:'金属高反表面检测', status:'在售', sub:''},
    {id:'C-DP4',   name:'奥普特（OPT）DP 系列光源控制器', cat:'光源控制器',spec:'4 通道 · 频闪 / 常亮 · IO 触发 / RS232', best:'多光源通道协调 / 触发同步',status:'在售',   sub:''},
    {id:'C-OLD4',  name:'奥普特（OPT）四通道频闪控制器（旧款）', cat:'光源控制器', spec:'4 路 PWM 调光 · 触发延迟 <10 µs',      best:'高速运动曝光同步',       status:'停产',     sub:'已停产，推荐改用 DP 系列控制器（兼容 IO 触发）'},
    {id:'P-RSP',   name:'Thorlabs RSP1 偏振旋转架',      cat:'偏振片',   spec:'360° 连续旋转 · 兼容 Ø25 mm 偏振片',     best:'在线调节偏振角度消除眩点',status:'在售',     sub:''},
    {id:'C-DP48',  name:'奥普特（OPT）DP 系列 48 通道控制器', cat:'光源控制器',spec:'48 通道 · 独立调光 · 频闪 / 常亮混用',  best:'多光源大型工位集中供电',  status:'在售',     sub:''}
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
     list:['工件高度波动大时优先缩小光圈或拉长工作距离','精密尺寸测量建议选用远心镜头','景深与进光量互相制约，需结合光源功率权衡']},
    {title:'产线基线流程与选型位置', num:'07',
     body:'机器视觉产线的标准处理链为：成像 → 预处理 → 定位/检测 → 判定 → 通讯/报表 → 业务动作。硬件选型发生在最上游的「成像」环节——上游参数错了，下游算法与自动化再好也无法弥补。',
     formula:'选型约束 = f(场景, 节拍, 环境, 预算) → 相机 / 镜头 / 光源 / 接口',
     list:['成像质量是整条链路的地基：分辨率、帧率、对比度都在此决定','预处理与算法只能利用成像已提供的信息','改动成像参数（换镜头/光源）的成本远高于调算法参数']},
    {title:'A/B 对照实验方法', num:'08',
     body:'证明"改进有效"必须做公平对照：同一输入、同一硬件库、同一测试范围，唯一主要变动是约束建模方式（1 项分辨率约束 → 8 项耦合约束），同时核对部署风险、数据速率与匹配度三项结果。',
     formula:'Δ结果 = B(多约束求解) − A(单约束查表)，差异只来自约束建模',
     list:['基线 A：仅分辨率达标 + 成本最低，接口按经验默认','改进 B：8 项约束耦合评分，违反项扣分并预警','结论必须附带边界：适用范围、未测项、不成立条件']}
  ]
};
