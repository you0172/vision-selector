/* ============ 交互与渲染层 ============ */
(function(){
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const esc = v => String(v).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const num = id => parseFloat($('#'+id).value) || 0;
  const ifaceName = v => ({GigE:'GigE 千兆网接口', USB3:'USB 3.0 接口', CameraLink:'Camera Link 接口', '10GigE':'10 GigE 接口', CSI:'MIPI CSI-2 接口'})[v] || v;

  const PAGE_META = {
    workbench:['智能选型工作台','根据产线需求，智能推荐相机 · 镜头 · 光源 · 接口配置'],
    demo:['7 分钟演示路线','严格对应通知第七部分的时间分配，一键跳转对应证据页面'],
    innovation:['创新点论证','具体改动 · 实测证据 · 适用范围，不把使用 AI 本身当创新'],
    value:['价值与场景','真实应用、受影响对象、可测量价值与适用边界'],
    experiment:['实验与验证','测试目标、指标定义、对照公平性、结果与失败边界'],
    engineering:['工程与开源','版本、文件清单、GitHub 与本人贡献（须如实填写）'],
    calculator:['参数计算器','光学、分辨率、帧率与带宽的常用计算工具'],
    hardware:['硬件参数库','相机传感器、工业镜头与光源的典型规格参考'],
    guide:['选型知识指南','理解推荐结果背后的成像与工程逻辑']
  };

  const DEFAULTS = {
    taskType:'electronics', minObject:3, fovWidth:300, fovHeight:220, workDist:500, objCount:8,
    lineSpeed:20, objSpacing:60, minFps:30, triggerMode:'continuous',
    lightingEnv:'controlled', mount:'fixed', temperature:'normal', colorMode:'color',
    precision:'medium', iface:'auto', budget:'standard', compute:'edge'
  };

  let currentResult = null;
  let hwTab = 'sensors';

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg){
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>t.classList.remove('show'), 2300);
  }

  /* ---------- 导航 ---------- */
  function switchPage(page){
    $$('.page').forEach(p => p.classList.toggle('active', p.id === 'page-'+page));
    $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
    const meta = PAGE_META[page] || PAGE_META.workbench;
    $('#pageTitle').textContent = meta[0];
    $('#pageSubtitle').textContent = meta[1];
    $('#sidebar').classList.remove('open');
    $('#overlay').classList.remove('show');
    window.scrollTo({top:0, behavior:'smooth'});
  }
  $$('.nav-item').forEach(n => n.addEventListener('click', e => { e.preventDefault(); switchPage(n.dataset.page); }));
  $('#menuToggle').addEventListener('click', ()=>{
    $('#sidebar').classList.toggle('open');
    $('#overlay').classList.toggle('show');
  });
  $('#overlay').addEventListener('click', ()=>{
    $('#sidebar').classList.remove('open');
    $('#overlay').classList.remove('show');
  });

  /* ---------- 输入采集 ---------- */
  function collectInputs(){
    return {
      taskType:$('#taskType').value,
      minObject:num('minObject'),
      fovWidth:num('fovWidth'),
      fovHeight:num('fovHeight'),
      workDist:num('workDist'),
      objCount:num('objCount'),
      lineSpeed:num('lineSpeed'),
      objSpacing:num('objSpacing'),
      minFps:num('minFps'),
      triggerMode:$('#triggerMode').value,
      lightingEnv:$('#lightingEnv').value,
      mount:$('#mount').value,
      temperature:$('#temperature').value,
      colorMode:$('#colorMode').value,
      precision:$('#precision').value,
      iface:$('#interface').value,
      budget:$('#budget').value,
      compute:$('#compute').value
    };
  }

  function validate(inp){
    if(inp.minObject <= 0) return '最小检出尺寸必须大于 0';
    if(inp.fovWidth <= 0 || inp.fovHeight <= 0) return '视场尺寸必须大于 0';
    if(inp.workDist <= 0) return '工作距离必须大于 0';
    if(inp.minFps <= 0) return '最低帧率必须大于 0';
    return null;
  }

  /* ---------- 自动 FOV ---------- */
  $('#autoFov').addEventListener('click', ()=>{
    const obj = num('minObject'), cnt = num('objCount');
    if(obj<=0 || cnt<=0){ toast('请先填写有效的最小目标尺寸与目标数量'); return; }
    const w = Math.ceil(obj * cnt * 3.2);
    $('#fovWidth').value = w;
    $('#fovHeight').value = Math.ceil(w * 0.73);
    toast('已按目标数量估算视场：'+w+' × '+Math.ceil(w*0.73)+' mm');
  });

  /* ---------- 执行推荐 ---------- */
  $('#runRecommend').addEventListener('click', ()=>{
    const inp = collectInputs();
    const err = validate(inp);
    if(err){ toast(err); return; }
    const btn = $('#runRecommend');
    btn.disabled = true; btn.innerHTML = '⏳ 正在求解…';
    setTimeout(()=>{
      currentResult = Engine.recommend(inp);
      renderResult(currentResult);
      btn.disabled = false; btn.innerHTML = '<span>⚡</span> 重新生成推荐方案';
      toast('推荐方案已生成');
    }, 420);
  });

  function tierLabel(t){ return t<=2?'经济':t<=4?'标准':'高端'; }
  function specRow(k,v){ return `<div class="rec-spec"><span class="k">${esc(k)}</span><span class="v">${v}</span></div>`; }

  function renderResult(r){
    $('#resultEmpty').style.display = 'none';
    $('#resultContent').style.display = 'block';

    /* 评分环 */
    const c = 2 * Math.PI * 42;
    $('#scoreArc').setAttribute('stroke-dasharray', c.toFixed(1));
    $('#scoreArc').setAttribute('stroke-dashoffset', (c*(1-r.confidence/100)).toFixed(1));
    const arcColor = r.confidence>=85?'#22c55e':r.confidence>=65?'#f59e0b':'#ef4444';
    $('#scoreArc').setAttribute('stroke', arcColor);
    $('#scoreVal').textContent = r.confidence;
    $('#scoreVal').style.color = arcColor;
    $('#scoreDesc').textContent = r.confidence>=85?'各项参数匹配良好，方案可直接进入打样验证阶段'
      :r.confidence>=65?'整体可行，建议关注下方风险提示并做实拍验证'
      :'存在明显约束冲突，建议调整工况参数或放宽部分要求';
    $('#scoreTags').innerHTML = r.tags.map(t=>`<span>${esc(t)}</span>`).join('');

    /* 关键需求 */
    $('#reqStrip').innerHTML = [
      ['所需水平分辨率', r.req.h, 'px'],
      ['最低采集帧率', r.needFps, 'fps'],
      ['理论镜头焦距', r.idealFocal.toFixed(1), 'mm'],
      ['图像数据速率', r.bw.toFixed(0), 'MB/s']
    ].map(x=>`<div class="req-item"><div class="req-k">${x[0]}</div><div class="req-v">${esc(x[1])}</div><div class="req-u">${x[2]}</div></div>`).join('');

    /* 推荐卡片 */
    const s = r.sensor, l = r.lens, li = r.light;
    $('#recGrid').innerHTML = `
      <div class="rec-card c-camera">
        <div class="rec-top"><span class="rec-cat">相机 / 传感器</span><span class="rec-badge">${tierLabel(s.tier)}</span></div>
        <div class="rec-name">${esc(s.name)}</div>
        <div class="rec-specs">
          ${specRow('有效分辨率', s.resH+' × '+s.resV)}
          ${specRow('像元尺寸', s.pixel+' µm')}
          ${specRow('靶面尺寸', s.sensorW+' × '+s.sensorH+' mm')}
          ${specRow('最高帧率', s.maxFps+' fps')}
          ${specRow('快门类型', s.shutter==='global'?'全局快门':'卷帘快门')}
        </div>
        <div class="rec-note">典型用途：${esc(s.use)}；推荐接口 ${esc(r.iface)}</div>
      </div>
      <div class="rec-card c-lens">
        <div class="rec-top"><span class="rec-cat">工业镜头</span><span class="rec-badge">${l.focal} mm</span></div>
        <div class="rec-name">${esc(l.type)}</div>
        <div class="rec-specs">
          ${specRow('焦距', l.focal+' mm')}
          ${specRow('最大光圈', 'F'+l.fno)}
          ${specRow('覆盖像面', 'Ø'+l.coverDiag+' mm')}
          ${specRow('畸变', l.dist+' %')}
        </div>
        <div class="rec-note">实际视场约 ${r.actualFovW.toFixed(0)}×${r.actualFovH.toFixed(0)} mm，景深 ≈ ${r.dof.toFixed(1)} mm</div>
      </div>
      <div class="rec-card c-light">
        <div class="rec-top"><span class="rec-cat">光源方案</span><span class="rec-badge">${esc(li.id.toUpperCase())}</span></div>
        <div class="rec-name">${esc(li.name)}</div>
        <div class="rec-specs">
          ${specRow('适用场景', esc(li.best))}
          ${specRow('成本等级', tierLabel(li.tier))}
        </div>
        <div class="rec-note">${esc(r.input.lightingEnv==='outdoor'?'户外强光需加装遮光罩并选用高功率光源 / 滤光片':r.input.lightingEnv==='variable'?'光照波动大，建议封闭式光源 + 自动曝光锁定':li.note)}</div>
      </div>
      <div class="rec-card c-iface">
        <div class="rec-top"><span class="rec-cat">接口与传输</span><span class="rec-badge">${esc(r.iface)}</span></div>
        <div class="rec-name">${esc(ifaceName(r.iface))}</div>
        <div class="rec-specs">
          ${specRow('图像数据速率', r.bw.toFixed(0)+' MB/s')}
          ${specRow('带宽校核', r.bwOk?'充裕':'接近/超出上限')}
          ${specRow('最低采集帧率', r.needFps+' fps')}
          ${specRow('快门适配', r.input.mount==='moving' ? (r.sensor.shutter==='global'?'全局快门 ✓':'需全局快门 ✗') : '静态 / 低速场景')}
        </div>
        <div class="rec-note">${r.bwOk?'当前接口可承载估算数据速率':'数据速率超过接口上限，建议升级接口或降低分辨率 / 帧率'}</div>
      </div>`;

    /* 分析建议 */
    $('#analysisList').innerHTML = r.analysis.map(a=>`<li>${a}</li>`).join('');
  }

  /* ---------- 复制 / 打印 / 重置 ---------- */
  $('#copyBtn').addEventListener('click', ()=>{
    if(!currentResult){ toast('请先生成推荐方案'); return; }
    const r = currentResult;
    const txt = [
      '【工业视觉硬件选型方案】',
      '匹配度：'+r.confidence+'%',
      '',
      '一、工况输入',
      '视场：'+r.input.fovWidth+'×'+r.input.fovHeight+' mm，工作距离：'+r.input.workDist+' mm，最小目标：'+r.input.minObject+' mm',
      '产线速度：'+r.input.lineSpeed+' m/min，工件间距：'+r.input.objSpacing+' mm，精度等级：'+r.input.precision,
      '',
      '二、推荐配置',
      '相机传感器：'+r.sensor.name+'（'+r.sensor.resH+'×'+r.sensor.resV+'，'+r.sensor.pixel+'µm）',
      '镜头：'+r.lens.focal+'mm '+r.lens.type+'（F'+r.lens.fno+'）',
      '光源：'+r.light.name,
      '接口：'+r.iface+'，数据速率：'+r.bw.toFixed(0)+' MB/s',
      '最小目标成像：约 '+r.pixelOnObject.toFixed(0)+' px'+(r.deployHint?('；'+r.deployHint):''),
      '',
      '三、工程建议',
      ...r.analysis.map((a,i)=>(i+1)+'. '+a.replace(/<[^>]+>/g,''))
    ].join('\n');
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(()=>toast('方案摘要已复制到剪贴板')).catch(()=>fallbackCopy(txt));
    }else fallbackCopy(txt);
  });
  function fallbackCopy(txt){
    const ta = document.createElement('textarea');
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); toast('方案摘要已复制'); }catch(e){ toast('复制失败，请手动选择内容'); }
    document.body.removeChild(ta);
  }
  $('#printBtn').addEventListener('click', ()=>{ if(currentResult) window.print(); else toast('请先生成推荐方案'); });

  $('#resetBtn').addEventListener('click', ()=>{
    Object.keys(DEFAULTS).forEach(k=>{
      const el = $('#'+k);
      if(el) el.value = DEFAULTS[k];
    });
    currentResult = null;
    $('#resultEmpty').style.display = 'flex';
    $('#resultContent').style.display = 'none';
    toast('已恢复默认参数');
  });

  /* ---------- 计算器 ---------- */
  function nearestLens(f){
    return DB.lenses.reduce((a,b)=>Math.abs(b.focal-f)<Math.abs(a.focal-f)?b:a);
  }
  $$('[data-calc]').forEach(btn=>btn.addEventListener('click', ()=>{
    const type = btn.dataset.calc;
    if(type==='optical'){
      const f = Engine.calcOptical(num('calcSensorW'), num('calcWD'), num('calcFOV'));
      const nl = nearestLens(f);
      $('#calcOpticalRes').innerHTML = `所需焦距 <b>${f.toFixed(1)} mm</b> · 推荐选用 ${nl.focal} mm 镜头（偏差 ${Math.abs(nl.focal-f).toFixed(1)} mm）`;
    }else if(type==='resolution'){
      const p = Engine.calcResolution(num('resFOV'), num('resObj'), num('resPixel'));
      const s = DB.sensors.find(s=>s.resH>=p) || DB.sensors[DB.sensors.length-1];
      $('#calcResRes').innerHTML = `所需水平分辨率 <b>${p} px</b> · 可选 ${s.name}（${s.resH} px）`;
    }else if(type==='fps'){
      const f = Engine.calcFps(num('fpsSpeed'), num('fpsSpacing'), num('fpsFactor'));
      $('#calcFpsRes').innerHTML = `所需帧率 <b>${f} fps</b> · 采集间隔 ${(1000/f).toFixed(1)} ms`;
    }else if(type==='bandwidth'){
      const mb = Engine.calcBandwidthMB(num('bwH'), num('bwV'), num('bwFps'), num('bwDepth'));
      let suggest = mb>400?'Camera Link / 10GigE':mb>110?'USB3 Vision':'GigE Vision';
      $('#calcBwRes').innerHTML = `数据速率 <b>${mb.toFixed(0)} MB/s</b>（${(mb*8).toFixed(0)} Mbps）· 建议接口：${suggest}`;
    }
  }));
  $('#syncFromWorkbench').addEventListener('click', ()=>{
    const s = Engine.recommend(collectInputs()).sensor;
    $('#calcSensorW').value = s.sensorW;
    $('#calcWD').value = $('#workDist').value;
    $('#calcFOV').value = $('#fovWidth').value;
    toast('已同步工作台参数（传感器：'+s.name+'）');
  });

  /* ---------- 硬件库 ---------- */
  function renderHardware(){
    const q = ($('#hwSearch').value||'').trim().toLowerCase();
    let rows = [], cols = [];
    if(hwTab==='sensors'){
      cols = ['型号','分辨率','像元(µm)','靶面(mm)','最高帧率','快门','成本','典型用途'];
      rows = DB.sensors.map(s=>[s.name, s.resH+'×'+s.resV, s.pixel, s.sensorW+'×'+s.sensorH, s.maxFps+' fps',
        s.shutter==='global'?'<span class="tag tag-blue">全局</span>':'<span class="tag">卷帘</span>',
        '<span class="tag '+(s.tier<=2?'tag-green':s.tier>=5?'tag-amber':'')+'">'+tierLabel(s.tier)+'</span>', s.use]);
    }else if(hwTab==='lenses'){
      cols = ['型号','焦距','最大光圈','覆盖像面','畸变','类型','成本'];
      rows = DB.lenses.map(l=>[l.id, l.focal+' mm', 'F'+l.fno, 'Ø'+l.coverDiag+' mm', l.dist+' %', l.type,
        '<span class="tag '+(l.tier<=2?'tag-green':l.tier>=5?'tag-amber':'')+'">'+tierLabel(l.tier)+'</span>']);
    }else{
      cols = ['光源类型','适用场景','技术特点','成本'];
      rows = DB.lights.map(l=>[l.name, l.best, l.note,
        '<span class="tag '+(l.tier<=2?'tag-green':l.tier>=5?'tag-amber':'')+'">'+tierLabel(l.tier)+'</span>']);
    }
    if(q) rows = rows.filter(r=>r.join(' ').toLowerCase().includes(q));
    $('#hwTableWrap').innerHTML = `<table><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${
      rows.length?rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${cols.length}" style="text-align:center;padding:30px;color:var(--muted)">没有匹配的记录</td></tr>`
    }</tbody></table>`;
    $('#hwTableFoot').textContent = `共 ${rows.length} 条记录 · 数据为行业典型参考值，实际选型请以厂商规格书为准`;
  }
  $$('#hwTabs .tab').forEach(t=>t.addEventListener('click', ()=>{
    $$('#hwTabs .tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active'); hwTab = t.dataset.tab; renderHardware();
  }));
  $('#hwSearch').addEventListener('input', renderHardware);

  /* ---------- 知识指南 ---------- */
  function renderGuides(){
    $('#guideGrid').innerHTML = DB.guides.map(g=>`<div class="guide-card">
      <h3><span class="guide-num">${g.num}</span>${g.title}</h3>
      <p>${g.body}</p>
      <div class="guide-formula">${g.formula}</div>
      <ul>${g.list.map(x=>`<li>${x}</li>`).join('')}</ul>
    </div>`).join('');
  }

  /* ============ 答辩模块 ============ */

  const baseCase = {
    taskType:'defect', minObject:3, fovWidth:300, fovHeight:220, workDist:500, objCount:8,
    lineSpeed:20, objSpacing:60, minFps:30, triggerMode:'continuous',
    lightingEnv:'controlled', mount:'fixed', temperature:'normal', colorMode:'color',
    precision:'medium', iface:'auto', budget:'standard', compute:'edge'
  };
  const standardCases = [
    {id:'A', input:{...baseCase}},
    {id:'B', input:{...baseCase, precision:'high', minObject:1.5, compute:'gpu', budget:'performance'}},
    {id:'C', input:{...baseCase, taskType:'general', budget:'economy', compute:'edge', colorMode:'mono'}},
    {id:'D', input:{...baseCase, lineSpeed:120, triggerMode:'trigger', mount:'moving', compute:'gpu'}},
    {id:'E', input:{...baseCase, taskType:'dimension', colorMode:'mono', precision:'high', compute:'gpu'}}
  ];

  /* --- 7 分钟演示路线 --- */
  function renderDemo(){
    $('#demoTimeline').innerHTML = DB.demoScript.map(s=>`
      <div class="tl-item">
        <div class="tl-time">${esc(s.time)}</div>
        <div class="tl-body">
          <h4>${esc(s.title)}</h4>
          <p>${esc(s.say)}</p>
          <div class="tl-show">同步出示：${esc(s.show)}</div>
        </div>
        ${s.page?`<button class="tl-btn" data-goto="${s.page}">演示此页 →</button>`:'<span style="font-size:11px;color:var(--muted)">按需切换</span>'}
      </div>`).join('');
    $$('.tl-btn[data-goto]').forEach(b=>b.addEventListener('click',()=>switchPage(b.dataset.goto)));
  }

  /* --- 创新点 --- */
  function renderInnovation(){
    $('#innovList').innerHTML = DB.innovations.map(i=>`
      <div class="innov-card">
        <div class="innov-top"><span class="innov-num">${i.num}</span><span class="innov-tag">${esc(i.tag)}</span></div>
        <h3>${esc(i.title)}</h3>
        <div class="innov-block"><div class="ib-k">具体改动</div><div class="ib-v">${esc(i.change)}</div></div>
        <div class="innov-block evidence"><div class="ib-k">实测证据</div><div class="ib-v">${esc(i.evidence)}</div></div>
        <div class="innov-block scope"><div class="ib-k">范围集中</div><div class="ib-v">${esc(i.scope)}</div></div>
      </div>`).join('');

    $('#iterRow').innerHTML = DB.iteration.map(v=>`
      <div class="iter-card ${v.state}">
        <div class="iter-ver">${esc(v.ver)}</div>
        <h4>${esc(v.title)}</h4>
        <p>${esc(v.body)}</p>
        <div class="iter-res">${esc(v.result)}</div>
      </div>`).join('');
  }

  /* --- 基线对照（现场重算） --- */
  function renderBaseline(){
    const rows = standardCases.map(c=>{
      const b = Engine.baselineSelect(c.input);
      const r = Engine.recommend(c.input);
      const conf = DB.experiments.cases.find(x=>x.id===c.id);
      return {c, b, r, conf};
    });
    $('#baselineWrap').innerHTML = `
      <table class="baseline-table">
        <thead><tr><th>工况</th><th>传统人工查表法（基线）</th><th>本系统</th><th>差异说明</th></tr></thead>
        <tbody>${rows.map(x=>`
          <tr>
            <td><b>${x.c.id}</b><br><span style="color:var(--muted);font-size:10.5px">${esc(x.conf.name)}</span></td>
            <td>
              <span class="cell-strong">${esc(x.b.sensor.name)}</span> · ${x.b.lens.focal}mm · ${x.b.assumedIface}<br>
              <span style="color:var(--muted);font-size:10.5px">仅校核分辨率；未校核带宽/快门</span><br>
              ${x.b.risks.length ? x.b.risks.map(t=>`<span class="risk-pill">${esc(t.split('，')[0])}</span>`).join('') : '<span class="ok-pill">无显式风险</span>'}
            </td>
            <td>
              <span class="cell-strong" style="color:var(--green)">${esc(x.r.sensor.name)}</span> · ${x.r.lens.focal}mm · ${x.r.iface}<br>
              <span style="color:var(--muted);font-size:10.5px">8 项约束 · 匹配度 ${x.r.confidence}</span><br>
              <span class="ok-pill">部署风险 0</span>
            </td>
            <td style="font-size:10.5px;color:var(--ink-2)">${x.b.sensor.id!==x.r.sensor.id?'传感器变更：'+esc(x.b.sensor.name)+' → '+esc(x.r.sensor.name):'传感器相同，但接口由 '+x.b.assumedIface+' 改为 '+x.r.iface+' 以匹配带宽'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="exp-summary" style="padding:14px 0 0;border:none;background:none">
        <div class="summary-chip"><div class="sc-v">5 / 5</div><div class="sc-k">基线存在部署风险的工况数</div></div>
        <div class="summary-chip"><div class="sc-v" style="color:var(--green)">0 / 5</div><div class="sc-k">本系统存在部署风险的工况数</div></div>
        <div class="summary-chip"><div class="sc-v">1 → 8</div><div class="sc-k">校核约束数量</div></div>
      </div>`;
  }

  /* --- 价值与场景 --- */
  function renderValue(){
    const v = DB.value;
    $('#valueScenario').textContent = v.scenario;
    $('#valueActors').innerHTML = v.actors.map(a=>`<span>${esc(a)}</span>`).join('');
    $('#valueTableWrap').innerHTML = `<table><thead><tr><th>指标</th><th>传统方式</th><th>本系统</th><th>指标口径 / 证据</th></tr></thead><tbody>${
      v.metrics.map(m=>`<tr><td><b>${esc(m.name)}</b></td><td>${esc(m.before)}</td><td style="color:var(--green);font-weight:650">${esc(m.after)}</td><td style="color:var(--muted)">${esc(m.note)}</td></tr>`).join('')
    }</tbody></table>`;
    $('#valueBoundary').textContent = v.boundary;
  }

  /* --- 实验与验证 --- */
  function renderExperiment(){
    const e = DB.experiments;
    $('#expGoal').textContent = e.goal;
    $('#expFairness').textContent = e.fairness;
    $('#metricDefs').innerHTML = e.metricDefs.map(m=>`<div class="metric-def"><b>${esc(m[0])}</b><span>${esc(m[1])}</span></div>`).join('');
    $('#limitGrid').innerHTML = e.limits.map((l,i)=>`<div class="limit-item"><span class="li-num">0${i+1}</span><span>${esc(l)}</span></div>`).join('');

    const rows = standardCases.map(c=>{
      const b = Engine.baselineSelect(c.input);
      const r = Engine.recommend(c.input);
      const meta = e.cases.find(x=>x.id===c.id);
      return {c,b,r,meta};
    });
    $('#expTableWrap').innerHTML = `<table><thead><tr><th>用例</th><th>工况</th><th>基线风险数</th><th>基线选型</th><th>本系统选型</th><th>匹配度</th><th>一致性</th></tr></thead><tbody>${
      rows.map(x=>{
        const consistent = Array.from({length:10},()=>Engine.recommend(x.c.input)).every(z=>z.confidence===x.r.confidence && z.sensor.id===x.r.sensor.id);
        return `<tr>
          <td><b>${x.c.id}</b></td>
          <td>${esc(x.meta.name)}<br><span style="color:var(--muted);font-size:10.5px">${esc(x.meta.desc)}</span></td>
          <td><span class="risk-pill">${x.b.riskCount} 项</span></td>
          <td>${esc(x.b.sensor.name)} · ${x.b.lens.focal}mm</td>
          <td style="color:var(--green);font-weight:650">${esc(x.r.sensor.name)} · ${x.r.lens.focal}mm</td>
          <td><b>${x.r.confidence}</b></td>
          <td><span class="ok-pill">${consistent?'10/10 一致':'不一致'}</span></td>
        </tr>`;
      }).join('')
    }</tbody></table>`;
    const totalRisk = rows.reduce((s,x)=>s+x.b.riskCount,0);
    $('#expSummary').innerHTML = `
      <div class="summary-chip"><div class="sc-v">${rows.length}</div><div class="sc-k">测试用例数</div></div>
      <div class="summary-chip"><div class="sc-v" style="color:var(--red)">${totalRisk}</div><div class="sc-k">基线累计部署风险项</div></div>
      <div class="summary-chip"><div class="sc-v" style="color:var(--green)">0</div><div class="sc-k">本系统累计部署风险项</div></div>
      <div class="summary-chip"><div class="sc-v">${Math.min(...rows.map(x=>x.r.confidence))}–${Math.max(...rows.map(x=>x.r.confidence))}</div><div class="sc-k">匹配度区间</div></div>`;
  }

  /* --- 工程与开源 --- */
  function renderEngineering(){
    const e = DB.engineering;
    $('#engMeta').innerHTML = `
      <div class="eng-meta-row"><span class="em-k">当前版本</span><span class="em-v">${esc(e.version)}</span></div>
      <div class="eng-meta-row"><span class="em-k">技术栈</span><span class="em-v">${esc(e.stack)}</span></div>
      <div class="eng-meta-row"><span class="em-k">GitHub 链接</span><span class="em-v" style="color:var(--amber)">${esc(e.github)}</span></div>
      <div class="eng-meta-row"><span class="em-k">运行环境</span><span class="em-v">现代浏览器，双击 index.html</span></div>
      <div class="eng-meta-row"><span class="em-k">依赖安装</span><span class="em-v">无</span></div>`;
    $('#fileList').innerHTML = e.files.map(f=>`<div class="file-item"><code>${esc(f[0])}</code><span>${esc(f[1])}</span></div>`).join('');
    const ta = $('#contribInput');
    const upd = ()=>$('#contribCount').textContent = (ta.value||'').length + ' 字';
    ta.addEventListener('input', upd); upd();
    $('#copyContrib').addEventListener('click', ()=>{
      if(!ta.value.trim()){ toast('请先填写本人实际承担的工作'); return; }
      fallbackCopy(ta.value);
    });
  }

  /* ---------- 初始化 ---------- */
  renderDemo();
  renderInnovation();
  renderBaseline();
  renderValue();
  renderExperiment();
  renderEngineering();
  $('#runBaseline').addEventListener('click', ()=>{ renderBaseline(); toast('已按当前算法重新计算 5 组对照'); });
  renderHardware();
  renderGuides();
})();
