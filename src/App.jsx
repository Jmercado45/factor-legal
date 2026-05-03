import { useState, useEffect, useMemo } from "react";
import {
  Building2, FileText, Users, CheckCircle2, Clock, Download, Plus,
  Search, ChevronRight, Briefcase, TrendingUp, AlertCircle,
  LogOut, User, Lock, Eye, EyeOff, Trash2, Edit3, Save, ArrowLeft,
  Calendar, DollarSign, Scale, Gavel, Target, BarChart3, Activity,
  ShieldCheck, ShieldAlert, ShieldX, Shield, Home, Database,
  ClipboardCheck, Coins, Info
} from "lucide-react";
import { db } from "./firebase.js";
import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot
} from "firebase/firestore";

// ─── Paleta ──────────────────────────────────────────────────
const C = {
  navy:"#0B2545", navyDeep:"#081A33", navyLight:"#1A3A5F",
  gold:"#B08D57", goldLight:"#D4B883",
  cream:"#F5F2EC", charcoal:"#2F2F2F",
  greyMid:"#6B6B6B", greySoft:"#E8E8E8", greyBg:"#F8F6F2",
  green:"#2E7D32", greenSoft:"#E8F5E9",
  amber:"#B08D57", amberSoft:"#FFF8E1",
  red:"#B71C1C", redSoft:"#FFEBEE",
};

// ─── Catálogos ────────────────────────────────────────────────
const ENTIDADES = [
  {id:"policia",       nombre:"Policía Nacional",               minDef:false},
  {id:"ejercito",      nombre:"Ejército Nacional",              minDef:true},
  {id:"armada",        nombre:"Armada Nacional",                minDef:true},
  {id:"fac",           nombre:"Fuerza Aérea Colombiana",        minDef:true},
  {id:"sanidad",       nombre:"Dirección de Sanidad",           minDef:true},
  {id:"jpm",           nombre:"Justicia Penal Militar",         minDef:true},
  {id:"inpec",         nombre:"INPEC",                         minDef:false},
  {id:"invias",        nombre:"Invías",                        minDef:false},
  {id:"fiscalia",      nombre:"Fiscalía General de la Nación", minDef:false},
  {id:"ramaJudicial",  nombre:"Rama Judicial",                  minDef:false},
  {id:"congreso",      nombre:"Congreso de la República",      minDef:false},
  {id:"hospitalMilitar",nombre:"Hospital Militar",             minDef:false},
  {id:"hospitalNaval", nombre:"Hospital Naval Cartagena",      minDef:false},
];
const TIPOS_PROCESO = [
  {id:"reparacionDirecta", nombre:"Reparación directa"},
  {id:"nulidadRest",       nombre:"Nulidad y restablecimiento del derecho"},
];
const ESCENARIOS = [
  {id:"sentencia",  nombre:"Sentencia (proceso judicial)"},
  {id:"concJud",    nombre:"Conciliación judicial"},
  {id:"concExtra",  nombre:"Conciliación extrajudicial"},
];
const REGIMENES = [
  {id:"cca",   nombre:"CCA (sistema antiguo)"},
  {id:"cpaca", nombre:"CPACA"},
];
const SMLMV = 1423500;
const UVT   = 49799;

const DOCS = {
  sentencia: [
    {id:"propAceptada",label:"Propuesta aceptada",req:true},
    {id:"poderesIni",  label:"Poderes iniciales",req:true},
    {id:"sent1",       label:"Sentencia de primera instancia",req:true},
    {id:"sent2",       label:"Sentencia de segunda instancia",req:false},
    {id:"autoAclara",  label:"Auto que aclara y/o adiciona",req:false},
    {id:"constEjec",   label:"Constancia de ejecutoria y vigencia de poderes",req:true},
    {id:"cuentaCobro", label:"Cuenta de cobro con sello/guía de envío",req:true},
    {id:"oficio2469",  label:"Oficio Decreto 2469/2015 (solo MinDefensa)",req:false,cond:"minDef"},
    {id:"sarlaft",     label:"Sarlaft por beneficiario",req:true},
    {id:"resolLiq",    label:"Resolución u oficio que liquida la condena (N&R)",req:false,cond:"nyr"},
    {id:"docBenef",    label:"Documentos de identificación de beneficiarios",req:true},
    {id:"docApod",     label:"Documentos de identificación del apoderado",req:true},
    {id:"samai1",      label:"Consulta SAMAI 1ra instancia",req:true},
    {id:"samai2",      label:"Consulta SAMAI 2da instancia (si aplica)",req:false},
    {id:"poderesCeder",label:"Poderes para ceder (autenticados)",req:false},
    {id:"dpDian",      label:"DP consulta obligaciones DIAN",req:false},
    {id:"pazSalvoHon", label:"Paz y salvo honorarios apoderados anteriores",req:false},
    {id:"soporteNotif",label:"Soportes de notificación del fallo",req:false},
  ],
  concJud: [
    {id:"propAceptada",label:"Propuesta aceptada",req:true},
    {id:"poderesIni",  label:"Poderes iniciales",req:true},
    {id:"fallo1",      label:"Fallo de primera instancia",req:true},
    {id:"actaCTC",     label:"Acta del comité técnico de conciliación",req:true},
    {id:"actaAud",     label:"Acta de audiencia de conciliación",req:true},
    {id:"autoAprueba", label:"Auto que aprueba la conciliación",req:true},
    {id:"constEjec",   label:"Constancia de ejecutoria y vigencia de poderes",req:true},
    {id:"cuentaCobro", label:"Cuenta de cobro con sello/guía de envío",req:true},
    {id:"oficio2469",  label:"Oficio Decreto 2469/2015 (solo MinDefensa)",req:false,cond:"minDef"},
    {id:"sarlaft",     label:"Sarlaft por beneficiario",req:true},
    {id:"docBenef",    label:"Documentos de identificación de beneficiarios",req:true},
    {id:"docApod",     label:"Documentos de identificación del apoderado",req:true},
    {id:"samai1",      label:"Consulta SAMAI 1ra instancia",req:true},
    {id:"poderesCeder",label:"Poderes para ceder (autenticados)",req:false},
    {id:"dpDian",      label:"DP consulta obligaciones DIAN",req:false},
    {id:"pazSalvoHon", label:"Paz y salvo honorarios apoderados anteriores",req:false},
  ],
  concExtra: [
    {id:"propAceptada",label:"Propuesta aceptada",req:true},
    {id:"poderesIni",  label:"Poderes iniciales",req:true},
    {id:"actaCTC",     label:"Acta del comité técnico de conciliación",req:true},
    {id:"actaAud",     label:"Acta de audiencia de conciliación ante Procuraduría",req:true},
    {id:"autoAprueba", label:"Auto que aprueba la conciliación",req:true},
    {id:"constEjec",   label:"Constancia de ejecutoria y vigencia de poderes",req:true},
    {id:"cuentaCobro", label:"Cuenta de cobro con sello/guía de envío",req:true},
    {id:"oficio2469",  label:"Oficio Decreto 2469/2015 (solo MinDefensa)",req:false,cond:"minDef"},
    {id:"sarlaft",     label:"Sarlaft por beneficiario",req:true},
    {id:"docBenef",    label:"Documentos de identificación de beneficiarios",req:true},
    {id:"docApod",     label:"Documentos de identificación del apoderado",req:true},
    {id:"samai1",      label:"Consulta SAMAI 1ra instancia",req:true},
    {id:"poderesCeder",label:"Poderes para ceder (autenticados)",req:false},
    {id:"dpDian",      label:"DP consulta obligaciones DIAN",req:false},
    {id:"pazSalvoHon", label:"Paz y salvo honorarios apoderados anteriores",req:false},
  ],
};

// ─── Motor de elegibilidad ────────────────────────────────────
function evaluarCaso(caso) {
  const alertas = [];
  const entidad = ENTIDADES.find(e => e.id === caso.entidad);
  if (!entidad) alertas.push({tipo:"rechazo",titulo:"Entidad no admisible",detalle:"La entidad no se encuentra dentro del perímetro de las 13 entidades admisibles."});
  if (caso.tipoProceso==="nulidadRest"&&(caso.entidad==="ramaJudicial"||caso.entidad==="fiscalia"))
    alertas.push({tipo:"rechazo",titulo:"Tipología no admisible",detalle:"N&R contra Rama Judicial o Fiscalía no son objeto de compra."});
  if (caso.fechaEjecutoria&&caso.fechaCuentaCobro) {
    const diff=(new Date(caso.fechaCuentaCobro)-new Date(caso.fechaEjecutoria))/(1000*60*60*24*365.25);
    if (diff>5) alertas.push({tipo:"rechazo",titulo:"Prescripción de la obligación",detalle:`Cuenta de cobro radicada ${diff.toFixed(2)} años después de la ejecutoria. Supera el término de 5 años.`});
  }
  if (!caso.fechaCuentaCobro) alertas.push({tipo:"pendiente",titulo:"Cuenta de cobro pendiente",detalle:"No se ha registrado fecha de radicación de la cuenta de cobro."});
  if (!caso.fechaEjecutoria)  alertas.push({tipo:"pendiente",titulo:"Constancia de ejecutoria pendiente",detalle:"Sin fecha de ejecutoria registrada."});
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
  if (caso.demandaAlimentos)   alertas.push({tipo:"alerta",titulo:"Demanda activa por alimentos",detalle:"Excluir beneficiario de la cesión."});
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

// ─── Usuarios ─────────────────────────────────────────────────
const SEED_USERS = [
  {id:"u-ceo", username:"jesus",    password:"fl2026", nombre:"Jesús — CEO Factor Legal", role:"admin"},
  {id:"u-leg", username:"analista", password:"fl2026", nombre:"Analista Jurídico",         role:"analista"},
  {id:"u-com", username:"comercial",password:"fl2026", nombre:"Originación Comercial",     role:"comercial"},
];

// ─── Helpers UI ───────────────────────────────────────────────
function Logo({size="md"}) {
  const s={sm:{c:28,f:11,g:8,n:13,sub:9},md:{c:38,f:15,g:10,n:16,sub:10},lg:{c:56,f:22,g:14,n:22,sub:12}}[size];
  return (
    <div style={{display:"flex",alignItems:"center",gap:s.g}}>
      <div style={{width:s.c,height:s.c,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
        fontWeight:"bold",background:`linear-gradient(135deg,${C.navy},${C.navyDeep})`,color:C.gold,
        fontFamily:"Georgia,serif",fontSize:s.f,border:`1.5px solid ${C.gold}`}}>FL</div>
      <div style={{lineHeight:1.1}}>
        <div style={{fontWeight:"bold",letterSpacing:"0.06em",color:C.navy,fontSize:s.n,fontFamily:"Georgia,serif"}}>FACTOR LEGAL</div>
        <div style={{fontStyle:"italic",color:C.greyMid,fontSize:s.sub,letterSpacing:"0.08em"}}>DUE DILIGENCE PLATFORM</div>
      </div>
    </div>
  );
}

function Badge({verdict}) {
  const cfg={
    apto:            {bg:C.greenSoft,fg:C.green,Ic:ShieldCheck,lbl:"APTO"},
    apto_con_alertas:{bg:C.amberSoft,fg:C.amber,Ic:ShieldAlert,lbl:"APTO CON ALERTAS"},
    no_apto:         {bg:C.redSoft,  fg:C.red,  Ic:ShieldX,    lbl:"NO APTO"},
    sin_evaluar:     {bg:C.greySoft, fg:C.greyMid,Ic:Shield,   lbl:"SIN EVALUAR"},
  };
  const {bg,fg,Ic,lbl}=cfg[verdict]||cfg.sin_evaluar;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:6,borderRadius:999,
      background:bg,color:fg,padding:"4px 10px",fontSize:10,fontWeight:"bold",letterSpacing:"0.1em"}}>
      <Ic size={12} strokeWidth={2.2}/>{lbl}
    </span>
  );
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

const inp={width:"100%",padding:"8px 12px",fontSize:13,borderRadius:6,
  border:`1px solid ${C.greySoft}`,background:C.greyBg,outline:"none",boxSizing:"border-box"};

// ─── LOGIN ────────────────────────────────────────────────────
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
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,
      background:`linear-gradient(135deg,${C.navyDeep},${C.navy},${C.navyLight})`}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:C.cream,border:`2px solid ${C.gold}`,
            display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
            <span style={{color:C.navy,fontSize:26,fontWeight:700,fontFamily:"Georgia,serif"}}>FL</span>
          </div>
          <div style={{fontWeight:"bold",color:"white",fontSize:26,fontFamily:"Georgia,serif"}}>FACTOR LEGAL</div>
          <div style={{fontStyle:"italic",color:C.goldLight,fontSize:11,letterSpacing:"0.18em",marginTop:4}}>DUE DILIGENCE PLATFORM</div>
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
              <button onClick={()=>setShowPwd(!showPwd)} style={{position:"absolute",right:10,top:"50%",
                transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.greyMid}}>
                {showPwd?<EyeOff size={15}/>:<Eye size={15}/>}
              </button>
            </div>
          </div>
          {error&&<div style={{background:C.redSoft,color:C.red,borderRadius:6,padding:"10px 12px",
            display:"flex",alignItems:"center",gap:8,fontSize:12,marginBottom:16}}>
            <AlertCircle size={14}/>{error}</div>}
          <button onClick={submit} style={{width:"100%",padding:12,borderRadius:6,border:"none",
            background:C.navy,color:C.gold,fontWeight:"bold",fontSize:13,letterSpacing:"0.12em",cursor:"pointer"}}>
            INGRESAR
          </button>
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

// ─── HEADER ───────────────────────────────────────────────────
function NavBtn({active,onClick,icon:Ic,label}) {
  return (
    <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:6,
      border:"none",cursor:"pointer",fontWeight:"bold",fontSize:12,letterSpacing:"0.08em",
      background:active?C.navy:"transparent",color:active?C.gold:C.greyMid}}>
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
            <NavBtn active={view==="dashboard"} onClick={()=>setView("dashboard")} icon={Home}     label="Dashboard"/>
            <NavBtn active={view==="casos"}     onClick={()=>setView("casos")}     icon={Database}  label="Casos"/>
            <NavBtn active={view==="nuevo"}     onClick={()=>setView("nuevo")}     icon={Plus}      label="Nuevo caso"/>
          </nav>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{textAlign:"right",lineHeight:1.3}}>
            <div style={{fontSize:13,fontWeight:"bold",color:C.navy}}>{user.nombre}</div>
            <div style={{fontSize:11,fontStyle:"italic",color:C.gold}}>
              {user.role==="admin"?"Administrador":user.role==="analista"?"Analista jurídico":"Originación comercial"}
            </div>
          </div>
          <button onClick={onLogout} style={{background:"none",border:"none",cursor:"pointer",padding:8,borderRadius:6}}>
            <LogOut size={16} style={{color:C.greyMid}}/>
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────
function Dashboard({casos,onOpen,setView}) {
  const stats=useMemo(()=>{
    const total=casos.length;
    const aptos=casos.filter(c=>c.eval?.veredicto==="apto").length;
    const alertas=casos.filter(c=>c.eval?.veredicto==="apto_con_alertas").length;
    const noAptos=casos.filter(c=>c.eval?.veredicto==="no_apto").length;
    const nominal=casos.filter(c=>c.eval?.veredicto!=="no_apto")
      .reduce((s,c)=>s+((parseFloat(c.valorCapital)||0)+(parseFloat(c.valorIntereses)||0)),0);
    const desembolso=casos.filter(c=>c.eval?.veredicto!=="no_apto")
      .reduce((s,c)=>s+(parseFloat(c.valorDesembolso)||0),0);
    const porEntidad={};
    casos.forEach(c=>{
      const e=ENTIDADES.find(e=>e.id===c.entidad);
      if(!e)return;
      if(!porEntidad[e.nombre])porEntidad[e.nombre]={count:0,valor:0};
      porEntidad[e.nombre].count++;
      porEntidad[e.nombre].valor+=(parseFloat(c.valorCapital)||0)+(parseFloat(c.valorIntereses)||0);
    });
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
        <StatCard label="VEREDICTO APTO" value={stats.aptos+stats.alertas}
          sub={`${stats.aptos} sin alertas, ${stats.alertas} con alertas`} icon={CheckCircle2} accent={C.green}/>
        <StatCard label="VALOR NOMINAL"
          value={`COP ${stats.nominal.toLocaleString("es-CO",{maximumFractionDigits:0})} M`}
          sub="agregado viables" icon={Coins} accent={C.gold}/>
        <StatCard label="CAPITAL A DESPLEGAR"
          value={`COP ${stats.desembolso.toLocaleString("es-CO",{maximumFractionDigits:0})} M`}
          sub="desembolso estimado" icon={TrendingUp} accent={C.navy}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
        {[
          {lbl:"APTOS",cnt:stats.aptos,color:C.green,Ic:ShieldCheck},
          {lbl:"APTOS CON ALERTAS",cnt:stats.alertas,color:C.amber,Ic:ShieldAlert},
          {lbl:"NO APTOS",cnt:stats.noAptos,color:C.red,Ic:ShieldX},
        ].map(({lbl,cnt,color,Ic})=>(
          <div key={lbl} style={{background:"white",border:`1px solid ${C.greySoft}`,borderLeft:`4px solid ${color}`,borderRadius:8,padding:20}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.12em",color:C.greyMid,marginBottom:8}}>{lbl}</div>
                <div style={{fontWeight:"bold",color:C.navy,fontSize:32,fontFamily:"Georgia,serif",lineHeight:1}}>{cnt}</div>
                <div style={{fontSize:11,fontStyle:"italic",marginTop:4,color:C.greyMid}}>
                  {stats.total>0?((cnt/stats.total)*100).toFixed(0):0}% del portafolio
                </div>
              </div>
              <Ic size={36} style={{color,opacity:0.85}} strokeWidth={1.5}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:24}}>
        <div style={{background:"white",border:`1px solid ${C.greySoft}`,borderRadius:8,overflow:"hidden"}}>
          <div style={{background:C.navy,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,color:"white",fontSize:12,fontWeight:"bold",letterSpacing:"0.1em"}}>
              <Activity size={15} style={{color:C.gold}}/> CASOS RECIENTES
            </div>
            <button onClick={()=>setView("casos")} style={{background:"none",border:"none",cursor:"pointer",
              color:C.gold,fontSize:11,fontWeight:"bold"}}>VER TODOS →</button>
          </div>
          {casos.length===0?(
            <div style={{padding:48,textAlign:"center"}}>
              <FileText size={32} style={{color:C.greyMid,opacity:0.5,margin:"0 auto 12px"}}/>
              <div style={{fontSize:13,fontStyle:"italic",color:C.greyMid}}>Aún no hay casos registrados.</div>
              <button onClick={()=>setView("nuevo")} style={{marginTop:16,padding:"8px 16px",borderRadius:6,
                border:"none",background:C.navy,color:C.gold,fontWeight:"bold",fontSize:12,cursor:"pointer"}}>+ NUEVO CASO</button>
            </div>
          ):casos.slice(-5).reverse().map(c=>{
            const ent=ENTIDADES.find(e=>e.id===c.entidad);
            const val=(parseFloat(c.valorCapital)||0)+(parseFloat(c.valorIntereses)||0);
            return (
              <button key={c.id} onClick={()=>onOpen(c.id)} style={{width:"100%",display:"flex",alignItems:"center",
                gap:16,padding:"12px 20px",background:"none",border:"none",
                borderBottom:`1px solid ${C.greySoft}`,cursor:"pointer",textAlign:"left"}}>
                <div style={{width:36,height:36,borderRadius:6,background:C.greyBg,display:"flex",
                  alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <FileText size={16} style={{color:C.navy}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:"bold",color:C.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {c.codigo} — {c.demandanteNombre||"(sin nombre)"}
                  </div>
                  <div style={{fontSize:11,color:C.greyMid}}>
                    {ent?.nombre||"sin entidad"} · COP {val.toLocaleString("es-CO",{maximumFractionDigits:0})} M
                  </div>
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
            {stats.entArr.length===0?(
              <div style={{fontSize:11,fontStyle:"italic",textAlign:"center",padding:32,color:C.greyMid}}>Sin datos</div>
            ):stats.entArr.slice(0,5).map((e,i)=>{
              const pct=stats.entArr[0].valor>0?(e.valor/stats.entArr[0].valor)*100:0;
              return (
                <div key={i} style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <div style={{fontSize:11,fontWeight:"bold",color:C.navy}}>{e.nombre}</div>
                    <div style={{fontSize:11,fontFamily:"monospace",color:C.gold}}>{e.count}</div>
                  </div>
                  <div style={{height:5,background:C.greySoft,borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",background:C.gold,width:`${pct}%`}}/>
                  </div>
                  <div style={{fontSize:10,fontStyle:"italic",marginTop:3,color:C.greyMid}}>
                    COP {e.valor.toLocaleString("es-CO",{maximumFractionDigits:0})} M
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LISTA DE CASOS ───────────────────────────────────────────
function CasosList({casos,onOpen,onDelete,setView,currentUser}) {
  const [search,setSearch]=useState("");
  const [filterVerdict,setFV]=useState("all");
  const [filterEntidad,setFE]=useState("all");
  const filtered=useMemo(()=>casos.filter(c=>{
    if(search&&!`${c.codigo} ${c.demandanteNombre}`.toLowerCase().includes(search.toLowerCase()))return false;
    if(filterVerdict!=="all"&&(c.eval?.veredicto||"sin_evaluar")!==filterVerdict)return false;
    if(filterEntidad!=="all"&&c.entidad!==filterEntidad)return false;
    return true;
  }),[casos,search,filterVerdict,filterEntidad]);
  return (
    <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 24px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:24}}>
        <div>
          <div style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.18em",color:C.gold,marginBottom:4}}>REPOSITORIO DE CASOS</div>
          <h1 style={{color:C.navy,fontSize:26,fontFamily:"Georgia,serif",margin:0}}>Casos en estudio</h1>
          <div style={{height:3,width:48,background:C.gold,marginTop:8}}/>
        </div>
        <button onClick={()=>setView("nuevo")} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 18px",
          borderRadius:6,border:"none",background:C.navy,color:C.gold,fontWeight:"bold",fontSize:12,cursor:"pointer"}}>
          <Plus size={13}/>NUEVO CASO
        </button>
      </div>
      <div style={{display:"flex",gap:12,marginBottom:20}}>
        <div style={{flex:1,position:"relative"}}>
          <Search size={13} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.greyMid}}/>
          <input style={{...inp,paddingLeft:32}} value={search} placeholder="Buscar por código o demandante..."
            onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select style={{...inp,width:"auto",minWidth:190,cursor:"pointer"}} value={filterVerdict} onChange={e=>setFV(e.target.value)}>
          <option value="all">Todos los veredictos</option>
          <option value="apto">Apto</option>
          <option value="apto_con_alertas">Apto con alertas</option>
          <option value="no_apto">No apto</option>
          <option value="sin_evaluar">Sin evaluar</option>
        </select>
        <select style={{...inp,width:"auto",minWidth:190,cursor:"pointer"}} value={filterEntidad} onChange={e=>setFE(e.target.value)}>
          <option value="all">Todas las entidades</option>
          {ENTIDADES.map(e=><option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      </div>
      <div style={{background:"white",border:`1px solid ${C.greySoft}`,borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"140px 1fr 180px 140px 180px 80px",
          background:C.navy,padding:"10px 20px",gap:12}}>
          {["CÓDIGO","DEMANDANTE","ENTIDAD","VALOR NOMINAL","VEREDICTO",""].map((h,i)=>(
            <div key={i} style={{fontSize:10,fontWeight:"bold",color:C.gold,letterSpacing:"0.1em",textAlign:i>=3?"center":"left"}}>{h}</div>
          ))}
        </div>
        {filtered.length===0?(
          <div style={{padding:64,textAlign:"center"}}>
            <Database size={32} style={{color:C.greyMid,opacity:0.4,margin:"0 auto 12px"}}/>
            <div style={{fontSize:13,fontStyle:"italic",color:C.greyMid}}>
              {casos.length===0?"Sin casos registrados todavía.":"No se encontraron casos con los filtros aplicados."}
            </div>
          </div>
        ):filtered.map(c=>{
          const ent=ENTIDADES.find(e=>e.id===c.entidad);
          const val=(parseFloat(c.valorCapital)||0)+(parseFloat(c.valorIntereses)||0);
          return (
            <div key={c.id} style={{display:"grid",gridTemplateColumns:"140px 1fr 180px 140px 180px 80px",
              padding:"12px 20px",gap:12,alignItems:"center",borderBottom:`1px solid ${C.greySoft}`}}>
              <div style={{fontSize:12,fontFamily:"monospace",fontWeight:"bold",color:C.gold}}>{c.codigo}</div>
              <div style={{fontSize:13,fontWeight:"bold",color:C.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.demandanteNombre||"—"}</div>
              <div style={{fontSize:12,color:C.charcoal,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ent?.nombre||"—"}</div>
              <div style={{fontSize:12,fontFamily:"monospace",color:C.navy,textAlign:"center"}}>
                {val>0?`$${val.toLocaleString("es-CO",{maximumFractionDigits:0})}M`:"—"}
              </div>
              <div style={{textAlign:"center"}}><Badge verdict={c.eval?.veredicto||"sin_evaluar"}/></div>
              <div style={{display:"flex",justifyContent:"flex-end",gap:4}}>
                <button onClick={()=>onOpen(c.id)} style={{background:"none",border:"none",cursor:"pointer",padding:6,borderRadius:4}}>
                  <ChevronRight size={14} style={{color:C.navy}}/>
                </button>
                {currentUser.role==="admin"&&(
                  <button onClick={()=>{if(confirm(`¿Eliminar ${c.codigo}?`))onDelete(c.id);}}
                    style={{background:"none",border:"none",cursor:"pointer",padding:6,borderRadius:4}}>
                    <Trash2 size={14} style={{color:C.red}}/>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── FORM HELPERS ─────────────────────────────────────────────
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
      <label style={{display:"block",fontSize:11,fontWeight:"bold",letterSpacing:"0.08em",color:C.navy,marginBottom:6}}>
        {label}{required&&<span style={{color:C.red}}> *</span>}
      </label>
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
    </div>
  );
}

function Step2({caso,upd}) {
  return (
    <div>
      <Sec title="Marco procesal y temporal" icon={Calendar}>
        <Fld label="Fecha de ejecutoria del fallo" required>
          <input type="date" style={inp} value={caso.fechaEjecutoria||""} onChange={e=>upd("fechaEjecutoria",e.target.value)}/>
        </Fld>
        <Fld label="Fecha de radicación de la cuenta de cobro">
          <input type="date" style={inp} value={caso.fechaCuentaCobro||""} onChange={e=>upd("fechaCuentaCobro",e.target.value)}/>
        </Fld>
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
        <Fld label="¿Autos de corrección que alteren valores?">
          <select style={inp} value={caso.autoCorreccion?"si":"no"} onChange={e=>upd("autoCorreccion",e.target.value==="si")}>
            <option value="no">No</option><option value="si">Sí</option>
          </select>
        </Fld>
        <Fld label="¿Condena solidaria?">
          <select style={inp} value={caso.condenaSolidaria||"no"} onChange={e=>upd("condenaSolidaria",e.target.value)}>
            <option value="no">No es solidaria</option>
            <option value="solidariaSinPorc">Solidaria sin porcentajes</option>
            <option value="solidariaConPorc">Solidaria con porcentajes</option>
          </select>
        </Fld>
        <Fld label="¿Proceso ejecutivo radicado?">
          <select style={inp} value={caso.ejecutivoRadicado?"si":"no"} onChange={e=>upd("ejecutivoRadicado",e.target.value==="si")}>
            <option value="no">No / sin información</option><option value="si">Sí, radicado</option>
          </select>
        </Fld>
        <Fld label="Tipo de cesión a Factor Legal">
          <select style={inp} value={caso.tipoCesion||"total"} onChange={e=>upd("tipoCesion",e.target.value)}>
            <option value="total">Total (100%)</option>
            <option value="parcialHonorarios">Parcial — solo honorarios</option>
            <option value="parcialExcluyeHon">Parcial — excluye honorarios</option>
            <option value="parcialOtra">Parcial — otra</option>
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
        <Fld label="Capital de la condena" required helper="Componente de capital">
          <input type="number" step="0.01" style={inp} value={caso.valorCapital||""} placeholder="ej. 600" onChange={e=>upd("valorCapital",e.target.value)}/>
        </Fld>
        <Fld label="Intereses moratorios acumulados" required>
          <input type="number" step="0.01" style={inp} value={caso.valorIntereses||""} placeholder="ej. 400" onChange={e=>upd("valorIntereses",e.target.value)}/>
        </Fld>
        <Fld label="Valor total condena (parte resolutiva)" helper="Para validar ≥300 SMLMV">
          <input type="number" step="0.01" style={inp} value={caso.valorTotalCondenaResolutiva||""} placeholder="ej. 1000" onChange={e=>upd("valorTotalCondenaResolutiva",e.target.value)}/>
        </Fld>
        <Fld label="Costas y agencias en derecho">
          <input type="number" step="0.01" style={inp} value={caso.valorCostas||""} placeholder="0" onChange={e=>upd("valorCostas",e.target.value)}/>
        </Fld>
      </Sec>
      <Sec title="Propuesta económica" icon={DollarSign}>
        <Fld label="Valor de desembolso (precio de compra)" required helper="Umbral mínimo: COP $100M">
          <input type="number" step="0.01" style={inp} value={caso.valorDesembolso||""} placeholder="ej. 564" onChange={e=>upd("valorDesembolso",e.target.value)}/>
        </Fld>
        <Fld label="% honorarios pactado (cuota litis)" helper="Alerta si supera 50%">
          <input type="number" step="0.1" style={inp} value={caso.porcHonorarios||""} placeholder="ej. 30" onChange={e=>upd("porcHonorarios",e.target.value)}/>
        </Fld>
      </Sec>
      <div style={{background:C.cream,border:`1px solid ${C.gold}`,borderRadius:8,padding:20,marginTop:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <BarChart3 size={13} style={{color:C.gold}}/>
          <span style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.12em",color:C.navy}}>KPIs CALCULADOS</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
          {[
            {lbl:"Valor nominal",val:`COP ${kpis.nominal.toFixed(1)} M`},
            {lbl:"Descuento",val:`${kpis.descuento.toFixed(1)}%`},
            {lbl:"MOIC",val:`${kpis.moic.toFixed(2)}x`},
            {lbl:"Meses mora",val:kpis.mesesEjec?`${kpis.mesesEjec} m`:"—"},
          ].map(({lbl,val})=>(
            <div key={lbl}>
              <div style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.08em",color:C.greyMid,marginBottom:4}}>{lbl.toUpperCase()}</div>
              <div style={{fontWeight:"bold",color:C.navy,fontSize:20,fontFamily:"Georgia,serif"}}>{val}</div>
            </div>
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
        <Fld label="Número de beneficiarios">
          <input type="number" style={inp} value={caso.numBeneficiarios||""} onChange={e=>upd("numBeneficiarios",e.target.value)}/>
        </Fld>
        <Fld label="Menores de edad (beneficiarios)">
          <input type="number" style={inp} value={caso.numMenores||0} onChange={e=>upd("numMenores",e.target.value)}/>
        </Fld>
        {(parseInt(caso.numMenores)||0)>0&&(
          <Fld label="Tipo de menores" span={2}>
            <select style={inp} value={caso.tipoBeneficiariosMenores||"directos"} onChange={e=>upd("tipoBeneficiariosMenores",e.target.value)}>
              <option value="directos">Beneficiarios directos del fallo (aplica retención)</option>
              <option value="herederos">Herederos en sucesión (no aplica retención)</option>
            </select>
          </Fld>
        )}
        <Fld label="¿Sucesión por beneficiario fallecido?">
          <select style={inp} value={caso.sucesion?"si":"no"} onChange={e=>upd("sucesion",e.target.value==="si")}>
            <option value="no">No</option><option value="si">Sí</option>
          </select>
        </Fld>
        <Fld label="¿Cesión previa al cesionario actual?">
          <select style={inp} value={caso.cesionPrevia||"no"} onChange={e=>upd("cesionPrevia",e.target.value)}>
            <option value="no">No</option>
            <option value="honorarios">Sí — por honorarios</option>
            <option value="beneficiario">Sí — beneficiario inicial vendió derechos</option>
          </select>
        </Fld>
        <Fld label="¿Antecedentes graves de beneficiario o apoderado?">
          <select style={inp} value={caso.antecedentesGraves?"si":"no"} onChange={e=>upd("antecedentesGraves",e.target.value==="si")}>
            <option value="no">No</option>
            <option value="si">Sí — listas restrictivas / delitos LA-FT</option>
          </select>
        </Fld>
        <Fld label="¿Demanda activa por alimentos?">
          <select style={inp} value={caso.demandaAlimentos?"si":"no"} onChange={e=>upd("demandaAlimentos",e.target.value==="si")}>
            <option value="no">No</option>
            <option value="si">Sí (excluir beneficiario)</option>
          </select>
        </Fld>
      </Sec>
      <div>
        <div style={{display:"flex",alignItems:"center",gap:8,paddingBottom:8,borderBottom:`2px solid ${C.gold}`,marginBottom:16}}>
          <ClipboardCheck size={15} style={{color:C.gold}}/>
          <span style={{fontWeight:"bold",fontSize:12,letterSpacing:"0.1em",color:C.navy}}>
            VERIFICACIÓN DOCUMENTAL — {caso.escenario?caso.escenario.toUpperCase():""}
          </span>
        </div>
        {!caso.escenario?(
          <div style={{background:C.amberSoft,borderRadius:8,padding:24,textAlign:"center",color:C.amber}}>
            <Info size={20} style={{margin:"0 auto 8px"}}/>
            <div style={{fontSize:13,fontStyle:"italic"}}>Selecciona el escenario procesal en el Paso 1.</div>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {docMatrix.map(d=>{
              if(d.cond==="minDef"&&!entidad?.minDef)return null;
              if(d.cond==="nyr"&&caso.tipoProceso!=="nulidadRest")return null;
              return (
                <label key={d.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",
                  border:`1px solid ${C.greySoft}`,borderRadius:6,cursor:"pointer"}}>
                  <input type="checkbox" checked={!!(caso.documentos||{})[d.id]}
                    onChange={e=>updDoc(d.id,e.target.checked)}
                    style={{accentColor:C.gold,width:15,height:15}}/>
                  <span style={{fontSize:13,flex:1,color:C.charcoal}}>{d.label}</span>
                  {d.req&&<span style={{fontSize:10,fontWeight:"bold",padding:"2px 8px",borderRadius:4,
                    background:C.amberSoft,color:C.amber,letterSpacing:"0.08em"}}>OBLIGATORIO</span>}
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FORMULARIO WIZARD ────────────────────────────────────────
function CasoForm({initial,onSave,onCancel,currentUser}) {
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
  const valid=s=>{
    if(s===1)return caso.codigo&&caso.demandanteNombre&&caso.escenario&&caso.tipoProceso&&caso.entidad;
    if(s===2)return caso.fechaEjecutoria;
    if(s===3)return caso.valorCapital&&caso.valorIntereses;
    return true;
  };
  const steps=[{n:1,label:"Identificación"},{n:2,label:"Marco procesal"},{n:3,label:"Económico"},{n:4,label:"Documentos"}];
  return (
    <div style={{maxWidth:1000,margin:"0 auto",padding:"32px 24px"}}>
      <button onClick={onCancel} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",
        cursor:"pointer",color:C.gold,fontSize:11,fontWeight:"bold",marginBottom:8}}>
        <ArrowLeft size={12}/>VOLVER
      </button>
      <div style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.18em",color:C.gold,marginBottom:4}}>
        {initial?"EDITAR CASO":"NUEVO CASO"}
      </div>
      <h1 style={{color:C.navy,fontSize:24,fontFamily:"Georgia,serif",margin:"0 0 24px"}}>
        Estudio de elegibilidad — {caso.codigo}
      </h1>
      <div style={{background:"white",border:`1px solid ${C.greySoft}`,borderRadius:8,padding:16,marginBottom:24,
        display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        {steps.map((s,i)=>(
          <div key={s.n} style={{display:"flex",alignItems:"center",flex:i<steps.length-1?1:"none"}}>
            <button onClick={()=>setStep(s.n)} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer"}}>
              <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:12,fontWeight:"bold",
                background:step===s.n?C.navy:step>s.n?C.gold:C.greyBg,
                color:step===s.n?C.gold:step>s.n?"white":C.greyMid,
                border:`2px solid ${step>=s.n?C.navy:C.greySoft}`}}>
                {step>s.n?<CheckCircle2 size={14}/>:s.n}
              </div>
              <span style={{fontSize:11,fontWeight:"bold",letterSpacing:"0.08em",color:step===s.n?C.navy:C.greyMid}}>
                {s.label.toUpperCase()}
              </span>
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
        <button onClick={onCancel} style={{background:"none",border:"none",cursor:"pointer",color:C.greyMid,fontWeight:"bold",fontSize:12}}>CANCELAR</button>
        <div style={{display:"flex",gap:12}}>
          {step>1&&<button onClick={()=>setStep(step-1)} style={{padding:"10px 18px",borderRadius:6,
            border:`1px solid ${C.navy}`,background:"white",color:C.navy,fontWeight:"bold",fontSize:12,cursor:"pointer"}}>← ANTERIOR</button>}
          {step<4?(
            <button onClick={()=>valid(step)&&setStep(step+1)} disabled={!valid(step)}
              style={{padding:"10px 18px",borderRadius:6,border:"none",background:C.navy,color:C.gold,
                fontWeight:"bold",fontSize:12,cursor:"pointer",opacity:valid(step)?1:0.4}}>SIGUIENTE →</button>
          ):(
            <button onClick={()=>{
              const ev=evaluarCaso(caso);
              onSave({...caso,eval:ev,fechaActualizacion:new Date().toISOString()});
            }} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 18px",borderRadius:6,border:"none",
              background:C.gold,color:C.navy,fontWeight:"bold",fontSize:12,cursor:"pointer"}}>
              <Save size={13}/>EVALUAR Y GUARDAR
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── FICHA TÉCNICA ────────────────────────────────────────────
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
  function DR({label,value}) {
    return (
      <div style={{display:"grid",gridTemplateColumns:"45% 55%",gap:12,padding:"10px 16px",
        borderBottom:`1px solid ${C.greySoft}`,fontSize:12}}>
        <div style={{fontWeight:"bold",color:C.greyMid,fontSize:11,letterSpacing:"0.06em"}}>{label}</div>
        <div style={{color:C.charcoal}}>{value||"—"}</div>
      </div>
    );
  }
  function DC({title,icon:Ic,children}) {
    return (
      <div style={{background:"white",border:`1px solid ${C.greySoft}`,borderRadius:8,overflow:"hidden",marginBottom:16}}>
        <div style={{background:C.navy,padding:"10px 16px",display:"flex",alignItems:"center",gap:8}}>
          <Ic size={13} style={{color:C.gold}}/>
          <span style={{fontSize:11,fontWeight:"bold",letterSpacing:"0.1em",color:"white"}}>{title.toUpperCase()}</span>
        </div>
        {children}
      </div>
    );
  }
  function AG({title,items,color,bg,Ic}) {
    return (
      <div style={{border:`1px solid ${color}`,borderRadius:8,overflow:"hidden",marginBottom:16}}>
        <div style={{background:color,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
          <Ic size={13} style={{color:"white"}}/>
          <span style={{fontSize:11,fontWeight:"bold",letterSpacing:"0.1em",color:"white"}}>{title} ({items.length})</span>
        </div>
        <div style={{padding:12,display:"flex",flexDirection:"column",gap:8}}>
          {items.map((a,i)=>(
            <div key={i} style={{background:bg,borderRadius:6,padding:12}}>
              <div style={{fontWeight:"bold",fontSize:12,color,marginBottom:4}}>{a.titulo}</div>
              <div style={{fontSize:11,color:C.charcoal,lineHeight:1.5,whiteSpace:"pre-line"}}>{a.detalle}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 24px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div>
          <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",
            cursor:"pointer",color:C.gold,fontSize:11,fontWeight:"bold",marginBottom:8}}>
            <ArrowLeft size={12}/>VOLVER
          </button>
          <div style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.18em",color:C.gold,marginBottom:4}}>FICHA TÉCNICA — DUE DILIGENCE</div>
          <h1 style={{color:C.navy,fontSize:28,fontFamily:"Georgia,serif",margin:0}}>{caso.codigo}</h1>
          <div style={{fontSize:12,fontStyle:"italic",color:C.greyMid,marginTop:4}}>
            Demandante: <strong style={{color:C.charcoal,fontStyle:"normal"}}>{caso.demandanteNombre}</strong>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onEdit} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:6,
            border:`1px solid ${C.navy}`,background:"white",color:C.navy,fontWeight:"bold",fontSize:11,cursor:"pointer"}}>
            <Edit3 size={13}/>EDITAR
          </button>
          <button onClick={()=>onExport("word")} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",
            borderRadius:6,border:"none",background:C.navy,color:C.gold,fontWeight:"bold",fontSize:11,cursor:"pointer"}}>
            <Download size={13}/>WORD
          </button>
          <button onClick={()=>onExport("excel")} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",
            borderRadius:6,border:"none",background:C.gold,color:C.navy,fontWeight:"bold",fontSize:11,cursor:"pointer"}}>
            <Download size={13}/>EXCEL
          </button>
        </div>
      </div>
      <div style={{background:vSoft,border:`2px solid ${vColor}`,borderRadius:10,padding:24,marginBottom:24,
        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:10,fontWeight:"bold",letterSpacing:"0.18em",color:vColor,marginBottom:8}}>VEREDICTO DE ELEGIBILIDAD</div>
          <div style={{fontWeight:"bold",color:vColor,fontSize:32,fontFamily:"Georgia,serif",marginBottom:8}}>{vLabel}</div>
          <div style={{fontSize:13,fontStyle:"italic",color:vColor}}>
            {ev.veredicto==="apto"?"Cumple integralmente con el marco de elegibilidad. Procede para etapa de cierre.":
             ev.veredicto==="apto_con_alertas"?`${alertas.length} alerta(s) y ${pendientes.length} pendiente(s). Subsanar antes del cierre.`:
             `${rechazos.length} causal(es) de rechazo. El activo no procede para descuento.`}
          </div>
        </div>
        <VIco size={64} style={{color:vColor}} strokeWidth={1.4}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
        <StatCard label="VALOR NOMINAL"   value={`COP ${kpis.nominal.toFixed(1)} M`}    sub="capital + intereses" icon={Coins}      accent={C.gold}/>
        <StatCard label="DESEMBOLSO"      value={`COP ${kpis.desembolso.toFixed(1)} M`} sub="precio de compra"    icon={DollarSign} accent={C.navy}/>
        <StatCard label="DESCUENTO"       value={`${kpis.descuento.toFixed(1)}%`}        sub="vs. valor nominal"   icon={TrendingUp} accent={C.gold}/>
        <StatCard label="MOIC"            value={`${kpis.moic.toFixed(2)}x`}             sub="múltiple invertido"  icon={Target}     accent={C.navy}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:24}}>
        <div>
          <DC title="Identificación del activo" icon={FileText}>
            <DR label="Código" value={caso.codigo}/><DR label="Demandante" value={caso.demandanteNombre}/>
            <DR label="Identificación" value={caso.demandanteCC}/><DR label="Apoderado" value={caso.apoderadoNombre}/>
          </DC>
          <DC title="Marco procesal" icon={Scale}>
            <DR label="Escenario" value={escen?.nombre}/><DR label="Tipo de proceso" value={tipoP?.nombre}/>
            <DR label="Entidad demandada" value={entidad?.nombre}/><DR label="Régimen" value={regim?.nombre}/>
            <DR label="Fecha ejecutoria" value={caso.fechaEjecutoria?new Date(caso.fechaEjecutoria).toLocaleDateString("es-CO"):"—"}/>
            <DR label="Cuenta de cobro" value={caso.fechaCuentaCobro?new Date(caso.fechaCuentaCobro).toLocaleDateString("es-CO"):"—"}/>
            <DR label="Meses desde ejecutoria" value={kpis.mesesEjec?`${kpis.mesesEjec} meses`:"—"}/>
            <DR label="Única instancia" value={caso.unicaInstancia?"Sí":"No"}/>
          </DC>
          <DC title="Particularidades de la condena" icon={Gavel}>
            <DR label="Condena solidaria" value={caso.condenaSolidaria==="no"?"No":caso.condenaSolidaria==="solidariaSinPorc"?"Sí — sin %s":"Sí — con %s"}/>
            <DR label="Ejecutivo radicado" value={caso.ejecutivoRadicado?"Sí":"No"}/>
            <DR label="Tipo de cesión" value={caso.tipoCesion==="total"?"Total (100%)":"Parcial"}/>
            <DR label="% Honorarios" value={caso.porcHonorarios?`${caso.porcHonorarios}%`:"—"}/>
          </DC>
          <DC title="Beneficiarios y novedades" icon={Users}>
            <DR label="N.° beneficiarios" value={caso.numBeneficiarios}/>
            <DR label="Menores de edad" value={`${caso.numMenores||0} ${caso.tipoBeneficiariosMenores==="herederos"?"(herederos)":"(directos)"}`}/>
            <DR label="Sucesión" value={caso.sucesion?"Sí":"No"}/>
            <DR label="Cesión previa" value={caso.cesionPrevia==="no"?"No":caso.cesionPrevia==="honorarios"?"Sí — honorarios":"Sí — beneficiario"}/>
          </DC>
        </div>
        <div>
          {rechazos.length>0&&<AG title="CAUSALES DE RECHAZO" items={rechazos} color={C.red} bg={C.redSoft} Ic={ShieldX}/>}
          {alertas.length>0&&<AG title="ALERTAS" items={alertas} color={C.amber} bg={C.amberSoft} Ic={ShieldAlert}/>}
          {pendientes.length>0&&<AG title="PENDIENTES DOCUMENTALES" items={pendientes} color={C.navy} bg={C.greyBg} Ic={Clock}/>}
          {ev.alertas.length===0&&(
            <div style={{background:C.greenSoft,border:`1px solid ${C.green}`,borderRadius:8,padding:24,textAlign:"center"}}>
              <CheckCircle2 size={32} style={{color:C.green,margin:"0 auto 8px"}}/>
              <div style={{fontWeight:"bold",color:C.green,fontSize:13,marginBottom:4}}>Sin observaciones</div>
              <div style={{fontSize:11,fontStyle:"italic",color:C.green}}>El caso cumple integralmente con el marco de Factor Legal.</div>
            </div>
          )}
        </div>
      </div>
      <div style={{marginTop:32,paddingTop:16,borderTop:`1px solid ${C.greySoft}`,
        display:"flex",justifyContent:"space-between",fontSize:11,fontStyle:"italic",color:C.greyMid}}>
        <div>Creado por: <strong style={{color:C.navy,fontStyle:"normal"}}>{caso.creadoPorNombre}</strong>
          {caso.fechaActualizacion&&` · ${new Date(caso.fechaActualizacion).toLocaleString("es-CO")}`}
        </div>
        <div>Confidencial — Factor Legal S.A.S.</div>
      </div>
    </div>
  );
}

// ─── EXPORT ───────────────────────────────────────────────────
function buildHTML(caso) {
  const entidad=ENTIDADES.find(e=>e.id===caso.entidad);
  const kpis=calcKPIs(caso);
  const ev=caso.eval||evaluarCaso(caso);
  const vLabel=ev.veredicto==="apto"?"APTO PARA DESCUENTO":ev.veredicto==="apto_con_alertas"?"APTO CON ALERTAS":"NO APTO";
  const vColor=ev.veredicto==="apto"?"#2E7D32":ev.veredicto==="apto_con_alertas"?"#B08D57":"#B71C1C";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ficha ${caso.codigo}</title>
<style>body{font-family:Calibri,sans-serif;color:#2F2F2F;max-width:800px;margin:0 auto;padding:40px}
h1{color:#0B2545;font-family:Georgia,serif;font-size:26px;border-bottom:3px solid #B08D57;padding-bottom:8px}
h2{font-family:Georgia,serif;font-size:14px;margin-top:20px;padding:6px 12px;background:#0B2545;color:white}
.v{background:${vColor}1A;border:2px solid ${vColor};padding:16px;margin:16px 0}
.vl{color:${vColor};font-family:Georgia,serif;font-size:26px;font-weight:bold}
table{width:100%;border-collapse:collapse}td{padding:6px 12px;border:1px solid #E8E8E8;font-size:12px}
td.l{background:#F8F6F2;font-weight:bold;color:#0B2545;width:35%}
.kg{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:10px 0}
.kc{padding:10px;border-top:3px solid #B08D57;border:1px solid #E8E8E8}
.kl{font-size:9px;color:#6B6B6B;letter-spacing:.1em;font-weight:bold}
.kv{font-family:Georgia,serif;color:#0B2545;font-size:20px;font-weight:bold}
.al{padding:8px 12px;margin:4px 0;border-left:4px solid}
.ar{background:#FFEBEE;border-color:#B71C1C}.aa{background:#FFF8E1;border-color:#B08D57}
.ap{background:#F8F6F2;border-color:#0B2545}
.at{font-weight:bold;font-size:12px}.ad{font-size:11px;margin-top:4px;white-space:pre-line}
.ft{margin-top:24px;padding-top:10px;border-top:1px solid #E8E8E8;font-size:10px;color:#6B6B6B;font-style:italic}
</style></head><body>
<div style="font-size:10px;font-weight:bold;letter-spacing:.18em;color:#B08D57">FACTOR LEGAL S.A.S. · FICHA TÉCNICA</div>
<h1>${caso.codigo} — ${caso.demandanteNombre||""}</h1>
<div class="v"><div style="font-size:10px;font-weight:bold;color:${vColor}">VEREDICTO</div><div class="vl">${vLabel}</div></div>
<h2>KPIs</h2>
<div class="kg">
<div class="kc"><div class="kl">VALOR NOMINAL</div><div class="kv">COP ${kpis.nominal.toFixed(1)} M</div></div>
<div class="kc"><div class="kl">DESEMBOLSO</div><div class="kv">COP ${kpis.desembolso.toFixed(1)} M</div></div>
<div class="kc"><div class="kl">DESCUENTO</div><div class="kv">${kpis.descuento.toFixed(1)}%</div></div>
<div class="kc"><div class="kl">MOIC</div><div class="kv">${kpis.moic.toFixed(2)}x</div></div>
</div>
<h2>IDENTIFICACIÓN</h2>
<table>
<tr><td class="l">Código</td><td>${caso.codigo}</td></tr>
<tr><td class="l">Demandante</td><td>${caso.demandanteNombre||"—"}</td></tr>
<tr><td class="l">Entidad demandada</td><td>${entidad?.nombre||"—"}</td></tr>
<tr><td class="l">Apoderado</td><td>${caso.apoderadoNombre||"—"}</td></tr>
<tr><td class="l">Fecha ejecutoria</td><td>${caso.fechaEjecutoria?new Date(caso.fechaEjecutoria).toLocaleDateString("es-CO"):"—"}</td></tr>
<tr><td class="l">Capital (COP M)</td><td>${kpis.capital.toFixed(2)}</td></tr>
<tr><td class="l">Intereses (COP M)</td><td>${kpis.intereses.toFixed(2)}</td></tr>
<tr><td class="l">Nominal (COP M)</td><td><strong>${kpis.nominal.toFixed(2)}</strong></td></tr>
<tr><td class="l">Desembolso (COP M)</td><td>${kpis.desembolso.toFixed(2)}</td></tr>
</table>
<h2>OBSERVACIONES Y ALERTAS</h2>
${ev.alertas.length===0?'<p style="font-style:italic;color:#2E7D32">Sin observaciones.</p>':
  ev.alertas.map(a=>`<div class="al ${a.tipo==="rechazo"?"ar":a.tipo==="alerta"?"aa":"ap"}"><div class="at">${a.titulo}</div><div class="ad">${a.detalle}</div></div>`).join("")}
<div class="ft">Creado por: ${caso.creadoPorNombre||"—"} · Factor Legal S.A.S. — Confidencial</div>
</body></html>`;
}

function buildCSV(caso) {
  const kpis=calcKPIs(caso);
  const ev=caso.eval||evaluarCaso(caso);
  const rows=[
    ["FACTOR LEGAL S.A.S. — FICHA TÉCNICA"],
    ["Código",caso.codigo],["Demandante",caso.demandanteNombre||""],
    [""],["VEREDICTO",ev.veredicto==="apto"?"APTO":ev.veredicto==="apto_con_alertas"?"APTO CON ALERTAS":"NO APTO"],
    [""],["KPIs"],
    ["Valor nominal (COP M)",kpis.nominal.toFixed(2)],["Capital (COP M)",kpis.capital.toFixed(2)],
    ["Intereses (COP M)",kpis.intereses.toFixed(2)],["Desembolso (COP M)",kpis.desembolso.toFixed(2)],
    ["Descuento %",kpis.descuento.toFixed(2)],["MOIC",kpis.moic.toFixed(2)],
    [""],["ALERTAS"],["Tipo","Título","Detalle"],
    ...ev.alertas.map(a=>[a.tipo,a.titulo,a.detalle.replace(/\n/g," ")]),
  ];
  return rows.map(r=>r.map(c=>`"${(c||"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
}

function dl(content,name,mime) {
  const b=new Blob([content],{type:mime});
  const u=URL.createObjectURL(b);
  const a=document.createElement("a");
  a.href=u;a.download=name;a.click();
  URL.revokeObjectURL(u);
}

// ─── APP — con Firebase Firestore ────────────────────────────
export default function App() {
  const [user,    setUser]    = useState(null);
  const [casos,   setCasos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [view,    setView]    = useState("dashboard");
  const [selId,   setSelId]   = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    // Restaurar sesión desde localStorage
    try {
      const saved = localStorage.getItem("fl:user");
      if (saved) setUser(JSON.parse(saved));
    } catch {}

    // Suscripción en tiempo real a Firestore
    const unsub = onSnapshot(collection(db, "casos"), snapshot => {
      const data = snapshot.docs.map(d => ({...d.data(), id: d.id}));
      // Ordenar por fecha de creación descendente
      data.sort((a, b) => new Date(b.fechaCreacion||0) - new Date(a.fechaCreacion||0));
      setCasos(data);
      setLoading(false);
    }, err => {
      console.error("Firestore error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  function login(u) {
    setUser(u);
    localStorage.setItem("fl:user", JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("fl:user");
    setView("dashboard");
  }

  async function saveCaso(caso) {
    try {
      if (caso.id) {
        // Actualizar caso existente
        const {id, ...data} = caso;
        await updateDoc(doc(db, "casos", id), data);
        setSelId(id);
      } else {
        // Crear nuevo caso
        const ref = await addDoc(collection(db, "casos"), caso);
        setSelId(ref.id);
      }
      setEditing(null);
      setView("ficha");
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Error al guardar el caso. Revisa la conexión con Firebase.");
    }
  }

  async function delCaso(id) {
    try {
      await deleteDoc(doc(db, "casos", id));
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  }

  function exportCaso(fmt) {
    const c = casos.find(x => x.id === selId);
    if (!c) return;
    if (fmt === "word")  dl(buildHTML(c), `FichaTecnica_${c.codigo}.doc`, "application/msword");
    if (fmt === "excel") dl("\uFEFF"+buildCSV(c), `FichaTecnica_${c.codigo}.csv`, "text/csv;charset=utf-8");
  }

  const selCaso = casos.find(c => c.id === selId);

  if (loading) {
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.cream}}>
        <div style={{textAlign:"center"}}>
          <div style={{width:48,height:48,borderRadius:"50%",background:C.navy,color:C.gold,display:"flex",
            alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",fontWeight:"bold",
            fontSize:18,border:`2px solid ${C.gold}`,margin:"0 auto 16px"}}>FL</div>
          <div style={{fontSize:12,fontStyle:"italic",color:C.greyMid}}>Conectando con Firebase...</div>
        </div>
      </div>
    );
  }

  if (!user) return <Login onLogin={login}/>;

  function nav(v) { setView(v); setEditing(null); }

  return (
    <div style={{minHeight:"100vh",background:C.cream,fontFamily:"system-ui,-apple-system,sans-serif"}}>
      <Header user={user} onLogout={logout} view={view} setView={nav}/>
      {view==="dashboard"&&<Dashboard casos={casos} onOpen={id=>{setSelId(id);setView("ficha");}} setView={nav}/>}
      {view==="casos"&&<CasosList casos={casos} onOpen={id=>{setSelId(id);setView("ficha");}}
        onDelete={delCaso} setView={nav} currentUser={user}/>}
      {view==="nuevo"&&<CasoForm initial={editing} onSave={saveCaso}
        onCancel={()=>{setEditing(null);setView("casos");}} currentUser={user}/>}
      {view==="ficha"&&selCaso&&<Ficha caso={selCaso} onBack={()=>setView("casos")}
        onEdit={()=>{setEditing(selCaso);setView("nuevo");}} onExport={exportCaso}/>}
    </div>
  );
}
