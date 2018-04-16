%
% ALGEBRAIC
%
% Algebraic grid generator. Assumes that all four sides are given in the 
% grid xg, yg. Generates the grid in the interior.
%
%  function [ xg, yg ] = algebraic( xg, yg )
%
%   Input: xg, yg  - Grid matrices with only sides defined.
%   Output: xg, yg - Grid matrices with all points defined.
%
function [ xg, yg ] = algebraic( xg, yg )

[ ni nj ] =size(xg);

for i=2:ni-1
  r = (i-1)/(ni-1);
  for j=2:nj-1
     s = (j-1)/(nj-1);
     xg(i,j) = (1-r)*xg(1,j) + r*xg(ni,j) + (1-s)*xg(i,1) + s*xg(i,nj) - ...
        (1-r)*(1-s)*xg(1,1)-(1-r)*s*xg(1,nj)-r*(1-s)*xg(ni,1)-r*s*xg(ni,nj);
     yg(i,j) = (1-r)*yg(1,j) + r*yg(ni,j) + (1-s)*yg(i,1) + s*yg(i,nj) - ...
        (1-r)*(1-s)*yg(1,1)-(1-r)*s*yg(1,nj)-r*(1-s)*yg(ni,1)-r*s*yg(ni,nj);
  end;
end;
