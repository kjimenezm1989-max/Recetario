import html2pdf from 'html2pdf.js'

const BASE_URL = import.meta.env.BASE_URL || '/'

export const generateQuotePDF = (quote, quoteRecipes = [], config, formatCurrency) => {
  const today = new Date()
  const quoteDate = new Date(quote.fecha)
  const firstRecipe = quoteRecipes[0]
  const recipeList = quoteRecipes.map(recipe => recipe.nombre).filter(Boolean)

  const element = document.createElement('div')
  element.innerHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 100%; margin: 0; padding: 5mm; color: #333; line-height: 1.05; font-size: 9.2px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 4.5mm; border-bottom: 1px solid #4A2C2A; padding-bottom: 2.5mm;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 4mm; margin-bottom: 1.5mm; flex-wrap: wrap;">
          ${config.logo ? `<img src="${config.logo}" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover;" />` : ''}
          <div>
            <h1 style="margin: 0; color: #4A2C2A; font-size: 14.5px;">${config.nombre_negocio || 'Mi Negocio'}</h1>
            <p style="margin: 1mm 0 0 0; color: #666; font-size: 8.8px;">${config.descripcion_negocio || ''}</p>
          </div>
        </div>
      </div>

      <!-- Quote Title -->
      <div style="text-align: center; margin-bottom: 5mm;">
        <h2 style="color: #4A2C2A; margin: 0 0 2mm 0; font-size: 14px;">COTIZACIÓN</h2>
        <p style="color: #666; margin: 0; font-size: 9px;">Cotización #${quote.id.substring(0, 8).toUpperCase()}</p>
      </div>

      <!-- Client Info -->
      <div style="background-color: #FFF4E6; padding: 5mm; border-radius: 3px; margin-bottom: 6mm; font-size: 10px;">
        <p style="margin: 1mm 0;"><strong>Cliente:</strong> ${quote.cliente || 'No especificado'}</p>
        <p style="margin: 1mm 0;"><strong>Fecha:</strong> ${quoteDate.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      <!-- Recipe Info with Images -->
      <div style="margin-bottom: 5mm; display: flex; gap: 5mm; flex-wrap: wrap;">
        ${firstRecipe && firstRecipe.imagen ? `
            <div style="flex-shrink: 0;">
              <img src="${firstRecipe.imagen}" style="width: 55mm; height: 55mm; object-fit: cover; border-radius: 3px; border: 1px solid #ddd;" />
            </div>
        ` : ''}
        <div style="flex: 1; min-width: 0; background-color: #F5F5F5; padding: 4mm; border-left: 3px solid #F5B7C5; border-radius: 3px; font-size: 9px;">
          <p style="margin: 0 0 2mm 0;"><strong>Recetas:</strong> ${recipeList.length > 0 ? recipeList.join(', ') : 'No especificado'}</p>
          ${quote.extraMaterials && quote.extraMaterials.length > 0 ? `
            <p style="margin: 0;"><strong>Materiales adicionales:</strong> ${quote.extraMaterials.map(m => `${m.nombre} (${m.cantidad}${m.unidad})`).join(', ')}</p>
          ` : ''}
        </div>
      </div>

      ${quote.nota ? `
      <div style="background-color: #FFF8E6; padding: 5mm; border-radius: 3px; margin-bottom: 5mm; font-size: 10px; border: 1px solid #F5B7C5;">
        <p style="margin: 0 0 4px 0; font-weight: 700; color: #4A2C2A;">Observación:</p>
        <p style="margin: 0;">${quote.nota}</p>
      </div>
      ` : ''}

      <div style="background-color: #F7F7F7; padding: 4mm; border-radius: 6px; margin-bottom: 4mm; font-size: 9px; border: 1px solid #DDD;">
        <p style="margin: 0 0 5px 0; font-weight: 700; color: #4A2C2A;">Métodos de pago</p>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: space-between;">
          <div style="flex: 1 1 30%; min-width: 65px; padding: 4px; border-radius: 6px; background: white; border: 1px solid #DDD; text-align: center;">
            <img src="${BASE_URL}payment-logos/daviplata.jpg" style="width: 100%; max-height: 26px; object-fit: contain; margin-bottom: 3px;" alt="Daviplata" />
            <div style="font-size: 8.5px; font-weight: 700;">Daviplata</div>
            <div style="font-size: 8px; color: #555; line-height: 1.2;">3107420071</div>
          </div>
          <div style="flex: 1 1 30%; min-width: 65px; padding: 4px; border-radius: 6px; background: white; border: 1px solid #DDD; text-align: center;">
            <img src="${BASE_URL}payment-logos/breb.jpg" style="width: 100%; max-height: 26px; object-fit: contain; margin-bottom: 3px;" alt="Bre-B" />
            <div style="font-size: 8.5px; font-weight: 700;">Bre-B</div>
            <div style="font-size: 8px; color: #555; line-height: 1.2;">3107420071</div>
          </div>
          <div style="flex: 1 1 30%; min-width: 65px; padding: 4px; border-radius: 6px; background: white; border: 1px solid #DDD; text-align: center;">
            <img src="${BASE_URL}payment-logos/nequi.jpg" style="width: 100%; max-height: 26px; object-fit: contain; margin-bottom: 3px;" alt="Nequi" />
            <div style="font-size: 8.5px; font-weight: 700;">Nequi</div>
            <div style="font-size: 8px; color: #555; line-height: 1.2;">3107420071</div>
          </div>
        </div>
      </div>

      <div style="background-color: #FFF4E6; padding: 6mm; border-radius: 5px; border: 1px solid #F5B7C5; margin-bottom: 5mm; font-size: 10px;">
        <p style="margin: 0 0 4px 0; font-weight: 700; color: #4A2C2A;">Condiciones de pago:</p>
        <p style="margin: 0 0 4px 0;">50% de anticipo para apartar el pedido y 50% contra entrega.</p>
        <p style="margin: 0;">Recuerda confirmar 3 días antes: Fecha, hora y lugar de entrega a nuestro WhatsApp: <strong>310 742 0071 o 311 408 7428</strong>.</p>
      </div>

      <!-- Price Summary -->
      <div style="background: linear-gradient(135deg, #CFE8D5 0%, #B8D9C5 100%); padding: 6mm; border-radius: 3px; margin-bottom: 5mm;">
        <div style="font-size: 14px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #4A2C2A;">Precio Final:</span>
          <span style="color: #4A2C2A; font-size: 16px;">${formatCurrency(quote.precio_final, config.moneda)}</span>
        </div>
      </div>

      <!-- Footer Message -->
      <div style="background-color: #FFF4E6; padding: 5mm; border-radius: 3px; text-align: center; margin-bottom: 4mm; font-size: 9px;">
        <p style="color: #4A2C2A; margin: 0; font-weight: bold;">¡Gracias por elegirnos!</p>
        <p style="color: #666; margin: 1mm 0 0 0; font-size: 8px;">Comprometidos con la mejor calidad y servicio.</p>
      </div>

      <!-- Social Media Footer -->
      <div style="text-align: center; border-top: 1px solid #ddd; padding-top: 3mm; color: #666; font-size: 8px;">
        <p style="margin: 1mm 0;">${config.nombre_negocio || 'Mi Negocio'} © ${today.getFullYear()}</p>
        <div style="margin: 2mm 0;">
          ${config.instagram ? `
            <span style="display: inline-block; margin: 0 3mm;">
              📷 <strong>Instagram:</strong> ${config.instagram}
            </span>
          ` : ''}
          ${config.facebook ? `
            <span style="display: inline-block; margin: 0 3mm;">
              📘 <strong>Facebook:</strong> ${config.facebook}
            </span>
          ` : ''}
          ${config.whatsapp ? `
            <span style="display: inline-block; margin: 0 3mm;">
              💬 <strong>WhatsApp:</strong> ${config.whatsapp}
            </span>
          ` : ''}        
    </div>
  `

  const opt = {
    margin: 0,
    filename: `Cotizacion_${quote.cliente || 'Quote'}_${new Date().getTime()}.pdf`,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { scale: 2, useCORS: true, allowTaint: true },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    pagebreak: { mode: ['avoid-all'] }
  }

  html2pdf().set(opt).from(element).save()
}
