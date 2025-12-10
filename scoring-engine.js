/**
 * 膝痛問診チェックリスト - スコアリングエンジン
 * スコア計算・確率変換（7カテゴリ対応：鵞足炎・PFPS・タナ障害・Hoffa脂肪体炎・半月板損傷・伏在神経障害・その他）
 */

class ScoringEngine {
    constructor(config) {
        this.config = config;
        this.scores = { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0, other: 0 };
        this.contributingFactors = [];
        this.redFlags = [];
    }

    /**
     * スコアをリセット
     */
    reset() {
        this.scores = { pes: 0, pfps: 0, plica: 0, hoffa: 0, meniscus: 0, saphenous: 0, other: 0 };
        this.contributingFactors = [];
        this.redFlags = [];
    }

    /**
     * スコアを追加
     */
    addScore(category, item, value, description) {
        const scoreData = this.getScoreData(category, item, value);
        if (!scoreData) return;

        ['pes', 'pfps', 'plica', 'hoffa', 'meniscus', 'saphenous', 'other'].forEach(disease => {
            if (scoreData[disease] !== undefined) {
                this.scores[disease] += scoreData[disease];

                // 寄与因子を記録（プラスのスコアのみ）
                if (scoreData[disease] > 0) {
                    this.contributingFactors.push({
                        disease,
                        category,
                        item,
                        value,
                        score: scoreData[disease],
                        description: scoreData.description || description || ''
                    });
                }
            }
        });
    }

    /**
     * 設定からスコアデータを取得
     */
    getScoreData(category, item, value) {
        const categoryData = this.config[category];
        if (!categoryData) return null;

        const itemData = categoryData[item];
        if (!itemData) return null;

        // 値が指定されている場合（例：陽性/陰性）
        if (value && typeof itemData === 'object' && itemData[value]) {
            return itemData[value];
        }

        // 値がなければアイテムそのものを返す
        return itemData;
    }

    /**
     * レッドフラッグをチェック
     */
    checkRedFlag(flagType) {
        const flagData = this.config.redFlags?.[flagType];
        if (flagData?.isRedFlag) {
            this.redFlags.push({
                type: flagType,
                description: flagData.description
            });
            return true;
        }
        return false;
    }

    /**
     * 背景因子を処理
     */
    processBackground(data) {
        // 年齢
        if (data.age !== undefined) {
            let ageCategory;
            if (data.age < 31) ageCategory = 'young';
            else if (data.age < 51) ageCategory = 'middle';
            else ageCategory = 'senior';
            this.addScore('background', 'age', ageCategory, `年齢：${data.age}歳`);
        }

        // BMI
        if (data.bmi !== undefined && data.bmi >= 25) {
            this.addScore('background', 'highBMI', null, `BMI ${data.bmi.toFixed(1)}`);
        }

        // 膝OA
        if (data.kneeOA) {
            this.addScore('background', 'kneeOA', null, '変形性膝関節症あり');
        }

        // スポーツ活動
        if (data.sportsActivity) {
            this.addScore('background', 'sportsActivity', data.sportsActivity, 'スポーツ活動');
        }

        // 膝手術歴（伏在神経用）
        if (data.kneeHistory) {
            this.addScore('background', 'kneeHistory', data.kneeHistory, '膝手術/注射歴');
        }
    }

    /**
     * 症状を処理
     */
    processSymptoms(data) {
        // 痛みの主座
        if (data.painLocation) {
            data.painLocation.forEach(loc => {
                this.addScore('painLocation', loc, null, '痛みの部位');
            });
        }

        // 誘発動作
        if (data.provocativeMovements) {
            data.provocativeMovements.forEach(mov => {
                this.addScore('provocativeMovements', mov, null, '誘発動作');
            });
        }

        // レッドフラッグチェック
        if (data.restPain) this.checkRedFlag('restPain');
        if (data.nightPain) this.checkRedFlag('nightPain');
        if (data.fever) this.checkRedFlag('fever');
        if (data.severeSwelling) this.checkRedFlag('severeSwelling');

        // 症状の性質
        if (data.catchingClicking) {
            this.addScore('symptomCharacter', 'catchingClicking', null, '引っかかり感');
        }
        if (data.locking) {
            this.addScore('symptomCharacter', 'locking', null, 'ロッキング');
        }
        if (data.instability) {
            this.addScore('symptomCharacter', 'instability', null, '不安定感');
        }
        if (data.localSwelling) {
            this.addScore('symptomCharacter', 'localSwelling', null, '局所腫脹');
        }
        if (data.localHeat) {
            this.addScore('symptomCharacter', 'localHeat', null, '熱感');
        }
        if (data.jointEffusion) {
            this.addScore('symptomCharacter', 'jointEffusion', null, '関節水腫');
        }
        // 伏在神経用
        if (data.burningTingling) {
            this.addScore('symptomCharacter', 'burningTingling', null, '灼熱感・ピリピリ感');
        }
        if (data.numbness) {
            this.addScore('symptomCharacter', 'numbness', null, 'しびれ');
        }
        // その他
        if (data.otherSymptom) {
            this.addScore('symptomCharacter', 'other', null, 'その他の症状');
        }
    }

    /**
     * 触診・検査を処理
     */
    processExamination(data) {
        // 触診
        if (data.tibialTenderness) {
            this.addScore('palpation', 'tibialTenderness', data.tibialTenderness, '鵞足部圧痛');
        }
        if (data.jointLineTenderness) {
            this.addScore('palpation', 'jointLineTenderness', null, '関節裂隙圧痛');
        }
        if (data.patellarFacetTenderness) {
            this.addScore('palpation', 'patellarFacetTenderness', null, 'ファセット圧痛');
        }
        if (data.plicaPalpation) {
            this.addScore('palpation', 'plicaPalpation', null, '棚触知＋圧痛');
        }
        if (data.tibialNodule) {
            this.addScore('palpation', 'tibialNodule', null, '脛骨内側結節');
        }
        if (data.hoffaTenderness) {
            this.addScore('palpation', 'hoffaTenderness', null, 'Hoffa脂肪体圧痛');
        }
        // 伏在神経用
        if (data.infrapatellarBranchTenderness) {
            this.addScore('palpation', 'infrapatellarBranchTenderness', null, '膝蓋下枝圧痛');
        }

        // 徒手検査
        if (data.valgusStress) {
            this.addScore('manualTests', 'valgusStress', data.valgusStress, '外反ストレステスト');
        }
        if (data.squatPain) {
            this.addScore('manualTests', 'squatPain', null, 'スクワット痛');
        }
        if (data.clarkeTest) {
            this.addScore('manualTests', 'clarkeTest', data.clarkeTest, 'Clarkeテスト');
        }
        if (data.patellarTilt) {
            this.addScore('manualTests', 'patellarTilt', data.patellarTilt, '膝蓋骨傾斜テスト');
        }
        if (data.apprehension) {
            this.addScore('manualTests', 'apprehension', data.apprehension, '不安テスト');
        }
        if (data.mppTest) {
            this.addScore('manualTests', 'mppTest', data.mppTest, 'MPPテスト');
        }
        if (data.stutterTest) {
            this.addScore('manualTests', 'stutterTest', data.stutterTest, 'Stutterテスト');
        }
        if (data.hoffaTest) {
            this.addScore('manualTests', 'hoffaTest', data.hoffaTest, 'Hoffaテスト');
        }
        if (data.mcMurrayTest) {
            this.addScore('manualTests', 'mcMurrayTest', data.mcMurrayTest, 'McMurrayテスト');
        }
        if (data.apleyTest) {
            this.addScore('manualTests', 'apleyTest', data.apleyTest, 'Apleyテスト');
        }
        if (data.thessalyTest) {
            this.addScore('manualTests', 'thessalyTest', data.thessalyTest, 'Thessalyテスト');
        }
        // 伏在神経用
        if (data.tinelSign) {
            this.addScore('manualTests', 'tinelSign', data.tinelSign, 'Tinel徴候');
        }
    }

    /**
     * 画像所見を処理
     */
    processImaging(data) {
        // X線
        if (data.xrayOA) {
            this.addScore('imaging', 'xray', 'oaChanges', 'X線OA所見');
        }
        if (data.xrayPesSpurs) {
            this.addScore('imaging', 'xray', 'pesSpurs', '鵞足部骨棘');
        }
        if (data.xrayPatellar) {
            this.addScore('imaging', 'xray', 'patellarMalalignment', '膝蓋骨異常');
        }

        // 超音波
        if (data.usPesBursa) {
            const scoreData = this.config.imaging.ultrasound.pesBursaSwelling;
            this.scores.pes += scoreData.pes;
            this.contributingFactors.push({
                disease: 'pes',
                score: scoreData.pes,
                description: scoreData.description
            });
        }
        if (data.usPlica) {
            const scoreData = this.config.imaging.ultrasound.plicaThickening;
            this.scores.plica += scoreData.plica;
            this.contributingFactors.push({
                disease: 'plica',
                score: scoreData.plica,
                description: scoreData.description
            });
        }
        if (data.usPatellarTendon) {
            const scoreData = this.config.imaging.ultrasound.patellarTendonChanges;
            this.scores.pfps += scoreData.pfps;
            this.scores.hoffa += scoreData.hoffa;
            this.contributingFactors.push({
                disease: 'pfps',
                score: scoreData.pfps,
                description: scoreData.description
            });
        }
        if (data.usHoffa) {
            const scoreData = this.config.imaging.ultrasound.hoffaSwelling;
            this.scores.hoffa += scoreData.hoffa;
            this.contributingFactors.push({
                disease: 'hoffa',
                score: scoreData.hoffa,
                description: scoreData.description
            });
        }
        if (data.usMeniscus) {
            const scoreData = this.config.imaging.ultrasound.meniscusExtrusion;
            this.scores.meniscus += scoreData.meniscus;
            this.contributingFactors.push({
                disease: 'meniscus',
                score: scoreData.meniscus,
                description: scoreData.description
            });
        }
        // 伏在神経用
        if (data.usSaphenous) {
            const scoreData = this.config.imaging.ultrasound.saphenousNerveSwelling;
            this.scores.saphenous += scoreData.saphenous;
            this.contributingFactors.push({
                disease: 'saphenous',
                score: scoreData.saphenous,
                description: scoreData.description
            });
        }

        // MRI
        if (data.mriPes) {
            const scoreData = this.config.imaging.mri.pesTendonChanges;
            this.scores.pes += scoreData.pes;
            this.contributingFactors.push({
                disease: 'pes',
                score: scoreData.pes,
                description: scoreData.description
            });
        }
        if (data.mriPlica) {
            const scoreData = this.config.imaging.mri.plicaEdema;
            this.scores.plica += scoreData.plica;
            this.contributingFactors.push({
                disease: 'plica',
                score: scoreData.plica,
                description: scoreData.description
            });
        }
        if (data.mriPF) {
            const scoreData = this.config.imaging.mri.pfCartilage;
            this.scores.pfps += scoreData.pfps;
            this.contributingFactors.push({
                disease: 'pfps',
                score: scoreData.pfps,
                description: scoreData.description
            });
        }
        if (data.mriHoffa) {
            const scoreData = this.config.imaging.mri.hoffaEdema;
            this.scores.hoffa += scoreData.hoffa;
            this.contributingFactors.push({
                disease: 'hoffa',
                score: scoreData.hoffa,
                description: scoreData.description
            });
        }
        if (data.mriMeniscus) {
            const scoreData = this.config.imaging.mri.meniscusTear;
            this.scores.meniscus += scoreData.meniscus;
            this.contributingFactors.push({
                disease: 'meniscus',
                score: scoreData.meniscus,
                description: scoreData.description
            });
        }
        // 伏在神経用
        if (data.mriSaphenous) {
            const scoreData = this.config.imaging.mri.saphenousNerveSignal;
            this.scores.saphenous += scoreData.saphenous;
            this.contributingFactors.push({
                disease: 'saphenous',
                score: scoreData.saphenous,
                description: scoreData.description
            });
        }
        if (data.mriMeniscusLigament) {
            const scoreData = this.config.imaging.mri.meniscusLigament;
            this.scores.pes += scoreData.pes;
            this.scores.pfps += scoreData.pfps;
            this.scores.plica += scoreData.plica;
            this.scores.hoffa += scoreData.hoffa;
            this.scores.saphenous += scoreData.saphenous;
        }
    }

    /**
     * 最終計算を実行
     */
    calculate() {
        // マイナス値を0に切り上げ
        this.scores.pes = Math.max(0, this.scores.pes);
        this.scores.pfps = Math.max(0, this.scores.pfps);
        this.scores.plica = Math.max(0, this.scores.plica);
        this.scores.hoffa = Math.max(0, this.scores.hoffa);
        this.scores.meniscus = Math.max(0, this.scores.meniscus);
        this.scores.saphenous = Math.max(0, this.scores.saphenous);
        this.scores.other = Math.max(0, this.scores.other);

        const sum = this.scores.pes + this.scores.pfps + this.scores.plica + this.scores.hoffa + this.scores.meniscus + this.scores.saphenous + this.scores.other;

        // 相対確率
        const probabilities = {
            pes: sum > 0 ? Math.round((this.scores.pes / sum) * 100) : 0,
            pfps: sum > 0 ? Math.round((this.scores.pfps / sum) * 100) : 0,
            plica: sum > 0 ? Math.round((this.scores.plica / sum) * 100) : 0,
            hoffa: sum > 0 ? Math.round((this.scores.hoffa / sum) * 100) : 0,
            meniscus: sum > 0 ? Math.round((this.scores.meniscus / sum) * 100) : 0,
            saphenous: sum > 0 ? Math.round((this.scores.saphenous / sum) * 100) : 0,
            other: sum > 0 ? Math.round((this.scores.other / sum) * 100) : 0
        };

        // 合計が100%になるよう調整
        const total = probabilities.pes + probabilities.pfps + probabilities.plica + probabilities.hoffa + probabilities.meniscus + probabilities.saphenous + probabilities.other;
        if (total !== 100 && sum > 0) {
            const diff = 100 - total;
            // 最大のものに差分を加える
            const maxKey = Object.keys(probabilities).reduce((a, b) =>
                probabilities[a] > probabilities[b] ? a : b
            );
            probabilities[maxKey] += diff;
        }

        // 絶対カテゴリ
        const categories = {};
        ['pes', 'pfps', 'plica', 'hoffa', 'meniscus', 'saphenous', 'other'].forEach(disease => {
            const ratio = (this.scores[disease] / this.config.maxScore) * 100;
            if (ratio <= this.config.categories.low.max) {
                categories[disease] = 'low';
            } else if (ratio <= this.config.categories.moderate.max) {
                categories[disease] = 'moderate';
            } else {
                categories[disease] = 'high';
            }
        });

        // 寄与因子をスコア順にソート
        const topFactors = {};
        ['pes', 'pfps', 'plica', 'hoffa', 'meniscus', 'saphenous', 'other'].forEach(disease => {
            topFactors[disease] = this.contributingFactors
                .filter(f => f.disease === disease)
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);
        });

        // 推奨アクションを取得
        const recommendations = {};
        ['pes', 'pfps', 'plica', 'hoffa', 'meniscus', 'saphenous', 'other'].forEach(disease => {
            const cat = categories[disease];
            if (cat === 'high') {
                recommendations[disease] = this.config.recommendations[disease]?.high || [];
            } else if (cat === 'moderate') {
                recommendations[disease] = this.config.recommendations[disease]?.moderate || [];
            }
        });

        return {
            rawScores: { ...this.scores },
            probabilities,
            categories,
            topFactors,
            recommendations,
            redFlags: this.redFlags,
            hasRedFlags: this.redFlags.length > 0
        };
    }

    /**
     * カテゴリラベルを取得
     */
    getCategoryLabel(category) {
        return this.config.categories[category]?.label || category;
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.ScoringEngine = ScoringEngine;
}
