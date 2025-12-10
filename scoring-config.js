/**
 * 膝痛問診チェックリスト - スコアリング設定
 * 各項目に対する6疾患（鵞足炎・PFPS・タナ障害・Hoffa脂肪体炎・半月板損傷・伏在神経障害）への重みづけ
 */

const SCORING_CONFIG = {
  // 最大想定スコア（カテゴリ判定用）
  maxScore: 20,

  // カテゴリ閾値（%）
  categories: {
    low: { min: 0, max: 30, label: '低', labelEn: 'Low' },
    moderate: { min: 31, max: 70, label: '中', labelEn: 'Moderate' },
    high: { min: 71, max: 100, label: '高', labelEn: 'High' }
  },

  // 背景因子
  background: {
    // 年齢
    age: {
      young: { // 10-30歳
        pes: 0, pfps: 2, plica: 2, hoffa: 2, meniscus: 2, saphenous: 1,
        description: '若年層はスポーツ外傷による半月板損傷リスクあり'
      },
      middle: { // 31-50歳
        pes: 1, pfps: 1, plica: 1, hoffa: 1, meniscus: 2, saphenous: 1,
        description: '中年層は変性による半月板損傷リスクが上昇'
      },
      senior: { // 51歳以上
        pes: 2, pfps: 1, plica: 0, hoffa: 1, meniscus: 3, saphenous: 2,
        description: '高齢層は伏在神経障害のリスクも上昇'
      }
    },
    // BMI高値（25以上）
    highBMI: {
      pes: 2, pfps: 1, plica: 0, hoffa: 1, meniscus: 1, saphenous: 1,
      description: '肥満は膝関節への負荷増加'
    },
    // 膝OAあり
    kneeOA: {
      pes: 2, pfps: 1, plica: 0, hoffa: 2, meniscus: 3, saphenous: 2,
      description: '変形性膝関節症は伏在神経障害との合併あり'
    },
    // スポーツ活動
    sportsActivity: {
      competitive: {
        pes: 1, pfps: 2, plica: 2, hoffa: 2, meniscus: 3, saphenous: 1,
        description: '競技スポーツは半月板損傷のリスク'
      },
      recreational: {
        pes: 1, pfps: 1, plica: 1, hoffa: 1, meniscus: 1, saphenous: 1,
        description: 'レクリエーションレベルは各疾患に軽度関連'
      },
      none: {
        pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0,
        description: '非スポーツは特記なし'
      }
    },
    // 膝手術歴 - 伏在神経用追加
    kneeHistory: {
      surgery: {
        pes: 1, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 4,
        description: '膝手術歴（特にTKA）は伏在神経障害を強く示唆'
      },
      injection: {
        pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 2,
        description: '膝への注射歴は伏在神経障害のリスク'
      },
      none: {
        pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0,
        description: '手術歴なし'
      }
    }
  },

  // 痛みの主座
  painLocation: {
    anteriorKnee: { // 膝前面（膝蓋骨周囲）
      pes: 0, pfps: 3, plica: 1, hoffa: 2, meniscus: 0, saphenous: 0,
      description: '膝蓋骨周囲痛はPFPSを強く示唆'
    },
    medialAnterior: { // 膝内側前面（関節裂隙付近）
      pes: 1, pfps: 1, plica: 1, hoffa: 1, meniscus: 2, saphenous: 2,
      description: '膝内側前面は伏在神経障害も考慮'
    },
    tibialMedial: { // 脛骨内側で関節裂隙から3〜5cm下方
      pes: 4, pfps: -1, plica: 0, hoffa: 0, meniscus: 0, saphenous: 2,
      description: '脛骨内側3-5cm下方は鵞足炎・伏在神経を考慮'
    },
    anteromedial: { // 膝前内側（膝蓋骨内側縁〜大腿骨内顆）
      pes: 1, pfps: 1, plica: 3, hoffa: 1, meniscus: 1, saphenous: 2,
      description: '膝前内側はタナ障害・伏在神経を示唆'
    },
    infrapatellar: { // 膝蓋腱両側（膝蓋下部）- Hoffa用追加
      pes: 0, pfps: 1, plica: 0, hoffa: 4, meniscus: 0, saphenous: 3,
      description: '膝蓋腱両側は伏在神経膝蓋下枝も考慮'
    },
    medialJointLine: { // 内側関節裂隙 - 半月板用追加
      pes: 0, pfps: 0, plica: 1, hoffa: 0, meniscus: 4, saphenous: 1,
      description: '内側関節裂隙の痛みは内側半月板損傷を強く示唆'
    },
    lateralJointLine: { // 外側関節裂隙 - 半月板用追加
      pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 4, saphenous: 0,
      description: '外側関節裂隙の痛みは外側半月板損傷を強く示唆'
    },
    medialLowerLeg: { // 下腿内側 - 伏在神経用追加
      pes: 1, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 4,
      description: '下腿内側への放散痛は伏在神経障害を強く示唆'
    },
    other: { // その他
      pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0, other: 3,
      description: 'その他の部位'
    }
  },

  // 誘発動作
  provocativeMovements: {
    stairClimbing: { // 階段昇りで痛い
      pes: 2, pfps: 2, plica: 1, hoffa: 1, meniscus: 1, saphenous: 1,
      description: '階段昇降痛は複数疾患で共通'
    },
    stairDescending: { // 階段降りで痛い
      pes: 2, pfps: 2, plica: 1, hoffa: 1, meniscus: 1, saphenous: 1,
      description: '階段降り痛は特にPFPSで多い'
    },
    standingUp: { // 立ち上がりで痛い
      pes: 2, pfps: 2, plica: 1, hoffa: 1, meniscus: 1, saphenous: 1,
      description: '立ち上がり動作時痛'
    },
    deepSquat: { // 深いしゃがみ込みで痛い
      pes: 1, pfps: 3, plica: 2, hoffa: 2, meniscus: 3, saphenous: 1,
      description: '深屈曲は半月板への負荷大'
    },
    runningJumping: { // ランニング・ジャンプで痛い
      pes: 1, pfps: 2, plica: 2, hoffa: 2, meniscus: 2, saphenous: 1,
      description: '走行・跳躍時痛'
    },
    theaterSign: { // 長時間座位後の立ち上がり痛
      pes: 0, pfps: 3, plica: 1, hoffa: 1, meniscus: 0, saphenous: 0,
      description: 'シアターサインはPFPSの特徴的所見'
    },
    initialMovement: { // 歩き始めだけ痛い
      pes: 1, pfps: 1, plica: 0, hoffa: 1, meniscus: 1, saphenous: 1,
      description: '動作開始時痛'
    },
    terminalExtension: { // 膝伸展最終域で痛い - Hoffa用追加
      pes: 0, pfps: 1, plica: 1, hoffa: 4, meniscus: 1, saphenous: 0,
      description: '膝完全伸展時痛はHoffa脂肪体炎を強く示唆'
    },
    weightBearingFlexion: { // 膝関節屈曲時の荷重時痛 - Hoffa用追加
      pes: 0, pfps: 2, plica: 1, hoffa: 4, meniscus: 2, saphenous: 1,
      description: '膝屈曲荷重時痛はHoffa脂肪体炎を強く示唆'
    },
    twistingPivot: { // ひねり・方向転換で痛い - 半月板用追加
      pes: 0, pfps: 1, plica: 1, hoffa: 0, meniscus: 4, saphenous: 0,
      description: 'ひねり動作時痛は半月板損傷を強く示唆'
    },
    prolongedSitting: { // 長時間座位で痛い - 伏在神経用追加
      pes: 0, pfps: 1, plica: 0, hoffa: 0, meniscus: 0, saphenous: 3,
      description: '長時間座位で悪化は伏在神経障害を示唆'
    },
    other: { // その他の動作
      pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0, other: 3,
      description: 'その他の動作'
    }
  },

  // レッドフラッグ（警告症状）
  redFlags: {
    restPain: { // 安静時痛
      isRedFlag: true,
      description: '安静時痛・夜間痛は感染・腫瘍などを疑う'
    },
    nightPain: { // 夜間痛
      isRedFlag: true,
      description: '夜間痛は重篤な病態を示唆'
    },
    fever: { // 発熱
      isRedFlag: true,
      description: '発熱は感染を疑う'
    },
    severeSwelling: { // 著明な腫脹
      isRedFlag: true,
      description: '著明な腫脹は急性炎症・感染を示唆'
    }
  },

  // 症状の性質
  symptomCharacter: {
    catchingClicking: { // 引っかかり感・クリック感
      pes: 1, pfps: 1, plica: 3, hoffa: 0, meniscus: 3, saphenous: 0,
      description: '引っかかり感はタナ障害・半月板損傷を示唆'
    },
    locking: { // ロッキング（膝が固まる）- 半月板用追加
      pes: 0, pfps: 0, plica: 1, hoffa: 0, meniscus: 5, saphenous: 0,
      description: 'ロッキングは半月板損傷を強く示唆'
    },
    instability: { // 膝が抜ける・不安定感
      pes: 0, pfps: 1, plica: 1, hoffa: 0, meniscus: 2, saphenous: 0,
      description: '不安定感は靭帯損傷も考慮'
    },
    localSwelling: { // 局所の腫脹
      pes: 2, pfps: 1, plica: 1, hoffa: 2, meniscus: 2, saphenous: 0,
      description: '局所腫脹は炎症を示唆'
    },
    localHeat: { // 熱感
      pes: 1, pfps: 0, plica: 0, hoffa: 1, meniscus: 1, saphenous: 0,
      description: '局所熱感は炎症を示唆'
    },
    jointEffusion: { // 関節水腫 - 半月板用追加
      pes: 0, pfps: 1, plica: 0, hoffa: 1, meniscus: 3, saphenous: 0,
      description: '関節水腫は半月板損傷を示唆'
    },
    burningTingling: { // 灼熱感・ピリピリ感 - 伏在神経用追加
      pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 5,
      description: '灼熱感・ピリピリ感は伏在神経障害を強く示唆'
    },
    numbness: { // しびれ - 伏在神経用追加
      pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 5,
      description: '膝内側〜下腿内側のしびれは伏在神経障害を強く示唆'
    },
    other: { // その他の症状
      pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0, other: 3,
      description: 'その他の症状'
    }
  },

  // 触診所見
  palpation: {
    tibialTenderness: { // 脛骨内側3-5cm下方の限局圧痛
      none: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 },
      mild: { pes: 2, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 1 },
      marked: { pes: 4, pfps: -1, plica: 0, hoffa: 0, meniscus: 0, saphenous: 1, description: '鵞足部限局圧痛は鵞足炎を強く示唆' }
    },
    jointLineTenderness: { // 関節裂隙の圧痛
      pes: -1, pfps: 0, plica: 0, hoffa: 0, meniscus: 4, saphenous: 0,
      description: '関節裂隙圧痛は半月板損傷を強く示唆'
    },
    patellarFacetTenderness: { // 膝蓋骨ファセット圧痛
      pes: 0, pfps: 3, plica: 1, hoffa: 0, meniscus: 0, saphenous: 0,
      description: 'ファセット圧痛はPFPSを示唆'
    },
    plicaPalpation: { // 棚触知＋圧痛
      pes: 0, pfps: 0, plica: 4, hoffa: 0, meniscus: 0, saphenous: 0,
      description: '棚触知・圧痛はタナ障害を強く示唆'
    },
    tibialNodule: { // 脛骨内側の腫瘤・結節
      pes: 2, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0,
      description: '鵞足部結節は慢性鵞足炎を示唆'
    },
    hoffaTenderness: { // 膝蓋腱両側の脂肪体圧痛 - Hoffa用追加
      pes: 0, pfps: 0, plica: 0, hoffa: 4, meniscus: 0, saphenous: 0,
      description: '膝蓋腱両側の圧痛はHoffa脂肪体炎を強く示唆'
    },
    infrapatellarBranchTenderness: { // 伏在神経膝蓋下枝圧痛 - 伏在神経用追加
      pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 5,
      description: '膝蓋下枝（縫工筋付着部内側）の圧痛は伏在神経障害を強く示唆'
    }
  },

  // 徒手検査
  manualTests: {
    valgusStress: { // 外反ストレステスト
      negative: { pes: 1, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0, description: 'MCL正常で鵞足炎を支持' },
      positive: { pes: -1, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0, description: 'MCL損傷を示唆' },
      notDone: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 }
    },
    squatPain: { // スクワットで膝蓋骨周囲痛再現
      pes: 0, pfps: 3, plica: 1, hoffa: 1, meniscus: 1, saphenous: 0,
      description: 'スクワット時膝蓋骨痛はPFPSを示唆'
    },
    clarkeTest: { // Clarkeテスト
      positive: { pes: 0, pfps: 3, plica: 1, hoffa: 0, meniscus: 0, saphenous: 0, description: 'Clarke陽性はPFPSを示唆' },
      negative: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 },
      notDone: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 }
    },
    patellarTilt: { // 膝蓋骨傾斜テスト
      positive: { pes: 0, pfps: 4, plica: 1, hoffa: 0, meniscus: 0, saphenous: 0, description: '傾斜テスト陽性はPFPSを示唆' },
      negative: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 },
      notDone: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 }
    },
    apprehension: { // 膝蓋骨不安テスト
      positive: { pes: 0, pfps: 2, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0, description: '不安テスト陽性は膝蓋骨不安定を示唆' },
      negative: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 },
      notDone: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 }
    },
    mppTest: { // MPPテスト
      positive: { pes: 0, pfps: 0, plica: 5, hoffa: 0, meniscus: 0, saphenous: 0, description: 'MPP陽性はタナ障害を強く示唆' },
      negative: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 },
      notDone: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 }
    },
    stutterTest: { // Stutterテスト
      positive: { pes: 0, pfps: 0, plica: 3, hoffa: 0, meniscus: 0, saphenous: 0, description: 'Stutter陽性はタナ障害を示唆' },
      negative: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 },
      notDone: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 }
    },
    hoffaTest: { // Hoffa's test（膝蓋下脂肪体圧迫テスト）- Hoffa用追加
      positive: { pes: 0, pfps: 0, plica: 0, hoffa: 5, meniscus: 0, saphenous: 0, description: 'Hoffa陽性は脂肪体炎を強く示唆' },
      negative: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 },
      notDone: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 }
    },
    mcMurrayTest: { // McMurrayテスト - 半月板用追加
      positive: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 5, saphenous: 0, description: 'McMurray陽性は半月板損傷を強く示唆' },
      negative: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 },
      notDone: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 }
    },
    apleyTest: { // Apleyテスト - 半月板用追加
      positive: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 4, saphenous: 0, description: 'Apley陽性は半月板損傷を示唆' },
      negative: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 },
      notDone: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 }
    },
    thessalyTest: { // Thessalyテスト - 半月板用追加
      positive: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 4, saphenous: 0, description: 'Thessaly陽性は半月板損傷を示唆' },
      negative: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 },
      notDone: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 }
    },
    tinelSign: { // Tinel徴候 - 伏在神経用追加
      positive: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 5, description: 'Tinel陽性（内転筋管・膝蓋下枝）は伏在神経障害を強く示唆' },
      negative: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 },
      notDone: { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0 }
    }
  },

  // 画像所見
  imaging: {
    xray: {
      oaChanges: { // OA所見
        pes: 1, pfps: 1, plica: 0, hoffa: 1, meniscus: 2, saphenous: 1,
        description: 'OA変化は半月板損傷との合併多い'
      },
      pesSpurs: { // 鵞足部付近の骨棘
        pes: 2, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0,
        description: '鵞足部骨棘は慢性鵞足炎を示唆'
      },
      patellarMalalignment: { // 膝蓋骨アライメント異常
        pes: 0, pfps: 3, plica: 1, hoffa: 1, meniscus: 0, saphenous: 0,
        description: '膝蓋骨異常はPFPSを示唆'
      }
    },
    ultrasound: {
      pesBursaSwelling: { // 鵞足滑液包腫大
        pes: 4, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0,
        description: '鵞足滑液包液貯留は鵞足炎を強く示唆'
      },
      plicaThickening: { // 滑膜ヒダ肥厚
        pes: 0, pfps: 0, plica: 4, hoffa: 0, meniscus: 0, saphenous: 0,
        description: '棚肥厚はタナ障害を強く示唆'
      },
      patellarTendonChanges: { // 膝蓋腱変化
        pes: 0, pfps: 2, plica: 0, hoffa: 1, meniscus: 0, saphenous: 0,
        description: '膝蓋腱変化はジャンパー膝も考慮'
      },
      hoffaSwelling: { // Hoffa脂肪体腫大 - Hoffa用追加
        pes: 0, pfps: 0, plica: 0, hoffa: 4, meniscus: 0, saphenous: 0,
        description: 'Hoffa脂肪体腫大・高エコーはHoffa脂肪体炎を強く示唆'
      },
      meniscusExtrusion: { // 半月板逸脱 - 半月板用追加
        pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 3, saphenous: 0,
        description: '超音波での半月板逸脱は損傷を示唆'
      },
      saphenousNerveSwelling: { // 伏在神経腫大 - 伏在神経用追加
        pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 4,
        description: '伏在神経・膝蓋下枝の腫大は神経障害を示唆'
      }
    },
    mri: {
      pesTendonChanges: { // 鵞足腱変化
        pes: 4, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0,
        description: 'MRIでの鵞足腱変化は確定的'
      },
      plicaEdema: { // 棚肥厚＋浮腫
        pes: 0, pfps: 0, plica: 4, hoffa: 0, meniscus: 0, saphenous: 0,
        description: 'MRIでの棚変化は確定的'
      },
      pfCartilage: { // PF軟骨変性
        pes: 0, pfps: 3, plica: 1, hoffa: 0, meniscus: 0, saphenous: 0,
        description: 'PF軟骨変性はPFPSを示唆'
      },
      hoffaEdema: { // Hoffa脂肪体浮腫 - Hoffa用追加
        pes: 0, pfps: 0, plica: 0, hoffa: 4, meniscus: 0, saphenous: 0,
        description: 'MRIでのHoffa脂肪体浮腫は確定的'
      },
      meniscusTear: { // 半月板断裂 - 半月板用追加
        pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 5, saphenous: 0,
        description: 'MRIでの半月板断裂所見は確定的'
      },
      saphenousNerveSignal: { // 伏在神経信号変化 - 伏在神経用追加
        pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 4,
        description: 'MRIでの伏在神経高信号は神経障害を示唆'
      },
      meniscusLigament: { // 靭帯損傷
        pes: -1, pfps: -1, plica: -1, hoffa: -1, meniscus: 0, saphenous: -1,
        description: '靭帯損傷は別疾患を示唆'
      }
    }
  },

  // 推奨アクション
  recommendations: {
    pes: {
      high: [
        '鵞足部圧痛の再確認と局在の詳細評価',
        'MCL・内側半月板損傷の除外',
        '超音波/MRIで鵞足滑液包の評価を検討',
        '荷重・歩容の評価（過度な外反モーメント）'
      ],
      moderate: [
        '鵞足部の詳細な触診評価',
        '膝内側構造の鑑別（MCL、内側半月板）',
        '姿勢・歩容の評価'
      ]
    },
    pfps: {
      high: [
        '股関節外転・外旋筋力評価',
        '動作分析（スクワット・ステップダウン）',
        '膝蓋骨トラッキングの評価',
        'コアスタビリティの評価'
      ],
      moderate: [
        '膝蓋骨可動性・傾斜の評価',
        '下肢アライメント評価',
        '大腿四頭筋柔軟性評価'
      ]
    },
    plica: {
      high: [
        'MPPテストの再確認',
        '棚の触知・可動性評価',
        '超音波/MRIでの棚肥厚確認を検討',
        '症状持続時は整形外科紹介を検討'
      ],
      moderate: [
        '膝前内側の詳細な触診',
        '引っかかり感の再現性評価',
        '他の膝蓋骨周囲病変との鑑別'
      ]
    },
    hoffa: {
      high: [
        'Hoffa脂肪体の圧痛再確認',
        '膝伸展最終域での症状再現確認',
        '超音波/MRIでの脂肪体評価を検討',
        '膝過伸展の習慣・姿勢評価'
      ],
      moderate: [
        '膝蓋腱両側の触診評価',
        '膝伸展時痛の詳細評価',
        'ジャンパー膝との鑑別'
      ]
    },
    meniscus: {
      high: [
        'McMurray・Apley・Thessalyテストの再確認',
        '関節裂隙圧痛の詳細評価',
        'MRI検査を強く推奨',
        '症状持続・ロッキングがあれば整形外科紹介'
      ],
      moderate: [
        '半月板テストの詳細評価',
        'ACL・MCL損傷の除外',
        '膝関節可動域・筋力評価'
      ]
    },
    saphenous: {
      high: [
        '伏在神経走行（内転筋管〜膝蓋下枝）に沿った圧痛確認',
        'Tinel徴候の再確認',
        '感覚検査（膝内側〜下腿内側）',
        '診断的神経ブロック検討・ペインクリニック紹介'
      ],
      moderate: [
        '膝蓋下枝の触診評価',
        '鵞足炎・タナ障害との鑑別',
        '神経症状（しびれ・灼熱感）の詳細評価'
      ]
    }
  }
};

// モジュールとしてエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SCORING_CONFIG;
}
