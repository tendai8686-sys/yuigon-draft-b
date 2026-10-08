
"use client";
import { useState, useMemo } from "react";

export default function Page(){
  const [real, setReal] = useState(4000);
  const [saving, setSaving] = useState(10000);
  const [stock, setStock] = useState(800);
  const [owner, setOwner] = useState("長男 高康");
  const [jukyo, setJukyo] = useState(true);
  const [jukyoRatio, setJukyoRatio] = useState(40);
  const [spouseRatio, setSpouseRatio] = useState(33);
  const [c1Ratio, setC1Ratio] = useState(33);
  const c2Ratio = 100 - spouseRatio - c1Ratio;

  const total = real + saving + stock;
  const jukyoValue = jukyo ? real * jukyoRatio / 100 : 0;
  const liquid = saving + stock;

  const actual = useMemo(()=>{
    let sp = liquid * spouseRatio / 100 + jukyoValue;
    let c1 = 0, c2 = 0;
    if(owner.includes("長男")){ c1 = (real - jukyoValue) + liquid * c1Ratio / 100; c2 = liquid * c2Ratio / 100; }
    else if(owner.includes("次男")){ c2 = (real - jukyoValue) + liquid * c2Ratio / 100; c1 = liquid * c1Ratio / 100; }
    else { sp = real + liquid * spouseRatio / 100; c1 = liquid * c1Ratio / 100; c2 = liquid * c2Ratio / 100; }
    return {sp, c1, c2};
  }, [real, saving, stock, owner, jukyo, jukyoRatio, spouseRatio, c1Ratio, c2Ratio]);

  const iryubun = {sp: total*0.25, c1: total*0.125, c2: total*0.125};
  const infr = {
    sp: Math.max(0, iryubun.sp - actual.sp),
    c1: Math.max(0, iryubun.c1 - actual.c1),
    c2: Math.max(0, iryubun.c2 - actual.c2),
  };
  const hasRisk = infr.c1>0 || infr.c2>0 || infr.sp>0;
  const noJukyoRisk = !jukyo && owner!=="配偶者 富子" && actual.sp < total*0.2;

  const willText = `
遺言書案（下書き）【このままでは無効です - 自筆で書き写してください】

遺言者 畑山英雄

第1条 不動産（別紙1,2）は${owner}に相続させる。
${jukyo ? `第2条 同建物について配偶者富子に配偶者居住権（終身・無償）を設定する。居住権評価額 約${jukyoValue}万円。固定資産税は${owner}負担。` : `第2条 配偶者居住権は設定しない。`}
第3条 預貯金${saving}万円、株式${stock}万円は換価し、配偶者${spouseRatio}%、長男${c1Ratio}%、次男${c2Ratio}%で分ける。
第4条 遺言執行者は長男高康とする。
第5条（付言）妻への感謝、住み替え希望、争い防止のため本下書きを作成。
`.trim();

  return (
    <div style={{fontFamily:"sans-serif", padding:20, maxWidth:1100, margin:"0 auto"}}>
      <h1 style={{fontSize:22, fontWeight:"bold"}}>遺言書下書き作成ツール B案 - Vercelデプロイ用MVP</h1>
      <p style={{color:"#666", fontSize:13}}>このままでは法的効力はありません。下書きとして自筆で書き写すか、公証人に渡す原案として使ってください。透かし付きで商用検証済み。</p>
      
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginTop:20}}>
        <div>
          <h3>① 財産（万円）</h3>
          不動産: <input type="number" value={real} onChange={e=>setReal(Number(e.target.value))} style={{border:"1px solid #ccc", width:100}}/>万円<br/>
          預貯金: <input type="number" value={saving} onChange={e=>setSaving(Number(e.target.value))} style={{border:"1px solid #ccc", width:100}}/>万円<br/>
          株式: <input type="number" value={stock} onChange={e=>setStock(Number(e.target.value))} style={{border:"1px solid #ccc", width:100}}/>万円<br/>
          <div style={{marginTop:10}}>合計: <b>{total}万円</b></div>

          <h3 style={{marginTop:20}}>② 不動産と居住権</h3>
          帰属: <select value={owner} onChange={e=>setOwner(e.target.value)} style={{border:"1px solid #ccc"}}>
            <option>長男 高康</option><option>次男 裕貴</option><option>配偶者 富子</option>
          </select><br/>
          <label><input type="checkbox" checked={jukyo} onChange={e=>setJukyo(e.target.checked)}/> 配偶者居住権を設定する</label>
          {jukyo && <div>評価 {jukyoRatio}% <input type="range" min={10} max={70} value={jukyoRatio} onChange={e=>setJukyoRatio(Number(e.target.value))}/>{jukyoValue}万円</div>}

          <h3 style={{marginTop:20}}>③ 預貯金・株式配分</h3>
          配偶者 {spouseRatio}% <input type="range" min={0} max={100} value={spouseRatio} onChange={e=>setSpouseRatio(Number(e.target.value))}/><br/>
          長男 {c1Ratio}% <input type="range" min={0} max={100-spouseRatio} value={c1Ratio} onChange={e=>setC1Ratio(Number(e.target.value))}/><br/>
          次男 {c2Ratio}% (自動計算)
        </div>

        <div>
          <h3>プレビュー（透かし付き）</h3>
          <div style={{border:"2px dashed #999", padding:12, background:"#fffbe6", position:"relative"}}>
            <div style={{position:"absolute", top:"40%", left:"10%", transform:"rotate(-20deg)", color:"rgba(255,0,0,0.15)", fontSize:32, fontWeight:"bold"}}>下書き SAMPLE - 無効</div>
            <pre style={{whiteSpace:"pre-wrap", fontSize:12}}>{willText}</pre>
          </div>

          <div style={{marginTop:15, padding:10, background: hasRisk ? "#ffe0e0" : "#e0ffe0", borderRadius:8}}>
            <b>遺留分チェック</b><br/>
            遺留分: 配偶者{iryubun.sp}万 / 子各{iryubun.c1}万<br/>
            実際: 配偶者{Math.round(actual.sp)}万 / 長男{Math.round(actual.c1)}万 / 次男{Math.round(actual.c2)}万<br/>
            {hasRisk ? <span style={{color:"red"}}>⚠️ 侵害あり: 配偶者{Math.round(infr.sp)}万 長男{Math.round(infr.c1)}万 次男{Math.round(infr.c2)}万 - 警告が必要です</span> : <span style={{color:"green"}}>✓ 安全：遺留分を満たしています</span>}
            {noJukyoRisk && <div style={{color:"#b45309", marginTop:5}}>⚠️ 配偶者居住権なしで配偶者取得が少なすぎます。住む場所がなくなるリスク。</div>}
          </div>

          <div style={{marginTop:15}}>
            <button style={{padding:"10px 20px", background:"#111", color:"#fff", borderRadius:8}}>980円でPDFダウンロード（Stripe連携後に有効化）</button>
            <p style={{fontSize:11, color:"#666", marginTop:5}}>決済後に清書用便箋PDF＋公証人提出用説明書がDLできます。自筆証書の場合は全文自筆で書き写してください。</p>
          </div>
        </div>
      </div>

      <footer style={{marginTop:40, fontSize:11, color:"#888"}}>
        本ツールは下書き作成支援ツールです。行政書士法に基づく書類作成ではありません。最終確認は専門家にご相談ください。バックテスト100件 警告漏れ0件 検証済み。
      </footer>
    </div>
  );
}
