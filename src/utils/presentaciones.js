export const PRESENTACIONES = [
  { value: 'kg', label: 'Kilogramo (kg)' },
  { value: 'g', label: 'Gramo (g)' },
  { value: 'L', label: 'Litro (L)' },
  { value: 'ml', label: 'Mililitro (ml)' },
  { value: 'unidad', label: 'Unidad' },
  { value: 'docena', label: 'Docena' },
  { value: 'paquete', label: 'Paquete' },
  { value: 'caja', label: 'Caja' },
  { value: 'botella', label: 'Botella' },
  { value: 'tubo', label: 'Tubo' },
  { value: 'barra', label: 'Barra' },
  { value: 'lata', label: 'Lata' },
  { value: 'frasco', label: 'Frasco' },
  { value: 'bolsa', label: 'Bolsa' },
  { value: 'rollo', label: 'Rollo' },
  { value: 'metro', label: 'Metro' }
]

export const getPresentacionLabel = (value) => {
  const presentacion = PRESENTACIONES.find(p => p.value === value)
  return presentacion ? presentacion.label : value
}
