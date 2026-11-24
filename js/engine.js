/* ============ 规则推荐引擎（多约束规则求解，非 AI 推理） ============
   基于针孔成像模型与 8 项工程约束的可解释规则打分：
   每条规则有明确物理含义，任何输出都可人工复核。 */
/* 基于物理成像模型 + 产线工况的多约束联合求解 */

const Engine = {

  /* ---------- 基础计算 ---------- */
  pixelsPerObject(precision){
    return {high:30, medium:20, low:12}[precision] || 20;
  },

  requiredResolution(input){
    const px = this.pixelsPerObject(input.precision);
    const h = Math.ceil((input.fovWidth / input.minObject) * px * 1.2);
    const v = Math.ceil((input.fovHeight / input.minObject) * px * 1.2);
    return {h, v, px};
  },

  requiredFps(input){
    if(input.triggerMode === 'trigger') return Math.max(5, input.minFps);
    const speedMmS = input.lineSpeed * 1000 / 60;
    const byLine = Math.ceil(speedMmS / Math.max(input.objSpacing,1) * 1.5);
    return Math.max(input.minFps, byLine);
  },

  sensorDiag(s){ return Math.sqrt(s.sensorW*s.sensorW + s.sensorH*s.sensorH); },

  bandwidth(resH, resV, fps, color){
    const bits = color ? 24 : 8;
    return resH * resV * fps * bits / 8 / 1e6; // MB/s
  },

  interfaceCapacity(name){
    return {GigE:110, USB3:400, CameraLink:850, '10GigE':1100, CSI:200, auto:1100}[name] || 110;
  },

  /* 景深粗估：DOF ≈ 2·N·c·(WD/f)²  (c ≈ 2×像元尺寸) */
  depthOfField(sensor, lens, wd){
    const c = 2 * sensor.pixel / 1000; // mm
    return 2 * lens.fno * c * Math.pow(wd / lens.focal, 2);
  },

  /* ---------- 主推荐 ---------- */
  recommend(input){
    const req = this.requiredResolution(input);
    const needFps = this.requiredFps(input);
    const hint = DB.taskHints[input.taskType] || DB.taskHints.general;

    /* 1) 传感器筛选与评分（规则：停产型号不参与推荐，仅保留在库供替代核对） */
    let pool = DB.sensors.filter(s => s.status !== '停产' && s.resH >= req.h * 0.85 && s.resV >= req.v * 0.8);
    let resLimited = false;
    if(pool.length === 0){ pool = DB.sensors.filter(s=>s.status!=='停产').sort((a,b)=>b.resH-a.resH).slice(0,3); resLimited = true; }

    const budgetWeight = {economy:0.85, standard:0.35, performance:0.05}[input.budget] || 0.35;
    const scoreSensor = s => {
      let sc = 0;
      /* 分辨率不足属硬约束违反，惩罚显著高于分辨率过剩（过剩只是成本浪费） */
      if(s.resH < req.h) sc += (req.h - s.resH) / Math.max(req.h,1) * 4;
      sc += Math.max(0, (s.resH - req.h) / Math.max(req.h,1)) * 0.9;       // 分辨率过剩惩罚
      if(s.maxFps < needFps) sc += input.triggerMode === 'trigger' ? 2 : 14; // 帧率不足
      sc += s.tier * budgetWeight;                                          // 成本
      if(input.lightingEnv === 'variable' || input.lightingEnv === 'outdoor') sc += (5 - s.lowLight) * 0.45;
      if(s.shutter === 'rolling'){
        if(input.mount === 'moving') sc += 3;
        if(input.triggerMode === 'continuous' && input.lineSpeed > 0) sc += 1.1;
        if(input.lineSpeed > 60) sc += 1.5;
        if(input.precision === 'high') sc += 1.0;
        if(needFps > 60) sc += 2;
      }
      return sc;
    };
    pool.sort((a,b)=>scoreSensor(a)-scoreSensor(b));
    const sensor = pool[0];
    const fpsLimited = sensor.maxFps < needFps && input.triggerMode !== 'trigger';

    /* 2) 焦距与镜头 */
    const limitW = sensor.sensorW * input.workDist / input.fovWidth;
    const limitH = sensor.sensorH * input.workDist / input.fovHeight;
    const idealFocal = Math.min(limitW, limitH);
    const diag = this.sensorDiag(sensor);

    let lensPool = DB.lenses.filter(l => l.coverDiag >= diag * 0.92 && l.focal <= idealFocal * 1.12);
    lensPool.sort((a,b)=>a.focal-b.focal);
    let lens;
    if(lensPool.length){
      lens = lensPool[lensPool.length-1]; // 取不超过视场限制的最大焦距
    }else{
      const covered = DB.lenses.filter(l => l.coverDiag >= diag * 0.92);
      const base = covered.length ? covered : DB.lenses;
      lens = base.reduce((a,b)=>Math.abs(b.focal-idealFocal) < Math.abs(a.focal-idealFocal) ? b : a);
    }
    const coverOk = lens.coverDiag >= diag * 0.92;

    /* 3) 实际成像参数 */
    const actualFovW = sensor.sensorW * input.workDist / lens.focal;
    const actualFovH = sensor.sensorH * input.workDist / lens.focal;
    const pixelOnObject = (input.minObject / actualFovW) * sensor.resH;
    const dof = this.depthOfField(sensor, lens, input.workDist);
    const bw = this.bandwidth(sensor.resH, sensor.resV, needFps, input.colorMode === 'color');

    /* 4) 接口（规则：必须在所选型号支持的接口列表内，且容量满足带宽） */
    let iface = input.iface;
    if(iface === 'auto'){
      if(bw > 400) iface = 'CameraLink';
      else if(bw > 110) iface = 'USB3';
      else iface = 'GigE';
      if(input.compute === 'edge' && bw < 200 && input.budget === 'economy') iface = 'CSI';
      if(!sensor.iface.includes(iface)){
        const cap = x => this.interfaceCapacity(x);
        const avail = sensor.iface.filter(x => cap(x) >= bw).sort((a,b)=>cap(a)-cap(b));
        iface = avail.length ? avail[0] : sensor.iface.slice().sort((a,b)=>cap(b)-cap(a))[0];
      }
    }
    const bwOk = bw <= this.interfaceCapacity(iface);

    /* 5) 光源 */
    const light = DB.lights.find(l => l.id === hint.light) || DB.lights[0];
    let lightNote = light.note;
    if(input.lightingEnv === 'outdoor') lightNote = '户外强光需加装遮光罩并选用高功率光源 / 滤光片';
    else if(input.lightingEnv === 'variable') lightNote = '光照波动大，建议封闭式光源 + 自动曝光锁定';

    /* 6) 部署环境建议 */
    const deployHint = {
      edge: '边缘部署：建议嵌入式视觉平台或工控机直连采集，预留存储与编码带宽余量',
      gpu: 'GPU 工作站：适合高帧率、大分辨率采集与离线算法分析',
      cloud: '服务器集中处理：多路图像经网络回传，需核算上行链路带宽'
    }[input.compute] || '';

    /* 7) 匹配度评分 */
    let confidence = 100;
    if(resLimited) confidence -= 25;
    if(fpsLimited) confidence -= 14;
    if(pixelOnObject < 12) confidence -= 16;
    else if(pixelOnObject < 20) confidence -= 7;
    if(!coverOk) confidence -= 10;
    if(!bwOk) confidence -= 12;
    if(input.lightingEnv === 'outdoor' || input.lightingEnv === 'variable') confidence -= 5;
    if(input.mount === 'moving' && sensor.shutter === 'rolling') confidence -= 8;
    confidence = Math.max(32, Math.min(99, Math.round(confidence)));

    /* 8) 标签与分析 */
    const tags = [];
    tags.push(sensor.shutter === 'global' ? '全局快门' : '卷帘快门');
    tags.push(sensor.lowLight >= 4 ? '弱光增强' : '标准灵敏度');
    tags.push(iface + ' 接口');
    if(input.compute === 'edge') tags.push('边缘部署');

    const analysis = [];
    analysis.push(`目标在图像中约占 <b>${pixelOnObject.toFixed(0)} px</b>，${pixelOnObject>=20?'满足稳定检出与识别的像素要求':'低于 20 px 推荐阈值，建议缩短工作距离或提高精度等级'}。`);
    analysis.push(`理论所需分辨率 ${req.h}×${req.v}，选用 ${sensor.name}（${sensor.resH}×${sensor.resV}）${resLimited?'，现有库内分辨率最接近该需求':'，分辨率满足且不过度冗余'}。`);
    analysis.push(`理论焦距 ${idealFocal.toFixed(1)} mm，选配 ${lens.focal} mm ${lens.type}，实际视场约 ${actualFovW.toFixed(0)}×${actualFovH.toFixed(0)} mm。`);
    analysis.push(`采集帧率需 ≥ ${needFps} fps（${input.triggerMode==='trigger'?'触发模式，按单次触发计算':'连续采集模式'}），图像数据速率约 ${bw.toFixed(0)} MB/s，${iface} ${bwOk?'带宽充裕':'带宽接近上限，建议降低分辨率或升级接口'}。`);
    if(deployHint) analysis.push(deployHint + '。');
    if(hint.note) analysis.push(hint.note + '。');
    if(dof < 15) analysis.push(`当前景深约 ${dof.toFixed(0)} mm，较浅；若工件高度波动大，建议缩小光圈或改用远心镜头。`);

    const result = {
      input, req, needFps, sensor, lens, light, iface, deployHint,
      idealFocal, actualFovW, actualFovH, pixelOnObject, dof, bw,
      confidence, tags, analysis, resLimited, fpsLimited, bwOk, coverOk
    };
    result.risks = this.riskAudit(result).risks;
    return result;
  },

  /* ---------- 对照实验：A/B 双方案 ---------- */
  compare(input){
    const a = this.baselineSelect(input);
    const aAudit = this.riskAudit(a);
    const b = this.recommend(input);
    const bAudit = this.riskAudit(b);
    return { a, b, aRisks: aAudit.risks, aMetrics: aAudit.metrics, bRisks: bAudit.risks, bMetrics: bAudit.metrics };
  },

  /* ---------- 单约束基线（对照实验 · A 方案） ---------- */
  /* 模拟传统经验做法：只校核分辨率达标 + 成本最低，接口按经验默认 GigE */
  baselineSelect(input){
    const req = this.requiredResolution(input);
    const ok = DB.sensors.filter(s => s.resH >= req.h && s.resV >= req.v);
    const pool = ok.length ? ok : [...DB.sensors].sort((a,b)=>b.resH-a.resH).slice(0,3);
    const sensor = pool.reduce((a,b)=> b.tier < a.tier ? b : a);
    const idealFocal = Math.min(
      sensor.sensorW * input.workDist / input.fovWidth,
      sensor.sensorH * input.workDist / input.fovHeight
    );
    const lens = DB.lenses.reduce((a,b)=> Math.abs(b.focal-idealFocal) < Math.abs(a.focal-idealFocal) ? b : a);
    const hint = DB.taskHints[input.taskType] || DB.taskHints.general;
    const light = DB.lights.find(l => l.id === hint.light) || DB.lights[0];
    const needFps = this.requiredFps(input);
    const bw = this.bandwidth(sensor.resH, sensor.resV, needFps, input.colorMode === 'color');
    return { input, req, needFps, sensor, lens, light, iface:'GigE', idealFocal, bw };
  },

  /* ---------- 约束审计（部署风险清单） ---------- */
  /* 对任一选型结果逐条核对 8 项工程约束，返回风险列表与关键指标 */
  riskAudit(r){
    const i = r.input;
    const req = r.req || this.requiredResolution(i);
    const needFps = r.needFps || this.requiredFps(i);
    const bw = r.bw || this.bandwidth(r.sensor.resH, r.sensor.resV, needFps, i.colorMode === 'color');
    const diag = this.sensorDiag(r.sensor);
    const actualFovW = r.sensor.sensorW * i.workDist / r.lens.focal;
    const pixel = (i.minObject / actualFovW) * r.sensor.resH;
    const dof = this.depthOfField(r.sensor, r.lens, i.workDist);
    const bwCap = this.interfaceCapacity(r.iface);
    const risks = [];
    const add = (level, title, detail) => risks.push({level, title, detail});

    if(r.sensor.resH < req.h * 0.85)
      add('high','分辨率不足', `理论需要 ${req.h}×${req.v}，所选 ${r.sensor.name} 仅 ${r.sensor.resH}×${r.sensor.resV}`);
    if(pixel < 12) add('high','目标成像过小', `最小目标仅约 ${pixel.toFixed(0)} px，低于 12 px 稳定检出下限`);
    else if(pixel < 20) add('mid','目标成像偏小', `最小目标约 ${pixel.toFixed(0)} px，低于 20 px 推荐阈值，建议缩短工作距离`);
    if(r.sensor.maxFps < needFps && i.triggerMode !== 'trigger')
      add('high','帧率不足', `产线节拍要求 ≥${needFps} fps，所选最高 ${r.sensor.maxFps} fps，连续采集将漏检`);
    if(bw > bwCap)
      add('high','带宽超限', `数据速率 ${bw.toFixed(0)} MB/s 超出 ${r.iface} 容量 ${bwCap} MB/s，图像无法实时回传`);
    else if(bw > bwCap * 0.85)
      add('mid','带宽接近上限', `数据速率 ${bw.toFixed(0)} MB/s 已达 ${r.iface} 容量的 85% 以上`);
    if(r.lens.coverDiag < diag * 0.92)
      add('high','像面覆盖不足', `镜头覆盖 Ø${r.lens.coverDiag} mm < 传感器对角 ${diag.toFixed(1)} mm，图像边缘出现黑角`);
    if(i.mount === 'moving' && r.sensor.shutter === 'rolling')
      add('mid','卷帘快门风险', '运动平台上卷帘快门会产生果冻效应，应改选全局快门');
    else if(i.triggerMode === 'continuous' && i.lineSpeed > 60 && r.sensor.shutter === 'rolling')
      add('mid','高速拖影风险', `线速度 ${i.lineSpeed} m/min 连续采集下卷帘快门易产生拖影`);
    if((i.lightingEnv === 'outdoor' || i.lightingEnv === 'variable') && r.sensor.lowLight < 4)
      add('mid','弱光能力不足', `${i.lightingEnv === 'outdoor' ? '户外强光' : '光照波动'}环境下传感器弱光等级仅 ${r.sensor.lowLight}/5`);
    if(dof < 10)
      add('mid','景深过浅', `景深约 ${dof.toFixed(0)} mm，工件高度波动较大时易失焦`);

    return { risks, metrics: { pixel, bw, bwCap, dof, diag, actualFovW } };
  },

  /* ---------- 预设对照工况（与答辩实验一致） ---------- */
  PRESETS: (() => {
    const BASE = {taskType:'defect', minObject:3, fovWidth:300, fovHeight:220, workDist:500, objCount:8,
      lineSpeed:20, objSpacing:60, minFps:30, triggerMode:'continuous', lightingEnv:'controlled',
      mount:'fixed', temperature:'normal', colorMode:'color', precision:'medium', iface:'auto',
      budget:'standard', compute:'edge'};
    return {
      A:{label:'A · 默认缺陷检测', desc:'3 mm 目标 / 300×220 视场 / 20 m·min⁻¹ 连续采集', input:{...BASE}},
      B:{label:'B · 微小缺陷高精度', desc:'1.5 mm 目标 / 高精度 / GPU / 高性能预算', input:{...BASE, minObject:1.5, fovWidth:150, fovHeight:110, workDist:300, precision:'high', budget:'performance', compute:'gpu'}},
      C:{label:'C · 经济型嵌入式', desc:'通用检测 / 单色 / 边缘算力 / 成本优先', input:{...BASE, taskType:'general', fovWidth:200, fovHeight:150, workDist:350, budget:'economy', compute:'edge', colorMode:'mono'}},
      D:{label:'D · 高速触发采集', desc:'120 m·min⁻¹ / 外部触发 / 机械臂安装', input:{...BASE, lineSpeed:120, triggerMode:'trigger', mount:'arm'}},
      E:{label:'E · 尺寸测量', desc:'0.5 mm 目标 / 背光单色 / 高精度 / GPU', input:{...BASE, taskType:'dimension', minObject:0.5, fovWidth:55, fovHeight:42, workDist:110, triggerMode:'trigger', colorMode:'mono', precision:'high', compute:'gpu', budget:'performance', objCount:1}}
    };
  })(),

  /* ---------- 计算器 ---------- */
  calcOptical(sensorW, wd, fov){ return sensorW * wd / fov; },
  calcResolution(fov, obj, px){ return Math.ceil((fov/obj)*px*1.2); },
  calcFps(speed, spacing, factor){ return Math.ceil((speed*1000/60)/Math.max(spacing,1)*factor); },
  calcBandwidthMB(h, v, fps, bits){ return h*v*fps*bits/8/1e6; }
};
