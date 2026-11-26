import numpy as np, time
from PIL import Image
from scipy.spatial import cKDTree
from scipy import ndimage
t0=time.time()
P = np.fromfile('simp_pos.bin', dtype=np.float32).reshape(-1,3).astype(np.float64)
I = np.fromfile('simp_idx.bin', dtype=np.uint32).reshape(-1,3)
fn = np.cross(P[I[:,1]]-P[I[:,0]], P[I[:,2]]-P[I[:,0]])
vn = np.zeros_like(P)
for k in range(3): np.add.at(vn, I[:,k], fn)
vn /= np.maximum(np.linalg.norm(vn,axis=1,keepdims=True),1e-12)
fnn = fn/np.maximum(np.linalg.norm(fn,axis=1,keepdims=True),1e-12)
cx=(P[:,0].min()+P[:,0].max())/2; cz=(P[:,2].min()+P[:,2].max())/2
ymin,ymax=P[:,1].min(),P[:,1].max(); Hh=ymax-ymin
W=H=2048; MAINH=1536
ty = P[I][:,:,1]
cls = np.zeros(len(I),int)
cls[(ty.min(1)>ymax-0.05*Hh)&(fnn[:,1]>0.5)] = 1
cls[(ty.max(1)<ymin+0.06*Hh)&(fnn[:,1]<-0.5)] = 2
print('classes', np.bincount(cls))
CAP = 480.0; CAPD = 0.92
caps = {1:(260,1792), 2:(780,1792)}
verts = {}; vpos=[]; vnrm=[]; vuvpix=[]; tris=[]
def getv(orig, key, px, py):
    k=(orig,key)
    r = verts.get(k)
    if r is None:
        r=len(vpos); verts[k]=r; vpos.append(P[orig]); vnrm.append(vn[orig]); vuvpix.append((px,py))
    return r
for t in range(len(I)):
    a=I[t]; c=cls[t]
    if c==0:
        u = np.arctan2(P[a,2]-cz, P[a,0]-cx)/(2*np.pi)+0.5
        shift = np.zeros(3,int)
        if u.max()-u.min()>0.5:
            shift = (u<0.25).astype(int); u = u+shift
        tri=[]
        for k in range(3):
            v=(ymax-P[a[k],1])/Hh
            tri.append(getv(a[k], (0,shift[k]), u[k]*W, v*MAINH))
    else:
        cx0,cy0 = caps[c]; tri=[]
        for k in range(3):
            px = cx0 + (P[a[k],0]-cx)*CAP/CAPD; py = cy0 + (P[a[k],2]-cz)*CAP/CAPD
            tri.append(getv(a[k], (c,0), px, py))
    tris.append(tri)
vpos=np.array(vpos); vnrm=np.array(vnrm); vuvpix=np.array(vuvpix); tris=np.array(tris)
print('verts', len(vpos), 'tris', len(tris), time.time()-t0)
texel_xy=[]; texel_pos=[]
for t in range(len(tris)):
    a,b,c = tris[t]
    pa,pb,pc = vuvpix[a],vuvpix[b],vuvpix[c]
    minx=int(np.floor(min(pa[0],pb[0],pc[0]))); maxx=int(np.ceil(max(pa[0],pb[0],pc[0])))
    miny=int(np.floor(min(pa[1],pb[1],pc[1]))); maxy=int(np.ceil(max(pa[1],pb[1],pc[1])))
    xs,ys = np.meshgrid(np.arange(minx,maxx+1), np.arange(miny,maxy+1))
    cxx = xs.ravel()+0.5; cyy = ys.ravel()+0.5
    d = (pb[1]-pc[1])*(pa[0]-pc[0]) + (pc[0]-pb[0])*(pa[1]-pc[1])
    if abs(d)<1e-9: continue
    l1 = ((pb[1]-pc[1])*(cxx-pc[0]) + (pc[0]-pb[0])*(cyy-pc[1]))/d
    l2 = ((pc[1]-pa[1])*(cxx-pc[0]) + (pa[0]-pc[0])*(cyy-pc[1]))/d
    l3 = 1-l1-l2
    m = (l1>=-0.03)&(l2>=-0.03)&(l3>=-0.03)
    if not m.any(): continue
    l1,l2,l3=l1[m],l2[m],l3[m]
    p3 = l1[:,None]*vpos[a] + l2[:,None]*vpos[b] + l3[:,None]*vpos[c]
    texel_xy.append(np.stack([xs.ravel()[m]%W, ys.ravel()[m]],1)); texel_pos.append(p3)
txy=np.concatenate(texel_xy); tpos=np.concatenate(texel_pos).astype(np.float32)
ok=(txy[:,1]>=0)&(txy[:,1]<H); txy=txy[ok]; tpos=tpos[ok]
print('texels', len(txy), time.time()-t0)
OP = np.fromfile('orig_pos.bin', dtype=np.float32).reshape(-1,3)
OU = np.fromfile('orig_uv.bin', dtype=np.float32).reshape(-1,2)
OI = np.load('orig_idx.npy')
a,b,c = OP[OI[:,0]],OP[OI[:,1]],OP[OI[:,2]]
L = np.maximum.reduce([np.linalg.norm(a-b,axis=1),np.linalg.norm(b-c,axis=1),np.linalg.norm(c-a,axis=1)])
kk = np.ceil(L/0.003).astype(int)
sp=[OP]; su=[OU]
cen = (OP[OI[:,0]]+OP[OI[:,1]]+OP[OI[:,2]])/3; cenu=(OU[OI[:,0]]+OU[OI[:,1]]+OU[OI[:,2]])/3
sp.append(cen); su.append(cenu)
for k in np.unique(kk[kk>1]):
    tri = OI[kk==k]
    for i in range(k+1):
        for j in range(k+1-i):
            w0=i/k; w1=j/k; w2=1-w0-w1
            if (w0==1 or w1==1 or w2==1): continue
            sp.append(w0*OP[tri[:,0]]+w1*OP[tri[:,1]]+w2*OP[tri[:,2]]); su.append(w0*OU[tri[:,0]]+w1*OU[tri[:,1]]+w2*OU[tri[:,2]])
SP=np.concatenate(sp).astype(np.float32); SU=np.concatenate(su).astype(np.float32)
print('sample points', len(SP), time.time()-t0)
tree = cKDTree(SP); print('tree', time.time()-t0)
dist, nn = tree.query(tpos, workers=-1)
print('query', time.time()-t0, 'maxdist', dist.max(), 'mean', dist.mean())
OU = SU
src = [np.asarray(Image.open(f'tex{i}.png').convert('RGB')).astype(np.float32) for i in (0,1)]
def sample(img, uv):
    h,w,_ = img.shape
    x = np.clip(uv[:,0]*w-0.5, 0, w-1.001); y = np.clip(uv[:,1]*h-0.5, 0, h-1.001)
    x0=np.floor(x).astype(int); y0=np.floor(y).astype(int); fx=(x-x0)[:,None]; fy=(y-y0)[:,None]
    return img[y0,x0]*(1-fx)*(1-fy)+img[y0,x0+1]*fx*(1-fy)+img[y0+1,x0]*(1-fx)*fy+img[y0+1,x0+1]*fx*fy
uvn = OU[nn]
for name,img in (('base',src[0]),('mr',src[1])):
    col = sample(img, uvn)
    out = np.zeros((H,W,3), np.float32); mask = np.zeros((H,W), bool)
    out[txy[:,1], txy[:,0]] = col; mask[txy[:,1], txy[:,0]] = True
    _, (iy,ix) = ndimage.distance_transform_edt(~mask, return_indices=True)
    out = out[iy,ix]
    Image.fromarray(np.clip(out,0,255).astype(np.uint8)).save(f'bake_{name}.png')
uvout = np.stack([vuvpix[:,0]/W, vuvpix[:,1]/H],1).astype(np.float32)
np.save('b_pos.npy', vpos.astype(np.float32)); np.save('b_nrm.npy', vnrm.astype(np.float32)); np.save('b_uv.npy', uvout); np.save('b_idx.npy', tris.astype(np.uint32))
print('done', time.time()-t0)
