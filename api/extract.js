export const config = {
  api: {
    bodyParser: { sizeLimit: '50mb' },
  },
  maxDuration: 120,
};

const PROMPT = `Eres un experto jurídico colombiano en responsabilidad del Estado y cesión de derechos litigiosos.
Analiza TODOS los documentos adjuntos (sentencias, poderes, actas, cuentas de cobro, constancias, etc.)
y extrae la información en formato JSON puro, sin texto adicional ni bloques de código markdown.

Devuelve EXACTAMENTE este JSON (usa null si no encuentras el dato, nunca inventes):

{
  "demandanteNombre": "nombre completo del accionante o demandante principal",
  "demandanteCC": "número de cédula del demandante principal si aparece",
  "apoderadoNombre": "nombre completo del abogado apoderado",
  "apoderadoTP": "número tarjeta profesional del abogado",
  "porcHonorarios": "porcentaje honorarios pactado solo el número ej 30",
  "entidad": "uno de estos IDs exactos: policia | ejercito | armada | fac | sanidad | jpm | inpec | invias | fiscalia | ramaJudicial | congreso | hospitalMilitar | hospitalNaval",
  "tipoProceso": "reparacionDirecta o nulidadRest",
  "escenario": "sentencia o concJud o concExtra",
  "regimen": "cca o cpaca",
  "numeroExpediente": "número de radicado completo del proceso",
  "fechaFallo1": "fecha fallo primera instancia en formato YYYY-MM-DD",
  "fechaFallo2": "fecha fallo segunda instancia YYYY-MM-DD o null",
  "organismoFallo1": "nombre del juzgado o tribunal que profirió el fallo de primera instancia",
  "organismoFallo2": "nombre del tribunal de segunda instancia o null",
  "fechaEjecutoria": "fecha de ejecutoria del fallo en formato YYYY-MM-DD",
  "fechaCuentaCobro": "fecha de radicación de la cuenta de cobro YYYY-MM-DD o null",
  "unicaInstancia": true o false,
  "gradoConsultaSurtido": true o false,
  "valorCapital": "valor del capital condenado en millones de COP solo número ej 600.5",
  "valorIntereses": "valor intereses moratorios en millones COP solo número",
  "valorCostas": "valor costas y agencias en derecho en millones COP solo número o null",
  "valorTotalCondenaResolutiva": "valor total de la condena según parte resolutiva en millones COP",
  "afectacionIntereses": "ninguna | conciliadoIntCorrientes | conciliadoSinInt | policiaSMLMVPago | reparacionIntIPC | ramaSinArtPago",
  "condenaSolidaria": "no | solidariaSinPorc | solidariaConPorc",
  "ejecutivoRadicado": true o false,
  "tipoCesion": "total | parcialHonorarios | parcialExcluyeHon | parcialOtra",
  "numBeneficiarios": número entero de beneficiarios totales,
  "numMenores": número entero de menores de edad,
  "resumenHechos": "resumen claro y conciso de los hechos del caso en 3-5 oraciones",
  "caducidadEjecutivo": "fecha límite para proceso ejecutivo YYYY-MM-DD (5 años desde ejecutoria)",
  "beneficiarios": [
    {
      "nombre": "nombre completo",
      "cedula": "número de cédula",
      "calidad": "víctima directa | cónyuge | compañero permanente | hijo | padre | madre | abuelo | hermano | nieto | otro"
    }
  ],
  "condenaDetalle": "texto exacto de la parte resolutiva que describe las condenas",
  "observaciones": "observaciones jurídicas relevantes que el analista debe conocer"
}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { pdfs } = req.body;

  if (!pdfs || !Array.isArray(pdfs) || pdfs.length === 0) {
    return res.status(400).json({ error: 'No se recibieron documentos PDF' });
  }

  if (!process.env.ANTHROPIC_KEY) {
    return res.status(500).json({ error: 'Clave de API no configurada en Vercel' });
  }

  try {
    const content = [
      ...pdfs.map((data, i) => ({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data },
        title: `Documento ${i + 1}`,
      })),
      { type: 'text', text: PROMPT },
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'pdfs-2024-09-25',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 4096,
        messages: [{ role: 'user', content }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: 'Error API Anthropic', detail: err });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor', detail: err.message });
  }
}
