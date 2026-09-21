/* tuong-tac.js — 7 hoạt động tương tác cho Bài 5, bám theo slide mới:
   0. Em nhận ra các cổng này không? (Hình 5.4 — A-F)
   1. Nối tình huống với loại thiết bị (Vào/Ra/Vào-ra)
   2. Chọn chuột cho đúng nhu cầu (Ứng dụng 1)
   3. Mỗi nơi một loại máy in (Ứng dụng 2)
   4. "Máy in không in được!" — chẩn đoán (Ứng dụng 3)
   5. Ghép đôi Bluetooth — quy trình 2 bước (đúng slide 24-25)
   6. Chọn cách kết nối — ứng dụng tổng hợp (slide 26) */

/* ================= 0. Em nhận ra các cổng này không? (A-F) ================= */

const PORT_NAMES = [
  { key: 'A', name: 'VGA' },
  { key: 'B', name: 'HDMI' },
  { key: 'C', name: 'USB-A' },
  { key: 'D', name: 'USB-B' },
  { key: 'E', name: 'Cổng độc quyền (vd Lightning)' },
  { key: 'F', name: 'Cổng mạng (RJ45)' }
];

function renderPortNameGame() {
  const wrap = document.getElementById('portname-game');
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="q-options constrain-md" id="portname-list">
      ${PORT_NAMES.map(p => `
        <button class="q-option" data-key="${p.key}" data-name="${p.name}">
          <b>${p.key}</b> — bấm để xem đáp án
        </button>
      `).join('')}
    </div>
  `;

  wrap.querySelectorAll('.q-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('correct')) return;
      btn.classList.add('correct');
      btn.innerHTML = `<b>${btn.dataset.key}</b> — ${btn.dataset.name}`;
    });
  });
}

/* ================= 1. Nối tình huống với loại thiết bị (Vào / Ra / Vào-ra) ================= */

const DEVICE_TYPE_ROUNDS = [
  { situation: 'Gõ chữ vào máy tính', correct: 'vao' },
  { situation: 'Hình ảnh từ máy tính hiện lên màn hình', correct: 'ra' },
  { situation: 'USB vừa nhận dữ liệu vừa gửi dữ liệu', correct: 'vaora' }
];
const TYPE_LABELS = { vao: 'THIẾT BỊ VÀO', ra: 'THIẾT BỊ RA', vaora: 'VÀO – RA' };

let dtIdx = 0, dtScore = 0;

function renderDeviceTypeGame() {
  const wrap = document.getElementById('devicetype-game');
  if (!wrap) return;
  const round = DEVICE_TYPE_ROUNDS[dtIdx];

  if (!round) {
    wrap.innerHTML = `<div class="quiz-score">🎉 Xong! Điểm: ${dtScore} / ${DEVICE_TYPE_ROUNDS.length}</div>
      <div class="text-center"><button class="btn-outline" onclick="restartDeviceTypeGame()">🔄 Chơi lại</button></div>`;
    return;
  }

  const opts = Object.entries(TYPE_LABELS).sort(() => Math.random() - 0.5);
  wrap.innerHTML = `
    <div class="callout question">${round.situation}</div>
    <div class="q-options constrain-md" id="dt-options">
      ${opts.map(([key, label]) => `<button class="q-option" data-key="${key}">${label}</button>`).join('')}
    </div>
    <div class="q-feedback" id="dt-feedback"></div>
    <div class="text-center mt-sm" style="font-size:12.5px; color:var(--sub);">Câu ${dtIdx + 1} / ${DEVICE_TYPE_ROUNDS.length} · Điểm: ${dtScore}</div>
  `;

  wrap.querySelectorAll('.q-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const allBtns = wrap.querySelectorAll('.q-option');
      allBtns.forEach(b => b.disabled = true);
      const feedback = document.getElementById('dt-feedback');

      if (key === round.correct) {
        btn.classList.add('correct');
        feedback.className = 'q-feedback show ok';
        feedback.textContent = `✅ Đúng! Đây là ${TYPE_LABELS[round.correct]}.`;
        dtScore++;
      } else {
        btn.classList.add('wrong');
        Array.from(allBtns).find(b => b.dataset.key === round.correct).classList.add('correct');
        feedback.className = 'q-feedback show bad';
        feedback.textContent = `❌ Chưa đúng. Đây là ${TYPE_LABELS[round.correct]}.`;
      }

      setTimeout(() => { dtIdx++; renderDeviceTypeGame(); }, 1400);
    });
  });
}

function restartDeviceTypeGame() { dtIdx = 0; dtScore = 0; renderDeviceTypeGame(); }

/* ================= 2. Ứng dụng 1: Chọn chuột cho đúng nhu cầu ================= */

const MOUSE_TYPES = [
  { id: 'office', name: 'Chuột văn phòng', emoji: '🖱️', fit: 'Học tập, soạn thảo văn bản', dpi: '800–1600 DPI', price: '~150.000đ', weight: '~90 g', adjustable: 'Không' },
  { id: 'gaming', name: 'Chuột gaming', emoji: '🎯', fit: 'Chơi game, thao tác nhanh', dpi: '1600–16.000 DPI', price: '~500.000đ trở lên', weight: '~80–110 g', adjustable: 'Có (đổi DPI theo nút bấm)' },
  { id: 'wireless', name: 'Chuột không dây gọn nhẹ', emoji: '📡', fit: 'Di chuyển nhiều, dùng với laptop', dpi: '1000–1600 DPI', price: '~200.000đ', weight: '~60 g', adjustable: 'Không' }
];

// Đúng theo Ứng dụng 1 trong slide: Bạn A (học tập), Bạn B (chơi game), Bạn C (di chuyển nhiều)
const MOUSE_ROUNDS = [
  { person: 'Bạn A', icon: '📚', need: 'Học tập, làm Word, PowerPoint', correct: 'office',
    explain: 'Công việc văn phòng không cần độ nhạy cao — chuột thường, giá rẻ, ổn định là đủ.' },
  { person: 'Bạn B', icon: '🎮', need: 'Thường xuyên chơi game', correct: 'gaming',
    explain: 'Chơi game cần thao tác nhanh, chính xác — DPI cao và độ trễ thấp giúp phản xạ tốt hơn.' },
  { person: 'Bạn C', icon: '💻', need: 'Dùng laptop khi di chuyển nhiều', correct: 'wireless',
    explain: 'Di chuyển nhiều nên ưu tiên gọn nhẹ, không vướng dây — chuột không dây nhỏ là lựa chọn hợp lý.' }
];

let mouseRoundIdx = 0, mouseScore = 0;

function statRow(label, value) {
  return `<div class="mc-stat"><div class="mc-stat-label"><span>${label}</span><span>${value}</span></div></div>`;
}

function renderMouseGame() {
  const round = MOUSE_ROUNDS[mouseRoundIdx];
  const wrap = document.getElementById('mouse-game');
  if (!wrap) return;

  if (!round) {
    wrap.innerHTML = `<div class="quiz-score">🎉 Xong! Điểm: ${mouseScore} / ${MOUSE_ROUNDS.length}</div>
      <div class="text-center"><button class="btn-outline" onclick="restartMouseGame()">🔄 Chơi lại</button></div>`;
    return;
  }

  wrap.innerHTML = `
    <div class="mouse-scenario-banner">
      <div class="msb-icon">${round.icon}</div>
      <div class="msb-text"><b>${round.person}</b><span>${round.need}</span></div>
    </div>
    <div class="mouse-grid">
      ${MOUSE_TYPES.map(m => `
        <div class="mouse-card" data-id="${m.id}">
          <div class="mc-svg">${mouseSvg(m.id)}</div>
          <div class="mc-name">${m.emoji} ${m.name}</div>
          <div class="mc-fit">${m.fit}</div>
          ${statRow('DPI', m.dpi)}
          ${statRow('Giá tham khảo', m.price)}
          ${statRow('Khối lượng', m.weight)}
          ${statRow('Chỉnh DPI', m.adjustable)}
        </div>
      `).join('')}
    </div>
    <div class="q-feedback mouse-feedback-box" id="mouse-feedback"></div>
    <div class="text-center mt-sm" style="font-size:12.5px; color:var(--sub);">Câu ${mouseRoundIdx + 1} / ${MOUSE_ROUNDS.length} · Điểm: ${mouseScore}</div>
  `;

  wrap.querySelectorAll('.mouse-card').forEach(card => {
    card.addEventListener('click', () => {
      const chosenId = card.dataset.id;
      const allCards = wrap.querySelectorAll('.mouse-card');
      allCards.forEach(c => c.classList.add('locked'));
      const feedback = document.getElementById('mouse-feedback');

      if (chosenId === round.correct) {
        card.classList.add('correct');
        feedback.className = 'q-feedback show ok';
        feedback.textContent = '✅ ' + round.explain;
        mouseScore++;
      } else {
        card.classList.add('wrong');
        wrap.querySelector(`.mouse-card[data-id="${round.correct}"]`).classList.add('correct');
        feedback.className = 'q-feedback show bad';
        feedback.textContent = '❌ ' + round.explain;
      }

      setTimeout(() => { mouseRoundIdx++; renderMouseGame(); }, 2000);
    });
  });
}

function mouseSvg(id) {
  const colors = { office: 'var(--teal)', gaming: 'var(--coral)', wireless: 'var(--amber)' };
  const color = colors[id] || 'var(--teal)';
  return `<svg width="52" height="72" viewBox="0 0 52 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M26 2C12 2 3 14 3 30V46C3 60 13 70 26 70C39 70 49 60 49 46V30C49 14 40 2 26 2Z" fill="${color}" opacity="0.9"/>
    <line x1="26" y1="2" x2="26" y2="26" stroke="white" stroke-width="2"/>
    <line x1="3" y1="26" x2="49" y2="26" stroke="white" stroke-width="2"/>
    <rect x="22" y="8" width="8" height="14" rx="4" fill="white" opacity="0.85"/>
  </svg>`;
}

function restartMouseGame() { mouseRoundIdx = 0; mouseScore = 0; renderMouseGame(); }

/* ================= 3. Ứng dụng 2: Mỗi nơi một loại máy in ================= */

const PRINTER_TYPES = [
  { id: 'kim', name: 'Máy in kim', icon: '🖨️' },
  { id: 'laser', name: 'Máy in laser', icon: '📠' },
  { id: 'phun', name: 'Máy in phun', icon: '🎨' },
  { id: 'nhiet', name: 'Máy in nhiệt', icon: '🧾' }
];

const PLACE_ROUNDS = [
  { place: 'Gia đình', icon: '🏠', need: 'In tài liệu học tập', correct: 'laser' },
  { place: 'Văn phòng', icon: '🏢', need: 'In nhiều tài liệu, nhanh', correct: 'laser' },
  { place: 'Cửa hàng', icon: '🏪', need: 'In hoá đơn', correct: 'nhiet' },
  { place: 'Nơi in ảnh', icon: '🖼', need: 'Cần bản in màu, chất lượng cao', correct: 'phun' }
];

let placeIdx = 0, placeScore = 0;

function renderPlaceGame() {
  const wrap = document.getElementById('place-game');
  if (!wrap) return;
  const round = PLACE_ROUNDS[placeIdx];

  if (!round) {
    wrap.innerHTML = `<div class="quiz-score">🎉 Xong! Điểm: ${placeScore} / ${PLACE_ROUNDS.length}</div>
      <div class="text-center"><button class="btn-outline" onclick="restartPlaceGame()">🔄 Chơi lại</button></div>`;
    return;
  }

  wrap.innerHTML = `
    <div class="mouse-scenario-banner">
      <div class="msb-icon">${round.icon}</div>
      <div class="msb-text"><b>${round.place}</b><span>${round.need}</span></div>
    </div>
    <div class="place-grid">
      ${PRINTER_TYPES.map(p => `
        <div class="place-card" data-id="${p.id}">
          <div class="pc-icon">${p.icon}</div>
          <div class="pc-name">${p.name}</div>
        </div>
      `).join('')}
    </div>
    <div class="q-feedback" id="place-feedback"></div>
    <div class="text-center mt-sm" style="font-size:12.5px; color:var(--sub);">Câu ${placeIdx + 1} / ${PLACE_ROUNDS.length} · Điểm: ${placeScore}</div>
  `;

  wrap.querySelectorAll('.place-card').forEach(card => {
    card.addEventListener('click', () => {
      const chosenId = card.dataset.id;
      const allCards = wrap.querySelectorAll('.place-card');
      allCards.forEach(c => c.classList.add('locked'));
      const feedback = document.getElementById('place-feedback');

      if (chosenId === round.correct) {
        card.classList.add('correct');
        feedback.className = 'q-feedback show ok';
        feedback.textContent = `✅ Đúng! ${PRINTER_TYPES.find(p => p.id === round.correct).name} phù hợp nhất cho ${round.place.toLowerCase()}.`;
        placeScore++;
      } else {
        card.classList.add('wrong');
        wrap.querySelector(`.place-card[data-id="${round.correct}"]`).classList.add('correct');
        feedback.className = 'q-feedback show bad';
        feedback.textContent = `❌ Chưa đúng. ${PRINTER_TYPES.find(p => p.id === round.correct).name} mới phù hợp nhất cho ${round.place.toLowerCase()}.`;
      }

      setTimeout(() => { placeIdx++; renderPlaceGame(); }, 1800);
    });
  });
}

function restartPlaceGame() { placeIdx = 0; placeScore = 0; renderPlaceGame(); }

/* ================= 4. Ứng dụng 3: "Máy in không in được!" — chẩn đoán ================= */

const DIAGNOSIS_STEPS = [
  { text: 'Kiểm tra máy in đã kết nối (cắm dây / đã bật) chưa', done: false },
  { text: 'Kiểm tra máy tính có nhận thiết bị không', done: false },
  { text: 'Kiểm tra đã cài driver chưa', done: false },
  { text: 'Kiểm tra đã chọn đúng máy in trong danh sách in chưa', done: false }
];

function renderDiagnosisGame() {
  const wrap = document.getElementById('diagnosis-game');
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="callout question">Em vừa cắm máy in mới vào máy tính. Máy tính không in được tài liệu. Bấm vào từng bước em sẽ kiểm tra (theo thứ tự hợp lý):</div>
    <div class="diagnosis-wrap" id="diagnosis-list">
      ${DIAGNOSIS_STEPS.map((s, i) => `<button class="diagnosis-step" data-i="${i}">${i + 1}. ${s.text}</button>`).join('')}
    </div>
    <div class="q-feedback" id="diagnosis-feedback"></div>
  `;

  let checkedCount = 0;
  wrap.querySelectorAll('.diagnosis-step').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('checked')) return;
      btn.classList.add('checked');
      checkedCount++;
      if (checkedCount === DIAGNOSIS_STEPS.length) {
        const feedback = document.getElementById('diagnosis-feedback');
        feedback.className = 'q-feedback show ok';
        feedback.textContent = '✅ Đúng vậy — "cắm dây" thôi chưa đủ. Cần kiểm tra đủ cả 4 bước trên trước khi kết luận máy in bị hỏng.';
      }
    });
  });
}

/* ================= 5. Bluetooth — ghép đôi (2 bước theo slide 24-25) ================= */

const BT_SCENARIOS = [
  { scenario: 'Em vừa mua tai nghe Bluetooth mới tên "SoundMax Pro". Em muốn ghép đôi laptop với tai nghe này.', pairWith: 'laptop',
    devices: [{ name: 'SoundMax Pro', icon: '🎧', correct: true }, { name: 'iPhone của Lan', icon: '📱', correct: false }, { name: 'HP LaserJet', icon: '🖨️', correct: false }, { name: 'Mouse M185', icon: '🖱️', correct: false }] },
  { scenario: 'Trong lớp có 10 tai nghe Bluetooth. Em cần ghép đôi đúng với tai nghe của mình tên "Tai nghe của em".', pairWith: 'laptop',
    devices: [{ name: 'Tai nghe bạn A', icon: '🎧', correct: false }, { name: 'Tai nghe của em', icon: '🎧', correct: true }, { name: 'Tai nghe bạn B', icon: '🎧', correct: false }, { name: 'Tai nghe bạn C', icon: '🎧', correct: false }] }
];

let btIdx = 0, btScore = 0, btStage = 0; // 0 = bật+chọn thiết bị, 1 = ghép đôi xong

function renderBtGame() {
  const wrap = document.getElementById('bt-game');
  if (!wrap) return;
  const round = BT_SCENARIOS[btIdx];

  if (!round) {
    wrap.innerHTML = `<div class="quiz-score">🎉 Xong! Ghép đôi đúng: ${btScore} / ${BT_SCENARIOS.length}</div>
      <div class="text-center"><button class="btn-outline" onclick="restartBtGame()">🔄 Chơi lại</button></div>`;
    return;
  }

  btStage = 0;
  renderBtStage();
}

function renderBtStage() {
  const wrap = document.getElementById('bt-game');
  const round = BT_SCENARIOS[btIdx];
  let html = '';

  if (btStage === 0) {
    const shuffled = [...round.devices].sort(() => Math.random() - 0.5);
    html = `
      <div class="bt-stage">
        <div class="scan-pulse">📡</div>
        <p style="color:var(--sub); font-size:13.5px;">${round.scenario}</p>
        <p style="font-size:13px; font-weight:bold; color:var(--primary-dark);">Bước 1: Bật Bluetooth và chọn đúng thiết bị cần ghép đôi</p>
        <div class="bt-scan-list" id="bt-scan-list">
          ${shuffled.map((d, i) => `<button class="bt-device-row" style="animation-delay:${i * 0.1}s" data-correct="${d.correct}"><span class="bdr-icon">${d.icon}</span><span class="bdr-name">${d.name}</span></button>`).join('')}
        </div>
        <div class="q-feedback" id="bt-feedback"></div>
      </div>`;
  } else {
    html = `
      <div class="bt-connected-banner">
        <div class="cb-icon">🤝</div>
        <b>Bước 2: Xác nhận ghép đôi — Kết nối thành công!</b>
        <p style="margin:6px 0 0; font-size:13px; color:var(--ink);">${round.pairWith} đã kết nối với đúng thiết bị cần dùng.</p>
      </div>
      <div class="text-center mt-sm"><button class="btn btn-primary" onclick="btNextRound()">Tình huống tiếp theo →</button></div>`;
  }

  wrap.innerHTML = html + `<div class="text-center mt-sm" style="font-size:12.5px; color:var(--sub);">Tình huống ${btIdx + 1} / ${BT_SCENARIOS.length} · Đúng: ${btScore}</div>`;

  if (btStage === 0) {
    wrap.querySelectorAll('.bt-device-row').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.dataset.correct === 'true';
        const allBtns = wrap.querySelectorAll('.bt-device-row');
        const feedback = document.getElementById('bt-feedback');
        if (isCorrect) {
          allBtns.forEach(b => b.disabled = true);
          btn.classList.add('correct');
          feedback.className = 'q-feedback show ok';
          feedback.textContent = '✅ Đúng thiết bị! Đang ghép đôi...';
          btScore++;
          setTimeout(() => { btStage = 1; renderBtStage(); }, 1000);
        } else {
          btn.classList.add('wrong');
          btn.disabled = true;
          feedback.className = 'q-feedback show bad';
          feedback.textContent = '❌ Không phải thiết bị này — máy vẫn cần biết chính xác đang ghép với thiết bị nào. Thử thiết bị khác.';
        }
      });
    });
  }
}

function btNextRound() { btIdx++; renderBtGame(); }
function restartBtGame() { btIdx = 0; btScore = 0; renderBtGame(); }

/* ================= 6. Ứng dụng tổng hợp: Chọn cách kết nối ================= */

const CONNECT_CHOICES = [
  { device: 'Laptop → TV', icon: '📺', options: ['HDMI', 'Bluetooth', 'USB'], correct: 'HDMI' },
  { device: 'Laptop → USB (flash drive)', icon: '💾', options: ['Bluetooth', 'USB', 'VGA'], correct: 'USB' },
  { device: 'Laptop → Tai nghe', icon: '🎧', options: ['Bluetooth', 'Cổng mạng', 'VGA'], correct: 'Bluetooth' },
  { device: 'Laptop → Máy in', icon: '🖨️', options: ['USB / Cổng mạng', 'Bluetooth', 'VGA'], correct: 'USB / Cổng mạng' }
];

function renderConnectChoiceGame() {
  const wrap = document.getElementById('connect-choice-game');
  if (!wrap) return;

  wrap.innerHTML = `
    <p style="color:var(--sub); font-size:13.5px;">Với mỗi thiết bị, em sẽ chọn cách kết nối nào?</p>
    <div class="connect-choice-grid">
      ${CONNECT_CHOICES.map((c, idx) => `
        <div class="connect-choice-row">
          <span class="ccr-label">${c.icon} ${c.device}</span>
          <span class="ccr-options" id="ccr-opts-${idx}">
            ${c.options.map(o => `<button class="ccr-opt-btn" data-round="${idx}" data-val="${o}">${o}</button>`).join('')}
          </span>
        </div>
      `).join('')}
    </div>
    <div class="q-feedback" id="connect-feedback"></div>
  `;

  let correctCount = 0;
  let answeredGroups = 0;
  wrap.querySelectorAll('.ccr-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const roundIdx = parseInt(btn.dataset.round, 10);
      const val = btn.dataset.val;
      const round = CONNECT_CHOICES[roundIdx];
      const group = document.getElementById(`ccr-opts-${roundIdx}`);
      if (group.dataset.answered === 'true') return;
      group.dataset.answered = 'true';
      group.querySelectorAll('.ccr-opt-btn').forEach(b => b.disabled = true);
      answeredGroups++;

      if (val === round.correct) {
        btn.classList.add('correct');
        correctCount++;
      } else {
        btn.classList.add('wrong');
        group.querySelector(`[data-val="${round.correct}"]`).classList.add('correct');
      }

      if (answeredGroups === CONNECT_CHOICES.length) {
        const feedback = document.getElementById('connect-feedback');
        feedback.className = 'q-feedback show ok';
        feedback.textContent = `🎉 Hoàn thành! Đúng ${correctCount} / ${CONNECT_CHOICES.length}. Đây là lúc vận dụng kiến thức của cả hai phần đã học (thiết bị + cổng kết nối).`;
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderPortNameGame();
  renderDeviceTypeGame();
  renderMouseGame();
  renderPlaceGame();
  renderDiagnosisGame();
  renderBtGame();
  renderConnectChoiceGame();
});
