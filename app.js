/**
 * 膝痛問診チェックリスト - メインアプリケーション
 * 画面遷移、フォーム処理、症例保存
 */

// ========================
// グローバル状態
// ========================
let currentScreen = 'home';
let caseData = {};
let scoringEngine = null;
let visitedScreens = new Set(['home']); // 訪問済み画面を追跡

// ========================
// 初期化
// ========================
document.addEventListener('DOMContentLoaded', () => {
    // スコアリングエンジン初期化
    scoringEngine = new ScoringEngine(SCORING_CONFIG);

    // 症例履歴を読み込み
    loadCaseHistory();

    // BMI自動計算イベント
    document.getElementById('height').addEventListener('input', calculateBMI);
    document.getElementById('weight').addEventListener('input', calculateBMI);

    // プログレスステップにクリックイベントを追加
    setupProgressTabs();

    // チェックボックスのイベントリスナーを追加
    setupCheckboxListeners();
});

// ========================
// プログレスタブのセットアップ
// ========================
function setupProgressTabs() {
    const screenOrder = ['home', 'basic', 'symptoms', 'examination', 'imaging', 'results'];
    const steps = document.querySelectorAll('.progress-step');

    steps.forEach((step, index) => {
        step.addEventListener('click', () => {
            const targetScreen = screenOrder[index];

            // 訪問済みの画面、または現在より前の画面のみ移動可能
            if (visitedScreens.has(targetScreen) || index < screenOrder.indexOf(currentScreen)) {
                goToScreen(targetScreen);
            }
        });

        // ホバー時のスタイル調整用
        step.addEventListener('mouseenter', () => {
            const targetScreen = screenOrder[index];
            if (visitedScreens.has(targetScreen) || index < screenOrder.indexOf(currentScreen)) {
                step.style.cursor = 'pointer';
            } else {
                step.style.cursor = 'not-allowed';
            }
        });
    });
}

// ========================
// 画面遷移
// ========================
function goToScreen(screenName) {
    // 現在の画面を非表示
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // 新しい画面を表示
    const newScreen = document.getElementById(`screen-${screenName}`);
    if (newScreen) {
        newScreen.classList.add('active');
        currentScreen = screenName;
        visitedScreens.add(screenName); // 訪問済みに追加
        updateProgress(screenName);
        window.scrollTo(0, 0);
    }
}

function updateProgress(screenName) {
    const screenOrder = ['home', 'basic', 'symptoms', 'examination', 'imaging', 'results'];
    const currentIndex = screenOrder.indexOf(screenName);

    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index < currentIndex) {
            step.classList.add('completed');
        } else if (index === currentIndex) {
            step.classList.add('active');
        }
    });
}

// ========================
// 新規症例
// ========================
function startNewCase() {
    // データリセット
    caseData = {
        id: generateCaseId(),
        createdAt: new Date().toISOString()
    };

    // 訪問済み画面をリセット
    visitedScreens = new Set(['home', 'basic']);

    // フォームリセット
    resetAllForms();

    // 基本情報画面へ
    goToScreen('basic');
}

function generateCaseId() {
    const now = new Date();
    return `CASE-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
}

function resetAllForms() {
    // テキスト入力リセット
    document.querySelectorAll('.form-input').forEach(input => {
        input.value = '';
    });

    // セレクトリセット
    document.querySelectorAll('.form-select').forEach(select => {
        select.selectedIndex = 0;
    });

    // ラジオボタンリセット
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
    });

    // チェックボックスリセット
    document.querySelectorAll('.checkbox-item').forEach(item => {
        item.classList.remove('checked');
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.checked = false;
    });

    // BMI表示リセット
    document.getElementById('bmiDisplay').style.display = 'none';
}

// ========================
// BMI計算
// ========================
function calculateBMI() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);

    if (height > 0 && weight > 0) {
        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);
        document.getElementById('bmiValue').textContent = bmi.toFixed(1);
        document.getElementById('bmiDisplay').style.display = 'block';
    } else {
        document.getElementById('bmiDisplay').style.display = 'none';
    }
}

// ========================
// チェックボックスのセットアップ
// ========================
function setupCheckboxListeners() {
    // すべてのチェックボックスにchangeイベントを追加
    document.querySelectorAll('.checkbox-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const label = this.closest('.checkbox-item');
            if (label) {
                if (this.checked) {
                    label.classList.add('checked');
                } else {
                    label.classList.remove('checked');
                }
            }
        });
    });
}

// ========================
// チェックボックストグル（後方互換性のため残す）
// ========================
function toggleCheckbox(element) {
    // この関数は現在使用されていませんが、後方互換性のため残します
    element.classList.toggle('checked');
    const checkbox = element.querySelector('input[type="checkbox"]');
    if (checkbox) {
        checkbox.checked = element.classList.contains('checked');
    }
}

// ========================
// データ収集
// ========================
function collectFormData() {
    const data = {};

    // 基本情報
    data.patientId = document.getElementById('patientId').value || '匿名';
    data.age = parseInt(document.getElementById('age').value) || null;

    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    if (height > 0 && weight > 0) {
        data.bmi = weight / ((height / 100) ** 2);
    }

    data.gender = document.querySelector('input[name="gender"]:checked')?.value || null;
    data.affectedSide = document.querySelector('input[name="affectedSide"]:checked')?.value || null;
    data.duration = document.getElementById('duration').value || null;

    // 既往歴
    data.kneeOA = document.querySelector('input[name="history"][value="kneeOA"]')?.checked || false;
    data.patellarDislocation = document.querySelector('input[name="history"][value="patellarDislocation"]')?.checked || false;
    data.meniscusLigament = document.querySelector('input[name="history"][value="meniscusLigament"]')?.checked || false;

    // スポーツ活動
    data.sportsActivity = document.querySelector('input[name="sportsActivity"]:checked')?.value || null;

    // 痛みの部位
    data.painLocation = [];
    document.querySelectorAll('input[name="painLocation"]:checked').forEach(cb => {
        data.painLocation.push(cb.value);
    });

    // 誘発動作
    data.provocativeMovements = [];
    document.querySelectorAll('input[name="provocative"]:checked').forEach(cb => {
        data.provocativeMovements.push(cb.value);
    });

    // 症状の性質
    data.catchingClicking = document.querySelector('input[name="symptomChar"][value="catchingClicking"]')?.checked || false;
    data.instability = document.querySelector('input[name="symptomChar"][value="instability"]')?.checked || false;
    data.localSwelling = document.querySelector('input[name="symptomChar"][value="localSwelling"]')?.checked || false;
    data.localHeat = document.querySelector('input[name="symptomChar"][value="localHeat"]')?.checked || false;
    data.locking = document.querySelector('input[name="symptomChar"][value="locking"]')?.checked || false;
    data.jointEffusion = document.querySelector('input[name="symptomChar"][value="jointEffusion"]')?.checked || false;
    data.burningTingling = document.querySelector('input[name="symptomChar"][value="burningTingling"]')?.checked || false;
    data.numbness = document.querySelector('input[name="symptomChar"][value="numbness"]')?.checked || false;

    // 触診
    data.tibialTenderness = document.querySelector('input[name="tibialTenderness"]:checked')?.value || null;
    data.jointLineTenderness = document.querySelector('input[name="palpation"][value="jointLineTenderness"]')?.checked || false;
    data.patellarFacetTenderness = document.querySelector('input[name="palpation"][value="patellarFacetTenderness"]')?.checked || false;
    data.plicaPalpation = document.querySelector('input[name="palpation"][value="plicaPalpation"]')?.checked || false;
    data.tibialNodule = document.querySelector('input[name="palpation"][value="tibialNodule"]')?.checked || false;
    data.hoffaTenderness = document.querySelector('input[name="palpation"][value="hoffaTenderness"]')?.checked || false;
    data.infrapatellarBranchTenderness = document.querySelector('input[name="palpation"][value="infrapatellarBranchTenderness"]')?.checked || false;

    // 徒手検査
    data.valgusStress = document.querySelector('input[name="valgusStress"]:checked')?.value || null;
    data.squatPain = document.querySelector('input[name="manualTest"][value="squatPain"]')?.checked || false;
    data.clarkeTest = document.querySelector('input[name="clarkeTest"]:checked')?.value || null;
    data.patellarTilt = document.querySelector('input[name="patellarTilt"]:checked')?.value || null;
    data.apprehension = document.querySelector('input[name="apprehension"]:checked')?.value || null;
    data.mppTest = document.querySelector('input[name="mppTest"]:checked')?.value || null;
    data.stutterTest = document.querySelector('input[name="stutterTest"]:checked')?.value || null;
    data.hoffaTest = document.querySelector('input[name="hoffaTest"]:checked')?.value || null;
    data.mcMurrayTest = document.querySelector('input[name="mcMurrayTest"]:checked')?.value || null;
    data.apleyTest = document.querySelector('input[name="apleyTest"]:checked')?.value || null;
    data.thessalyTest = document.querySelector('input[name="thessalyTest"]:checked')?.value || null;
    data.tinelSign = document.querySelector('input[name="tinelSign"]:checked')?.value || null;

    // 画像所見
    data.xrayOA = document.querySelector('input[name="xray"][value="oaChanges"]')?.checked || false;
    data.xrayPesSpurs = document.querySelector('input[name="xray"][value="pesSpurs"]')?.checked || false;
    data.xrayPatellar = document.querySelector('input[name="xray"][value="patellarMalalignment"]')?.checked || false;

    data.usPesBursa = document.querySelector('input[name="ultrasound"][value="pesBursaSwelling"]')?.checked || false;
    data.usPlica = document.querySelector('input[name="ultrasound"][value="plicaThickening"]')?.checked || false;
    data.usPatellarTendon = document.querySelector('input[name="ultrasound"][value="patellarTendonChanges"]')?.checked || false;
    data.usHoffa = document.querySelector('input[name="ultrasound"][value="hoffaSwelling"]')?.checked || false;
    data.usMeniscus = document.querySelector('input[name="ultrasound"][value="meniscusExtrusion"]')?.checked || false;
    data.usSaphenous = document.querySelector('input[name="ultrasound"][value="saphenousNerveSwelling"]')?.checked || false;

    data.mriPes = document.querySelector('input[name="mri"][value="pesTendonChanges"]')?.checked || false;
    data.mriPlica = document.querySelector('input[name="mri"][value="plicaEdema"]')?.checked || false;
    data.mriPF = document.querySelector('input[name="mri"][value="pfCartilage"]')?.checked || false;
    data.mriHoffa = document.querySelector('input[name="mri"][value="hoffaEdema"]')?.checked || false;
    data.mriMeniscus = document.querySelector('input[name="mri"][value="meniscusTear"]')?.checked || false;
    data.mriSaphenous = document.querySelector('input[name="mri"][value="saphenousNerveSignal"]')?.checked || false;
    data.mriMeniscusLigament = document.querySelector('input[name="mri"][value="meniscusLigament"]')?.checked || false;

    return data;
}

// ========================
// 結果計算
// ========================
function calculateResults() {
    // データ収集
    const formData = collectFormData();
    caseData = { ...caseData, ...formData };

    // スコアリングエンジンリセット
    scoringEngine.reset();

    // 背景因子を処理
    scoringEngine.processBackground(formData);

    // 症状を処理
    scoringEngine.processSymptoms(formData);

    // 検査を処理
    scoringEngine.processExamination(formData);

    // 画像を処理
    scoringEngine.processImaging(formData);

    // 結果計算
    const results = scoringEngine.calculate();
    caseData.results = results;

    // 結果表示
    displayResults(results);

    // 結果画面へ
    goToScreen('results');
}

// ========================
// 結果表示
// ========================
function displayResults(results) {
    // 確率表示
    document.getElementById('pesProb').textContent = `${results.probabilities.pes}%`;
    document.getElementById('pfpsProb').textContent = `${results.probabilities.pfps}%`;
    document.getElementById('plicaProb').textContent = `${results.probabilities.plica}%`;
    document.getElementById('hoffaProb').textContent = `${results.probabilities.hoffa}%`;
    document.getElementById('meniscusProb').textContent = `${results.probabilities.meniscus}%`;
    document.getElementById('saphenousProb').textContent = `${results.probabilities.saphenous}%`;
    document.getElementById('otherProb').textContent = `${results.probabilities.other}%`;

    // バーアニメーション
    setTimeout(() => {
        document.getElementById('pesFill').style.width = `${results.probabilities.pes}%`;
        document.getElementById('pfpsFill').style.width = `${results.probabilities.pfps}%`;
        document.getElementById('plicaFill').style.width = `${results.probabilities.plica}%`;
        document.getElementById('hoffaFill').style.width = `${results.probabilities.hoffa}%`;
        document.getElementById('meniscusFill').style.width = `${results.probabilities.meniscus}%`;
        document.getElementById('saphenousFill').style.width = `${results.probabilities.saphenous}%`;
        document.getElementById('otherFill').style.width = `${results.probabilities.other}%`;
    }, 100);

    // カテゴリバッジ
    const catLabels = { low: '低', moderate: '中', high: '高' };
    const catClasses = { low: 'category-low', moderate: 'category-moderate', high: 'category-high' };

    ['pes', 'pfps', 'plica', 'hoffa', 'meniscus', 'saphenous', 'other'].forEach(disease => {
        const catEl = document.getElementById(`${disease}Cat`);
        const cat = results.categories[disease];
        catEl.textContent = catLabels[cat];
        catEl.className = `category-badge ${catClasses[cat]}`;
    });

    // 円グラフ描画
    drawPieChart(results.probabilities);

    // 寄与因子表示
    displayTopFactors(results.topFactors);

    // 推奨アクション表示
    displayRecommendations(results);
}

// ========================
// 円グラフ
// ========================
function drawPieChart(probabilities) {
    const canvas = document.getElementById('resultChart');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // クリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const data = [
        { value: probabilities.pes, color: '#f97316', label: '鵞足炎' },
        { value: probabilities.pfps, color: '#8b5cf6', label: 'PFPS' },
        { value: probabilities.plica, color: '#06b6d4', label: 'タナ障害' },
        { value: probabilities.hoffa, color: '#f59e0b', label: 'Hoffa脂肪体炎' },
        { value: probabilities.meniscus, color: '#10b981', label: '半月板損傷' },
        { value: probabilities.saphenous, color: '#ec4899', label: '伏在神経障害' },
        { value: probabilities.other, color: '#6b7280', label: 'その他' }
    ];

    let startAngle = -Math.PI / 2;

    data.forEach(item => {
        if (item.value > 0) {
            const sliceAngle = (item.value / 100) * 2 * Math.PI;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();

            ctx.fillStyle = item.color;
            ctx.fill();

            // ラベル
            const labelAngle = startAngle + sliceAngle / 2;
            const labelRadius = radius * 0.65;
            const labelX = centerX + Math.cos(labelAngle) * labelRadius;
            const labelY = centerY + Math.sin(labelAngle) * labelRadius;

            if (item.value >= 10) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px "Noto Sans JP", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${item.value}%`, labelX, labelY);
            }

            startAngle += sliceAngle;
        }
    });

    // 中央の円（ドーナツ効果）- 白背景に変更
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
}

// ========================
// 寄与因子表示
// ========================
function displayTopFactors(topFactors) {
    const container = document.getElementById('topFactors');
    container.innerHTML = '';

    const diseaseNames = { pes: '鵞足炎', pfps: 'PFPS', plica: 'タナ障害', hoffa: 'Hoffa脂肪体炎', meniscus: '半月板損傷', saphenous: '伏在神経障害', other: 'その他' };
    const diseaseColors = { pes: 'var(--pes-color)', pfps: 'var(--pfps-color)', plica: 'var(--plica-color)', hoffa: 'var(--hoffa-color)', meniscus: 'var(--meniscus-color)', saphenous: 'var(--saphenous-color)', other: 'var(--other-color)' };

    ['pes', 'pfps', 'plica', 'hoffa', 'meniscus', 'saphenous', 'other'].forEach(disease => {
        const factors = topFactors[disease];
        if (factors && factors.length > 0) {
            const section = document.createElement('div');
            section.style.marginBottom = 'var(--spacing-md)';

            const title = document.createElement('div');
            title.style.fontSize = 'var(--font-size-sm)';
            title.style.fontWeight = '600';
            title.style.color = diseaseColors[disease];
            title.style.marginBottom = 'var(--spacing-xs)';
            title.textContent = diseaseNames[disease];
            section.appendChild(title);

            factors.forEach(factor => {
                const item = document.createElement('div');
                item.className = 'factor-item';
                item.innerHTML = `
          <span class="factor-score positive">+${factor.score}</span>
          <span>${factor.description || factor.item}</span>
        `;
                section.appendChild(item);
            });

            container.appendChild(section);
        }
    });

    if (container.innerHTML === '') {
        container.innerHTML = '<p style="color: var(--gray-500); font-size: var(--font-size-sm);">特徴的な所見は検出されませんでした</p>';
    }
}

// ========================
// 推奨アクション表示
// ========================
function displayRecommendations(results) {
    const list = document.getElementById('recommendationList');
    list.innerHTML = '';

    let hasRecommendations = false;

    // 最も可能性が高い疾患を優先
    const sortedDiseases = ['pes', 'pfps', 'plica', 'hoffa', 'meniscus', 'saphenous', 'other'].sort((a, b) =>
        results.probabilities[b] - results.probabilities[a]
    );

    sortedDiseases.forEach(disease => {
        const recs = results.recommendations[disease];
        if (recs && recs.length > 0) {
            hasRecommendations = true;
            recs.forEach(rec => {
                const li = document.createElement('li');
                li.textContent = rec;
                list.appendChild(li);
            });
        }
    });

    if (!hasRecommendations) {
        const li = document.createElement('li');
        li.textContent = '追加評価の推奨はありません。各疾患の可能性は低いと推定されます。';
        list.appendChild(li);
    }
}

// ========================
// 症例保存
// ========================
function saveCase() {
    const cases = JSON.parse(localStorage.getItem('kneeCases') || '[]');

    // 既存の同じIDがあれば更新、なければ追加
    const existingIndex = cases.findIndex(c => c.id === caseData.id);
    if (existingIndex >= 0) {
        cases[existingIndex] = caseData;
    } else {
        cases.unshift(caseData);
    }

    // 最新20件のみ保存
    const limitedCases = cases.slice(0, 20);
    localStorage.setItem('kneeCases', JSON.stringify(limitedCases));

    // 履歴更新
    loadCaseHistory();

    // 通知
    alert('症例を保存しました');
}

// ========================
// 症例履歴読み込み
// ========================
function loadCaseHistory() {
    const container = document.getElementById('caseHistory');
    const cases = JSON.parse(localStorage.getItem('kneeCases') || '[]');

    if (cases.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>保存された症例はありません</p>
      </div>
    `;
        return;
    }

    container.innerHTML = '';

    cases.forEach(caseItem => {
        const item = document.createElement('div');
        item.className = 'case-item';
        item.onclick = () => loadCase(caseItem);

        const date = new Date(caseItem.createdAt);
        const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

        let resultBadges = '';
        if (caseItem.results) {
            const { probabilities } = caseItem.results;
            resultBadges = `
        <span class="mini-badge pes">${probabilities.pes}%</span>
        <span class="mini-badge pfps">${probabilities.pfps}%</span>
        <span class="mini-badge plica">${probabilities.plica}%</span>
      `;
        }

        item.innerHTML = `
      <div class="case-info">
        <div class="case-id">${caseItem.patientId || caseItem.id}</div>
        <div class="case-date">${dateStr}</div>
      </div>
      <div class="case-result">${resultBadges}</div>
    `;

        container.appendChild(item);
    });
}

// ========================
// 症例読み込み
// ========================
function loadCase(caseItem) {
    caseData = { ...caseItem };

    if (caseItem.results) {
        displayResults(caseItem.results);
        goToScreen('results');
    } else {
        goToScreen('basic');
    }
}
