clear
clc
close all
mx=20;
my=40;
xi=linspace(0,1,mx);
eta=linspace(0,1,my);
% xi=0:.025:1;
% %eta=0:1/32:1;
% eta=0:.1:1;
[px,py] = swan(mx, my);
 plotgrid(px,py,'k','ro-'); axis equal
% %  fopen()
%  for j=1:my
% fprintf('%d, %d')  px(1,j), py(1,j)
%  end
%  fprintf('%d') my
%  for j=1:my
%  fprintf('%d, %d')  px(nx,j), py(nx,j)
%  end

 [ xg, yg ] = algebraic( px, py);
 plotgrid(xg,yg,'k','b-'); axis equal
 tol=0.001;
 method=0;
 [X,Y,err]=elliptic(xg,yg,tol,method);
 % [X,Y]=transfinite('px','py',xi,eta);
  figure(2)
  plotgrid(X,Y,'k','ro-'); axis equal
% fprintf(' Press return to continue...');
% pause
% % 
% k=10;
