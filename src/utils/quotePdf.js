import html2pdf from 'html2pdf.js'

export const generateQuotePDF = (quote, recipe, config, formatCurrency) => {
  const today = new Date()
  const quoteDate = new Date(quote.fecha)
  
  const element = document.createElement('div')
  element.innerHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 100%; margin: 0; padding: 10mm; color: #333; line-height: 1.2;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 6mm; border-bottom: 2px solid #4A2C2A; padding-bottom: 4mm;">
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 3mm;">
          ${config.logo ? `<img src="${config.logo}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 8mm; object-fit: cover;" />` : ''}
          <div>
            <h1 style="margin: 0; color: #4A2C2A; font-size: 18px;">${config.nombre_negocio || 'Mi Negocio'}</h1>
            <p style="margin: 1mm 0 0 0; color: #666; font-size: 10px;">${config.descripcion_negocio || ''}</p>
          </div>
        </div>
      </div>

      <!-- Quote Title -->
      <div style="text-align: center; margin-bottom: 6mm;">
        <h2 style="color: #4A2C2A; margin: 0 0 2mm 0; font-size: 15px;">COTIZACIÓN</h2>
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
      <div style="margin-bottom: 6mm;">
        <div style="display: flex; gap: 5mm; margin-bottom: 5mm;">
          <!-- Product Image -->
          ${recipe && recipe.imagen ? `
            <div style="flex-shrink: 0;">
              <p style="margin: 0 0 2mm 0; font-size: 9px; font-weight: bold; color: #4A2C2A;">Producto:</p>
              <img src="${recipe.imagen}" style="width: 65mm; height: 65mm; object-fit: cover; border-radius: 3px; border: 1px solid #ddd;" />
            </div>
          ` : ''}
          
          <!-- Gift Image -->
          ${recipe && recipe.tiene_obsequio && recipe.imagen_obsequio ? `
            <div style="flex-shrink: 0;">
              <p style="margin: 0 0 2mm 0; font-size: 9px; font-weight: bold; color: #4A2C2A;">🎁 ${recipe.nombre_obsequio || 'Obsequio'}:</p>
              <img src="${recipe.imagen_obsequio}" style="width: 65mm; height: 65mm; object-fit: cover; border-radius: 3px; border: 1px solid #ddd;" />
            </div>
          ` : ''}
        </div>

        <!-- Product Details -->
        <div style="background-color: #F5F5F5; padding: 5mm; border-left: 3px solid #F5B7C5; border-radius: 3px; font-size: 10px;">
          <p style="margin: 0 0 2mm 0;"><strong>Producto:</strong> ${recipe?.nombre || 'No especificado'}</p>
          ${recipe?.tiene_obsequio ? `
            <p style="margin: 0;"><strong>Incluye Obsequio:</strong> ${recipe?.nombre_obsequio || 'Obsequio especial'}</p>
          ` : ''}
        </div>
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
        <p style="margin: 1mm 0 0 0;">Válida por 7 días</p>
      </div>
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
