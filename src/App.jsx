import { useState, useEffect, useMemo } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Building2, FileText, Users, CheckCircle2, Clock, Download, Plus,
  Search, ChevronRight, Briefcase, TrendingUp, AlertCircle,
  LogOut, User, Lock, Eye, EyeOff, Trash2, Edit3, Save, ArrowLeft,
  Calendar, DollarSign, Scale, Gavel, Target, BarChart3, Activity,
  ShieldCheck, ShieldAlert, ShieldX, Shield, Home, Database,
  ClipboardCheck, Coins, Info, Upload, X, FileUp, FolderOpen, Sparkles
} from "lucide-react";
import { db } from "./firebase.js";
import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot
} from "firebase/firestore";

const C = {
  navy:"#0B2545", navyDeep:"#081A33", navyLight:"#1A3A5F",
  gold:"#B08D57", goldLight:"#D4B883",
  cream:"#F5F2EC", charcoal:"#2F2F2F",
  greyMid:"#6B6B6B", greySoft:"#E8E8E8", greyBg:"#F8F6F2",
  green:"#2E7D32", greenSoft:"#E8F5E9",
  amber:"#B08D57", amberSoft:"#FFF8E1",
  red:"#B71C1C", redSoft:"#FFEBEE",
  purple:"#6B3FA0", purpleSoft:"#F0EBF8",
};

const WORKER_URL = "https://factor-legal-extract.jmercado.workers.dev";

const ENTIDADES = [
  {id:"policia",nombre:"Policía Nacional",minDef:false},
  {id:"ejercito",nombre:"Ejército Nacional",minDef:true},
  {id:"armada",nombre:"Armada Nacional",minDef:true},
  {id:"fac",nombre:"Fuerza Aérea Colombiana",minDef:true},
  {id:"sanidad",nombre:"Dirección de Sanidad",minDef:true},
  {id:"jpm",nombre:"Justicia Penal Militar",minDef:true},
  {id:"inpec",nombre:"INPEC",minDef:false},
  {id:"invias",nombre:"Invías",minDef:false},
  {id:"fiscalia",nombre:"Fiscalía General de la Nación",minDef:false},
  {id:"ramaJudicial",nombre:"Rama Judicial",minDef:false},
  {id:"congreso",nombre:"Congreso de la República",minDef:false},
  {id:"hospitalMilitar",nombre:"Hospital Militar",minDef:false},
  {id:"hospitalNaval",nombre:"Hospital Naval Cartagena",minDef:false},
];
const TIPOS_PROCESO = [
  {id:"reparacionDirecta",nombre:"Reparación directa"},
  {id:"nulidadRest",nombre:"Nulidad y restablecimiento del derecho"},
];
const ESCENARIOS = [
  {id:"sentencia",nombre:"Sentencia (proceso judicial)"},
  {id:"concJud",nombre:"Conciliación judicial"},
  {id:"concExtra",nombre:"Conciliación extrajudicial"},
];
const REGIMENES = [
  {id:"cca",nombre:"CCA (sistema antiguo)"},
  {id:"cpaca",nombre:"CPACA"},
];
const SMLMV = 1423500;
const UVT   = 49799;

const DOCS = {
  sentencia:[
    {id:"propAceptada",label:"Propuesta aceptada",req:true},
    {id:"poderesIni",label:"Poderes iniciales",req:true},
    {id:"sent1",label:"Sentencia de primera instancia",req:true},
    {id:"sent2",label:"Sentencia de segunda instancia",req:false},
    {id:"autoAclara",label:"Auto que aclara y/o adiciona",req:false},
    {id:"constEjec",label:"Constancia de ejecutoria y vigencia de poderes",req:true},
    {id:"cuentaCobro",label:"Cuenta de cobro con sello/guía de envío",req:true},
    {id:"oficio2469",label:"Oficio Decreto 2469/2015 (solo MinDefensa)",req:false,cond:"minDef"},
    {id:"sarlaft",label:"Sarlaft por beneficiario",req:true},
    {id:"resolLiq",label:"Resolución u oficio que liquida la condena (N&R)",req:false,cond:"nyr"},
    {id:"docBenef",label:"Documentos de identificación de beneficiarios",req:true},
    {id:"docApod",label:"Documentos de identificación del apoderado",req:true},
    {id:"samai1",label:"Consulta SAMAI 1ra instancia",req:true},
    {id:"samai2",label:"Consulta SAMAI 2da instancia (si aplica)",req:false},
    {id:"poderesCeder",label:"Poderes para ceder (autenticados)",req:false},
    {id:"dpDian",label:"DP consulta obligaciones DIAN",req:false},
    {id:"pazSalvoHon",label:"Paz y salvo honorarios apoderados anteriores",req:false},
    {id:"soporteNotif",label:"Soportes de notificación del fallo",req:false},
  ],
  concJud:[
    {id:"propAceptada",label:"Propuesta aceptada",req:true},
    {id:"poderesIni",label:"Poderes iniciales",req:true},
    {id:"fallo1",label:"Fallo de primera instancia",req:true},
    {id:"actaCTC",label:"Acta del comité técnico de conciliación",req:true},
    {id:"actaAud",label:"Acta de audiencia de conciliación",req:true},
    {id:"autoAprueba",label:"Auto que aprueba la conciliación",req:true},
    {id:"constEjec",label:"Constancia de ejecutoria y vigencia de poderes",req:true},
    {id:"cuentaCobro",label:"Cuenta de cobro con sello/guía de envío",req:true},
    {id:"oficio2469",label:"Oficio Decreto 2469/2015 (solo MinDefensa)",req:false,cond:"minDef"},
    {id:"sarlaft",label:"Sarlaft por beneficiario",req:true},
    {id:"docBenef",label:"Documentos de identificación de beneficiarios",req:true},
    {id:"docApod",label:"Documentos de identificación del apoderado",req:true},
    {id:"samai1",label:"Consulta SAMAI 1ra instancia",req:true},
    {id:"poderesCeder",label:"Poderes para ceder (autenticados)",req:false},
    {id:"dpDian",label:"DP consulta obligaciones DIAN",req:false},
    {id:"pazSalvoHon",label:"Paz y salvo honorarios apoderados anteriores",req:false},
  ],
  concExtra:[
    {id:"propAceptada",label:"Propuesta aceptada",req:true},
    {id:"poderesIni",label:"Poderes iniciales",req:true},
    {id:"actaCTC",label:"Acta del comité técnico de conciliación",req:true},
    {id:"actaAud",label:"Acta de audiencia de conciliación ante Procuraduría",req:true},
    {id:"autoAprueba",label:"Auto que aprueba la conciliación",req:true},
    {id:"constEjec",label:"Constancia de ejecutoria y vigencia de poderes",req:true},
    {id:"cuentaCobro",label:"Cuenta de cobro con sello/guía de envío",req:true},
    {id:"oficio2469",label:"Oficio Decreto 2469/2015 (solo MinDefensa)",req:false,cond:"minDef"},
    {id:"sarlaft",label:"Sarlaft por beneficiario",req:true},
    {id:"docBenef",label:"Documentos de identificación de beneficiarios",req:true},
    {id:"docApod",label:"Documentos de identificación del apoderado",req:true},
    {id:"samai1",label:"Consulta SAMAI 1ra instancia",req:true},
    {id:"poderesCeder",label:"Poderes para ceder (autenticados)",req:false},
    {id:"dpDian",label:"DP consulta obligaciones DIAN",req:false},
    {id:"pazSalvoHon",label:"Paz y salvo honorarios apoderados anteriores",req:false},
  ],
};

function evaluarCaso(caso) {
  const alertas = [];
  const entidad = ENTIDADES.find(e => e.id === caso.entidad);
  if (!entidad) alertas.push({tipo:"rechazo",titulo:"Entidad no admisible",detalle:"La entidad no se encuentra dentro del perímetro admisible."});
  if (caso.tipoProceso==="nulidadRest"&&(caso.entidad==="ramaJudicial"||caso.entidad==="fiscalia"))
    alertas.push({tipo:"rechazo",titulo:"Tipología no admisible",detalle:"N&R contra Rama Judicial o Fiscalía no son objeto de compra."});
  if (caso.fechaEjecutoria&&caso.fechaCuentaCobro) {
    const diff=(new Date(caso.fechaCuentaCobro)-new Date(caso.fechaEjecutoria))/(1000*60*60*24*365.25);
    if (diff>5) alertas.push({tipo:"rechazo",titulo:"Prescripción de la obligación",detalle:`Cuenta de cobro radicada ${diff.toFixed(2)} años después de la ejecutoria. Supera el término de 5 años.`});
  }
  if (!caso.fechaCuentaCobro) alertas.push({tipo:"pendiente",titulo:"Cuenta de cobro pendiente",detalle:"No se ha registrado fecha de radicación de la cuenta de cobro."});
  if (!caso.fechaEjecutoria) alertas.push({tipo:"pendiente",titulo:"Constancia de ejecutoria pendiente",detalle:"Sin fecha de ejecutoria registrada."});
  const motivos={conciliadoIntCorrientes:"Fallo conciliado con intereses corrientes/DTF.",conciliadoSinInt:"Fallo conciliado sin pago de intereses.",policiaSMLMVPago:"Policía: pago en SMLMV al momento del pago.",reparacionIntIPC:"Reparación directa: intereses + IPC.",ramaSinArtPago:"Rama Judicial: sin artículos de pago en resolutiva."};
  if (caso.afectacionIntereses&&caso.afectacionIntereses!=="ninguna"&&motivos[caso.afectacionIntereses])
    alertas.push({tipo:"rechazo",titulo:"Afectación de intereses de pago",detalle:motivos[caso.afectacionIntereses]+" Causal de rechazo."});
  const capitalM=parseFloat(caso.valorCapital)||0;
  const desembolsoM=parseFloat(caso.valorDesembolso)||0;
  if (capitalM>0&&capitalM<70) alertas.push({tipo:"alerta",titulo:"Capital por debajo del umbral",detalle:`Capital COP ${capitalM} M inferior al mínimo de COP 70 M.`});
  if (desembolsoM>0&&desembolsoM<100) alertas.push({tipo:"alerta",titulo:"Desembolso por debajo del umbral",detalle:`Desembolso COP ${desembolsoM} M inferior al mínimo de COP 100 M.`});
  const condenaM=parseFloat(caso.valorTotalCondenaResolutiva)||0;
  const smlmvCond=condenaM*1000000/SMLMV;
  if (caso.regimen==="cca"&&smlmvCond>=300&&caso.unicaInstancia&&!caso.gradoConsultaSurtido)
    alertas.push({tipo:"alerta",titulo:"Grado jurisdiccional de consulta pendiente",detalle:`Condena ${smlmvCond.toFixed(0)} SMLMV en única instancia. Acreditar auto de consulta.`});
  const porcHon=parseFloat(caso.porcHonorarios)||0;
  if (porcHon>50) alertas.push({tipo:"alerta",titulo:"Honorarios elevados",detalle:`Honorarios (${porcHon}%) exceden el 50% de la condena.`});
  if (caso.fechaEjecutoria) {
    const anios=(new Date()-new Date(caso.fechaEjecutoria))/(1000*60*60*24*365.25);
    if (anios>=5&&!caso.ejecutivoRadicado) alertas.push({tipo:"rechazo",titulo:"Prescripción por inacción ejecutiva",detalle:"Más de 5 años sin proceso ejecutivo radicado."});
    else if (anios>=4&&!caso.ejecutivoRadicado) alertas.push({tipo:"alerta",titulo:"Proceso ejecutivo por conexidad",detalle:`${anios.toFixed(1)} años sin ejecutivo radicado.`});
  }
  if (caso.tipoCesion==="total"&&!caso.poderesPorcCuotaLitis&&!caso.contratoPS)
    alertas.push({tipo:"alerta",titulo:"Porcentaje de honorarios no constatado",detalle:"Cesión 100% sin poder con cuota litis ni contrato PS."});
  const numMenores=parseInt(caso.numMenores)||0;
  if (numMenores>0&&caso.tipoBeneficiariosMenores==="directos")
    alertas.push({tipo:"alerta",titulo:"Retención por menores de edad",detalle:`${numMenores} menor(es) directo(s). Retención COP 1.000.000 c/u.`});
  if (caso.antecedentesGraves) alertas.push({tipo:"alerta",titulo:"Antecedentes judiciales graves",detalle:"Beneficiarios o apoderado en listas restrictivas."});
  if (caso.demandaAlimentos) alertas.push({tipo:"alerta",titulo:"Demanda activa por alimentos",detalle:"Excluir beneficiario de la cesión."});
  if (caso.sucesion&&(condenaM*1000000)>(1680*UVT)&&!caso.pazSalvoDianCausante)
    alertas.push({tipo:"pendiente",titulo:"Paz y salvo DIAN del causante pendiente",detalle:`Condena superior a 1.680 UVT (COP ${(1680*UVT/1000000).toFixed(1)} M).`});
  const docs=caso.documentos||{};
  const matriz=DOCS[caso.escenario]||[];
  const faltantes=matriz.filter(d=>{
    if (!d.req) return false;
    if (d.cond==="minDef"&&!entidad?.minDef) return false;
    if (d.cond==="nyr"&&caso.tipoProceso!=="nulidadRest") return false;
    return !docs[d.id];
  });
  if (faltantes.length>0) alertas.push({tipo:"pendiente",titulo:`Documentación obligatoria faltante (${faltantes.length})`,detalle:faltantes.map(d=>"• "+d.label).join("\n")});
  const tieneRechazo=alertas.some(a=>a.tipo==="rechazo");
  const tieneAlertas=alertas.some(a=>a.tipo==="alerta"||a.tipo==="pendiente");
  return {veredicto: tieneRechazo?"no_apto":tieneAlertas?"apto_con_alertas":"apto", alertas};
}

function calcKPIs(caso) {
  const capital=parseFloat(caso.valorCapital)||0;
  const intereses=parseFloat(caso.valorIntereses)||0;
  const desembolso=parseFloat(caso.valorDesembolso)||0;
  const nominal=capital+intereses;
  const descuento=nominal>0?((nominal-desembolso)/nominal)*100:0;
  const moic=desembolso>0?nominal/desembolso:0;
  let mesesEjec=null;
  if (caso.fechaEjecutoria) mesesEjec=Math.round((new Date()-new Date(caso.fechaEjecutoria))/(1000*60*60*24*30.44));
  return {capital,intereses,desembolso,nominal,descuento,moic,mesesEjec};
}

// localStorage for session-only user persistence (non-sensitive)
const lsGet = (key, fallback) => { try { const v=localStorage.getItem(key); return v?JSON.parse(v):fallback; } catch { return fallback; }};
const lsSet = (key, value) => { try { localStorage.setItem(key,JSON.stringify(value)); } catch {} };
const lsDel = (key) => { try { localStorage.removeItem(key); } catch {} };

const SEED_USERS = [
  {id:"u-ceo",username:"jesus",password:"fl2026",nombre:"Jesús — CEO Factor Legal",role:"admin"},
  {id:"u-leg",username:"analista",password:"fl2026",nombre:"Analista Jurídico",role:"analista"},
  {id:"u-com",username:"comercial",password:"fl2026",nombre:"Originación Comercial",role:"comercial"},
];

function Logo({size="md",showText=false}) {
  const dims={sm:32,md:44,lg:72};
  const s=dims[size]||44;
  // viewBox 200×144 → hex teal + nested squares/diamonds blue + center dot
  return (
    <div style={{display:"flex",alignItems:"center",gap:showText?10:0}}>
      <svg width={s} height={Math.round(s*144/200)} viewBox="0 0 200 144" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hexagon outline teal */}
        <polygon points="100,10 150,37.5 150,106.5 100,134 50,106.5 50,37.5" stroke="#3EC9D6" strokeWidth="2.5" fill="none"/>
        {/* 6 vertex dots teal */}
        {[[100,10],[150,37.5],[150,106.5],[100,134],[50,106.5],[50,37.5]].map(([cx,cy],i)=>(
          <circle key={i} cx={cx} cy={cy} r="4" fill="#3EC9D6"/>
        ))}
        {/* 8 lines hex-vertices → square corners */}
        {[[[100,10],[68,40]],[[100,10],[132,40]],[[150,37.5],[132,40]],[[150,106.5],[132,104]],[[100,134],[132,104]],[[100,134],[68,104]],[[50,106.5],[68,104]],[[50,37.5],[68,40]]].map(([[x1,y1],[x2,y2]],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3EC9D6" strokeWidth="1.4" opacity="0.7"/>
        ))}
        {/* Outer square blue */}
        <rect x="68" y="40" width="64" height="64" stroke="#1A4EC8" strokeWidth="2.2" fill="none"/>
        {/* Outer diamond blue */}
        <polygon points="100,40 132,72 100,104 68,72" stroke="#1A4EC8" strokeWidth="2.2" fill="none"/>
        {/* Inner square blue */}
        <rect x="84" y="56" width="32" height="32" stroke="#1A4EC8" strokeWidth="2" fill="none"/>
        {/* Inner diamond blue */}
        <polygon points="100,56 116,72 100,88 84,72" stroke="#1A4EC8" strokeWidth="1.8" fill="none"/>
        {/* Center dot teal */}
        <circle cx="100" cy="72" r="3.5" fill="#3EC9D6"/>
      </svg>
      {showText&&(
        <div style={{display:"flex",flexDirection:"column",lineHeight:1.1}}>
          <span style={{fontFamily:"'Georgia',serif",fontWeight:"bold",fontSize:s*0.38,color:"#0D1F4E",letterSpacing:"0.08em"}}>FACTOR</span>
          <span style={{fontFamily:"'Georgia',serif",fontWeight:"bold",fontSize:s*0.38,color:"#0D1F4E",letterSpacing:"0.08em"}}>LEGAL</span>
        </div>
      )}
    </div>
  );
}

function Badge({verdict}) {
  const cfg={apto:{bg:C.greenSoft,fg:C.green,Ic:ShieldCheck,lbl:"APTO"},apto_con_alertas:{bg:C.amberSoft,fg:C.amber,Ic:ShieldAlert,lbl:"APTO CON ALERTAS"},no_apto:{bg:C.redSoft,fg:C.red,Ic:ShieldX,lbl:"NO APTO"},sin_evaluar:{bg:C.greySoft,fg:C.greyMid,Ic:Shield,lbl:"SIN EVALUAR"}};
  const {bg,fg,Ic,lbl}=cfg[verdict]||cfg.sin_evaluar;
  return (<span style={{display:"inline-flex",alignItems:"center",gap:6,borderRadius:999,background:bg,color:fg,padding:"4px 10px",fontSize:10,fontWeight:"bold",letterSpacing:"0.1em"}}><Ic size={12} strokeWidth={2.2}/>{lbl}</span>);
}

function StatCard({label,value,sub,icon:Ic,accent=C.navy}) {
  return (
    <div style={{background:"white",border:`1px solid ${C.greySoft}`,borderTop:`3px solid ${accent}`,borderRadius:8,padding:20}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.12em",color:C.greyMid}}>{label}</div>
        {Ic&&<div style={{background:C.greyBg,borderRadius:6,padding:6}}><Ic size={16} style={{color:accent}}/></div>}
      </div>
      <div style={{fontWeight:"bold",color:C.navy,fontSize:26,fontFamily:"Georgia,serif",lineHeight:1.1}}>{value}</div>
      {sub&&<div style={{fontSize:11,fontStyle:"italic",marginTop:4,color:C.greyMid}}>{sub}</div>}
    </div>
  );
}

const inp={width:"100%",padding:"8px 12px",fontSize:13,borderRadius:6,border:`1px solid ${C.greySoft}`,background:C.greyBg,outline:"none",boxSizing:"border-box"};

// ─── PDF EXTRACTOR ─────────────────────────────────────────────
function PdfExtractor({ onExtracted, onSkip }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const ACCEPTED_TYPES = {
    pdf: { exts: [".pdf"], mime: ["application/pdf"], label: "PDF", color: "#dc2626" },
    word: { exts: [".docx",".doc"], mime: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/msword"], label: "Word", color: "#2563eb" },
    image: { exts: [".jpg",".jpeg",".png",".tiff",".tif"], mime: ["image/jpeg","image/png","image/tiff"], label: "Imagen", color: "#059669" },
  };
  const SKIP_FILES = ["thumbs.db",".ds_store","desktop.ini","icon\r",".__afpresource"];

  function getFileType(f) {
    const name = f.name.toLowerCase();
    if (SKIP_FILES.some(s => name === s || name.startsWith("."))) return null;
    for (const [type, cfg] of Object.entries(ACCEPTED_TYPES)) {
      if (cfg.exts.some(e => name.endsWith(e)) || cfg.mime.includes(f.type)) return type;
    }
    return null;
  }

  const MAX_FILE_SIZE_MB = 15;
  const MAX_TOTAL_SIZE_MB = 30;
  const MAX_FILE_COUNT = 20;

  function addFiles(fileList) {
    const all = Array.from(fileList);
    const valid = all.filter(f => getFileType(f) !== null);
    const skipped = all.length - valid.length;
    if (valid.length === 0) {
      setError("No se encontraron documentos válidos. Se aceptan PDF, Word (.docx) e imágenes (JPG, PNG).");
      return;
    }

    // Per-file size check
    const oversize = valid.filter(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversize.length > 0) {
      setError(`${oversize.length} archivo(s) superan el límite de ${MAX_FILE_SIZE_MB} MB por archivo: ${oversize.map(f=>f.name).join(", ")}. Por favor divide en partes más pequeñas.`);
      return;
    }

    setFiles(prev => {
      const names = new Set(prev.map(f => f.webkitRelativePath || f.name));
      const newFiles = valid.filter(f => !names.has(f.webkitRelativePath || f.name));
      const combined = [...prev, ...newFiles];

      // File count check
      if (combined.length > MAX_FILE_COUNT) {
        setError(`Límite de ${MAX_FILE_COUNT} documentos por análisis. Actualmente seleccionados: ${combined.length}. Elimina algunos e intenta de nuevo.`);
        return prev;
      }

      // Total size check
      const totalMB = combined.reduce((s, f) => s + f.size, 0) / 1024 / 1024;
      if (totalMB > MAX_TOTAL_SIZE_MB) {
        setError(`El peso total (${totalMB.toFixed(1)} MB) supera el límite de ${MAX_TOTAL_SIZE_MB} MB. Selecciona menos documentos o usa archivos más ligeros.`);
        return prev;
      }

      if (skipped > 0) setError(`Se omitieron ${skipped} archivo(s) no compatibles. Se cargaron ${newFiles.length} documentos válidos.`);
      else setError("");
      return combined;
    });
  }

  function removeFile(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  async function fileToBase64(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  async function compressIfNeeded(file) {
    const MAX_SIZE = 3 * 1024 * 1024; // 3MB
    if (file.size <= MAX_SIZE) return file;
    // Only attempt PDF compression — Word/images pass through unchanged
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) return file;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const compressed = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([compressed], { type: "application/pdf" });
      if (blob.size < file.size) {
        return new File([blob], file.name, { type: "application/pdf" });
      }
      return file;
    } catch {
      return file;
    }
  }

  async function extract() {
    if (files.length === 0) return;
    setLoading(true);
    setError("");
    const merged = {};

    try {
      for (let i = 0; i < files.length; i++) {
        setStatus(`Analizando documento ${i + 1} de ${files.length}: ${files[i].name}`);

        let compressed;
        try {
          compressed = await compressIfNeeded(files[i]);
        } catch {
          compressed = files[i];
        }

        let b64;
        try {
          b64 = await fileToBase64(compressed);
        } catch {
          console.warn(`No se pudo leer: ${files[i].name}`);
          continue;
        }

        try {
          const res = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pdfs: [b64] }),
          });

          if (!res.ok) {
            console.warn(`Error en doc ${i+1} (${files[i].name}): ${res.status}`);
            continue;
          }

          const data = await res.json();
          if (data.result) {
            for (const key of Object.keys(data.result)) {
              if (key === "beneficiarios" || key === "docsEncontrados") {
                merged[key] = [...(merged[key] || []), ...(data.result[key] || [])];
              } else if (data.result[key] !== null && data.result[key] !== undefined && data.result[key] !== "") {
                if (!merged[key]) merged[key] = data.result[key];
              }
            }
          }
        } catch (fetchErr) {
          console.warn(`Fetch falló en doc ${i+1}: ${fetchErr.message}`);
          continue;
        }
      }

      if (Object.keys(merged).length === 0) {
        throw new Error("No se pudo extraer información de los documentos. Verifica que los PDFs tengan texto legible.");
      }

      setStatus("¡Extracción completada!");
      setTimeout(() => onExtracted(merged), 800);

    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
      setStatus("");
    }
  }

  return (
    <div>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:C.purpleSoft,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
          <Sparkles size={26} style={{color:C.purple}}/>
        </div>
        <h2 style={{color:C.navy,fontSize:20,fontFamily:"Georgia,serif",margin:"0 0 6px"}}>Extracción inteligente con IA</h2>
        <p style={{fontSize:13,color:C.greyMid,margin:0}}>Sube PDFs, documentos Word, imágenes o una carpeta completa — la IA llenará el formulario automáticamente</p>
      </div>

      <div
        onDragOver={e=>{e.preventDefault();setDragOver(true);}}
        onDragLeave={()=>setDragOver(false)}
        onDrop={e=>{
          e.preventDefault();setDragOver(false);
          // Handle folder drop via items API for deeper folder support
          const dt=e.dataTransfer;
          if(dt.items){
            const fileArr=[];
            const readEntry=(entry,path="")=>new Promise(resolve=>{
              if(entry.isFile){
                entry.file(f=>{
                  Object.defineProperty(f,"webkitRelativePath",{value:path+f.name,configurable:true});
                  fileArr.push(f);resolve();
                },resolve);
              } else if(entry.isDirectory){
                const reader=entry.createReader();
                const readAll=(entries=[])=>reader.readEntries(batch=>{
                  if(!batch.length){
                    Promise.all(entries.map(e2=>readEntry(e2,path+entry.name+"/"))).then(resolve);
                  } else readAll([...entries,...batch]);
                });
                readAll();
              } else resolve();
            });
            Promise.all(Array.from(dt.items).map(item=>{
              const entry=item.webkitGetAsEntry&&item.webkitGetAsEntry();
              return entry?readEntry(entry):Promise.resolve();
            })).then(()=>addFiles(fileArr));
          } else {
            addFiles(dt.files);
          }
        }}
        onClick={()=>document.getElementById("pdf-input").click()}
        style={{border:`2px dashed ${dragOver?C.purple:C.greySoft}`,borderRadius:10,padding:"32px 20px",textAlign:"center",cursor:"pointer",background:dragOver?C.purpleSoft:"white",transition:"all 0.2s",marginBottom:16}}
      >
        <FolderOpen size={28} style={{color:dragOver?C.purple:C.greyMid,margin:"0 auto 10px"}}/>
        <div style={{fontSize:14,fontWeight:"500",color:dragOver?C.purple:C.navy,marginBottom:4}}>Arrastra archivos o carpetas aquí</div>
        <div style={{fontSize:12,color:C.greyMid,marginBottom:14}}>PDF, Word (.docx) e imágenes (JPG, PNG) — incluye subcarpetas</div>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}} onClick={e=>e.stopPropagation()}>
          <button onClick={()=>document.getElementById("pdf-input").click()}
            style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:6,border:`1.5px solid ${C.purple}`,background:"white",color:C.purple,fontSize:12,fontWeight:"bold",cursor:"pointer",letterSpacing:"0.06em"}}>
            <FileUp size={13}/>Archivos
          </button>
          <button onClick={()=>document.getElementById("folder-input").click()}
            style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:6,border:`1.5px solid ${C.navy}`,background:"white",color:C.navy,fontSize:12,fontWeight:"bold",cursor:"pointer",letterSpacing:"0.06em"}}>
            <FolderOpen size={13}/>Carpeta completa
          </button>
        </div>
        <input id="pdf-input" type="file" accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.tiff" multiple style={{display:"none"}}
          onChange={e=>addFiles(e.target.files)}/>
        <input id="folder-input" type="file" webkitdirectory="" multiple style={{display:"none"}}
          onChange={e=>addFiles(e.target.files)}/>
      </div>

      {files.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:6}}>
            <div style={{fontSize:11,fontWeight:"bold",letterSpacing:"0.1em",color:C.greyMid}}>
              {files.length} DOCUMENTO(S) — {(files.reduce((s,f)=>s+f.size,0)/1024/1024).toFixed(1)} MB total
            </div>
            <div style={{display:"flex",gap:6}}>
              {Object.entries(ACCEPTED_TYPES).map(([type,cfg])=>{
                const count=files.filter(f=>getFileType(f)===type).length;
                return count>0?(
                  <span key={type} style={{fontSize:10,fontWeight:"bold",padding:"2px 8px",borderRadius:999,background:cfg.color+"18",color:cfg.color,letterSpacing:"0.06em"}}>
                    {count} {cfg.label}
                  </span>
                ):null;
              })}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:220,overflowY:"auto",paddingRight:2}}>
            {files.map((f,i)=>{
              const type=getFileType(f);
              const cfg=ACCEPTED_TYPES[type]||{color:C.greyMid,label:"?"};
              const relPath=f.webkitRelativePath||"";
              const folder=relPath.includes("/")?relPath.split("/").slice(0,-1).join("/"):"";
              return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",background:C.greyBg,borderRadius:6,border:`1px solid ${C.greySoft}`}}>
                <span style={{fontSize:9,fontWeight:"bold",padding:"2px 5px",borderRadius:4,background:cfg.color+"22",color:cfg.color,flexShrink:0,minWidth:28,textAlign:"center"}}>{cfg.label}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,color:C.charcoal,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</div>
                  {folder&&<div style={{fontSize:10,color:C.greyMid,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📁 {folder}</div>}
                </div>
                <div style={{fontSize:10,color:f.size>3*1024*1024?C.amber:C.greyMid,flexShrink:0,fontWeight:f.size>3*1024*1024?"bold":"normal"}}>
                  {(f.size/1024/1024).toFixed(1)} MB{f.size>3*1024*1024?" ⚡":""}
                </div>
                <button onClick={e=>{e.stopPropagation();removeFile(i);}} style={{background:"none",border:"none",cursor:"pointer",padding:2,flexShrink:0}}>
                  <X size={13} style={{color:C.red}}/>
                </button>
              </div>
            );})}
          </div>
        </div>
      )}

      {error && (
        <div style={{background:C.redSoft,color:C.red,borderRadius:6,padding:"10px 14px",fontSize:12,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
          <AlertCircle size={14}/>{error}
        </div>
      )}

      {loading && (
        <div style={{background:C.purpleSoft,color:C.purple,borderRadius:6,padding:"12px 16px",fontSize:13,marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:16,height:16,border:`2px solid ${C.purple}`,borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite",flexShrink:0}}/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          {status}
        </div>
      )}

      <div style={{display:"flex",gap:12}}>
        <button onClick={extract} disabled={files.length===0||loading}
          style={{flex:1,padding:"12px",borderRadius:6,border:"none",
            background:files.length>0&&!loading?C.purple:"#ccc",
            color:"white",fontWeight:"bold",fontSize:13,
            cursor:files.length>0&&!loading?"pointer":"not-allowed",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <Sparkles size={15}/>
          {loading?status||"Analizando...":`Analizar ${files.length} documento(s) con IA`}
        </button>
        <button onClick={onSkip}
          style={{padding:"12px 20px",borderRadius:6,border:`1px solid ${C.greySoft}`,background:"white",color:C.greyMid,fontWeight:"bold",fontSize:13,cursor:"pointer"}}>
          Llenar manualmente
        </button>
      </div>
      <div style={{marginTop:12,fontSize:11,color:C.greyMid,textAlign:"center",fontStyle:"italic"}}>
        Máx. {MAX_FILE_COUNT} archivos · {MAX_FILE_SIZE_MB} MB por archivo · {MAX_TOTAL_SIZE_MB} MB total — los PDFs grandes se comprimen automáticamente
      </div>
    </div>
  );
}

// ─── LOGIN ─────────────────────────────────────────────────────
function Login({onLogin}) {
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [showPwd,setShowPwd]=useState(false);
  const [error,setError]=useState("");
  function submit() {
    const user=SEED_USERS.find(u=>u.username===username&&u.password===password);
    if (user) onLogin(user); else setError("Credenciales inválidas.");
  }
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:`linear-gradient(135deg,${C.navyDeep},${C.navy},${C.navyLight})`}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{background:"white",borderRadius:12,padding:"16px 24px",display:"inline-block",boxShadow:"0 4px 20px rgba(0,0,0,0.2)",marginBottom:16}}>
            <Logo size="lg" showText={true}/>
          </div>
          <div style={{fontStyle:"italic",color:C.goldLight,fontSize:11,letterSpacing:"0.18em"}}>DUE DILIGENCE PLATFORM</div>
        </div>
        <div style={{background:"white",borderRadius:12,padding:32,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
          <div style={{fontWeight:"bold",color:C.navy,fontSize:18,fontFamily:"Georgia,serif",marginBottom:4}}>Acceso institucional</div>
          <div style={{fontSize:12,fontStyle:"italic",color:C.greyMid,marginBottom:24}}>Plataforma de evaluación de elegibilidad</div>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:11,fontWeight:"bold",letterSpacing:"0.1em",color:C.navy,marginBottom:6}}>USUARIO</label>
            <div style={{position:"relative"}}>
              <User size={15} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.greyMid}}/>
              <input style={{...inp,paddingLeft:34}} value={username} placeholder="usuario"
                onChange={e=>setUsername(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:11,fontWeight:"bold",letterSpacing:"0.1em",color:C.navy,marginBottom:6}}>CONTRASEÑA</label>
            <div style={{position:"relative"}}>
              <Lock size={15} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.greyMid}}/>
              <input style={{...inp,paddingLeft:34,paddingRight:36}} type={showPwd?"text":"password"}
                value={password} placeholder="••••••"
                onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
              <button onClick={()=>setShowPwd(!showPwd)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.greyMid}}>
                {showPwd?<EyeOff size={15}/>:<Eye size={15}/>}
              </button>
            </div>
          </div>
          {error&&<div style={{background:C.redSoft,color:C.red,borderRadius:6,padding:"10px 12px",display:"flex",alignItems:"center",gap:8,fontSize:12,marginBottom:16}}><AlertCircle size={14}/>{error}</div>}
          <button onClick={submit} style={{width:"100%",padding:12,borderRadius:6,border:"none",background:C.navy,color:C.gold,fontWeight:"bold",fontSize:13,letterSpacing:"0.12em",cursor:"pointer"}}>INGRESAR</button>
          <div style={{marginTop:24,paddingTop:24,borderTop:`1px solid ${C.greySoft}`,fontSize:11,color:C.greyMid}}>
            <strong style={{color:C.navy}}>Usuarios disponibles:</strong>
            <div style={{marginTop:8,fontFamily:"monospace",lineHeight:2}}>
              <div>jesus / fl2026 <span style={{color:C.gold}}>(admin)</span></div>
              <div>analista / fl2026 <span style={{color:C.gold}}>(analista)</span></div>
              <div>comercial / fl2026 <span style={{color:C.gold}}>(comercial)</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavBtn({active,onClick,icon:Ic,label}) {
  return (
    <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:6,border:"none",cursor:"pointer",fontWeight:"bold",fontSize:12,letterSpacing:"0.08em",background:active?C.navy:"transparent",color:active?C.gold:C.greyMid}}>
      <Ic size={13}/>{label}
    </button>
  );
}

function Header({user,onLogout,view,setView}) {
  return (
    <header style={{background:"white",borderBottom:`1px solid ${C.greySoft}`,boxShadow:"0 1px 4px rgba(11,37,69,0.07)",position:"relative"}}>
      <div style={{height:3,background:C.gold,position:"absolute",top:0,left:0,right:0}}/>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:32}}>
          <Logo/>
          <nav style={{display:"flex",gap:4}}>
            <NavBtn active={view==="dashboard"} onClick={()=>setView("dashboard")} icon={Home} label="Dashboard"/>
            <NavBtn active={view==="casos"} onClick={()=>setView("casos")} icon={Database} label="Casos"/>
            <NavBtn active={view==="nuevo"} onClick={()=>setView("nuevo")} icon={Plus} label="Nuevo caso"/>
            {(user.role==="admin"||user.role==="analista")&&(
              <button onClick={()=>setView("nerak")} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:6,border:"none",cursor:"pointer",fontWeight:"bold",fontSize:12,letterSpacing:"0.08em",background:view==="nerak"?C.purple:"transparent",color:view==="nerak"?"white":C.purple}}>
                <Sparkles size={13}/>Nerak Legal
              </button>
            )}
          </nav>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{textAlign:"right",lineHeight:1.3}}>
            <div style={{fontSize:13,fontWeight:"bold",color:C.navy}}>{user.nombre}</div>
            <div style={{fontSize:11,fontStyle:"italic",color:C.gold}}>{user.role==="admin"?"Administrador":user.role==="analista"?"Analista jurídico":"Originación comercial"}</div>
          </div>
          <button onClick={onLogout} style={{background:"none",border:"none",cursor:"pointer",padding:8,borderRadius:6}}><LogOut size={16} style={{color:C.greyMid}}/></button>
        </div>
      </div>
    </header>
  );
}

function Dashboard({casos,onOpen,setView}) {
  const stats=useMemo(()=>{
    const total=casos.length;
    const aptos=casos.filter(c=>c.eval?.veredicto==="apto").length;
    const alertas=casos.filter(c=>c.eval?.veredicto==="apto_con_alertas").length;
    const noAptos=casos.filter(c=>c.eval?.veredicto==="no_apto").length;
    const nominal=casos.filter(c=>c.eval?.veredicto!=="no_apto").reduce((s,c)=>s+((parseFloat(c.valorCapital)||0)+(parseFloat(c.valorIntereses)||0)),0);
    const desembolso=casos.filter(c=>c.eval?.veredicto!=="no_apto").reduce((s,c)=>s+(parseFloat(c.valorDesembolso)||0),0);
    const porEntidad={};
    casos.forEach(c=>{const e=ENTIDADES.find(e=>e.id===c.entidad);if(!e)return;if(!porEntidad[e.nombre])porEntidad[e.nombre]={count:0,valor:0};porEntidad[e.nombre].count++;porEntidad[e.nombre].valor+=(parseFloat(c.valorCapital)||0)+(parseFloat(c.valorIntereses)||0);});
    const entArr=Object.entries(porEntidad).map(([n,d])=>({nombre:n,...d})).sort((a,b)=>b.valor-a.valor);
    return{total,aptos,alertas,noAptos,nominal,desembolso,entArr};
  },[casos]);
  return (
    <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 24px"}}>
      <div style={{marginBottom:32}}>
        <div style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.18em",color:C.gold,marginBottom:6}}>DASHBOARD INSTITUCIONAL</div>
        <h1 style={{color:C.navy,fontSize:30,fontFamily:"Georgia,serif",margin:0}}>Portafolio de evaluación</h1>
        <div style={{height:3,width:64,background:C.gold,marginTop:10}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
        <StatCard label="CASOS EN PORTAFOLIO" value={stats.total} sub="total evaluados" icon={Briefcase} accent={C.navy}/>
        <StatCard label="VEREDICTO APTO" value={stats.aptos+stats.alertas} sub={`${stats.aptos} sin alertas, ${stats.alertas} con alertas`} icon={CheckCircle2} accent={C.green}/>
        <StatCard label="VALOR NOMINAL" value={`COP ${stats.nominal.toLocaleString("es-CO",{maximumFractionDigits:0})} M`} sub="agregado viables" icon={Coins} accent={C.gold}/>
        <StatCard label="CAPITAL A DESPLEGAR" value={`COP ${stats.desembolso.toLocaleString("es-CO",{maximumFractionDigits:0})} M`} sub="desembolso estimado" icon={TrendingUp} accent={C.navy}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
        {[{lbl:"APTOS",cnt:stats.aptos,color:C.green,Ic:ShieldCheck},{lbl:"APTOS CON ALERTAS",cnt:stats.alertas,color:C.amber,Ic:ShieldAlert},{lbl:"NO APTOS",cnt:stats.noAptos,color:C.red,Ic:ShieldX}].map(({lbl,cnt,color,Ic})=>(
          <div key={lbl} style={{background:"white",border:`1px solid ${C.greySoft}`,borderLeft:`4px solid ${color}`,borderRadius:8,padding:20}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.12em",color:C.greyMid,marginBottom:8}}>{lbl}</div>
                <div style={{fontWeight:"bold",color:C.navy,fontSize:32,fontFamily:"Georgia,serif",lineHeight:1}}>{cnt}</div>
                <div style={{fontSize:11,fontStyle:"italic",marginTop:4,color:C.greyMid}}>{stats.total>0?((cnt/stats.total)*100).toFixed(0):0}% del portafolio</div>
              </div>
              <Ic size={36} style={{color,opacity:0.85}} strokeWidth={1.5}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:24}}>
        <div style={{background:"white",border:`1px solid ${C.greySoft}`,borderRadius:8,overflow:"hidden"}}>
          <div style={{background:C.navy,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,color:"white",fontSize:12,fontWeight:"bold",letterSpacing:"0.1em"}}><Activity size={15} style={{color:C.gold}}/> CASOS RECIENTES</div>
            <button onClick={()=>setView("casos")} style={{background:"none",border:"none",cursor:"pointer",color:C.gold,fontSize:11,fontWeight:"bold"}}>VER TODOS →</button>
          </div>
          {casos.length===0?(
            <div style={{padding:48,textAlign:"center"}}>
              <FileText size={32} style={{color:C.greyMid,opacity:0.5,margin:"0 auto 12px"}}/>
              <div style={{fontSize:13,fontStyle:"italic",color:C.greyMid}}>Aún no hay casos registrados.</div>
              <button onClick={()=>setView("nuevo")} style={{marginTop:16,padding:"8px 16px",borderRadius:6,border:"none",background:C.navy,color:C.gold,fontWeight:"bold",fontSize:12,cursor:"pointer"}}>+ NUEVO CASO</button>
            </div>
          ):casos.slice(-5).reverse().map(c=>{
            const ent=ENTIDADES.find(e=>e.id===c.entidad);
            const val=(parseFloat(c.valorCapital)||0)+(parseFloat(c.valorIntereses)||0);
            return (
              <button key={c.id} onClick={()=>onOpen(c.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:16,padding:"12px 20px",background:"none",border:"none",borderBottom:`1px solid ${C.greySoft}`,cursor:"pointer",textAlign:"left"}}>
                <div style={{width:36,height:36,borderRadius:6,background:C.greyBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><FileText size={16} style={{color:C.navy}}/></div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:"bold",color:C.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.codigo} — {c.demandanteNombre||"(sin nombre)"}</div>
                  <div style={{fontSize:11,color:C.greyMid}}>{ent?.nombre||"sin entidad"} · COP {val.toLocaleString("es-CO",{maximumFractionDigits:0})} M</div>
                </div>
                <Badge verdict={c.eval?.veredicto||"sin_evaluar"}/>
                <ChevronRight size={15} style={{color:C.greyMid}}/>
              </button>
            );
          })}
        </div>
        <div style={{background:"white",border:`1px solid ${C.greySoft}`,borderRadius:8,overflow:"hidden"}}>
          <div style={{background:C.navy,padding:"12px 20px",display:"flex",alignItems:"center",gap:8}}>
            <Building2 size={15} style={{color:C.gold}}/>
            <span style={{color:"white",fontSize:12,fontWeight:"bold",letterSpacing:"0.1em"}}>POR ENTIDAD</span>
          </div>
          <div style={{padding:16}}>
            {stats.entArr.length===0?(<div style={{fontSize:11,fontStyle:"italic",textAlign:"center",padding:32,color:C.greyMid}}>Sin datos</div>):stats.entArr.slice(0,5).map((e,i)=>{
              const pct=stats.entArr[0].valor>0?(e.valor/stats.entArr[0].valor)*100:0;
              return (<div key={i} style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <div style={{fontSize:11,fontWeight:"bold",color:C.navy}}>{e.nombre}</div>
                  <div style={{fontSize:11,fontFamily:"monospace",color:C.gold}}>{e.count}</div>
                </div>
                <div style={{height:5,background:C.greySoft,borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",background:C.gold,width:`${pct}%`}}/>
                </div>
                <div style={{fontSize:10,fontStyle:"italic",marginTop:3,color:C.greyMid}}>COP {e.valor.toLocaleString("es-CO",{maximumFractionDigits:0})} M</div>
              </div>);
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CasosList({casos,onOpen,onDelete,setView,currentUser}) {
  const [search,setSearch]=useState("");
  const [fv,setFv]=useState("all");
  const [fe,setFe]=useState("all");
  const filtered=useMemo(()=>casos.filter(c=>{
    if(search&&!`${c.codigo} ${c.demandanteNombre}`.toLowerCase().includes(search.toLowerCase()))return false;
    if(fv!=="all"&&(c.eval?.veredicto||"sin_evaluar")!==fv)return false;
    if(fe!=="all"&&c.entidad!==fe)return false;
    return true;
  }),[casos,search,fv,fe]);
  return (
    <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 24px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:24}}>
        <div>
          <div style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.18em",color:C.gold,marginBottom:4}}>REPOSITORIO DE CASOS</div>
          <h1 style={{color:C.navy,fontSize:26,fontFamily:"Georgia,serif",margin:0}}>Casos en estudio</h1>
          <div style={{height:3,width:48,background:C.gold,marginTop:8}}/>
        </div>
        <button onClick={()=>setView("nuevo")} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 18px",borderRadius:6,border:"none",background:C.navy,color:C.gold,fontWeight:"bold",fontSize:12,cursor:"pointer"}}><Plus size={13}/>NUEVO CASO</button>
      </div>
      <div style={{display:"flex",gap:12,marginBottom:20}}>
        <div style={{flex:1,position:"relative"}}>
          <Search size={13} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.greyMid}}/>
          <input style={{...inp,paddingLeft:32}} value={search} placeholder="Buscar por código o demandante..." onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select style={{...inp,width:"auto",minWidth:190,cursor:"pointer"}} value={fv} onChange={e=>setFv(e.target.value)}>
          <option value="all">Todos los veredictos</option>
          <option value="apto">Apto</option>
          <option value="apto_con_alertas">Apto con alertas</option>
          <option value="no_apto">No apto</option>
          <option value="sin_evaluar">Sin evaluar</option>
        </select>
        <select style={{...inp,width:"auto",minWidth:190,cursor:"pointer"}} value={fe} onChange={e=>setFe(e.target.value)}>
          <option value="all">Todas las entidades</option>
          {ENTIDADES.map(e=><option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      </div>
      <div style={{background:"white",border:`1px solid ${C.greySoft}`,borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"140px 1fr 180px 140px 180px 80px",background:C.navy,padding:"10px 20px",gap:12}}>
          {["CÓDIGO","DEMANDANTE","ENTIDAD","VALOR NOMINAL","VEREDICTO",""].map((h,i)=>(<div key={i} style={{fontSize:10,fontWeight:"bold",color:C.gold,letterSpacing:"0.1em",textAlign:i>=3?"center":"left"}}>{h}</div>))}
        </div>
        {filtered.length===0?(
          <div style={{padding:64,textAlign:"center"}}>
            <Database size={32} style={{color:C.greyMid,opacity:0.4,margin:"0 auto 12px"}}/>
            <div style={{fontSize:13,fontStyle:"italic",color:C.greyMid}}>{casos.length===0?"Sin casos registrados todavía.":"No se encontraron casos con los filtros aplicados."}</div>
          </div>
        ):filtered.map(c=>{
          const ent=ENTIDADES.find(e=>e.id===c.entidad);
          const val=(parseFloat(c.valorCapital)||0)+(parseFloat(c.valorIntereses)||0);
          return (
            <div key={c.id} style={{display:"grid",gridTemplateColumns:"140px 1fr 180px 140px 180px 80px",padding:"12px 20px",gap:12,alignItems:"center",borderBottom:`1px solid ${C.greySoft}`}}>
              <div style={{fontSize:12,fontFamily:"monospace",fontWeight:"bold",color:C.gold}}>{c.codigo}</div>
              <div style={{fontSize:13,fontWeight:"bold",color:C.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.demandanteNombre||"—"}</div>
              <div style={{fontSize:12,color:C.charcoal,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ent?.nombre||"—"}</div>
              <div style={{fontSize:12,fontFamily:"monospace",color:C.navy,textAlign:"center"}}>{val>0?`$${val.toLocaleString("es-CO",{maximumFractionDigits:0})}M`:"—"}</div>
              <div style={{textAlign:"center"}}><Badge verdict={c.eval?.veredicto||"sin_evaluar"}/></div>
              <div style={{display:"flex",justifyContent:"flex-end",gap:4}}>
                <button onClick={()=>onOpen(c.id)} style={{background:"none",border:"none",cursor:"pointer",padding:6,borderRadius:4}}><ChevronRight size={14} style={{color:C.navy}}/></button>
                {currentUser.role==="admin"&&<button onClick={()=>{if(confirm(`¿Eliminar ${c.codigo}?`))onDelete(c.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:6,borderRadius:4}}><Trash2 size={14} style={{color:C.red}}/></button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Sec({title,icon:Ic,children}) {
  return (
    <div style={{marginBottom:24}}>
      <div style={{display:"flex",alignItems:"center",gap:8,paddingBottom:8,borderBottom:`2px solid ${C.gold}`,marginBottom:16}}>
        {Ic&&<Ic size={15} style={{color:C.gold}}/>}
        <span style={{fontWeight:"bold",fontSize:12,letterSpacing:"0.1em",color:C.navy}}>{title.toUpperCase()}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>{children}</div>
    </div>
  );
}

function Fld({label,required,helper,span=1,children}) {
  return (
    <div style={{gridColumn:`span ${span}`}}>
      <label style={{display:"block",fontSize:11,fontWeight:"bold",letterSpacing:"0.08em",color:C.navy,marginBottom:6}}>{label}{required&&<span style={{color:C.red}}> *</span>}</label>
      {children}
      {helper&&<div style={{fontSize:11,fontStyle:"italic",marginTop:4,color:C.greyMid}}>{helper}</div>}
    </div>
  );
}

function Step1({caso,upd}) {
  return (
    <div>
      <Sec title="Identificación del caso" icon={FileText}>
        <Fld label="Código del caso" required><input style={inp} value={caso.codigo||""} onChange={e=>upd("codigo",e.target.value)}/></Fld>
        <Fld label="Demandante (nombre completo)" required><input style={inp} value={caso.demandanteNombre||""} onChange={e=>upd("demandanteNombre",e.target.value)}/></Fld>
        <Fld label="Identificación del demandante"><input style={inp} value={caso.demandanteCC||""} onChange={e=>upd("demandanteCC",e.target.value)}/></Fld>
        <Fld label="Apoderado (nombre)"><input style={inp} value={caso.apoderadoNombre||""} onChange={e=>upd("apoderadoNombre",e.target.value)}/></Fld>
      </Sec>
      <Sec title="Tipología del activo" icon={Scale}>
        <Fld label="Escenario procesal" required>
          <select style={inp} value={caso.escenario||""} onChange={e=>upd("escenario",e.target.value)}>
            <option value="">— Seleccionar —</option>
            {ESCENARIOS.map(e=><option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </Fld>
        <Fld label="Tipo de proceso" required>
          <select style={inp} value={caso.tipoProceso||""} onChange={e=>upd("tipoProceso",e.target.value)}>
            <option value="">— Seleccionar —</option>
            {TIPOS_PROCESO.map(t=><option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </Fld>
        <Fld label="Entidad demandada" required>
          <select style={inp} value={caso.entidad||""} onChange={e=>upd("entidad",e.target.value)}>
            <option value="">— Seleccionar —</option>
            {ENTIDADES.map(e=><option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </Fld>
        <Fld label="Régimen jurídico" required>
          <select style={inp} value={caso.regimen||""} onChange={e=>upd("regimen",e.target.value)}>
            <option value="">— Seleccionar —</option>
            {REGIMENES.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </Fld>
      </Sec>
      {caso._resumenHechos&&(
        <div style={{background:C.purpleSoft,border:`1px solid ${C.purple}`,borderRadius:8,padding:16,marginTop:8}}>
          <div style={{fontSize:11,fontWeight:"bold",color:C.purple,marginBottom:6,display:"flex",alignItems:"center",gap:6}}><Sparkles size={13}/>RESUMEN DE HECHOS (extraído por IA)</div>
          <div style={{fontSize:13,color:C.charcoal,lineHeight:1.6}}>{caso._resumenHechos}</div>
        </div>
      )}
    </div>
  );
}

function Step2({caso,upd}) {
  return (
    <div>
      <Sec title="Marco procesal y temporal" icon={Calendar}>
        <Fld label="Fecha de ejecutoria del fallo" required><input type="date" style={inp} value={caso.fechaEjecutoria||""} onChange={e=>upd("fechaEjecutoria",e.target.value)}/></Fld>
        <Fld label="Fecha de radicación de la cuenta de cobro"><input type="date" style={inp} value={caso.fechaCuentaCobro||""} onChange={e=>upd("fechaCuentaCobro",e.target.value)}/></Fld>
        <Fld label="¿Proceso en única instancia?">
          <select style={inp} value={caso.unicaInstancia?"si":"no"} onChange={e=>upd("unicaInstancia",e.target.value==="si")}>
            <option value="no">No (dos instancias)</option><option value="si">Sí (única instancia)</option>
          </select>
        </Fld>
        <Fld label="Grado jurisdiccional de consulta surtido">
          <select style={inp} value={caso.gradoConsultaSurtido?"si":"no"} onChange={e=>upd("gradoConsultaSurtido",e.target.value==="si")}>
            <option value="no">No / no aplica</option><option value="si">Sí, surtido</option>
          </select>
        </Fld>
      </Sec>
      <Sec title="Particularidades de la condena" icon={Gavel}>
        <Fld label="Afectación de intereses" span={2}>
          <select style={inp} value={caso.afectacionIntereses||"ninguna"} onChange={e=>upd("afectacionIntereses",e.target.value)}>
            <option value="ninguna">Ninguna — pago ordinario de intereses</option>
            <option value="conciliadoIntCorrientes">Conciliado con intereses corrientes/DTF</option>
            <option value="conciliadoSinInt">Conciliado sin pago de intereses</option>
            <option value="policiaSMLMVPago">Policía: pago en SMLMV al momento del pago</option>
            <option value="reparacionIntIPC">Reparación directa: intereses + IPC</option>
            <option value="ramaSinArtPago">Rama Judicial: sin artículos de pago en resolutiva</option>
          </select>
        </Fld>
        <Fld label="¿Autos de corrección?">
          <select style={inp} value={caso.autoCorreccion?"si":"no"} onChange={e=>upd("autoCorreccion",e.target.value==="si")}><option value="no">No</option><option value="si">Sí</option></select>
        </Fld>
        <Fld label="¿Condena solidaria?">
          <select style={inp} value={caso.condenaSolidaria||"no"} onChange={e=>upd("condenaSolidaria",e.target.value)}>
            <option value="no">No es solidaria</option><option value="solidariaSinPorc">Solidaria sin porcentajes</option><option value="solidariaConPorc">Solidaria con porcentajes</option>
          </select>
        </Fld>
        <Fld label="¿Proceso ejecutivo radicado?">
          <select style={inp} value={caso.ejecutivoRadicado?"si":"no"} onChange={e=>upd("ejecutivoRadicado",e.target.value==="si")}><option value="no">No / sin información</option><option value="si">Sí, radicado</option></select>
        </Fld>
        <Fld label="Tipo de cesión a Factor Legal">
          <select style={inp} value={caso.tipoCesion||"total"} onChange={e=>upd("tipoCesion",e.target.value)}>
            <option value="total">Total (100%)</option><option value="parcialHonorarios">Parcial — solo honorarios</option><option value="parcialExcluyeHon">Parcial — excluye honorarios</option><option value="parcialOtra">Parcial — otra</option>
          </select>
        </Fld>
      </Sec>
    </div>
  );
}

function Step3({caso,upd}) {
  const kpis=calcKPIs(caso);
  return (
    <div>
      <Sec title="Valores económicos del fallo (COP millones)" icon={Coins}>
        <Fld label="Capital de la condena" required helper="Componente de capital"><input type="number" step="0.01" style={inp} value={caso.valorCapital||""} placeholder="ej. 600" onChange={e=>upd("valorCapital",e.target.value)}/></Fld>
        <Fld label="Intereses moratorios acumulados" required><input type="number" step="0.01" style={inp} value={caso.valorIntereses||""} placeholder="ej. 400" onChange={e=>upd("valorIntereses",e.target.value)}/></Fld>
        <Fld label="Valor total condena (parte resolutiva)" helper="Para validar ≥300 SMLMV"><input type="number" step="0.01" style={inp} value={caso.valorTotalCondenaResolutiva||""} placeholder="ej. 1000" onChange={e=>upd("valorTotalCondenaResolutiva",e.target.value)}/></Fld>
        <Fld label="Costas y agencias en derecho"><input type="number" step="0.01" style={inp} value={caso.valorCostas||""} placeholder="0" onChange={e=>upd("valorCostas",e.target.value)}/></Fld>
      </Sec>
      <Sec title="Propuesta económica" icon={DollarSign}>
        <Fld label="Valor de desembolso (precio de compra)" required helper="Umbral mínimo: COP $100M"><input type="number" step="0.01" style={inp} value={caso.valorDesembolso||""} placeholder="ej. 564" onChange={e=>upd("valorDesembolso",e.target.value)}/></Fld>
        <Fld label="% honorarios pactado (cuota litis)" helper="Alerta si supera 50%"><input type="number" step="0.1" style={inp} value={caso.porcHonorarios||""} placeholder="ej. 30" onChange={e=>upd("porcHonorarios",e.target.value)}/></Fld>
      </Sec>
      <div style={{background:C.cream,border:`1px solid ${C.gold}`,borderRadius:8,padding:20,marginTop:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><BarChart3 size={13} style={{color:C.gold}}/><span style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.12em",color:C.navy}}>KPIs CALCULADOS</span></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
          {[{lbl:"Valor nominal",val:`COP ${kpis.nominal.toFixed(1)} M`},{lbl:"Descuento",val:`${kpis.descuento.toFixed(1)}%`},{lbl:"MOIC",val:`${kpis.moic.toFixed(2)}x`},{lbl:"Meses mora",val:kpis.mesesEjec?`${kpis.mesesEjec} m`:"—"}].map(({lbl,val})=>(
            <div key={lbl}><div style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.08em",color:C.greyMid,marginBottom:4}}>{lbl.toUpperCase()}</div><div style={{fontWeight:"bold",color:C.navy,fontSize:20,fontFamily:"Georgia,serif"}}>{val}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step4({caso,upd,updDoc}) {
  const docMatrix=DOCS[caso.escenario]||[];
  const entidad=ENTIDADES.find(e=>e.id===caso.entidad);
  return (
    <div>
      <Sec title="Beneficiarios y novedades" icon={Users}>
        <Fld label="Número de beneficiarios"><input type="number" style={inp} value={caso.numBeneficiarios||""} onChange={e=>upd("numBeneficiarios",e.target.value)}/></Fld>
        <Fld label="Menores de edad (beneficiarios)"><input type="number" style={inp} value={caso.numMenores||0} onChange={e=>upd("numMenores",e.target.value)}/></Fld>
        {(parseInt(caso.numMenores)||0)>0&&(<Fld label="Tipo de menores" span={2}><select style={inp} value={caso.tipoBeneficiariosMenores||"directos"} onChange={e=>upd("tipoBeneficiariosMenores",e.target.value)}><option value="directos">Beneficiarios directos del fallo (aplica retención)</option><option value="herederos">Herederos en sucesión (no aplica retención)</option></select></Fld>)}
        <Fld label="¿Sucesión?"><select style={inp} value={caso.sucesion?"si":"no"} onChange={e=>upd("sucesion",e.target.value==="si")}><option value="no">No</option><option value="si">Sí</option></select></Fld>
        <Fld label="¿Cesión previa?"><select style={inp} value={caso.cesionPrevia||"no"} onChange={e=>upd("cesionPrevia",e.target.value)}><option value="no">No</option><option value="honorarios">Sí — por honorarios</option><option value="beneficiario">Sí — beneficiario inicial</option></select></Fld>
        <Fld label="¿Antecedentes graves?"><select style={inp} value={caso.antecedentesGraves?"si":"no"} onChange={e=>upd("antecedentesGraves",e.target.value==="si")}><option value="no">No</option><option value="si">Sí — listas restrictivas / LA-FT</option></select></Fld>
        <Fld label="¿Demanda por alimentos?"><select style={inp} value={caso.demandaAlimentos?"si":"no"} onChange={e=>upd("demandaAlimentos",e.target.value==="si")}><option value="no">No</option><option value="si">Sí (excluir beneficiario)</option></select></Fld>
      </Sec>
      <div>
        <div style={{display:"flex",alignItems:"center",gap:8,paddingBottom:8,borderBottom:`2px solid ${C.gold}`,marginBottom:16}}>
          <ClipboardCheck size={15} style={{color:C.gold}}/>
          <span style={{fontWeight:"bold",fontSize:12,letterSpacing:"0.1em",color:C.navy}}>VERIFICACIÓN DOCUMENTAL — {caso.escenario?caso.escenario.toUpperCase():""}</span>
        </div>
        {!caso.escenario?(
          <div style={{background:C.amberSoft,borderRadius:8,padding:24,textAlign:"center",color:C.amber}}><Info size={20} style={{margin:"0 auto 8px"}}/><div style={{fontSize:13,fontStyle:"italic"}}>Selecciona el escenario procesal en el Paso 1.</div></div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {docMatrix.map(d=>{
              if(d.cond==="minDef"&&!entidad?.minDef)return null;
              if(d.cond==="nyr"&&caso.tipoProceso!=="nulidadRest")return null;
              return (<label key={d.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",border:`1px solid ${C.greySoft}`,borderRadius:6,cursor:"pointer"}}>
                <input type="checkbox" checked={!!(caso.documentos||{})[d.id]} onChange={e=>updDoc(d.id,e.target.checked)} style={{accentColor:C.gold,width:15,height:15}}/>
                <span style={{fontSize:13,flex:1,color:C.charcoal}}>{d.label}</span>
                {d.req&&<span style={{fontSize:10,fontWeight:"bold",padding:"2px 8px",borderRadius:4,background:C.amberSoft,color:C.amber,letterSpacing:"0.08em"}}>OBLIGATORIO</span>}
              </label>);
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CasoForm({initial,onSave,onCancel,currentUser}) {
  const [phase,setPhase]=useState("upload");
  const [step,setStep]=useState(1);
  const [caso,setCaso]=useState(initial||{
    codigo:"FL-"+Date.now().toString().slice(-6),
    fechaCreacion:new Date().toISOString(),
    creadoPor:currentUser.id,
    creadoPorNombre:currentUser.nombre,
    documentos:{},
  });

  const upd=(k,v)=>setCaso(p=>({...p,[k]:v}));
  const updDoc=(id,v)=>setCaso(p=>({...p,documentos:{...(p.documentos||{}),[id]:v}}));

  function applyExtracted(data) {
    const map={
      demandanteNombre:data.demandanteNombre,demandanteCC:data.demandanteCC,
      apoderadoNombre:data.apoderadoNombre,porcHonorarios:data.porcHonorarios,
      entidad:data.entidad,tipoProceso:data.tipoProceso,escenario:data.escenario,
      regimen:data.regimen,fechaEjecutoria:data.fechaEjecutoria,
      fechaCuentaCobro:data.fechaCuentaCobro,unicaInstancia:data.unicaInstancia,
      gradoConsultaSurtido:data.gradoConsultaSurtido,valorCapital:data.valorCapital,
      valorIntereses:data.valorIntereses,valorCostas:data.valorCostas,
      valorTotalCondenaResolutiva:data.valorTotalCondenaResolutiva,
      afectacionIntereses:data.afectacionIntereses||"ninguna",
      condenaSolidaria:data.condenaSolidaria||"no",ejecutivoRadicado:data.ejecutivoRadicado,
      tipoCesion:data.tipoCesion||"total",numBeneficiarios:data.numBeneficiarios,
      numMenores:data.numMenores||0,_resumenHechos:data.resumenHechos,_iaExtracted:true,
    };
    Object.keys(map).forEach(k=>{if(map[k]==null)delete map[k];});
    setCaso(prev=>({...prev,...map}));
    setPhase("form");setStep(1);
  }

  const valid=s=>{
    if(s===1)return caso.codigo&&caso.demandanteNombre&&caso.escenario&&caso.tipoProceso&&caso.entidad;
    if(s===2)return caso.fechaEjecutoria;
    if(s===3)return caso.valorCapital&&caso.valorIntereses;
    return true;
  };
  const steps=[{n:1,label:"Identificación"},{n:2,label:"Marco procesal"},{n:3,label:"Económico"},{n:4,label:"Documentos"}];

  return (
    <div style={{maxWidth:1000,margin:"0 auto",padding:"32px 24px"}}>
      <button onClick={onCancel} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",color:C.gold,fontSize:11,fontWeight:"bold",marginBottom:8}}><ArrowLeft size={12}/>VOLVER</button>
      <div style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.18em",color:C.gold,marginBottom:4}}>{initial?"EDITAR CASO":"NUEVO CASO"}</div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <h1 style={{color:C.navy,fontSize:24,fontFamily:"Georgia,serif",margin:0}}>{phase==="upload"?"Analizar expediente con IA":`Estudio de elegibilidad — ${caso.codigo}`}</h1>
        {caso._iaExtracted&&<span style={{display:"inline-flex",alignItems:"center",gap:4,background:C.purpleSoft,color:C.purple,padding:"4px 10px",borderRadius:999,fontSize:11,fontWeight:"bold"}}><Sparkles size={12}/>IA</span>}
      </div>

      {phase==="upload"?(
        <div style={{background:"white",border:`1px solid ${C.greySoft}`,borderRadius:8,padding:32}}>
          <PdfExtractor onExtracted={applyExtracted} onSkip={()=>setPhase("form")}/>
        </div>
      ):(
        <>
          <div style={{background:"white",border:`1px solid ${C.greySoft}`,borderRadius:8,padding:16,marginBottom:24,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            {steps.map((s,i)=>(
              <div key={s.n} style={{display:"flex",alignItems:"center",flex:i<steps.length-1?1:"none"}}>
                <button onClick={()=>setStep(s.n)} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:"bold",background:step===s.n?C.navy:step>s.n?C.gold:C.greyBg,color:step===s.n?C.gold:step>s.n?"white":C.greyMid,border:`2px solid ${step>=s.n?C.navy:C.greySoft}`}}>
                    {step>s.n?<CheckCircle2 size={14}/>:s.n}
                  </div>
                  <span style={{fontSize:11,fontWeight:"bold",letterSpacing:"0.08em",color:step===s.n?C.navy:C.greyMid}}>{s.label.toUpperCase()}</span>
                </button>
                {i<steps.length-1&&<div style={{flex:1,height:2,margin:"0 12px",background:step>s.n?C.gold:C.greySoft}}/>}
              </div>
            ))}
          </div>
          <div style={{background:"white",border:`1px solid ${C.greySoft}`,borderRadius:8,padding:24,marginBottom:24}}>
            {step===1&&<Step1 caso={caso} upd={upd}/>}
            {step===2&&<Step2 caso={caso} upd={upd}/>}
            {step===3&&<Step3 caso={caso} upd={upd}/>}
            {step===4&&<Step4 caso={caso} upd={upd} updDoc={updDoc}/>}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",gap:8}}>
              <button onClick={onCancel} style={{background:"none",border:"none",cursor:"pointer",color:C.greyMid,fontWeight:"bold",fontSize:12}}>CANCELAR</button>
              <button onClick={()=>setPhase("upload")} style={{background:"none",border:`1px solid ${C.purple}`,cursor:"pointer",color:C.purple,fontWeight:"bold",fontSize:12,padding:"8px 14px",borderRadius:6,display:"flex",alignItems:"center",gap:6}}>
                <Upload size={12}/>Subir más PDFs
              </button>
            </div>
            <div style={{display:"flex",gap:12}}>
              {step>1&&<button onClick={()=>setStep(step-1)} style={{padding:"10px 18px",borderRadius:6,border:`1px solid ${C.navy}`,background:"white",color:C.navy,fontWeight:"bold",fontSize:12,cursor:"pointer"}}>← ANTERIOR</button>}
              {step<4?(
                <button onClick={()=>valid(step)&&setStep(step+1)} disabled={!valid(step)} style={{padding:"10px 18px",borderRadius:6,border:"none",background:C.navy,color:C.gold,fontWeight:"bold",fontSize:12,cursor:"pointer",opacity:valid(step)?1:0.4}}>SIGUIENTE →</button>
              ):(
                <button onClick={()=>{const ev=evaluarCaso(caso);onSave({...caso,eval:ev,fechaActualizacion:new Date().toISOString()});}} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 18px",borderRadius:6,border:"none",background:C.gold,color:C.navy,fontWeight:"bold",fontSize:12,cursor:"pointer"}}>
                  <Save size={13}/>EVALUAR Y GUARDAR
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Ficha({caso,onBack,onEdit,onExport}) {
  const entidad=ENTIDADES.find(e=>e.id===caso.entidad);
  const tipoP=TIPOS_PROCESO.find(t=>t.id===caso.tipoProceso);
  const escen=ESCENARIOS.find(e=>e.id===caso.escenario);
  const regim=REGIMENES.find(r=>r.id===caso.regimen);
  const kpis=calcKPIs(caso);
  const ev=caso.eval||evaluarCaso(caso);
  const rechazos=ev.alertas.filter(a=>a.tipo==="rechazo");
  const alertas=ev.alertas.filter(a=>a.tipo==="alerta");
  const pendientes=ev.alertas.filter(a=>a.tipo==="pendiente");
  const vColor=ev.veredicto==="apto"?C.green:ev.veredicto==="apto_con_alertas"?C.amber:C.red;
  const vSoft=ev.veredicto==="apto"?C.greenSoft:ev.veredicto==="apto_con_alertas"?C.amberSoft:C.redSoft;
  const vLabel=ev.veredicto==="apto"?"APTO PARA DESCUENTO":ev.veredicto==="apto_con_alertas"?"APTO CON ALERTAS":"NO APTO PARA DESCUENTO";
  const VIco=ev.veredicto==="apto"?ShieldCheck:ev.veredicto==="apto_con_alertas"?ShieldAlert:ShieldX;

  function DR({label,value}){return(<div style={{display:"grid",gridTemplateColumns:"45% 55%",gap:12,padding:"10px 16px",borderBottom:`1px solid ${C.greySoft}`,fontSize:12}}><div style={{fontWeight:"bold",color:C.greyMid,fontSize:11,letterSpacing:"0.06em"}}>{label}</div><div style={{color:C.charcoal}}>{value||"—"}</div></div>);}
  function DC({title,icon:Ic,children}){return(<div style={{background:"white",border:`1px solid ${C.greySoft}`,borderRadius:8,overflow:"hidden",marginBottom:16}}><div style={{background:C.navy,padding:"10px 16px",display:"flex",alignItems:"center",gap:8}}><Ic size={13} style={{color:C.gold}}/><span style={{fontSize:11,fontWeight:"bold",letterSpacing:"0.1em",color:"white"}}>{title.toUpperCase()}</span></div>{children}</div>);}
  function AG({title,items,color,bg,Ic}){return(<div style={{border:`1px solid ${color}`,borderRadius:8,overflow:"hidden",marginBottom:16}}><div style={{background:color,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}><Ic size={13} style={{color:"white"}}/><span style={{fontSize:11,fontWeight:"bold",letterSpacing:"0.1em",color:"white"}}>{title} ({items.length})</span></div><div style={{padding:12,display:"flex",flexDirection:"column",gap:8}}>{items.map((a,i)=>(<div key={i} style={{background:bg,borderRadius:6,padding:12}}><div style={{fontWeight:"bold",fontSize:12,color,marginBottom:4}}>{a.titulo}</div><div style={{fontSize:11,color:C.charcoal,lineHeight:1.5,whiteSpace:"pre-line"}}>{a.detalle}</div></div>))}</div></div>);}

  return (
    <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 24px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div>
          <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",color:C.gold,fontSize:11,fontWeight:"bold",marginBottom:8}}><ArrowLeft size={12}/>VOLVER</button>
          <div style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.18em",color:C.gold,marginBottom:4}}>FICHA TÉCNICA — DUE DILIGENCE</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <h1 style={{color:C.navy,fontSize:28,fontFamily:"Georgia,serif",margin:0}}>{caso.codigo}</h1>
            {caso._iaExtracted&&<span style={{display:"inline-flex",alignItems:"center",gap:4,background:C.purpleSoft,color:C.purple,padding:"4px 10px",borderRadius:999,fontSize:11,fontWeight:"bold"}}><Sparkles size={12}/>Extraído con IA</span>}
          </div>
          <div style={{fontSize:12,fontStyle:"italic",color:C.greyMid,marginTop:4}}>Demandante: <strong style={{color:C.charcoal,fontStyle:"normal"}}>{caso.demandanteNombre}</strong></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onEdit} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:6,border:`1px solid ${C.navy}`,background:"white",color:C.navy,fontWeight:"bold",fontSize:11,cursor:"pointer"}}><Edit3 size={13}/>EDITAR</button>
          <button onClick={()=>onExport("word")} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:6,border:"none",background:C.navy,color:C.gold,fontWeight:"bold",fontSize:11,cursor:"pointer"}}><Download size={13}/>WORD</button>
          <button onClick={()=>onExport("excel")} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:6,border:"none",background:C.gold,color:C.navy,fontWeight:"bold",fontSize:11,cursor:"pointer"}}><Download size={13}/>EXCEL</button>
        </div>
      </div>
      <div style={{background:vSoft,border:`2px solid ${vColor}`,borderRadius:10,padding:24,marginBottom:24,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.18em",color:vColor,marginBottom:8}}>VEREDICTO DE ELEGIBILIDAD</div>
          <div style={{fontWeight:"bold",color:vColor,fontSize:32,fontFamily:"Georgia,serif",marginBottom:8}}>{vLabel}</div>
          <div style={{fontSize:13,fontStyle:"italic",color:vColor}}>
            {ev.veredicto==="apto"?"Cumple integralmente con el marco de elegibilidad. Procede para etapa de cierre.":ev.veredicto==="apto_con_alertas"?`${alertas.length} alerta(s) y ${pendientes.length} pendiente(s). Subsanar antes del cierre.`:`${rechazos.length} causal(es) de rechazo. El activo no procede para descuento.`}
          </div>
        </div>
        <VIco size={64} style={{color:vColor}} strokeWidth={1.4}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
        <StatCard label="VALOR NOMINAL" value={`COP ${kpis.nominal.toFixed(1)} M`} sub="capital + intereses" icon={Coins} accent={C.gold}/>
        <StatCard label="DESEMBOLSO" value={`COP ${kpis.desembolso.toFixed(1)} M`} sub="precio de compra" icon={DollarSign} accent={C.navy}/>
        <StatCard label="DESCUENTO" value={`${kpis.descuento.toFixed(1)}%`} sub="vs. valor nominal" icon={TrendingUp} accent={C.gold}/>
        <StatCard label="MOIC" value={`${kpis.moic.toFixed(2)}x`} sub="múltiple invertido" icon={Target} accent={C.navy}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:24}}>
        <div>
          <DC title="Identificación del activo" icon={FileText}><DR label="Código" value={caso.codigo}/><DR label="Demandante" value={caso.demandanteNombre}/><DR label="Identificación" value={caso.demandanteCC}/><DR label="Apoderado" value={caso.apoderadoNombre}/></DC>
          <DC title="Marco procesal" icon={Scale}><DR label="Escenario" value={escen?.nombre}/><DR label="Tipo de proceso" value={tipoP?.nombre}/><DR label="Entidad demandada" value={entidad?.nombre}/><DR label="Régimen" value={regim?.nombre}/><DR label="Fecha ejecutoria" value={caso.fechaEjecutoria?new Date(caso.fechaEjecutoria).toLocaleDateString("es-CO"):"—"}/><DR label="Cuenta de cobro" value={caso.fechaCuentaCobro?new Date(caso.fechaCuentaCobro).toLocaleDateString("es-CO"):"—"}/><DR label="Meses desde ejecutoria" value={kpis.mesesEjec?`${kpis.mesesEjec} meses`:"—"}/><DR label="Única instancia" value={caso.unicaInstancia?"Sí":"No"}/></DC>
          {caso._resumenHechos&&<DC title="Resumen de hechos (IA)" icon={Sparkles}><div style={{padding:"12px 16px",fontSize:13,color:C.charcoal,lineHeight:1.6}}>{caso._resumenHechos}</div></DC>}
          <DC title="Particularidades" icon={Gavel}><DR label="Condena solidaria" value={caso.condenaSolidaria==="no"?"No":caso.condenaSolidaria==="solidariaSinPorc"?"Sí — sin %s":"Sí — con %s"}/><DR label="Ejecutivo radicado" value={caso.ejecutivoRadicado?"Sí":"No"}/><DR label="Tipo de cesión" value={caso.tipoCesion==="total"?"Total (100%)":"Parcial"}/><DR label="% Honorarios" value={caso.porcHonorarios?`${caso.porcHonorarios}%`:"—"}/></DC>
          <DC title="Beneficiarios" icon={Users}><DR label="N.° beneficiarios" value={caso.numBeneficiarios}/><DR label="Menores" value={`${caso.numMenores||0} ${caso.tipoBeneficiariosMenores==="herederos"?"(herederos)":"(directos)"}`}/><DR label="Sucesión" value={caso.sucesion?"Sí":"No"}/></DC>
        </div>
        <div>
          {rechazos.length>0&&<AG title="CAUSALES DE RECHAZO" items={rechazos} color={C.red} bg={C.redSoft} Ic={ShieldX}/>}
          {alertas.length>0&&<AG title="ALERTAS" items={alertas} color={C.amber} bg={C.amberSoft} Ic={ShieldAlert}/>}
          {pendientes.length>0&&<AG title="PENDIENTES DOCUMENTALES" items={pendientes} color={C.navy} bg={C.greyBg} Ic={Clock}/>}
          {ev.alertas.length===0&&(<div style={{background:C.greenSoft,border:`1px solid ${C.green}`,borderRadius:8,padding:24,textAlign:"center"}}><CheckCircle2 size={32} style={{color:C.green,margin:"0 auto 8px"}}/><div style={{fontWeight:"bold",color:C.green,fontSize:13,marginBottom:4}}>Sin observaciones</div><div style={{fontSize:11,fontStyle:"italic",color:C.green}}>El caso cumple integralmente con el marco de Factor Legal.</div></div>)}
        </div>
      </div>
      <div style={{marginTop:32,paddingTop:16,borderTop:`1px solid ${C.greySoft}`,display:"flex",justifyContent:"space-between",fontSize:11,fontStyle:"italic",color:C.greyMid}}>
        <div>Creado por: <strong style={{color:C.navy,fontStyle:"normal"}}>{caso.creadoPorNombre}</strong>{caso.fechaActualizacion&&` · ${new Date(caso.fechaActualizacion).toLocaleString("es-CO")}`}</div>
        <div>Confidencial — Factor Legal S.A.S.</div>
      </div>
    </div>
  );
}

function buildHTML(caso) {
  const entidad=ENTIDADES.find(e=>e.id===caso.entidad);
  const kpis=calcKPIs(caso);
  const ev=caso.eval||evaluarCaso(caso);
  const vLabel=ev.veredicto==="apto"?"APTO PARA DESCUENTO":ev.veredicto==="apto_con_alertas"?"APTO CON ALERTAS":"NO APTO";
  const vColor=ev.veredicto==="apto"?"#2E7D32":ev.veredicto==="apto_con_alertas"?"#B08D57":"#B71C1C";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ficha ${caso.codigo}</title>
<style>body{font-family:Calibri,sans-serif;color:#2F2F2F;max-width:800px;margin:0 auto;padding:40px}h1{color:#0B2545;font-family:Georgia,serif;font-size:26px;border-bottom:3px solid #B08D57;padding-bottom:8px}h2{font-family:Georgia,serif;font-size:14px;margin-top:20px;padding:6px 12px;background:#0B2545;color:white}.v{background:${vColor}1A;border:2px solid ${vColor};padding:16px;margin:16px 0}.vl{color:${vColor};font-family:Georgia,serif;font-size:26px;font-weight:bold}table{width:100%;border-collapse:collapse}td{padding:6px 12px;border:1px solid #E8E8E8;font-size:12px}td.l{background:#F8F6F2;font-weight:bold;color:#0B2545;width:35%}.kg{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:10px 0}.kc{padding:10px;border-top:3px solid #B08D57;border:1px solid #E8E8E8}.kl{font-size:9px;color:#6B6B6B;letter-spacing:.1em;font-weight:bold}.kv{font-family:Georgia,serif;color:#0B2545;font-size:20px;font-weight:bold}.al{padding:8px 12px;margin:4px 0;border-left:4px solid}.ar{background:#FFEBEE;border-color:#B71C1C}.aa{background:#FFF8E1;border-color:#B08D57}.ap{background:#F8F6F2;border-color:#0B2545}.at{font-weight:bold;font-size:12px}.ad{font-size:11px;margin-top:4px;white-space:pre-line}.ft{margin-top:24px;padding-top:10px;border-top:1px solid #E8E8E8;font-size:10px;color:#6B6B6B;font-style:italic}</style></head><body>
<div style="font-size:10px;font-weight:bold;letter-spacing:.18em;color:#B08D57">FACTOR LEGAL S.A.S. · FICHA TÉCNICA</div>
<h1>${caso.codigo} — ${caso.demandanteNombre||""}</h1>
<div class="v"><div style="font-size:10px;font-weight:bold;color:${vColor}">VEREDICTO</div><div class="vl">${vLabel}</div></div>
<h2>KPIs</h2><div class="kg"><div class="kc"><div class="kl">VALOR NOMINAL</div><div class="kv">COP ${kpis.nominal.toFixed(1)} M</div></div><div class="kc"><div class="kl">DESEMBOLSO</div><div class="kv">COP ${kpis.desembolso.toFixed(1)} M</div></div><div class="kc"><div class="kl">DESCUENTO</div><div class="kv">${kpis.descuento.toFixed(1)}%</div></div><div class="kc"><div class="kl">MOIC</div><div class="kv">${kpis.moic.toFixed(2)}x</div></div></div>
<h2>IDENTIFICACIÓN</h2><table><tr><td class="l">Código</td><td>${caso.codigo}</td></tr><tr><td class="l">Demandante</td><td>${caso.demandanteNombre||"—"}</td></tr><tr><td class="l">Entidad demandada</td><td>${entidad?.nombre||"—"}</td></tr><tr><td class="l">Apoderado</td><td>${caso.apoderadoNombre||"—"}</td></tr><tr><td class="l">Fecha ejecutoria</td><td>${caso.fechaEjecutoria?new Date(caso.fechaEjecutoria).toLocaleDateString("es-CO"):"—"}</td></tr><tr><td class="l">Capital (COP M)</td><td>${kpis.capital.toFixed(2)}</td></tr><tr><td class="l">Intereses (COP M)</td><td>${kpis.intereses.toFixed(2)}</td></tr><tr><td class="l">Nominal (COP M)</td><td><strong>${kpis.nominal.toFixed(2)}</strong></td></tr></table>
${caso._resumenHechos?`<h2>RESUMEN DE HECHOS</h2><p style="font-size:12px;line-height:1.6">${caso._resumenHechos}</p>`:""}
<h2>OBSERVACIONES Y ALERTAS</h2>
${ev.alertas.length===0?'<p style="font-style:italic;color:#2E7D32">Sin observaciones.</p>':ev.alertas.map(a=>`<div class="al ${a.tipo==="rechazo"?"ar":a.tipo==="alerta"?"aa":"ap"}"><div class="at">${a.titulo}</div><div class="ad">${a.detalle}</div></div>`).join("")}
<div class="ft">Creado por: ${caso.creadoPorNombre||"—"} · Factor Legal S.A.S. — Confidencial</div>
</body></html>`;
}

function buildCSV(caso) {
  const kpis=calcKPIs(caso);
  const ev=caso.eval||evaluarCaso(caso);
  const rows=[["FACTOR LEGAL S.A.S. — FICHA TÉCNICA"],["Código",caso.codigo],["Demandante",caso.demandanteNombre||""],[""],["VEREDICTO",ev.veredicto==="apto"?"APTO":ev.veredicto==="apto_con_alertas"?"APTO CON ALERTAS":"NO APTO"],[""],["KPIs"],["Valor nominal (COP M)",kpis.nominal.toFixed(2)],["Capital (COP M)",kpis.capital.toFixed(2)],["Intereses (COP M)",kpis.intereses.toFixed(2)],["Desembolso (COP M)",kpis.desembolso.toFixed(2)],["Descuento %",kpis.descuento.toFixed(2)],["MOIC",kpis.moic.toFixed(2)],[""],["ALERTAS"],["Tipo","Título","Detalle"],...ev.alertas.map(a=>[a.tipo,a.titulo,a.detalle.replace(/\n/g," ")])];
  return rows.map(r=>r.map(c=>`"${(c||"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
}

function dl(content,name,mime) {
  const b=new Blob([content],{type:mime});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=name;a.click();URL.revokeObjectURL(u);
}

export default function App() {
  const [user,setUser]=useState(()=>lsGet("fl:user",null));
  const [casos,setCasos]=useState([]);
  const [loading,setLoading]=useState(true);
  const [view,setView]=useState("dashboard");
  const [selId,setSelId]=useState(null);
  const [editing,setEditing]=useState(null);

  // Wire up Firestore real-time subscription
  useEffect(()=>{
    const unsub=onSnapshot(
      collection(db,"casos"),
      (snap)=>{
        setCasos(snap.docs.map(d=>({id:d.id,...d.data()})));
        setLoading(false);
      },
      (err)=>{
        console.error("Firestore error:",err);
        setLoading(false);
      }
    );
    return ()=>unsub();
  },[]);

  function login(u){setUser(u);lsSet("fl:user",u);}
  function logout(){setUser(null);lsDel("fl:user");setView("dashboard");}

  async function saveCaso(caso) {
    try {
      const {id,...data}=caso;
      const payload={...data,fechaActualizacion:new Date().toISOString()};
      if(id){
        // Update existing
        await updateDoc(doc(db,"casos",id),payload);
        setSelId(id);
      } else {
        // Create new
        payload.fechaCreacion=new Date().toISOString();
        const ref=await addDoc(collection(db,"casos"),payload);
        setSelId(ref.id);
      }
      setEditing(null);
      setView("ficha");
    } catch(err){
      console.error("Error guardando caso:",err);
      alert("Error al guardar. Verifica tu conexi\u00F3n.");
    }
  }

  async function delCaso(id){
    try { await deleteDoc(doc(db,"casos",id)); }
    catch(err){ console.error("Error eliminando:",err); alert("Error al eliminar."); }
  }

  function exportCaso(fmt){
    const c=casos.find(x=>x.id===selId);if(!c)return;
    if(fmt==="word")dl(buildHTML(c),`FichaTecnica_${c.codigo}.doc`,"application/msword");
    if(fmt==="excel")dl("\uFEFF"+buildCSV(c),`FichaTecnica_${c.codigo}.csv`,"text/csv;charset=utf-8");
  }

  const selCaso=casos.find(c=>c.id===selId);
  function nav(v){setView(v);setEditing(null);}

  if(loading){return(<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.cream}}><div style={{textAlign:"center"}}><div style={{margin:"0 auto 16px",display:"flex",justifyContent:"center"}}><Logo size="lg" showText={true}/></div><div style={{fontSize:12,fontStyle:"italic",color:C.greyMid}}>Conectando con Firestore\u2026</div></div></div>);}
  if(!user)return <Login onLogin={login}/>;

  return (
    <div style={{minHeight:"100vh",background:C.cream,fontFamily:"system-ui,-apple-system,sans-serif"}}>
      <Header user={user} onLogout={logout} view={view} setView={nav}/>
      {view==="dashboard"&&<Dashboard casos={casos} onOpen={id=>{setSelId(id);setView("ficha");}} setView={nav}/>}
      {view==="casos"&&<CasosList casos={casos} onOpen={id=>{setSelId(id);setView("ficha");}} onDelete={delCaso} setView={nav} currentUser={user}/>}
      {view==="nuevo"&&<CasoForm initial={editing} onSave={saveCaso} onCancel={()=>{setEditing(null);setView("casos");}} currentUser={user}/>}
      {view==="ficha"&&selCaso&&<Ficha caso={selCaso} onBack={()=>setView("casos")} onEdit={()=>{setEditing(selCaso);setView("nuevo");}} onExport={exportCaso}/>}
      {view==="nerak"&&(user.role==="admin"||user.role==="analista")&&<NerakLegal casos={casos} user={user} onOpenCaso={id=>{setSelId(id);setView("ficha");}}/>}
      {view==="nerak"&&user.role==="comercial"&&(
        <div style={{maxWidth:600,margin:"80px auto",textAlign:"center",padding:32}}>
          <ShieldX size={48} style={{color:C.red,margin:"0 auto 16px"}}/>
          <h2 style={{color:C.navy,fontFamily:"Georgia,serif"}}>Acceso restringido</h2>
          <p style={{color:C.greyMid,fontSize:13}}>El m\u00F3dulo Nerak Legal est\u00E1 disponible solo para administradores y analistas jur\u00EDdicos.</p>
        </div>
      )}
    </div>
  );
}


// ─── NERAK LEGAL MODULE ──────────────────────────────────────────────────────
// Memo de Inversión: 8 secciones estructuradas
// Determinístico: carátula, financiero, checklist, actores, recomendación
// IA (1 llamada): resumen ejecutivo, narrativa jurídica, matriz riesgos

function fmt(n){
  if(n==null||n===false||isNaN(n))return "—";
  return new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n);
}
function fmtM(n){
  if(n==null||isNaN(n))return "—";
  return `$${(n/1e6).toFixed(2)} M`;
}
function fmtPct(n){return (n!=null&&!isNaN(n))?`${n.toFixed(1)}%`:"—";}
function fmtX(n){return (n!=null&&!isNaN(n))?`${n.toFixed(2)}x`:"—";}

const RIESGO_COLOR={alto:C.red,media:C.amber,medio:C.amber,bajo:C.green,baja:C.green,alta:C.red};
const RIESGO_BG={alto:C.redSoft,media:C.amberSoft,medio:C.amberSoft,bajo:C.greenSoft,baja:C.greenSoft,alta:C.redSoft};

// ─── MemoVisor ───────────────────────────────────────────────────────────────
function MemoVisor({memo,caso}) {
  const kpis=calcKPIs(caso);
  const ev=evaluarCaso(caso);
  const entNombre=ENTIDADES.find(e=>e.id===caso.entidad)?.nombre||caso.entidad||"—";
  const tipoProcNombre=TIPOS_PROCESO.find(t=>t.id===caso.tipoProceso)?.nombre||caso.tipoProceso||"—";
  const escNombre=ESCENARIOS.find(s=>s.id===caso.escenario)?.nombre||caso.escenario||"—";
  const today=new Date().toLocaleDateString("es-CO",{day:"2-digit",month:"long",year:"numeric"});

  const veredictoColor=ev.veredicto==="apto"?C.green:ev.veredicto==="apto_con_alertas"?C.amber:C.red;
  const veredictoLabel=ev.veredicto==="apto"?"APTO PARA INVERSIÓN":ev.veredicto==="apto_con_alertas"?"APTO CON CONDICIONES":"NO APTO — RECHAZADO";

  const docsGroup=caso.escenario==="sentencia"?"sentencia":caso.escenario==="concJud"?"concJud":"concExtra";
  const docsItems=DOCS[docsGroup]||[];
  const docsOk=docsItems.filter(d=>caso.docs?.[d.id]);
  const docsFalt=docsItems.filter(d=>!caso.docs?.[d.id]&&d.req);

  const rechazosCausa=ev.alertas.filter(a=>a.tipo==="rechazo").map(a=>a.titulo).join("; ");
  const alertasCausa=ev.alertas.filter(a=>a.tipo!=="rechazo").map(a=>a.titulo).join("; ");
  const recomendacionTexto=ev.veredicto==="apto"
    ?"El caso cumple la totalidad de los criterios del motor de elegibilidad de Factor Legal. Se recomienda proceder con la negociación y firma del contrato de cesión de derechos litigiosos, condicionado únicamente a la verificación completa del checklist documental."
    :ev.veredicto==="apto_con_alertas"
    ?`El caso es elegible con condicionantes. Alertas activas: ${alertasCausa||"ver sección 4"}. Se recomienda avanzar únicamente después de resolver las condiciones señaladas y completar la documentación faltante.`
    :`El caso presenta causales de rechazo estructurales que impiden la inversión en las condiciones actuales. Rechazos: ${rechazosCausa||"ver sección 4"}. No se recomienda avanzar sin corrección de las causales identificadas.`;

  function exportWord(){
    const riesgosHtml=(memo.riesgos||[]).map(r=>`
      <tr>
        <td style="font-weight:bold;padding:6px 10px;border:1px solid #ddd;font-size:12px">${r.titulo||""}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;font-size:11px">${r.descripcion||""}</td>
        <td style="text-align:center;padding:6px 10px;border:1px solid #ddd;font-weight:bold;font-size:11px;color:${RIESGO_COLOR[r.probabilidad]||"#333"}">${(r.probabilidad||"").toUpperCase()}</td>
        <td style="text-align:center;padding:6px 10px;border:1px solid #ddd;font-weight:bold;font-size:11px;color:${RIESGO_COLOR[r.impacto]||"#333"}">${(r.impacto||"").toUpperCase()}</td>
      </tr>`).join("");

    const alertasHtml=ev.alertas.map(a=>`
      <div style="margin-bottom:8px;padding:8px 12px;border-left:3px solid ${a.tipo==="rechazo"?"#B71C1C":a.tipo==="alerta"?"#B08D57":"#2E7D32"};background:${a.tipo==="rechazo"?"#fff5f5":a.tipo==="alerta"?"#fffbe6":"#f5fff5"}">
        <strong style="font-size:12px">[${(a.tipo||"").toUpperCase()}] ${a.titulo||""}</strong>
        <p style="margin:4px 0 0;font-size:11px;color:#555">${a.detalle||""}</p>
      </div>`).join("");

    const html=`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Memo de Inversión — ${caso.codigo||""}</title>
<style>
body{font-family:Georgia,serif;max-width:820px;margin:0 auto;padding:40px;color:#2F2F2F;line-height:1.75;font-size:13px}
h1{color:#0B2545;font-size:20px;margin:0 0 4px}
h2{color:#0B2545;font-size:12px;letter-spacing:0.08em;border-bottom:2px solid #B08D57;padding-bottom:6px;margin:32px 0 14px;text-transform:uppercase}
.meta{font-size:11px;color:#6B6B6B;margin-bottom:3px}
.badge{display:inline-block;padding:5px 16px;border-radius:20px;font-size:12px;font-weight:bold;color:white;background:${veredictoColor};margin:8px 0}
table{width:100%;border-collapse:collapse;margin-bottom:12px}
th{background:#0B2545;color:#B08D57;font-size:10px;letter-spacing:0.1em;padding:7px 10px;text-align:left;border:1px solid #0B2545}
td{padding:6px 10px;border:1px solid #ddd;font-size:12px}
tr:nth-child(even) td{background:#f9f9f9}
.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0}
.kpi{border:1px solid #E8E8E8;border-top:3px solid #0B2545;border-radius:6px;padding:10px;text-align:center}
.kpi-val{font-size:16px;font-weight:bold;color:#0B2545}
.kpi-lbl{font-size:9px;color:#6B6B6B;letter-spacing:0.1em;font-weight:bold;margin-top:2px}
.narr{font-size:13px;line-height:1.9;color:#2F2F2F}
.footer{margin-top:48px;padding-top:12px;border-top:1px solid #E8E8E8;font-size:10px;color:#aaa;text-align:center}
.reco{background:#0B2545;color:white;padding:20px 24px;border-radius:8px}
</style></head><body>

<div style="border-bottom:4px solid #B08D57;padding-bottom:16px;margin-bottom:24px">
  <div style="font-size:9px;color:#6B6B6B;letter-spacing:0.15em;font-weight:bold;margin-bottom:6px">MEMORANDO CONFIDENCIAL DE INVERSIÓN — FACTOR LEGAL S.A.S.</div>
  <h1>${caso.codigo||""} — ${caso.demandanteNombre||""}</h1>
  <div class="meta">Propuesta No.: ${caso.propuestaNo||"—"} &nbsp;·&nbsp; No. Interno: ${caso.noInterno||"—"} &nbsp;·&nbsp; Fecha: ${today}</div>
  <div class="meta">Entidad: <strong>${entNombre}</strong> &nbsp;·&nbsp; Proceso: ${tipoProcNombre} &nbsp;·&nbsp; ${escNombre}</div>
  <div class="meta">Radicado: ${caso.radicado||"—"} &nbsp;·&nbsp; Juzgado: ${caso.juzgado||"—"}</div>
  <div class="badge">${veredictoLabel}</div>
</div>

<h2>1. Resumen Ejecutivo</h2>
<div class="narr">${memo.resumen||"<em>Resumen no generado.</em>"}</div>

<h2>2. Datos Financieros</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="kpi-val">${fmtM(kpis.nominal)}</div><div class="kpi-lbl">Valor Nominal</div></div>
  <div class="kpi"><div class="kpi-val">${fmtM(kpis.desembolso)}</div><div class="kpi-lbl">Desembolso</div></div>
  <div class="kpi"><div class="kpi-val">${fmtPct(kpis.descuento)}</div><div class="kpi-lbl">Descuento</div></div>
  <div class="kpi"><div class="kpi-val">${fmtX(kpis.moic)}</div><div class="kpi-lbl">MOIC</div></div>
  <div class="kpi"><div class="kpi-val">${kpis.mesesEjec!=null?kpis.mesesEjec+" m":"—"}</div><div class="kpi-lbl">Meses en Cobro</div></div>
  <div class="kpi"><div class="kpi-val">${caso.porcHonorarios?caso.porcHonorarios+"%":"—"}</div><div class="kpi-lbl">Honorarios</div></div>
</div>
<table>
  <tr><th>Componente</th><th>Valor</th><th>Nota</th></tr>
  <tr><td>Capital indexado (IPC)</td><td>${fmt(kpis.capital)}</td><td>Liquidación judicial actualizada</td></tr>
  <tr><td>Intereses moratorios</td><td>${fmt(kpis.intereses)}</td><td>Art. 176 CPACA — desde ejecutoria</td></tr>
  <tr><td><strong>Valor Nominal Total</strong></td><td><strong>${fmt(kpis.nominal)}</strong></td><td>Capital + Intereses</td></tr>
  <tr><td>Desembolso / Precio de compra</td><td>${fmt(kpis.desembolso)}</td><td>Giro al cedente propuesto</td></tr>
  <tr><td>Descuento</td><td>${fmtPct(kpis.descuento)}</td><td>Sobre valor nominal</td></tr>
  <tr><td>MOIC</td><td>${fmtX(kpis.moic)}</td><td>Nominal / Desembolso</td></tr>
  <tr><td>Fecha ejecutoria</td><td>${caso.fechaEjecutoria||"—"}</td><td>Inicio período moratorio</td></tr>
  <tr><td>Fecha cuenta de cobro</td><td>${caso.fechaCuentaCobro||"—"}</td><td>Radicación ante entidad</td></tr>
  <tr><td>Radicado ejecutivo</td><td>${caso.radicadoEjecutivo||"—"}</td><td>Proceso de cobro</td></tr>
</table>

<h2>3. Narrativa Jurídica</h2>
<div class="narr">${memo.narrativaJuridica||"<em>Narrativa no generada.</em>"}</div>

<h2>4. Motor de Elegibilidad</h2>
<div style="padding:10px 16px;border-radius:6px;border-left:4px solid ${veredictoColor};background:${ev.veredicto==="apto"?"#E8F5E9":ev.veredicto==="apto_con_alertas"?"#FFF8E1":"#FFEBEE"};margin-bottom:12px">
  <strong style="color:${veredictoColor}">${veredictoLabel}</strong> — Motor de 14 reglas de elegibilidad.
</div>
${alertasHtml||"<p><em>Sin alertas identificadas.</em></p>"}

<h2>5. Checklist Documental</h2>
<table>
  <tr><th>Documento</th><th>Requerido</th><th>Estado</th></tr>
  ${docsItems.map(d=>`<tr>
    <td>${d.label}</td>
    <td style="text-align:center">${d.req?"Sí":""}</td>
    <td style="text-align:center;font-weight:bold;color:${caso.docs?.[d.id]?"#2E7D32":d.req?"#B71C1C":"#6B6B6B"}">
      ${caso.docs?.[d.id]?"✓ Recibido":d.req?"✗ Faltante":"— N/A"}
    </td>
  </tr>`).join("")}
</table>
<p style="font-size:11px;color:#6B6B6B"><strong>${docsOk.length}</strong> / ${docsItems.length} recibidos &nbsp;·&nbsp; Faltantes obligatorios: <strong>${docsFalt.length}</strong></p>

<h2>6. Actores del Caso</h2>
<table>
  <tr><th>Rol</th><th>Nombre</th><th>Identificación</th></tr>
  <tr><td>Cedente (Demandante)</td><td>${caso.demandanteNombre||"—"}</td><td>C.C. ${caso.cedenteCc||"—"}</td></tr>
  <tr><td>Apoderado vigente</td><td>${caso.apoderadoNombre||"—"}</td><td>T.P. ${caso.apoderadoTp||"—"}</td></tr>
  <tr><td>Entidad Demandada</td><td>${entNombre}</td><td>${escNombre}</td></tr>
  <tr><td>Juzgado / Tribunal</td><td>${caso.juzgado||"—"}</td><td>Fallo: ${caso.fechaFallo||"—"}</td></tr>
  <tr><td>Comercial FL</td><td>${caso.comercial||"—"}</td><td></td></tr>
  <tr><td>Analista FL</td><td>${caso.analista||"—"}</td><td></td></tr>
</table>

<h2>7. Matriz de Riesgos</h2>
${(memo.riesgos||[]).length>0?`
<table>
  <tr><th>Riesgo</th><th>Descripción</th><th>Probabilidad</th><th>Impacto</th></tr>
  ${riesgosHtml}
</table>`:"<p><em>Matriz no generada.</em></p>"}

<h2>8. Recomendación de Inversión</h2>
<div class="reco">
  <div style="font-size:9px;color:#B08D57;letter-spacing:0.15em;font-weight:bold;margin-bottom:8px">DECISIÓN DEL COMITÉ DE INVERSIONES</div>
  <div style="font-size:17px;font-weight:bold;color:${ev.veredicto==="apto"?"#81C784":ev.veredicto==="apto_con_alertas"?"#FFD54F":"#EF9A9A"};margin-bottom:10px">${veredictoLabel}</div>
  <div style="font-size:12px;color:rgba(255,255,255,0.85);line-height:1.8">${recomendacionTexto}</div>
</div>

<div class="footer">Factor Legal S.A.S. — Documento confidencial de uso interno — Generado el ${today}<br>
Memo de Inversión ${caso.codigo||""} — No circula sin autorización escrita</div>
</body></html>`;
    dl(html,`MemoInversion_${caso.codigo||"caso"}_${new Date().toISOString().slice(0,10)}.doc`,"application/msword");
  }

  const SectionTitle=({n,title})=>(
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"26px 0 12px"}}>
      <div style={{width:22,height:22,borderRadius:"50%",background:C.navy,color:C.gold,fontSize:10,fontWeight:"bold",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{n}</div>
      <div style={{fontSize:11,fontWeight:"bold",letterSpacing:"0.1em",color:C.navy,textTransform:"uppercase"}}>{title}</div>
    </div>
  );

  return (
    <div style={{background:"white",border:`1px solid ${C.greySoft}`,borderRadius:10,overflow:"hidden"}}>
      {/* Header */}
      <div style={{background:C.navyDeep,padding:"20px 28px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:9,color:C.gold,letterSpacing:"0.2em",fontWeight:"bold",marginBottom:6}}>MEMORANDO CONFIDENCIAL DE INVERSIÓN</div>
            <div style={{fontSize:18,color:"white",fontFamily:"Georgia,serif",fontWeight:"bold",marginBottom:4}}>{caso.codigo} — {caso.demandanteNombre||"—"}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginBottom:2}}>Entidad: {entNombre} &nbsp;·&nbsp; {tipoProcNombre}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.55)"}}>Radicado: {caso.radicado||"—"} &nbsp;·&nbsp; {today}</div>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{display:"inline-block",padding:"5px 14px",borderRadius:20,fontSize:11,fontWeight:"bold",letterSpacing:"0.06em",color:"white",background:veredictoColor,marginBottom:8}}>{veredictoLabel}</div>
            <div>
              <button onClick={exportWord} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:5,border:`1px solid ${C.gold}`,background:"transparent",color:C.gold,fontWeight:"bold",fontSize:10,cursor:"pointer"}}>
                <Download size={11}/>Exportar Word
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{padding:"0 28px 32px"}}>
        {/* S1: Resumen Ejecutivo */}
        <SectionTitle n="1" title="Resumen Ejecutivo"/>
        <div style={{background:C.greyBg,borderRadius:7,padding:"14px 18px",fontSize:13,lineHeight:1.9,color:memo.resumen?C.charcoal:C.greyMid,fontStyle:memo.resumen?"normal":"italic"}}>
          {memo.resumen||"Generando resumen ejecutivo con IA…"}
        </div>

        {/* S2: Financiero */}
        <SectionTitle n="2" title="Datos Financieros"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:14}}>
          {[
            {v:fmtM(kpis.nominal),l:"Valor Nominal",c:C.navy},
            {v:fmtM(kpis.desembolso),l:"Desembolso / Giro",c:C.navy},
            {v:fmtPct(kpis.descuento),l:"Descuento",c:C.purple},
            {v:fmtX(kpis.moic),l:"MOIC",c:C.green},
            {v:kpis.mesesEjec!=null?`${kpis.mesesEjec} m`:"—",l:"Meses en Cobro",c:kpis.mesesEjec>24?C.red:C.amber},
            {v:caso.porcHonorarios?`${caso.porcHonorarios}%`:"—",l:"Honorarios",c:C.navy},
          ].map((kpi,i)=>(
            <div key={i} style={{background:"white",border:`1px solid ${C.greySoft}`,borderTop:`3px solid ${kpi.c}`,borderRadius:6,padding:"9px 12px",textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:"bold",fontFamily:"Georgia,serif",color:kpi.c}}>{kpi.v}</div>
              <div style={{fontSize:9,color:C.greyMid,letterSpacing:"0.1em",fontWeight:"bold",marginTop:2}}>{kpi.l}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:11,color:C.greyMid,display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,padding:"8px 0",borderTop:`1px solid ${C.greySoft}`}}>
          {[
            ["Capital indexado",fmt(kpis.capital)],
            ["Intereses moratorios",fmt(kpis.intereses)],
            ["Fecha ejecutoria",caso.fechaEjecutoria||"—"],
            ["Fecha cuenta cobro",caso.fechaCuentaCobro||"—"],
            ["Radicado NRD",caso.radicado||"—"],
            ["Radicado ejecutivo",caso.radicadoEjecutivo||"—"],
          ].map(([k,v],i)=>(
            <div key={i}><span style={{fontWeight:"bold",color:C.charcoal}}>{k}:</span> {v}</div>
          ))}
        </div>

        {/* S3: Narrativa Jurídica */}
        <SectionTitle n="3" title="Narrativa Jurídica del Caso"/>
        <div style={{fontSize:13,lineHeight:1.9,color:memo.narrativaJuridica?C.charcoal:C.greyMid,fontStyle:memo.narrativaJuridica?"normal":"italic"}}>
          {memo.narrativaJuridica||"Generando narrativa jurídica con IA…"}
        </div>

        {/* S4: Motor elegibilidad */}
        <SectionTitle n="4" title="Motor de Elegibilidad — 14 Reglas"/>
        <div style={{background:ev.veredicto==="apto"?C.greenSoft:ev.veredicto==="apto_con_alertas"?C.amberSoft:C.redSoft,borderLeft:`4px solid ${veredictoColor}`,borderRadius:"0 6px 6px 0",padding:"10px 14px",marginBottom:10}}>
          <div style={{fontWeight:"bold",color:veredictoColor,fontSize:13}}>{veredictoLabel}</div>
          <div style={{fontSize:11,color:C.charcoal,marginTop:2}}>Resultado automático del motor de 14 reglas — Factor Legal S.A.S.</div>
        </div>
        {ev.alertas.length>0?(
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {ev.alertas.map((a,i)=>(
              <div key={i} style={{padding:"7px 11px",borderRadius:5,borderLeft:`3px solid ${a.tipo==="rechazo"?C.red:a.tipo==="alerta"?C.amber:C.green}`,background:a.tipo==="rechazo"?C.redSoft:a.tipo==="alerta"?C.amberSoft:C.greenSoft}}>
                <div style={{fontSize:11,fontWeight:"bold",color:a.tipo==="rechazo"?C.red:a.tipo==="alerta"?C.amber:C.green}}>[{(a.tipo||"").toUpperCase()}] {a.titulo}</div>
                <div style={{fontSize:11,color:C.charcoal,marginTop:2}}>{a.detalle}</div>
              </div>
            ))}
          </div>
        ):(
          <div style={{fontSize:12,color:C.greyMid,fontStyle:"italic",padding:"8px 0"}}>Sin alertas identificadas. El caso pasa todos los filtros del motor.</div>
        )}

        {/* S5: Checklist documental */}
        <SectionTitle n="5" title="Checklist Documental"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:8}}>
          {docsItems.map(d=>{
            const ok=caso.docs?.[d.id];
            return (
              <div key={d.id} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 9px",borderRadius:4,background:ok?C.greenSoft:d.req?"#fff5f5":C.greyBg}}>
                <div style={{width:14,height:14,borderRadius:"50%",background:ok?C.green:d.req?C.red:C.greyMid,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{color:"white",fontSize:8,fontWeight:"bold"}}>{ok?"✓":d.req?"✗":"·"}</span>
                </div>
                <span style={{fontSize:10,color:ok?C.green:d.req?C.red:C.greyMid,fontWeight:d.req?"bold":"normal",flex:1}}>{d.label}</span>
                {d.req&&!ok&&<span style={{fontSize:8,color:C.red,fontWeight:"bold",flexShrink:0}}>REQ</span>}
              </div>
            );
          })}
        </div>
        <div style={{fontSize:11,color:C.greyMid}}>
          <strong style={{color:C.charcoal}}>{docsOk.length}</strong> / {docsItems.length} recibidos &nbsp;·&nbsp;
          <strong style={{color:docsFalt.length>0?C.red:C.green}}>{docsFalt.length} obligatorio(s) faltante(s)</strong>
        </div>

        {/* S6: Actores */}
        <SectionTitle n="6" title="Actores del Caso"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            {rol:"Cedente (Demandante)",nom:caso.demandanteNombre||"—",det:`C.C. ${caso.cedenteCc||"—"}`},
            {rol:"Apoderado vigente",nom:caso.apoderadoNombre||"—",det:`T.P. ${caso.apoderadoTp||"—"}`},
            {rol:"Entidad Demandada",nom:entNombre,det:escNombre},
            {rol:"Juzgado / Tribunal",nom:caso.juzgado||"—",det:`Fallo: ${caso.fechaFallo||"—"}`},
            {rol:"Comercial FL",nom:caso.comercial||"—",det:""},
            {rol:"Analista FL",nom:caso.analista||"—",det:""},
          ].map((a,i)=>(
            <div key={i} style={{background:C.greyBg,borderRadius:6,padding:"8px 11px"}}>
              <div style={{fontSize:9,color:C.greyMid,letterSpacing:"0.1em",fontWeight:"bold"}}>{a.rol}</div>
              <div style={{fontSize:12,color:C.navy,fontWeight:"bold",marginTop:2}}>{a.nom}</div>
              {a.det&&<div style={{fontSize:10,color:C.greyMid}}>{a.det}</div>}
            </div>
          ))}
        </div>

        {/* S7: Riesgos */}
        <SectionTitle n="7" title="Matriz de Riesgos"/>
        {memo.riesgos===null?(
          <div style={{fontSize:12,color:C.greyMid,fontStyle:"italic"}}>Generando matriz de riesgos con IA…</div>
        ):memo.riesgos&&memo.riesgos.length>0?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
            {memo.riesgos.map((r,i)=>(
              <div key={i} style={{border:`1px solid ${C.greySoft}`,borderLeft:`4px solid ${RIESGO_COLOR[r.impacto]||C.greyMid}`,borderRadius:6,padding:"10px 12px",background:RIESGO_BG[r.impacto]||C.greyBg}}>
                <div style={{fontSize:11,fontWeight:"bold",color:C.navy,marginBottom:4}}>{r.titulo}</div>
                <div style={{fontSize:11,color:C.charcoal,lineHeight:1.6,marginBottom:7}}>{r.descripcion}</div>
                <div style={{display:"flex",gap:6}}>
                  <span style={{fontSize:9,fontWeight:"bold",padding:"2px 7px",borderRadius:10,background:RIESGO_COLOR[r.probabilidad]||C.greyMid,color:"white"}}>P: {(r.probabilidad||"—").toUpperCase()}</span>
                  <span style={{fontSize:9,fontWeight:"bold",padding:"2px 7px",borderRadius:10,background:RIESGO_COLOR[r.impacto]||C.greyMid,color:"white"}}>I: {(r.impacto||"—").toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        ):(
          <div style={{fontSize:12,color:C.greyMid,fontStyle:"italic"}}>Sin riesgos adicionales identificados.</div>
        )}

        {/* S8: Recomendación */}
        <SectionTitle n="8" title="Recomendación de Inversión"/>
        <div style={{background:C.navyDeep,borderRadius:8,padding:"18px 22px"}}>
          <div style={{fontSize:9,color:C.gold,letterSpacing:"0.15em",fontWeight:"bold",marginBottom:8}}>DECISIÓN DEL COMITÉ DE INVERSIONES — FACTOR LEGAL S.A.S.</div>
          <div style={{fontSize:17,fontWeight:"bold",fontFamily:"Georgia,serif",marginBottom:10,color:ev.veredicto==="apto"?"#81C784":ev.veredicto==="apto_con_alertas"?"#FFD54F":"#EF9A9A"}}>{veredictoLabel}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.85)",lineHeight:1.8}}>{recomendacionTexto}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Contrato auto-poblado ───────────────────────────────────────────────────
function ContratoVisor({caso,tipo}) {
  const entNombre=ENTIDADES.find(e=>e.id===caso.entidad)?.nombre||caso.entidad||"[ENTIDAD]";
  const today=new Date().toLocaleDateString("es-CO",{day:"2-digit",month:"long",year:"numeric"});
  const kpis=calcKPIs(caso);

  const PLANTILLAS_TPL={
    sentencia:{
      titulo:"CONTRATO DE CESIÓN DE DERECHOS LITIGIOSOS",
      subtitulo:"(Sentencia Judicial — Factor Legal S.A.S.)",
      cuerpo:`Entre los suscritos, a saber: [NOMBRE CEDENTE], identificado(a) con C.C. No. [CC], actuando en calidad de beneficiario(a) del fallo judicial No. [RADICADO], proferido por [JUZGADO/TRIBUNAL] el [FECHA FALLO], debidamente ejecutoriado el [FECHA EJECUTORIA], en adelante EL CEDENTE; y FACTOR LEGAL S.A.S., sociedad identificada con NIT. [NIT], en adelante EL CESIONARIO; se celebra el presente contrato de cesión de derechos litigiosos, sujeto a las siguientes cláusulas:

PRIMERA — OBJETO: El CEDENTE cede y transfiere al CESIONARIO la totalidad de los derechos económicos que le corresponden en la sentencia identificada, por un valor nominal de [VALOR NOMINAL], comprensivo de capital ([CAPITAL]) e intereses moratorios ([INTERESES]).

SEGUNDA — PRECIO: El CESIONARIO reconoce al CEDENTE la suma de [PRECIO COMPRA] como precio de la presente cesión, suma que se cancelará conforme a las condiciones pactadas en el acuerdo comercial adjunto.

TERCERA — GARANTÍAS: El CEDENTE declara que los derechos cedidos se encuentran libres de gravámenes, hipotecas, embargos o cualquier medida cautelar. Declara igualmente que no existen cesiones previas sobre los mismos derechos.

CUARTA — DOCUMENTACIÓN: El CEDENTE se obliga a entregar al CESIONARIO la totalidad de la documentación del proceso, incluyendo pero sin limitarse a: sentencias de instancia, constancias de ejecutoria, poderes vigentes, y cuentas de cobro radicadas.

QUINTA — LEY APLICABLE: El presente contrato se rige por las normas del Código Civil colombiano sobre cesión de créditos y derechos litigiosos (Arts. 1959 y ss. C.C.), y las disposiciones del CPACA sobre cobro coactivo.

Para constancia, se firma en [CIUDAD], a los [DÍA] días del mes de [MES] de [AÑO].

_______________________________          _______________________________
EL CEDENTE                                EL CESIONARIO
[NOMBRE CEDENTE]                         FACTOR LEGAL S.A.S.
C.C. No. [CC]                           NIT. [NIT]`
    },
    conciliacion:{
      titulo:"CONTRATO DE CESIÓN DE DERECHOS CONCILIADOS",
      subtitulo:"(Acuerdo de Conciliación — Factor Legal S.A.S.)",
      cuerpo:`Entre los suscritos, a saber: [NOMBRE CEDENTE], identificado(a) con C.C. No. [CC], beneficiario(a) del acuerdo de conciliación aprobado mediante auto del [FECHA AUTO] por [JUZGADO/TRIBUNAL], con constancia de ejecutoria del [FECHA EJECUTORIA], en adelante EL CEDENTE; y FACTOR LEGAL S.A.S., identificada con NIT. [NIT], en adelante EL CESIONARIO; se celebra el presente contrato de cesión:

PRIMERA — OBJETO: Cesión de la totalidad de los derechos económicos derivados del acuerdo de conciliación suscrito entre el CEDENTE y [ENTIDAD DEMANDADA], por valor de [VALOR CONCILIADO].

SEGUNDA — PRECIO Y FORMA DE PAGO: El CESIONARIO pagará al CEDENTE la suma de [PRECIO COMPRA], en la forma y plazos acordados en el compromiso comercial suscrito entre las partes.

TERCERA — ACTA DE CONCILIACIÓN: El CEDENTE declara que el acuerdo fue debidamente aprobado por el despacho competente, se encuentra ejecutoriado, y ha sido radicada la respectiva cuenta de cobro ante [ENTIDAD].

CUARTA — OBLIGACIONES DEL CEDENTE: (i) Entregar originales o copias autenticadas de toda la documentación del proceso; (ii) suscribir poderes especiales para gestión de cobro; (iii) concurrir personalmente cuando la entidad pagadora lo requiera; (iv) abstenerse de suscribir nuevas cesiones, transacciones o gravámenes sobre los mismos derechos.

QUINTA — OBLIGACIONES DEL CESIONARIO: Gestionar el cobro del crédito cedido ante [ENTIDAD DEMANDADA] con la diligencia debida, informando al CEDENTE sobre el avance del proceso de pago.

SEXTA — RÉGIMEN JURÍDICO: El presente contrato se rige por los Arts. 1959 y siguientes del Código Civil, Ley 446 de 1998, Ley 640 de 2001 y normas concordantes.

Firmado en [CIUDAD], el [FECHA].

_______________________________          _______________________________
EL CEDENTE                                EL CESIONARIO
[NOMBRE CEDENTE]                         FACTOR LEGAL S.A.S.
C.C. No. [CC]                           NIT. [NIT]`
    }
  };

  const tpl=PLANTILLAS_TPL[tipo]||PLANTILLAS_TPL.sentencia;

  function fill(tpl){
    return tpl
      .replace(/\[NOMBRE CEDENTE\]/g, caso.demandanteNombre||"[NOMBRE CEDENTE]")
      .replace(/\[CC\]/g, caso.cedenteCc||"[CC]")
      .replace(/\[RADICADO\]/g, caso.radicado||"[RADICADO]")
      .replace(/\[JUZGADO\/TRIBUNAL\]/g, caso.juzgado||"[JUZGADO]")
      .replace(/\[FECHA FALLO\]/g, caso.fechaFallo||"[FECHA FALLO]")
      .replace(/\[FECHA EJECUTORIA\]/g, caso.fechaEjecutoria||"[FECHA EJECUTORIA]")
      .replace(/\[VALOR NOMINAL\]/g, fmt(kpis.nominal))
      .replace(/\[CAPITAL\]/g, fmt(kpis.capital))
      .replace(/\[INTERESES\]/g, fmt(kpis.intereses))
      .replace(/\[PRECIO COMPRA\]/g, fmt(kpis.desembolso))
      .replace(/\[VALOR CONCILIADO\]/g, fmt(kpis.nominal))
      .replace(/\[ENTIDAD DEMANDADA\]/g, entNombre)
      .replace(/\[ENTIDAD\]/g, entNombre)
      .replace(/\[FECHA AUTO\]/g, caso.fechaFallo||"[FECHA AUTO]")
      .replace(/\[CIUDAD\]/g, "Bogotá D.C.")
      .replace(/\[FECHA\]/g, today)
      .replace(/\[DÍA\]/g, new Date().getDate().toString())
      .replace(/\[MES\]/g, new Date().toLocaleString("es-CO",{month:"long"}))
      .replace(/\[AÑO\]/g, new Date().getFullYear().toString())
      .replace(/\[NIT\]/g, "901.234.567-8");
  }

  const cuerpoLleno=fill(tpl.cuerpo);
  const tituloLleno=tpl.titulo;
  const camposIncompletos=cuerpoLleno.includes("[");

  function exportContrato(){
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${tituloLleno}</title>
<style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:0 40px;color:#333;line-height:1.9;font-size:13px}
h1{color:#0B2545;font-size:16px;text-align:center;border-bottom:2px solid #B08D57;padding-bottom:10px}
h2{color:#0B2545;font-size:12px;text-align:center;font-style:italic;margin-top:0}
pre{white-space:pre-wrap;font-family:Georgia,serif;font-size:13px;line-height:1.9}
.footer{margin-top:48px;text-align:center;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:10px}</style></head><body>
<h1>${tituloLleno}</h1><h2>${tpl.subtitulo}</h2>
<pre>${cuerpoLleno}</pre>
<div class="footer">Factor Legal S.A.S. — Documento confidencial — ${today}</div>
</body></html>`;
    dl(html,`Contrato_${tipo}_${caso.codigo||"caso"}.doc`,"application/msword");
  }

  return (
    <div style={{background:"white",border:`1px solid ${C.greySoft}`,borderRadius:8,overflow:"hidden"}}>
      <div style={{background:C.navy,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:9,color:C.gold,letterSpacing:"0.12em",fontWeight:"bold",marginBottom:2}}>CONTRATO AUTO-POBLADO</div>
          <div style={{fontSize:13,fontWeight:"bold",color:"white"}}>{tituloLleno}</div>
          <div style={{fontSize:10,fontStyle:"italic",color:"rgba(255,255,255,0.6)"}}>{tpl.subtitulo}</div>
        </div>
        <button onClick={exportContrato} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:6,border:"none",background:C.gold,color:C.navy,fontWeight:"bold",fontSize:11,cursor:"pointer"}}>
          <Download size={12}/>Word
        </button>
      </div>
      {camposIncompletos&&(
        <div style={{background:C.amberSoft,borderBottom:`1px solid ${C.gold}`,padding:"7px 20px",fontSize:11,color:C.charcoal,display:"flex",alignItems:"center",gap:8}}>
          <AlertCircle size={12} style={{color:C.amber,flexShrink:0}}/>
          Campos pendientes: complete los datos del caso para auto-poblar el contrato.
        </div>
      )}
      <div style={{padding:"24px 32px"}}>
        <pre style={{whiteSpace:"pre-wrap",fontFamily:"Georgia,serif",fontSize:13,color:C.charcoal,lineHeight:1.9,margin:0}}>{cuerpoLleno}</pre>
      </div>
    </div>
  );
}

// ─── NerakLegal (main) ───────────────────────────────────────────────────────
function NerakLegal({casos,user,onOpenCaso}) {
  const [tab,setTab]=useState("dd");
  const [memo,setMemo]=useState(null);           // {resumen, narrativaJuridica, riesgos}
  const [memoCasoId,setMemoCasoId]=useState(null);
  const [loadingMemo,setLoadingMemo]=useState(false);
  const [plantillaTipo,setPlantillaTipo]=useState("sentencia");
  const [contratoCasoId,setContratoCasoId]=useState(null);

  const casosConAlertas=useMemo(()=>casos.map(c=>{
    const ev=evaluarCaso(c);
    return {...c,_ev:ev};
  }),[casos]);

  const rechazados=casosConAlertas.filter(c=>c._ev.veredicto==="no_apto");
  const conAlertas=casosConAlertas.filter(c=>c._ev.veredicto==="apto_con_alertas");
  const aptos=casosConAlertas.filter(c=>c._ev.veredicto==="apto");

  const memoCaso=memoCasoId?casosConAlertas.find(c=>c.id===memoCasoId):null;
  const contratoCaso=contratoCasoId?casosConAlertas.find(c=>c.id===contratoCasoId):null;

  async function generarMemo(caso) {
    setMemoCasoId(caso.id);
    setMemo({resumen:null,narrativaJuridica:null,riesgos:null});
    setLoadingMemo(true);
    setTab("memo");

    const kpis=calcKPIs(caso);
    const ev=evaluarCaso(caso);
    const entNombre=ENTIDADES.find(e=>e.id===caso.entidad)?.nombre||caso.entidad||"—";
    const tipoProcNombre=TIPOS_PROCESO.find(t=>t.id===caso.tipoProceso)?.nombre||"—";

    const prompt=`Eres un analista senior de factor de sentencias judiciales en Colombia, con experiencia en debida diligencia de cesión de derechos litigiosos. Analiza este caso y responde ÚNICAMENTE con un objeto JSON válido con exactamente estas 3 claves:

{
  "resumen": "<párrafo de 100-130 palabras: síntesis ejecutiva del caso para un comité de inversiones. Incluir: quién demandó a quién, por qué concepto legal (ej: prima especial sin carácter salarial), cuánto vale el fallo, qué tan avanzado está el cobro, y la conclusión de inversión en una oración>",
  "narrativaJuridica": "<2-3 párrafos: explicar el fundamento jurídico del caso (tipología de proceso, artículos aplicables, jurisprudencia relevante si existe), el estado procesal actual, y los aspectos legales relevantes para el cobro ante la entidad demandada>",
  "riesgos": [
    {"titulo":"<nombre del riesgo>","descripcion":"<descripción de 1-2 oraciones>","probabilidad":"alta|media|baja","impacto":"alto|medio|bajo"},
    ... (máximo 5 riesgos, solo los materiales)
  ]
}

DATOS DEL CASO:
Código FL: ${caso.codigo}
Demandante: ${caso.demandanteNombre||"—"} — C.C. ${caso.cedenteCc||"—"}
Entidad demandada: ${entNombre}
Tipo proceso: ${tipoProcNombre}
Escenario: ${ESCENARIOS.find(s=>s.id===caso.escenario)?.nombre||"—"}
Radicado NRD: ${caso.radicado||"—"}
Radicado ejecutivo: ${caso.radicadoEjecutivo||"—"}
Juzgado: ${caso.juzgado||"—"}
Fecha fallo: ${caso.fechaFallo||"—"}
Fecha ejecutoria: ${caso.fechaEjecutoria||"—"}
Fecha cuenta de cobro: ${caso.fechaCuentaCobro||"—"}
Capital indexado: ${fmt(kpis.capital)}
Intereses moratorios: ${fmt(kpis.intereses)}
Valor nominal total: ${fmt(kpis.nominal)}
Desembolso propuesto: ${fmt(kpis.desembolso)}
Descuento: ${fmtPct(kpis.descuento)}
MOIC: ${fmtX(kpis.moic)}
Meses desde ejecutoria: ${kpis.mesesEjec!=null?kpis.mesesEjec+" meses":"—"}
Honorarios abogado: ${caso.porcHonorarios?caso.porcHonorarios+"%":"—"}
Veredicto motor elegibilidad: ${ev.veredicto}
Alertas motor: ${ev.alertas.map(a=>`[${a.tipo}] ${a.titulo}`).join("; ")||"ninguna"}
Descripción caso: ${caso.descripcion||"—"}

IMPORTANTE: Responde SOLO el JSON. Sin texto adicional antes ni después. Sin markdown. Sin explicaciones.`;

    try {
      const res=await fetch(WORKER_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mode:"analyze",prompt})
      });
      if(res.ok){
        const data=await res.json();
        const rawText=data.analysis||data.result?.resumenHechos||"";
        try {
          // Extract JSON from response (handle markdown code blocks)
          const jsonMatch=rawText.match(/\{[\s\S]*\}/);
          if(jsonMatch){
            const parsed=JSON.parse(jsonMatch[0]);
            setMemo({
              resumen:parsed.resumen||"Resumen no disponible.",
              narrativaJuridica:parsed.narrativaJuridica||"Narrativa no disponible.",
              riesgos:Array.isArray(parsed.riesgos)?parsed.riesgos:[]
            });
          } else {
            throw new Error("No JSON found");
          }
        } catch(parseErr) {
          // IA responded but not valid JSON — use raw text as resumen
          setMemo({resumen:rawText.slice(0,600),narrativaJuridica:"Análisis de narrativa no disponible en este momento.",riesgos:[]});
        }
      } else {
        throw new Error("Worker error "+res.status);
      }
    } catch(e) {
      // Fallback: deterministic memo
      setMemo({
        resumen:`Caso ${caso.codigo} — ${caso.demandanteNombre||"demandante"}. Proceso de ${tipoProcNombre} contra ${entNombre}. Valor nominal: ${fmt(kpis.nominal)} (capital ${fmt(kpis.capital)} + intereses ${fmt(kpis.intereses)}). Desembolso propuesto: ${fmt(kpis.desembolso)} (descuento ${fmtPct(kpis.descuento)}, MOIC ${fmtX(kpis.moic)}). Veredicto del motor: ${ev.veredicto.replace(/_/g," ")}.`,
        narrativaJuridica:`El caso corresponde a un proceso de ${tipoProcNombre} radicado ante ${caso.juzgado||"despacho competente"}, bajo el radicado ${caso.radicado||"—"}. La sentencia quedó ejecutoriada el ${caso.fechaEjecutoria||"—"}, con cuenta de cobro radicada el ${caso.fechaCuentaCobro||"—"} ante ${entNombre}. El proceso de cobro coactivo se adelanta bajo el régimen del CPACA.`,
        riesgos:ev.alertas.filter(a=>a.tipo!=="info").slice(0,4).map(a=>({
          titulo:a.titulo,descripcion:a.detalle,
          probabilidad:a.tipo==="rechazo"?"alta":a.tipo==="alerta"?"media":"baja",
          impacto:a.tipo==="rechazo"?"alto":a.tipo==="alerta"?"medio":"bajo"
        }))
      });
    } finally {
      setLoadingMemo(false);
    }
  }

  const TabBtn=({id,label,Ic})=>(
    <button onClick={()=>setTab(id)} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:6,cursor:"pointer",fontWeight:"bold",fontSize:11,letterSpacing:"0.08em",background:tab===id?C.purple:"white",color:tab===id?"white":C.purple,border:tab===id?"none":`1px solid ${C.purple}`,transition:"all 0.15s"}}>
      <Ic size={12}/>{label}
    </button>
  );

  return (
    <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 24px"}}>
      {/* Header */}
      <div style={{marginBottom:28,display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <div style={{background:C.purpleSoft,borderRadius:8,padding:"3px 10px",display:"flex",alignItems:"center",gap:6}}>
              <Sparkles size={12} style={{color:C.purple}}/>
              <span style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.12em",color:C.purple}}>MÓDULO RESTRINGIDO</span>
            </div>
            <div style={{fontSize:10,color:C.greyMid}}>Acceso: {user.role}</div>
          </div>
          <h1 style={{color:C.navy,fontSize:26,fontFamily:"Georgia,serif",margin:"0 0 4px"}}>Nerak Legal</h1>
          <div style={{fontSize:12,fontStyle:"italic",color:C.greyMid}}>Due Diligence Avanzado · Memo de Inversión · Contratos</div>
          <div style={{height:3,width:56,background:C.purple,marginTop:10}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,textAlign:"center"}}>
          {[{n:aptos.length,l:"APTOS",c:C.green},{n:conAlertas.length,l:"CON ALERTAS",c:C.amber},{n:rechazados.length,l:"NO APTOS",c:C.red}].map((s,i)=>(
            <div key={i} style={{background:"white",border:`1px solid ${C.greySoft}`,borderTop:`3px solid ${s.c}`,borderRadius:8,padding:"12px 16px"}}>
              <div style={{fontSize:22,fontWeight:"bold",fontFamily:"Georgia,serif",color:C.navy}}>{s.n}</div>
              <div style={{fontSize:9,color:C.greyMid,letterSpacing:"0.1em",fontWeight:"bold"}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:7,marginBottom:22}}>
        <TabBtn id="dd" label="DD Avanzado" Ic={BarChart3}/>
        <TabBtn id="memo" label="Memo de Inversión" Ic={Sparkles}/>
        <TabBtn id="contratos" label="Contratos" Ic={FileText}/>
      </div>

      {/* ── TAB: DD AVANZADO ── */}
      {tab==="dd"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            {/* Con alertas */}
            <div style={{background:"white",border:`1px solid ${C.greySoft}`,borderRadius:8,overflow:"hidden"}}>
              <div style={{background:C.amber,padding:"9px 14px",display:"flex",alignItems:"center",gap:7}}>
                <ShieldAlert size={12} style={{color:"white"}}/>
                <span style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.1em",color:"white"}}>REQUIEREN GESTIÓN ({conAlertas.length})</span>
              </div>
              {conAlertas.length===0?(<div style={{padding:28,textAlign:"center",fontSize:12,fontStyle:"italic",color:C.greyMid}}>Sin casos pendientes</div>):
              conAlertas.map(c=>{
                const kpis=calcKPIs(c);
                return (
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:`1px solid ${C.greySoft}`}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:"bold",color:C.navy}}>{c.codigo}</div>
                      <div style={{fontSize:11,color:C.greyMid,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.demandanteNombre||"—"}</div>
                      <div style={{fontSize:10,color:C.amber,fontWeight:"bold",marginTop:2}}>{c._ev.alertas.filter(a=>a.tipo==="alerta").length} alerta(s) · {c._ev.alertas.filter(a=>a.tipo==="pendiente").length} pendiente(s)</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:11,fontFamily:"monospace",color:C.navy}}>{fmtM(kpis.nominal)}</div>
                      <div style={{fontSize:10,color:C.greyMid}}>{fmtPct(kpis.descuento)} dto</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      <button onClick={()=>onOpenCaso(c.id)} style={{padding:"3px 7px",fontSize:9,borderRadius:4,border:`1px solid ${C.greySoft}`,background:"white",cursor:"pointer",color:C.navy,fontWeight:"bold"}}>Ver</button>
                      <button onClick={()=>generarMemo(c)} style={{padding:"3px 7px",fontSize:9,borderRadius:4,border:"none",background:C.purple,cursor:"pointer",color:"white",fontWeight:"bold"}}>Memo</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Rechazados */}
            <div style={{background:"white",border:`1px solid ${C.greySoft}`,borderRadius:8,overflow:"hidden"}}>
              <div style={{background:C.red,padding:"9px 14px",display:"flex",alignItems:"center",gap:7}}>
                <ShieldX size={12} style={{color:"white"}}/>
                <span style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.1em",color:"white"}}>NO APTOS — RECHAZADOS ({rechazados.length})</span>
              </div>
              {rechazados.length===0?(<div style={{padding:28,textAlign:"center",fontSize:12,fontStyle:"italic",color:C.greyMid}}>Sin casos rechazados</div>):
              rechazados.map(c=>(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:`1px solid ${C.greySoft}`}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:"bold",color:C.navy}}>{c.codigo}</div>
                    <div style={{fontSize:11,color:C.greyMid}}>{c.demandanteNombre||"—"}</div>
                    <div style={{fontSize:10,color:C.red,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c._ev.alertas.filter(a=>a.tipo==="rechazo").map(a=>a.titulo).join(" · ")}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    <button onClick={()=>onOpenCaso(c.id)} style={{padding:"3px 7px",fontSize:9,borderRadius:4,border:`1px solid ${C.greySoft}`,background:"white",cursor:"pointer",color:C.navy,fontWeight:"bold"}}>Ver</button>
                    <button onClick={()=>generarMemo(c)} style={{padding:"3px 7px",fontSize:9,borderRadius:4,border:"none",background:C.purple,cursor:"pointer",color:"white",fontWeight:"bold"}}>Memo</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aptos */}
          <div style={{background:"white",border:`1px solid ${C.greySoft}`,borderRadius:8,overflow:"hidden",marginBottom:16}}>
            <div style={{background:C.green,padding:"9px 14px",display:"flex",alignItems:"center",gap:7}}>
              <ShieldCheck size={12} style={{color:"white"}}/>
              <span style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.1em",color:"white"}}>APTOS PARA INVERSIÓN ({aptos.length})</span>
            </div>
            {aptos.length===0?(<div style={{padding:24,textAlign:"center",fontSize:12,fontStyle:"italic",color:C.greyMid}}>Sin casos aptos</div>):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:0}}>
                {aptos.map(c=>{
                  const kpis=calcKPIs(c);
                  return (
                    <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:`1px solid ${C.greySoft}`,borderRight:`1px solid ${C.greySoft}`}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:"bold",color:C.navy}}>{c.codigo}</div>
                        <div style={{fontSize:11,color:C.greyMid,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.demandanteNombre||"—"}</div>
                        <div style={{fontSize:10,color:C.green,fontWeight:"bold",marginTop:2}}>{fmtM(kpis.nominal)} · {fmtX(kpis.moic)} MOIC</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:4}}>
                        <button onClick={()=>onOpenCaso(c.id)} style={{padding:"3px 7px",fontSize:9,borderRadius:4,border:`1px solid ${C.greySoft}`,background:"white",cursor:"pointer",color:C.navy,fontWeight:"bold"}}>Ver</button>
                        <button onClick={()=>generarMemo(c)} style={{padding:"3px 7px",fontSize:9,borderRadius:4,border:"none",background:C.purple,cursor:"pointer",color:"white",fontWeight:"bold"}}>Memo</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Exposición por entidad */}
          <div style={{background:"white",border:`1px solid ${C.greySoft}`,borderRadius:8,overflow:"hidden"}}>
            <div style={{background:C.navy,padding:"9px 14px",display:"flex",alignItems:"center",gap:7}}>
              <BarChart3 size={12} style={{color:C.gold}}/>
              <span style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.1em",color:"white"}}>EXPOSICIÓN AGREGADA POR ENTIDAD</span>
            </div>
            <div style={{padding:14}}>
              {(()=>{
                const byEnt={};
                casosConAlertas.forEach(c=>{
                  const eName=ENTIDADES.find(e=>e.id===c.entidad)?.nombre||c.entidad||"Sin entidad";
                  if(!byEnt[eName])byEnt[eName]={count:0,nominal:0,desembolso:0,aptos:0,alertas:0,rechazados:0};
                  const k=calcKPIs(c);
                  byEnt[eName].count++;
                  byEnt[eName].nominal+=k.nominal;
                  byEnt[eName].desembolso+=k.desembolso;
                  if(c._ev.veredicto==="apto")byEnt[eName].aptos++;
                  else if(c._ev.veredicto==="apto_con_alertas")byEnt[eName].alertas++;
                  else byEnt[eName].rechazados++;
                });
                const arr=Object.entries(byEnt).sort((a,b)=>b[1].nominal-a[1].nominal);
                if(arr.length===0)return <div style={{textAlign:"center",padding:28,fontSize:12,fontStyle:"italic",color:C.greyMid}}>Sin datos</div>;
                return (<>
                  <div style={{display:"grid",gridTemplateColumns:"2fr 60px 110px 110px 80px",gap:6,padding:"5px 8px",background:C.navy,borderRadius:4,marginBottom:6}}>
                    {["ENTIDAD","CASOS","NOMINAL","DESEMBOLSO","ESTADO"].map((h,i)=>(
                      <div key={i} style={{fontSize:9,fontWeight:"bold",color:C.gold,letterSpacing:"0.1em",textAlign:i>0?"center":"left"}}>{h}</div>
                    ))}
                  </div>
                  {arr.map(([ent,d])=>(
                    <div key={ent} style={{display:"grid",gridTemplateColumns:"2fr 60px 110px 110px 80px",gap:6,padding:"7px 8px",borderBottom:`1px solid ${C.greySoft}`,alignItems:"center"}}>
                      <div style={{fontSize:11,color:C.navy,fontWeight:"bold"}}>{ent}</div>
                      <div style={{fontSize:11,fontFamily:"monospace",textAlign:"center"}}>{d.count}</div>
                      <div style={{fontSize:11,fontFamily:"monospace",textAlign:"center",color:C.navy}}>{fmtM(d.nominal)}</div>
                      <div style={{fontSize:11,fontFamily:"monospace",textAlign:"center"}}>{fmtM(d.desembolso)}</div>
                      <div style={{textAlign:"center",fontSize:10,fontWeight:"bold"}}>
                        <span style={{color:C.green}}>{d.aptos}✓</span> <span style={{color:C.amber}}>{d.alertas}⚠</span> <span style={{color:C.red}}>{d.rechazados}✗</span>
                      </div>
                    </div>
                  ))}
                </>);
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: MEMO DE INVERSIÓN ── */}
      {tab==="memo"&&(
        <div>
          {!memoCasoId&&(
            <div>
              <div style={{fontSize:11,fontWeight:"bold",letterSpacing:"0.1em",color:C.navy,marginBottom:12}}>SELECCIONAR CASO PARA GENERAR MEMO DE INVERSIÓN</div>
              <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:500,overflowY:"auto"}}>
                {casosConAlertas.length===0?(<div style={{padding:32,textAlign:"center",fontSize:12,fontStyle:"italic",color:C.greyMid}}>Sin casos registrados</div>):
                casosConAlertas.map(c=>{
                  const kpis=calcKPIs(c);
                  return (
                    <button key={c.id} onClick={()=>generarMemo(c)}
                      style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:"white",border:`1px solid ${C.greySoft}`,borderRadius:6,cursor:"pointer",textAlign:"left"}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:"bold",color:C.navy}}>{c.codigo}</div>
                        <div style={{fontSize:11,color:C.greyMid}}>{c.demandanteNombre||"—"} · {ENTIDADES.find(e=>e.id===c.entidad)?.nombre||"—"}</div>
                        <div style={{fontSize:11,color:C.greyMid}}>{fmtM(kpis.nominal)} nominal · {fmtX(kpis.moic)} MOIC</div>
                      </div>
                      <div style={{padding:"4px 10px",borderRadius:12,fontSize:10,fontWeight:"bold",color:"white",background:c._ev.veredicto==="apto"?C.green:c._ev.veredicto==="apto_con_alertas"?C.amber:C.red}}>
                        {c._ev.veredicto==="apto"?"APTO":c._ev.veredicto==="apto_con_alertas"?"ALERTAS":"NO APTO"}
                      </div>
                      <Sparkles size={13} style={{color:C.purple,flexShrink:0}}/>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {memoCasoId&&(
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <button onClick={()=>{setMemoCasoId(null);setMemo(null);}} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:5,border:`1px solid ${C.greySoft}`,background:"white",cursor:"pointer",fontSize:11,color:C.navy,fontWeight:"bold"}}>
                  <ArrowLeft size={12}/>Otro caso
                </button>
                {loadingMemo&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:5,background:C.purpleSoft,border:`1px solid ${C.purple}`}}>
                    <div style={{width:14,height:14,border:`2px solid ${C.purple}`,borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    <span style={{fontSize:11,color:C.purple,fontWeight:"bold"}}>Generando memo con IA…</span>
                  </div>
                )}
                {!loadingMemo&&memo&&(
                  <div style={{fontSize:11,color:C.greyMid,fontStyle:"italic"}}>
                    Memo generado · {new Date().toLocaleString("es-CO")}
                  </div>
                )}
              </div>
              {memoCaso&&memo&&<MemoVisor memo={memo} caso={memoCaso}/>}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: CONTRATOS ── */}
      {tab==="contratos"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:20}}>
            {/* Panel izquierdo: selección */}
            <div>
              <div style={{fontSize:11,fontWeight:"bold",letterSpacing:"0.1em",color:C.navy,marginBottom:10}}>TIPO DE CONTRATO</div>
              <div style={{display:"flex",gap:6,marginBottom:16}}>
                {[{id:"sentencia",label:"Cesión Sentencia",Ic:Gavel},{id:"conciliacion",label:"Cesión Conciliación",Ic:Scale}].map(({id,label,Ic})=>(
                  <button key={id} onClick={()=>setPlantillaTipo(id)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:5,cursor:"pointer",fontWeight:"bold",fontSize:10,background:plantillaTipo===id?C.navy:"white",color:plantillaTipo===id?C.gold:C.navy,border:plantillaTipo===id?"none":`1px solid ${C.greySoft}`}}>
                    <Ic size={11}/>{label}
                  </button>
                ))}
              </div>
              <div style={{fontSize:11,fontWeight:"bold",letterSpacing:"0.1em",color:C.navy,marginBottom:8}}>CASO PARA EL CONTRATO</div>
              <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:500,overflowY:"auto"}}>
                {casosConAlertas.map(c=>(
                  <button key={c.id} onClick={()=>setContratoCasoId(c.id)}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"white",border:`1px solid ${contratoCasoId===c.id?C.navy:C.greySoft}`,borderLeft:contratoCasoId===c.id?`3px solid ${C.navy}`:`1px solid ${C.greySoft}`,borderRadius:5,cursor:"pointer",textAlign:"left"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:"bold",color:C.navy}}>{c.codigo}</div>
                      <div style={{fontSize:10,color:C.greyMid,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.demandanteNombre||"—"}</div>
                    </div>
                  </button>
                ))}
                {casosConAlertas.length===0&&(
                  <div style={{padding:24,textAlign:"center",fontSize:12,fontStyle:"italic",color:C.greyMid}}>Sin casos</div>
                )}
              </div>
            </div>
            {/* Panel derecho: contrato */}
            <div>
              {contratoCaso?(
                <ContratoVisor caso={contratoCaso} tipo={plantillaTipo}/>
              ):(
                <div style={{background:C.greyBg,border:`1px solid ${C.greySoft}`,borderRadius:8,padding:48,textAlign:"center"}}>
                  <FileText size={32} style={{color:C.greyMid,margin:"0 auto 12px"}}/>
                  <div style={{fontSize:13,color:C.greyMid,fontWeight:"bold",marginBottom:4}}>Selecciona un caso</div>
                  <div style={{fontSize:11,color:C.greyMid,fontStyle:"italic"}}>El contrato se auto-poblará con los datos del caso</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
