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
  ]
};
