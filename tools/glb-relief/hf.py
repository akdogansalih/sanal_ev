import numpy as np, time
from PIL import Image
from scipy import ndimage
t0=time.time()
OP=np.fromfile('orig_pos.bin',dtype=np.float32).reshape(-1,3); OU=np.fromfile('orig_uv.bin',dtype=np.float32).reshape(-1,2); OI=np.fromfile('orig_idx.bin',dtype=np.uint32).reshape(-1,3)
a,b,c=OP[OI[:,0]],OP[OI[:,1]],OP[OI[:,2]]
L=np.maximum.reduce([np.linalg.norm(a-b,axis=1),np.linalg.norm(b-c,axis=1),np.linalg.norm(c-a,axis=1)])
kk=np.ceil(L/0.00035).astype(int)
sp=[OP,(a+b+c)/3]; su=[OU,(OU[OI[:,0]]+OU[OI[:,1]]+OU[OI[:,2]])/3]
for k in np.unique(kk[kk>1]):
    tri=OI[kk==k]
    for i in range(k+1):
        for j in range(k+1-i):
            w0=i/k; w1=j/k; w2=1-w0-w1
            if w0==1 or w1==1 or w2==1: continue
            sp.append(w0*OP[tri[:,0]]+w1*OP[tri[:,1]]+w2*OP[tri[:,2]]); su.append(w0*OU[tri[:,0]]+w1*OU[tri[:,1]]+w2*OU[tri[:,2]])
SP=np.concatenate(sp).astype(np.float32); SU=np.concatenate(su).astype(np.float32)
print('samples',len(SP),time.time()-t0)
xmin,xmax=OP[:,0].min(),OP[:,0].max(); ymin,ymax=OP[:,1].min(),OP[:,1].max(); zmin,zmax=OP[:,2].min(),OP[:,2].max()
S=max(xmax-xmin,ymax-ymin); R=2048
px=np.clip(((SP[:,0]-xmin)/S*R).astype(int),0,R-1); py=np.clip(((ymax-SP[:,1])/S*R).astype(int),0,R-1)
key=py*R+px; order=np.lexsort((-SP[:,2],key)); ks=key[order]
first=np.concatenate([[True],ks[1:]!=ks[:-1]]); sel=order[first]
zb=np.full(R*R,-np.inf,np.float32); zb[key[sel]]=SP[sel,2]; zb=zb.reshape(R,R)
img=np.asarray(Image.open('tex0.png').convert('RGB')).astype(np.float32); h,w,_=img.shape
uv=SU[sel]; x=np.clip(uv[:,0]*w-0.5,0,w-1.001); y=np.clip(uv[:,1]*h-0.5,0,h-1.001); x0=np.floor(x).astype(int); y0=np.floor(y).astype(int); fx=(x-x0)[:,None]; fy=(y-y0)[:,None]
col=img[y0,x0]*(1-fx)*(1-fy)+img[y0,x0+1]*fx*(1-fy)+img[y0+1,x0]*(1-fx)*fy+img[y0+1,x0+1]*fx*fy
out=np.zeros((R,R,3),np.float32); mask=np.zeros(R*R,bool); out.reshape(-1,3)[key[sel]]=col; mask[key[sel]]=True; mask=mask.reshape(R,R)
print('coverage',mask.mean(),time.time()-t0)
# fill small holes inside by closing then nearest
closed=ndimage.binary_closing(mask,iterations=3); closed=ndimage.binary_fill_holes(closed)
_,(iy,ix)=ndimage.distance_transform_edt(~mask,return_indices=True)
mf=mask.astype(np.float32); Gm=ndimage.gaussian_filter(mf,1.4)
Gc=np.stack([ndimage.gaussian_filter(out[...,k]*mf,1.4) for k in range(3)],-1)
sm=Gc/np.maximum(Gm[...,None],1e-6)
outf=np.where((Gm>0.04)[...,None],sm,out[iy,ix]); zf=zb[iy,ix]
Image.fromarray(np.clip(outf,0,255).astype(np.uint8)).save('hf_base.png')
valid=closed
zfill=np.where(valid,zf,-np.inf)
# heightfield grid
N=176; step=R//N   # 2048/176 ~ 11.6 -> use floats
gx=np.linspace(0,R-1,N+1); gy=np.linspace(0,R-1,N+1)
Z=np.full((N+1,N+1),-np.inf,np.float32); V=np.zeros((N+1,N+1),bool)
win=int(R/N/2)+1
for j in range(N+1):
    for i in range(N+1):
        cx=int(gx[i]); cy=int(gy[j]); sl=(slice(max(cy-win,0),cy+win+1),slice(max(cx-win,0),cx+win+1))
        m=valid[sl]
        if m.mean()>0.5:
            V[j,i]=True; Z[j,i]=zfill[sl][m].max()
print('verts valid',V.sum(),time.time()-t0)
np.savez('hf.npz',Z=Z,V=V,xmin=xmin,ymax=ymax,S=S,zmin=zmin,N=N)
