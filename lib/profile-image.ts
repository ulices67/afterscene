export async function prepareProfileImage(file: File, maxWidth = 1600): Promise<string> {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)) throw Error('Elige una imagen JPG, PNG o WebP.');
  if(file.size>10*1024*1024) throw Error('La imagen debe pesar menos de 10 MB.');
  const bitmap=await createImageBitmap(file);
  const ratio=Math.min(1,maxWidth/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
  canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  const data=canvas.toDataURL('image/webp',0.82);
  if(data.length>3000000)throw Error('La imagen es demasiado grande. Elige una más pequeña.');
  return data;
}
