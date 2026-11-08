import sys
from PIL import Image
import numpy as np
SP='/tmp/claude-0/-home-claude/3affcd5e-ef1e-577a-a138-5bc9cb9d9df2/scratchpad/icons/'
OUT='/home/claude/Petualangan_Pythagoras/assets/img/new/'
G=Image.open(SP+'game_asset_sheet_rgba.png').convert('RGBA')
M=Image.open(SP+'menu_assets_sheet_transparent.png').convert('RGBA')
boxes={
 'G':{
  'cottage':(15,15,485,370),'windmill':(480,10,700,350),'mosque':(700,10,1055,365),
  'tree_a':(1015,15,1240,265),'tree_b':(1235,35,1386,270),'tree_pink':(1402,25,1530,245),'tree_orange':(1542,30,1668,245),
  'pine':(1160,222,1250,365),'bush_a':(1060,275,1160,365),'bush_b':(1255,270,1355,365),
  'fence':(25,385,265,470),'sign':(280,375,375,520),'lamp':(385,365,450,535),'well':(455,365,585,535),'market':(725,365,915,530),
  'ic_bag':(1295,495,1375,565),'ic_map':(1380,495,1455,565),'ic_gear':(1458,495,1530,565),'ic_gift':(1532,495,1605,565),'ic_trophy':(1605,495,1668,565),
  'ic_check':(1305,682,1362,735),'ic_x':(1380,682,1437,735),'ic_play':(1457,682,1514,735),'ic_pause':(1535,682,1592,735),'ic_home_r':(1607,682,1668,735),
  'scroll':(1535,815,1668,920),'flowers':(20,745,440,805)
 },
 'M':{
  'm_gear':(592,672,670,745),'m_gift':(680,672,760,745),'m_bag':(770,672,848,745),'m_book':(858,672,935,745),'m_pin':(945,672,1011,745),'m_help':(1022,672,1085,745),'m_home':(1088,672,1150,745),
  'm_star':(352,826,422,894),'m_heart':(430,826,502,894),'m_coin':(510,826,580,894),'m_check':(15,826,98,894),'m_x':(102,826,182,894),
  'm_cottage':(1040,290,1392,578),'m_barn':(1375,372,1602,572)
 }}
from scipy import ndimage as ndi
def trim(im,thr=24,keep_all=False):
    arr=np.array(im); a=arr[:,:,3]
    m=a>thr
    d=ndi.binary_dilation(m,iterations=3)
    lab,n=ndi.label(d)
    if n>1:
        sizes=ndi.sum(m,lab,range(1,n+1)); k=1+int(np.argmax(sizes))
        keep=ndi.binary_dilation(lab==k,iterations=2)
        arr[:,:,3]=np.where(keep,a,0)
        im=Image.fromarray(arr)
    a=np.array(im)[:,:,3]; ys,xs=np.where(a>thr)
    return im.crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1))
res={}
for k,src in (('G',G),('M',M)):
    for n,b in boxes[k].items():
        im=trim(src.crop(b))
        if n.startswith(('ic_','m_')): im=im.resize((im.width*2,im.height*2),Image.LANCZOS)
        res[n]=im
        im.save(OUT+n+'.png'); print(n,im.size)
# contact sheet
names=list(res); cols=8; cell=170
sheet=Image.new('RGB',(cols*cell,((len(names)+cols-1)//cols)*cell),(90,70,120))
for i,n in enumerate(names):
    im=res[n].copy(); im.thumbnail((cell-10,cell-24)); x=(i%cols)*cell+5; y=(i//cols)*cell+4
    sheet.paste(im,(x,y),im)
sheet.save('/tmp/claude-0/-home-claude/3affcd5e-ef1e-577a-a138-5bc9cb9d9df2/scratchpad/contact.png')
