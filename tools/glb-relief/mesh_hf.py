import numpy as np
from PIL import Image
d=np.load('hf.npz'); Z=d['Z']; V=d['V']; xmin=float(d['xmin']); ymax=float(d['ymax']); S=float(d['S']); zmin=float(d['zmin']); N=int(d['N'])
H=N+1
xs=xmin+np.arange(H)/N*S; ys=ymax-np.arange(H)/N*S
# erode valid slightly so rim triangles are complete; smooth Z lightly (keep peaks)
Zs=np.where(V,Z,zmin)
vid=-np.ones((H,H),int); k=0
pos=[];nrm=[];uv=[]
# normals from heights
dzdx=np.zeros_like(Zs); dzdy=np.zeros_like(Zs); h=S/N
dzdx[:,1:-1]=(Zs[:,2:]-Zs[:,:-2])/(2*h); dzdy[1:-1,:]=(Zs[:-2,:]-Zs[2:,:])/(2*h)   # y decreases with row
for j in range(H):
    for i in range(H):
        if V[j,i]:
            vid[j,i]=len(pos); pos.append((xs[i],ys[j],Zs[j,i]))
            n=np.array([-dzdx[j,i],-dzdy[j,i],1.0]); n/=np.linalg.norm(n); nrm.append(n); uv.append(((xs[i]-xmin)/S,(ymax-ys[j])/S))
tris=[]
for j in range(N):
    for i in range(N):
        a,b,c,dd=vid[j,i],vid[j,i+1],vid[j+1,i],vid[j+1,i+1]
        # CCW seen from +z: a(top-left), c(bottom-left), b(top-right), dd(bottom-right)
        if a>=0 and c>=0 and b>=0: tris.append((a,c,b))
        if b>=0 and c>=0 and dd>=0: tris.append((b,c,dd))
        if (a<0 or b<0 or c<0) and a>=0 and c>=0 and dd>=0 and b<0: tris.append((a,c,dd))
        if (a<0) and b>=0 and c>=0 and dd>=0: pass
tris=np.array(tris)
# boundary edges -> skirt
from collections import Counter
cnt=Counter()
for t in tris:
    for e in ((t[0],t[1]),(t[1],t[2]),(t[2],t[0])): cnt[(min(e),max(e))]+=1
bedges=[]
for t in tris:
    for e in ((t[0],t[1]),(t[1],t[2]),(t[2],t[0])):
        if cnt[(min(e),max(e))]==1: bedges.append(e)
pos=np.array(pos); nrm=np.array(nrm); uv=np.array(uv)
cx=(xmin+S/2); cy=(ymax-S/2)
P2=[];N2=[];U2=[];T2=[]; base=len(pos)
for (p,q) in bedges:
    pp,qq=pos[p],pos[q]
    mid=np.array([(pp[0]+qq[0])/2-cx,(pp[1]+qq[1])/2-cy,0]); mid/=np.linalg.norm(mid)+1e-12
    i0=base+len(P2)
    for v,u0 in ((pp,uv[p]),(qq,uv[q])):
        P2.append(v); N2.append(mid); U2.append(u0)
    for v,u0 in ((pp,uv[p]),(qq,uv[q])):
        P2.append((v[0],v[1],zmin)); N2.append(mid); U2.append(u0)
    # quad: top p,q ; bottom p,q ; orient outward
    T2.append((i0,i0+2,i0+1)); T2.append((i0+1,i0+2,i0+3))
if P2:
    pos=np.vstack([pos,np.array(P2)]); nrm=np.vstack([nrm,np.array(N2)]); uv=np.vstack([uv,np.array(U2)]); tris=np.vstack([tris,np.array(T2)])
print('verts',len(pos),'tris',len(tris),'bedges',len(bedges))
pos.astype(np.float32).tofile('f_pos.bin'); nrm.astype(np.float32).tofile('f_nrm.bin'); uv.astype(np.float32).tofile('f_uv.bin'); tris.astype(np.uint32).ravel().tofile('f_idx.bin')
Image.open('hf_base.png').save('f_base.jpg',quality=84,optimize=True)
