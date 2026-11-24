/* ============ 智能推荐引擎 ============ */
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

    /* 1) 传感器筛选与评分 */
    let pool = DB.sensors.filter(s => s.resH >= req.h * 0.85 && s.resV >= req.v * 0.8);
    let resLimited = false;
    if(pool.length === 0){ pool = [...DB.sensors].sort((a,b)=>b.resH-a.resH).slice(0,3); resLimited = true; }

    const budgetWeight = {economy:0.85, standard:0.35, performance:0.05}[input.budget] || 0.35;
    const scoreSensor = s => {
      let sc = 0;
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

    /* 4) 接口 */
    let iface = input.iface;
    if(iface === 'auto'){
      if(bw > 400) iface = 'CameraLink';
      else if(bw > 110) iface = 'USB3';
      else iface = 'GigE';
      if(input.compute === 'edge' && bw < 200 && input.budget === 'economy') iface = 'CSI';
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

    return {
      input, req, needFps, sensor, lens, light, iface, deployHint,
      idealFocal, actualFovW, actualFovH, pixelOnObject, dof, bw,
      confidence, tags, analysis, resLimited, fpsLimited, bwOk, coverOk
    };
  },

  /* ---------- 基线对照：传统人工查表法 ---------- */
  /* 模拟工程常见做法：仅按「分辨率达标 + 成本最低」单一约束选型，
     不校核帧率、快门、带宽、接口与目标成像像素。用于创新点的公平对照。 */
  baselineSelect(input){
    const req = this.requiredResolution(input);
    const pool = DB.sensors.filter(s => s.resH >= req.h);
    const sensor = pool.length
      ? pool.slice().sort((a,b)=>a.tier-b.tier || a.resH-b.resH)[0]
      : DB.sensors[DB.sensors.length-1];

    const idealFocal = Math.min(
      sensor.sensorW * input.workDist / input.fovWidth,
      sensor.sensorH * input.workDist / input.fovHeight
    );
    const lens = DB.lenses.slice().sort((a,b)=>Math.abs(a.focal-idealFocal)-Math.abs(b.focal-idealFocal))[0];

    const actualFovW = sensor.sensorW * input.workDist / lens.focal;
    const pixelOnObject = (input.minObject / actualFovW) * sensor.resH;
    const bw = this.bandwidth(sensor.resH, sensor.resV, Math.max(input.minFps,1), input.colorMode === 'color');

    /* 基线方法通常按经验直接指定 GigE（未做带宽校核） */
    const assumedIface = 'GigE';
    const bwOk = bw <= this.interfaceCapacity(assumedIface);
    const motionRisk = input.lineSpeed > 0 && input.triggerMode === 'continuous' && sensor.shutter === 'rolling';
    const pixelRisk = pixelOnObject < 20;

    const risks = [];
    if(bwOk === false) risks.push(`带宽 ${bw.toFixed(0)} MB/s 超出 GigE 约 110 MB/s 上限，实际部署需更换接口`);
    if(motionRisk) risks.push('运动产线下卷帘快门会产生果冻效应，需返工更换全局快门相机');
    if(pixelRisk) risks.push(`目标仅 ${pixelOnObject.toFixed(0)} px，低于 20 px 稳定检出阈值，识别易漏检`);

    return {
      sensor, lens, idealFocal, pixelOnObject, bw, assumedIface,
      riskCount: risks.length, risks,
      checkedConstraints: 1  // 仅分辨率
    };
  },

  /* ---------- 计算器 ---------- */
  calcOptical(sensorW, wd, fov){ return sensorW * wd / fov; },
  calcResolution(fov, obj, px){ return Math.ceil((fov/obj)*px*1.2); },
  calcFps(speed, spacing, factor){ return Math.ceil((speed*1000/60)/Math.max(spacing,1)*factor); },
  calcBandwidthMB(h, v, fps, bits){ return h*v*fps*bits/8/1e6; }
};
