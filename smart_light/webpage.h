/*
 * ============================================================================
 * webpage.h - Embedded Web Dashboard for ESP32 Smart Light
 * Clean Centered Layout + Standard System Typography + Light Bulb Graphic
 * Web Bluetooth API + Local Wi-Fi + Global EMQX Cloud
 * ============================================================================
 */

#ifndef WEBPAGE_H
#define WEBPAGE_H

const char PAGE_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="th" class="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>ระบบไฟอัจฉริยะ (Smart Light)</title>
<meta name="theme-color" content="#0b0d10">
<script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
:root{--acc:#d4af37;--bg:#07080a;--card:#0e1117;--subtle:#141820;--brd:#222834;--t1:#fcfbfa;--t2:#8b95a5;--t3:#505a6a}
body{background:var(--bg);color:var(--t1);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;min-height:100vh;padding:24px 16px 40px;display:flex;justify-content:center;-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}
.app{width:100%;max-width:440px;display:flex;flex-direction:column;justify-content:space-between;text-align:center}

/* Header Centered */
header{display:flex;flex-direction:column;align-items:center;padding-bottom:20px;margin-bottom:28px;border-bottom:1px solid var(--brd);gap:14px}
h1{font-size:1rem;font-weight:700;letter-spacing:-.02em;color:var(--t1)}
.sub{font-size:.72rem;color:var(--t2);margin-top:2px}
.hdr-btns{display:flex;align-items:center;justify-content:center;gap:8px}
.btn-rf{background:var(--card);border:1px solid var(--brd);color:var(--t2);padding:6px 12px;border-radius:8px;font-size:.75rem;font-family:inherit;cursor:pointer;transition:all .15s}
.btn-rf:hover{color:var(--t1);background:#191d24}
.btn-cn{background:var(--card);border:1px solid var(--brd);color:var(--t1);padding:6px 14px;border-radius:8px;font-size:.75rem;font-weight:500;font-family:inherit;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .15s}
.btn-cn.act{background:rgba(212,175,55,0.12);border-color:rgba(212,175,55,0.4);color:var(--acc);font-weight:600}
.cn-dot{width:6px;height:6px;border-radius:50%;background:var(--acc);box-shadow:0 0 6px var(--acc)}

/* Section Divider */
.sec{padding-bottom:28px;margin-bottom:28px;border-bottom:1px solid var(--brd);display:flex;flex-direction:column;align-items:center}
.sec-meta{display:flex;align-items:center;justify-content:space-between;width:100%;font-size:.75rem;color:var(--t2);margin-bottom:20px}
.status-dot{width:8px;height:8px;border-radius:50%;background:#3f3f46;transition:all .3s}
.status-dot.on{background:var(--acc);box-shadow:0 0 8px var(--acc)}

/* Clean Round LED Light Bulb Hero Section */
.switch-wrap{display:flex;flex-direction:column;align-items:center;position:relative;margin:4px 0}
.switch-halo{position:absolute;top:5px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(212,175,55,0.38)0%,rgba(212,175,55,0.1)50%,transparent 80%);pointer-events:none;opacity:0;transition:opacity .5s ease}
.switch-halo.on{opacity:1}
.bulb-btn{background:none;border:none;cursor:pointer;outline:none;position:relative;z-index:2;padding:2px;border-radius:24px;transition:transform .2s}
.bulb-btn:active{transform:scale(0.96)}
.switch-cap{margin-top:4px;text-align:center}
.switch-st{font-size:1.8rem;font-weight:800;letter-spacing:-.03em;display:flex;align-items:center;justify-content:center;gap:8px;color:var(--t2)}
.switch-st.on{color:var(--acc)}
.pill-tag{font-size:.7rem;padding:2px 8px;border-radius:6px;font-family:monospace;font-weight:700;background:#27272a;color:var(--t2);border:1px solid #3f3f46}
.pill-tag.on{background:rgba(212,175,55,0.18);color:var(--acc);border-color:rgba(212,175,55,0.4)}

/* Architectural Wall Light Switch */
.sw-box{margin-top:12px;width:240px}
.sw-plate{width:100%;height:58px;border-radius:18px;background:#0d0f14;border:1px solid var(--brd);box-shadow:inset 0 2px 4px rgba(0,0,0,0.6);padding:4px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;position:relative;outline:none;transition:all .3s}
.sw-plate.on{background:#151922;border-color:rgba(212,175,55,0.5);box-shadow:0 0 24px rgba(212,175,55,0.25)}
.sw-track{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:space-between;padding:0 16px}
.sw-lbl{font-family:monospace;font-size:.72rem;font-weight:700;color:#505a6a;transition:color .3s}
.sw-paddle{position:absolute;top:2px;bottom:2px;width:105px;border-radius:12px;background:#1c222d;border:1px solid #2b3444;display:flex;align-items:center;justify-content:center;gap:6px;left:2px;transition:all .3s cubic-bezier(0.16,1,0.3,1);box-shadow:0 2px 6px rgba(0,0,0,0.4);color:var(--t1)}
.sw-paddle.on{left:calc(100% - 107px);background:linear-gradient(135deg,#fef08a,#d4af37,#b45309);border-color:var(--acc);color:#07080a;box-shadow:0 0 16px rgba(212,175,55,0.5)}
.sw-led{width:4px;height:14px;border-radius:99px;background:#505a6a;transition:all .3s}
.sw-led.on{background:#07080a}
.sw-txt{font-family:monospace;font-size:.75rem;font-weight:800;display:flex;align-items:center;gap:4px}

/* Segmented Mode Selector */
.seg-wrap{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:var(--subtle);padding:6px;border-radius:16px;border:1px solid var(--brd);box-shadow:inset 0 1px 3px rgba(0,0,0,0.5);width:100%}
.seg-btn{background:transparent;border:1px solid transparent;border-radius:10px;padding:12px 6px;text-align:center;cursor:pointer;transition:all .18s;font-family:inherit;position:relative;outline:none}
.seg-btn .lbl{font-size:.75rem;font-weight:500;color:var(--t2);display:block}
.seg-btn .dsc{font-size:.65rem;color:var(--t3);margin-top:2px;display:block}
.seg-btn.act{background:#181e28;border-color:rgba(212,175,55,0.4);box-shadow:0 2px 6px rgba(0,0,0,0.4)}
.seg-btn.act .lbl{color:var(--t1);font-weight:600}
.seg-btn.act .dsc{color:var(--acc)}
.seg-btn .notch{display:none;position:absolute;top:-4px;left:50%;transform:translateX(-50%);width:20px;height:2px;background:var(--acc);border-radius:99px;box-shadow:0 0 8px var(--acc)}
.seg-btn.act .notch{display:block}

/* Card Sections Centered */
.dyn-card{animation:fIn .2s ease forwards;width:100%}
@keyframes fIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.c-hd{display:flex;flex-direction:column;align-items:center;margin-bottom:14px;text-align:center}
.c-ttl{font-size:.8rem;font-weight:600;color:var(--t1);display:flex;align-items:center;justify-content:center;gap:8px}
.c-tag{font-size:.65rem;padding:2px 8px;border-radius:99px;background:rgba(212,175,55,0.12);color:var(--acc);border:1px solid rgba(212,175,55,0.3);font-weight:500}
.c-desc{font-size:.72rem;color:var(--t2);margin-top:4px}

/* Gauge Meter */
.meter-box{background:var(--subtle);padding:14px;border-radius:16px;border:1px solid var(--brd);margin:12px 0;width:100%}
.meter-meta{display:flex;align-items:center;justify-content:space-between;font-size:.7rem;color:var(--t2);margin-bottom:8px}
.meter-tr{width:100%;height:10px;background:#141820;border-radius:99px;overflow:hidden;border:1px solid #232a38}
.meter-fl{height:100%;background:linear-gradient(90deg,#996515,var(--acc),#fef08a);box-shadow:0 0 10px rgba(212,175,55,0.4);border-radius:99px;transition:width .3s}

/* Slider Controls */
.sl-row{display:flex;align-items:center;justify-content:space-between;font-size:.75rem;color:var(--t2);margin:14px 0 8px;width:100%}
.sl-val{background:var(--subtle);padding:2px 10px;border-radius:6px;border:1px solid var(--brd);color:var(--t1);font-weight:500}
input[type=range]{-webkit-appearance:none;width:100%;background:transparent;outline:none}
input[type=range]::-webkit-slider-runnable-track{height:5px;background:#141820;border-radius:99px;border:1px solid #232a38}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#fef08a,#d4af37,#b45309);border:2px solid var(--bg);cursor:pointer;margin-top:-7px;box-shadow:0 2px 8px rgba(0,0,0,0.8),0 0 12px rgba(212,175,55,0.5);transition:transform .15s}
input[type=range]:active::-webkit-slider-thumb{transform:scale(1.2)}
.scale{display:flex;justify-content:space-between;font-size:.65rem;color:var(--t3);margin-top:6px;font-family:monospace;width:100%}

/* Time Clock Steppers */
.time-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0;width:100%}
.time-card{background:var(--subtle);padding:14px;border-radius:16px;border:1px solid var(--brd);display:flex;flex-direction:column;align-items:center;justify-content:space-between}
.t-hd{display:flex;align-items:center;justify-content:space-between;width:100%;font-size:.7rem;color:var(--t2);margin-bottom:8px}
.t-in-row{display:flex;align-items:center;justify-content:center;gap:4px;padding:4px 0}
.t-in{width:48px;background:#141820;border:1px solid #272e3b;border-radius:8px;padding:6px 0;text-align:center;font-family:monospace;font-size:1.3rem;font-weight:700;color:var(--t1);outline:none}
.t-in:focus{border-color:var(--acc)}
.t-sep{font-family:monospace;font-size:1.3rem;font-weight:700;color:var(--t3)}
.preset-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;width:100%}
.p-btn{font-size:.7rem;font-family:monospace;padding:6px 10px;border-radius:8px;background:var(--subtle);color:#a0aec0;border:1px solid var(--brd);cursor:pointer;transition:all .15s}
.p-btn:hover{background:#181d26;color:var(--t1)}
.btn-save{padding:8px 14px;border-radius:10px;font-size:.75rem;font-weight:600;background:#141820;color:var(--t1);border:1px solid var(--brd);cursor:pointer;transition:all .15s;font-family:inherit}
.btn-save.saved{background:linear-gradient(135deg,#fef08a,#d4af37,#b45309);color:#07080a;border-color:var(--acc);box-shadow:0 0 16px rgba(212,175,55,0.4)}

/* Modal */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(4px);z-index:50;display:none;align-items:center;justify-content:center;padding:16px}
.modal-box{background:var(--card);border:1px solid var(--brd);border-radius:20px;padding:24px;width:100%;max-width:380px;box-shadow:0 20px 40px rgba(0,0,0,0.9);text-align:center}
.m-hd{display:flex;align-items:center;justify-content:space-between;padding-bottom:14px;border-bottom:1px solid var(--brd);margin-bottom:16px}
.m-tab{display:flex;background:var(--subtle);padding:4px;border-radius:12px;margin-bottom:16px;gap:4px}
.m-tab-btn{flex:1;padding:8px 4px;font-size:.72rem;font-weight:600;border:none;background:transparent;color:var(--t2);border-radius:8px;cursor:pointer;font-family:inherit}
.m-tab-btn.act{background:var(--card);color:var(--acc);box-shadow:0 1px 4px rgba(0,0,0,0.4)}
.btn-main{width:100%;padding:12px;border-radius:12px;background:linear-gradient(135deg,#fef08a,#d4af37,#b45309);color:#07080a;border:none;font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;margin-top:12px}
.input-box{width:100%;background:var(--subtle);border:1px solid var(--brd);border-radius:8px;padding:8px 12px;color:var(--t1);font-size:.75rem;font-family:inherit;outline:none;margin-top:4px}
.input-box:focus{border-color:var(--acc)}
.footer{text-align:center;font-size:.7rem;color:var(--t3);padding:24px 0 10px}
</style>
</head>
<body>
<div class="app">
  <div>
    <header>
      <div>
        <h1 style="font-family:monospace;letter-spacing:-0.03em;font-size:1.1rem;display:flex;align-items:center;justify-content:center;gap:6px">
          <span style="width:7px;height:7px;border-radius:50%;background:var(--acc);box-shadow:0 0 6px var(--acc);display:inline-block"></span>
          allight
        </h1>
        <p class="sub">ระบบควบคุมโคมไฟอัจฉริยะ (BLE · Wi-Fi · Cloud)</p>
      </div>
      <div class="hdr-btns">
        <button class="btn-rf" onclick="fetchStatus()">รีเฟรช</button>
        <button class="btn-cn" id="cnBtn" onclick="openModal()">
          <span class="cn-dot" id="cnDot" style="display:none"></span>
          <span id="cnLabel">เชื่อมต่อโคมไฟ</span>
        </button>
      </div>
    </header>

    <main>
      <!-- Round LED Light Bulb Hero Section -->
      <section class="sec">
        <div class="sec-meta">
          <span style="display:flex;align-items:center;gap:6px">
            <span class="status-dot" id="metaDot"></span>
            <span id="metaMode">โหมดควบคุมเอง</span>
          </span>
          <span id="metaTime" style="font-family:monospace">เวลา --:-- น.</span>
        </div>

        <div class="switch-wrap">
          <div class="switch-halo" id="halo"></div>
          
          <button class="bulb-btn" onclick="toggleLight()">
            <svg viewBox="40 0 120 135" style="width:160px;height:180px;overflow:visible">
              <defs>
                <linearGradient id="gold-threads" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#1e180d"/>
                  <stop offset="25%" stop-color="#856427"/>
                  <stop offset="50%" stop-color="#3d2f13"/>
                  <stop offset="75%" stop-color="#a37c32"/>
                  <stop offset="100%" stop-color="#161208"/>
                </linearGradient>
                <linearGradient id="obsidian-heatsink" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#12151b"/>
                  <stop offset="50%" stop-color="#252b37"/>
                  <stop offset="100%" stop-color="#0c0e12"/>
                </linearGradient>
                <linearGradient id="gold-collar" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#78591c"/>
                  <stop offset="50%" stop-color="#e5be58"/>
                  <stop offset="100%" stop-color="#5c4314"/>
                </linearGradient>
                <radialGradient id="gold-dome-on" cx="45%" cy="38%" r="60%">
                  <stop offset="0%" stop-color="#fffdf0" stop-opacity="1"/>
                  <stop offset="25%" stop-color="#fef08a" stop-opacity="1"/>
                  <stop offset="55%" stop-color="#d4af37" stop-opacity="0.95"/>
                  <stop offset="85%" stop-color="#b45309" stop-opacity="0.9"/>
                  <stop offset="100%" stop-color="#78350f" stop-opacity="0.85"/>
                </radialGradient>
                <radialGradient id="gold-dome-off" cx="40%" cy="35%" r="60%">
                  <stop offset="0%" stop-color="#4a4233" stop-opacity="0.35"/>
                  <stop offset="50%" stop-color="#292723" stop-opacity="0.6"/>
                  <stop offset="90%" stop-color="#1a1c22" stop-opacity="0.85"/>
                  <stop offset="100%" stop-color="#0f1116" stop-opacity="0.95"/>
                </radialGradient>
                <filter id="gold-bulb-bloom" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="5" result="blur1"/>
                  <feGaussianBlur stdDeviation="2" result="blur2"/>
                  <feMerge><feMergeNode in="blur1"/><feMergeNode in="blur2"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              <line x1="100" y1="0" x2="100" y2="25" stroke="#1d222b" stroke-width="5" stroke-linecap="round"/>
              <rect x="82" y="25" width="36" height="6" rx="1.5" fill="url(#gold-threads)" stroke="#0e0b06" stroke-width="1"/>
              <path d="M82 31 Q100 33 118 31 L118 37 Q100 39 82 37 Z" fill="url(#gold-threads)" stroke="#0e0b06" stroke-width="0.8"/>
              <path d="M82 37 Q100 39 118 37 L118 43 Q100 45 82 43 Z" fill="url(#gold-threads)" stroke="#0e0b06" stroke-width="0.8"/>
              <path d="M82 43 Q100 45 118 43 L118 49 Q100 51 82 49 Z" fill="url(#gold-threads)" stroke="#0e0b06" stroke-width="0.8"/>
              <rect x="80" y="49" width="40" height="5" rx="1.5" fill="#181510" stroke="#0e0b06" stroke-width="0.8"/>

              <path d="M 80 54 L 68 120 Q 100 126 132 120 L 120 54 Z" fill="url(#obsidian-heatsink)" stroke="#262d3a" stroke-width="1.5"/>
              <line x1="88" y1="62" x2="82" y2="114" stroke="#0e1014" stroke-width="1.5" opacity="0.8"/>
              <line x1="100" y1="62" x2="100" y2="118" stroke="#0e1014" stroke-width="1.5" opacity="0.8"/>
              <line x1="112" y1="62" x2="118" y2="114" stroke="#0e1014" stroke-width="1.5" opacity="0.8"/>
              <ellipse cx="100" cy="120" rx="34" ry="7" fill="url(#gold-collar)" stroke="#5c4314" stroke-width="1.2"/>

              <path id="ledDome" d="M 66 120 C 50 102, 50 68, 72 46 C 88 30, 112 30, 128 46 C 150 68, 150 102, 134 120 Z"
                fill="url(#gold-dome-off)" stroke="#3b362a" stroke-width="1.8" style="transition:all .5s"/>

              <ellipse id="ledCore" cx="100" cy="80" rx="34" ry="28" fill="#fffdf0" opacity="0.95" style="display:none" filter="url(#gold-bulb-bloom)"/>
              <path id="ledSpec" d="M 76 66 A 32 32 0 0 1 114 44" fill="none" stroke="rgba(255, 255, 255, 0.2)" stroke-width="3.2" stroke-linecap="round" style="transition:all .3s"/>
              <circle id="ledDot" cx="74" cy="72" r="2.5" fill="rgba(255, 255, 255, 0.25)"/>
            </svg>
          </button>

          <div class="switch-cap">
            <div class="switch-st" id="statusText">
              <span id="stName">ไฟปิดอยู่</span>
              <span class="pill-tag" id="stPill">OFF</span>
            </div>
            
            <div class="sw-box">
              <div class="sw-plate" id="swPlate" onclick="toggleLight()">
                <div class="sw-track">
                  <span class="sw-lbl off-lbl">OFF</span>
                  <div class="sw-paddle" id="swPaddle">
                    <span class="sw-led" id="swLed"></span>
                    <span class="sw-txt" id="swTxt">
                      <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.5">
                        <path d="M12 2v10M18.4 6.6a9 9 0 1 1-12.8 0" stroke-linecap="round"/>
                      </svg>
                      <span id="swActionLbl">ปิด</span>
                    </span>
                  </div>
                  <span class="sw-lbl on-lbl">ON</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Segmented Mode Selector -->
      <section class="sec">
        <div style="font-size:.75rem;color:var(--t2);margin-bottom:12px;font-weight:500">โหมดการทำงาน</div>
        <div class="seg-wrap">
          <button class="seg-btn act" id="mBtn0" onclick="setMode(0)">
            <div class="notch"></div>
            <span class="lbl">เปิด-ปิดเอง</span>
            <span class="dsc">ควบคุมผ่านแอป</span>
          </button>
          <button class="seg-btn" id="mBtn1" onclick="setMode(1)">
            <div class="notch"></div>
            <span class="lbl">ตั้งเวลา</span>
            <span class="dsc">เปิด-ปิดตามเวลา</span>
          </button>
          <button class="seg-btn" id="mBtn2" onclick="setMode(2)">
            <div class="notch"></div>
            <span class="lbl">ตรวจจับแสง</span>
            <span class="dsc">อัตโนมัติตามแสง</span>
          </button>
        </div>
      </section>

      <!-- Conditional LDR Card -->
      <section class="sec dyn-card" id="ldrSec" style="display:none">
        <div class="c-hd">
          <div class="c-ttl">ระบบตรวจจับความสว่างรอบห้อง <span class="c-tag">กำลังทำงาน</span></div>
          <div class="c-desc">โคมไฟจะเปิดอัตโนมัติเมื่อห้องมืด และดับเมื่อห้องสว่าง</div>
          <div style="font-size:2rem;font-weight:800;color:var(--t1);font-family:monospace;margin-top:10px" id="ldrPercent">--%</div>
          <div style="font-size:.75rem;color:var(--t2);margin-top:2px" id="ldrCond">สภาพมืด</div>
        </div>

        <div class="meter-box">
          <div class="meter-meta">
            <span>ระดับความสว่างขณะนี้</span>
            <span id="ldrRaw" style="font-family:monospace">-- / 4095</span>
          </div>
          <div class="meter-tr">
            <div class="meter-fl" id="ldrBar" style="width:0%"></div>
          </div>
        </div>

        <div class="sl-row">
          <span>ระดับความมืดที่ให้เปิดไฟ:</span>
          <span class="sl-val" id="thDesc">มืดปานกลาง</span>
        </div>
        <input type="range" min="100" max="3900" step="25" id="thSlider" oninput="onThSlide(this.value)" onchange="saveThreshold(this.value)">
        <div class="scale"><span>มืดสนิท (0%)</span><span>มืดปานกลาง (50%)</span><span>สว่าง (100%)</span></div>
      </section>

      <!-- Conditional Schedule Card -->
      <section class="sec dyn-card" id="schSec" style="display:none">
        <div class="c-hd">
          <div class="c-ttl">ตั้งเวลาเปิด-ปิดอัตโนมัติ <span class="c-tag">กำลังทำงาน</span></div>
          <div class="c-desc">โคมไฟจะเปิดและดับตามเวลาที่คุณระบุ</div>
        </div>

        <div class="time-grid">
          <div class="time-card">
            <div class="t-hd"><span>เวลาเปิดไฟ</span><span style="font-family:monospace">START</span></div>
            <div class="t-in-row">
              <input type="number" min="0" max="23" class="t-in" id="onH" value="18">
              <span class="t-sep">:</span>
              <input type="number" min="0" max="59" class="t-in" id="onM" value="00">
            </div>
          </div>
          <div class="time-card">
            <div class="t-hd"><span>เวลาปิดไฟ</span><span style="font-family:monospace">END</span></div>
            <div class="t-in-row">
              <input type="number" min="0" max="23" class="t-in" id="offH" value="06">
              <span class="t-sep">:</span>
              <input type="number" min="0" max="59" class="t-in" id="offM" value="00">
            </div>
          </div>
        </div>

        <div class="preset-row">
          <div style="display:flex;gap:6px">
            <button class="p-btn" onclick="setPreset(18,0,6,0)">18:00–06:00</button>
            <button class="p-btn" onclick="setPreset(21,0,5,30)">21:00–05:30</button>
          </div>
          <button class="btn-save" id="saveSchBtn" onclick="saveSchedule()">บันทึกเวลา</button>
        </div>
      </section>
    </main>
  </div>

  <footer class="footer">
    ระบบไฟอัจฉริยะ • สวิตช์ปุ่มกดที่บอร์ดทำงานได้ตลอดเวลาแม้ออฟไลน์
  </footer>
</div>

<!-- Connect Modal -->
<div class="modal-bg" id="modalBg" onclick="if(event.target===this)closeModal()">
  <div class="modal-box">
    <div class="m-hd">
      <h3 style="font-size:.9rem;font-weight:700">เชื่อมต่อโคมไฟ</h3>
      <button onclick="closeModal()" style="background:none;border:none;color:var(--t2);cursor:pointer;font-size:.8rem">ปิด</button>
    </div>
    <div class="m-tab">
      <button class="m-tab-btn act" id="tabMqtt" onclick="switchTab('mqtt')">คลาวด์ (4G/5G)</button>
      <button class="m-tab-btn" id="tabBle" onclick="switchTab('ble')">บลูทูธ (BLE)</button>
      <button class="m-tab-btn" id="tabWifi" onclick="switchTab('wifi')">ไวไฟ (Wi-Fi)</button>
    </div>

    <div id="mqttContent">
      <p style="font-size:.75rem;color:var(--t2);line-height:1.5">ควบคุมโคมไฟได้จากทุกที่ทั่วโลกผ่านเครือข่ายเน็ตมือถือ 4G/5G ด้วยความเร็วสูง</p>
      <div style="margin-top:10px;padding:8px 12px;background:var(--subtle);border:1px solid var(--brd);border-radius:8px;font-size:.7rem;color:var(--t2);display:flex;justify-content:space-between">
        <span>Cloud Broker:</span>
        <span style="color:var(--acc);font-family:monospace">broker.emqx.io</span>
      </div>
      <button class="btn-main" onclick="connectMqtt()">เชื่อมต่อ Cloud ทันที</button>
    </div>

    <div id="bleContent" style="display:none">
      <p style="font-size:.75rem;color:var(--t2);line-height:1.5">เชื่อมต่อตรงกับโคมไฟผ่าน Bluetooth โดยไม่ต้องใช้อินเทอร์เน็ต</p>
      <button class="btn-main" onclick="connectBle()">ค้นหาและเชื่อมต่อบลูทูธ</button>
    </div>

    <div id="wifiContent" style="display:none">
      <p style="font-size:.75rem;color:var(--t2);line-height:1.5">เชื่อมต่อผ่านเครือข่ายไวไฟบ้าน (วง LAN)</p>
      <button class="btn-main" onclick="fetchStatus();closeModal()">ซิงค์ข้อมูลไวไฟ</button>
    </div>
  </div>
</div>

<script>
// ─── STATE MANAGEMENT ─────────────────────────────────────────────────────
let state = { light: false, mode: 0, ldrValue: 1500, ldrThreshold: 1500, onHour: 18, onMin: 0, offHour: 6, offMin: 0, time: '--:--' };
let bleDevice = null, rxChar = null, txChar = null;
let mqttClient = null;
const BLE_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const BLE_RX_UUID      = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const BLE_TX_UUID      = 'beb5483e-36e1-4688-b7f5-ea07361b26a9';

const MQTT_WS_URL     = 'wss://broker.emqx.io:8084/mqtt';
const MQTT_TOPIC_CMD  = 'smartlight/witta02/cmd';
const MQTT_TOPIC_STATE= 'smartlight/witta02/state';

// ─── DOM ELEMENTS ─────────────────────────────────────────────────────────
const metaDot = document.getElementById('metaDot');
const metaMode = document.getElementById('metaMode');
const metaTime = document.getElementById('metaTime');
const halo = document.getElementById('halo');
const statusText = document.getElementById('statusText');
const stName = document.getElementById('stName');
const stPill = document.getElementById('stPill');
const ldrSec = document.getElementById('ldrSec');
const schSec = document.getElementById('schSec');
const ldrPercent = document.getElementById('ldrPercent');
const ldrCond = document.getElementById('ldrCond');
const ldrRaw = document.getElementById('ldrRaw');
const ldrBar = document.getElementById('ldrBar');
const thSlider = document.getElementById('thSlider');
const thDesc = document.getElementById('thDesc');
const onHIn = document.getElementById('onH');
const onMIn = document.getElementById('onM');
const offHIn = document.getElementById('offH');
const offMIn = document.getElementById('offM');
const saveSchBtn = document.getElementById('saveSchBtn');
const cnBtn = document.getElementById('cnBtn');
const cnDot = document.getElementById('cnDot');
const cnLabel = document.getElementById('cnLabel');

const modeNames = ['โหมดควบคุมเอง', 'โหมดตั้งเวลา', 'โหมดตรวจจับแสง'];
const pad = n => String(n).padStart(2, '0');

function renderUI() {
  const on = state.light;
  halo.className = 'switch-halo' + (on ? ' on' : '');
  
  const ledDome = document.getElementById('ledDome');
  const ledCore = document.getElementById('ledCore');
  const ledSpec = document.getElementById('ledSpec');
  const ledDot = document.getElementById('ledDot');
  const swPlate = document.getElementById('swPlate');
  const swPaddle = document.getElementById('swPaddle');
  const swLed = document.getElementById('swLed');
  const swActionLbl = document.getElementById('swActionLbl');

  if (ledDome) {
    ledDome.setAttribute('fill', on ? 'url(#gold-dome-on)' : 'url(#gold-dome-off)');
    ledDome.setAttribute('stroke', on ? '#d4af37' : '#3b362a');
    ledDome.setAttribute('stroke-width', on ? '2.5' : '1.8');
    ledDome.setAttribute('filter', on ? 'url(#gold-bulb-bloom)' : 'none');
  }
  if (ledCore) {
    ledCore.style.display = on ? 'block' : 'none';
  }
  if (ledSpec) {
    ledSpec.setAttribute('stroke', on ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.2)');
  }
  if (ledDot) {
    ledDot.setAttribute('fill', on ? '#ffffff' : 'rgba(255, 255, 255, 0.25)');
  }

  if (swPlate) swPlate.className = 'sw-plate' + (on ? ' on' : '');
  if (swPaddle) swPaddle.className = 'sw-paddle' + (on ? ' on' : '');
  if (swLed) swLed.className = 'sw-led' + (on ? ' on' : '');
  if (swActionLbl) swActionLbl.innerText = on ? 'เปิด' : 'ปิด';

  statusText.className = 'switch-st' + (on ? ' on' : '');
  stName.innerText = on ? 'ไฟเปิดอยู่' : 'ไฟปิดอยู่';
  stPill.className = 'pill-tag' + (on ? ' on' : '');
  stPill.innerText = on ? 'ON' : 'OFF';

  metaDot.className = 'status-dot' + (on ? ' on' : '');
  metaMode.innerText = modeNames[state.mode] || 'โหมดควบคุมเอง';
  metaMode.style.color = on ? 'var(--acc)' : 'var(--t2)';
  if (state.time && state.time !== '--:--:--') {
    metaTime.innerText = 'เวลา ' + state.time + ' น.';
  }

  for (let i = 0; i < 3; i++) {
    const btn = document.getElementById('mBtn' + i);
    if (btn) btn.className = 'seg-btn' + (state.mode === i ? ' act' : '');
  }

  ldrSec.style.display = (state.mode === 2) ? 'block' : 'none';
  schSec.style.display = (state.mode === 1) ? 'block' : 'none';

  if (state.mode === 2) {
    const pct = Math.min(100, Math.max(0, Math.round((state.ldrValue / 4095) * 100)));
    const isDark = state.ldrValue < state.ldrThreshold;
    ldrPercent.innerText = pct + '%';
    ldrCond.innerText = isDark ? 'สภาพมืด (เปิดไฟ)' : 'สภาพสว่าง (ปิดไฟ)';
    ldrRaw.innerText = state.ldrValue + ' / 4095';
    ldrBar.style.width = pct + '%';
    thSlider.value = state.ldrThreshold;
    thDesc.innerText = state.ldrThreshold < 1000 ? 'ต้องมืดสนิท' : state.ldrThreshold < 2500 ? 'มืดปานกลาง' : 'มืดเล็กน้อยก็เปิด';
  }

  if (state.mode === 1) {
    onHIn.value = pad(state.onHour);
    onMIn.value = pad(state.onMin);
    offHIn.value = pad(state.offHour);
    offMIn.value = pad(state.offMin);
  }
}

// ─── COMMAND DISPATCHER ───────────────────────────────────────────────────
async function sendCommand(obj) {
  if (mqttClient && mqttClient.connected) {
    mqttClient.publish(MQTT_TOPIC_CMD, JSON.stringify(obj));
    return;
  }
  if (rxChar) {
    const enc = new TextEncoder();
    await rxChar.writeValue(enc.encode(JSON.stringify(obj)));
    return;
  }
  try {
    let url = '/api/toggle';
    let body = {};
    if (obj.action === 'toggle') { url = '/api/toggle'; }
    else if (obj.mode !== undefined) { url = '/api/mode'; body = { mode: obj.mode }; }
    else if (obj.threshold !== undefined) { url = '/api/threshold'; body = { threshold: obj.threshold }; }
    else if (obj.onHour !== undefined) {
      url = '/api/schedule';
      body = { onHour: obj.onHour, onMin: obj.onMin, offHour: obj.offHour, offMin: obj.offMin };
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    Object.assign(state, json);
    renderUI();
  } catch (e) {}
}

async function fetchStatus() {
  try {
    const res = await fetch('/api/status');
    const json = await res.json();
    Object.assign(state, json);
    setConnectedBadge('wifi', 'ไวไฟ: ออนไลน์');
    renderUI();
  } catch (e) {}
}

function toggleLight() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(!state.light ? 15 : 10); } catch (e) {}
  }
  state.light = !state.light;
  state.mode = 0;
  renderUI();
  sendCommand({ action: 'toggle' });
}

function setMode(m) {
  state.mode = m;
  renderUI();
  sendCommand({ mode: m });
}

function onThSlide(v) {
  state.ldrThreshold = parseInt(v);
  thDesc.innerText = v < 1000 ? 'ต้องมืดสนิท' : v < 2500 ? 'มืดปานกลาง' : 'มืดเล็กน้อยก็เปิด';
}

function saveThreshold(v) {
  sendCommand({ threshold: parseInt(v) });
}

function setPreset(onH, onM, offH, offM) {
  onHIn.value = pad(onH);
  onMIn.value = pad(onM);
  offHIn.value = pad(offH);
  offMIn.value = pad(offM);
  saveSchedule();
}

function saveSchedule() {
  const oH = parseInt(onHIn.value) || 0;
  const oM = parseInt(onMIn.value) || 0;
  const fH = parseInt(offHIn.value) || 0;
  const fM = parseInt(offMIn.value) || 0;
  sendCommand({ onHour: oH, onMin: oM, offHour: fH, offMin: fM });
  saveSchBtn.className = 'btn-save saved';
  saveSchBtn.innerText = 'บันทึกแล้ว';
  setTimeout(() => {
    saveSchBtn.className = 'btn-save';
    saveSchBtn.innerText = 'บันทึกเวลา';
  }, 2000);
}

// ─── GLOBAL CLOUD MQTT ───────────────────────────────────────────────────
function connectMqtt() {
  if (typeof mqtt === 'undefined') {
    alert('กำลังโหลดไลบรารีคลาวด์ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
    return;
  }
  mqttClient = mqtt.connect(MQTT_WS_URL, {
    protocol: 'wss',
    clientId: 'web-' + Math.random().toString(16).substr(2, 6)
  });
  mqttClient.on('connect', () => {
    setConnectedBadge('mqtt', 'คลาวด์: เชื่อมต่อแล้ว');
    mqttClient.subscribe(MQTT_TOPIC_STATE);
    mqttClient.publish(MQTT_TOPIC_CMD, JSON.stringify({ action: 'getStatus' }));
    closeModal();
  });
  mqttClient.on('message', (topic, msg) => {
    if (topic === MQTT_TOPIC_STATE) {
      try {
        const data = JSON.parse(msg.toString());
        Object.assign(state, data);
        renderUI();
      } catch (err) {}
    }
  });
  mqttClient.on('error', (err) => {
    alert('เชื่อมต่อคลาวด์ไม่สำเร็จ: ' + err.message);
  });
}

// ─── WEB BLUETOOTH API ────────────────────────────────────────────────────
async function connectBle() {
  try {
    bleDevice = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'ESP32' }, { namePrefix: 'SmartLight' }],
      optionalServices: [BLE_SERVICE_UUID]
    });
    const bleServer = await bleDevice.gatt.connect();
    const svc = await bleServer.getPrimaryService(BLE_SERVICE_UUID);
    rxChar = await svc.getCharacteristic(BLE_RX_UUID);
    txChar = await svc.getCharacteristic(BLE_TX_UUID);
    await txChar.startNotifications();
    txChar.addEventListener('characteristicvaluechanged', (e) => {
      const dec = new TextDecoder();
      const str = dec.decode(e.target.value);
      try {
        const data = JSON.parse(str);
        Object.assign(state, data);
        renderUI();
      } catch (err) {}
    });
    bleDevice.addEventListener('gattserverdisconnected', () => {
      rxChar = null;
      txChar = null;
      setConnectedBadge('none', 'เชื่อมต่อโคมไฟ');
    });
    setConnectedBadge('ble', 'บลูทูธ: ' + bleDevice.name);
    closeModal();
    const enc = new TextEncoder();
    await rxChar.writeValue(enc.encode(JSON.stringify({ action: 'getStatus' })));
  } catch (err) {
    alert('ไม่สามารถเชื่อมต่อบลูทูธได้: ' + err.message);
  }
}

function setConnectedBadge(mode, text) {
  if (mode === 'none') {
    cnBtn.className = 'btn-cn';
    cnDot.style.display = 'none';
    cnLabel.innerText = text;
  } else {
    cnBtn.className = 'btn-cn act';
    cnDot.style.display = 'inline-block';
    cnLabel.innerText = text;
  }
}

// ─── MODAL HELPERS ────────────────────────────────────────────────────────
function openModal() { document.getElementById('modalBg').style.display = 'flex'; }
function closeModal() { document.getElementById('modalBg').style.display = 'none'; }
function switchTab(t) {
  document.getElementById('tabMqtt').className = 'm-tab-btn' + (t === 'mqtt' ? ' act' : '');
  document.getElementById('tabBle').className = 'm-tab-btn' + (t === 'ble' ? ' act' : '');
  document.getElementById('tabWifi').className = 'm-tab-btn' + (t === 'wifi' ? ' act' : '');
  document.getElementById('mqttContent').style.display = t === 'mqtt' ? 'block' : 'none';
  document.getElementById('bleContent').style.display = t === 'ble' ? 'block' : 'none';
  document.getElementById('wifiContent').style.display = t === 'wifi' ? 'block' : 'none';
}

window.addEventListener('DOMContentLoaded', () => {
  renderUI();
  fetchStatus();
  setInterval(fetchStatus, 2000);
});
</script>
</body>
</html>
)rawliteral";

#endif
