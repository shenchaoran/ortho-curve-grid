%
% SWAN
%   Generates the sides of the 'swan' test grid. 
%
%   Input:  ni, nj - Number of points.
%   Output:  x, y - Matrices of grid points with only sides defined.
%
function [x,y] = swan( ni, nj )

s=linspace(0,1,ni);
x(:,1) = s';
y(:,1) = zeros(size(1:ni))';

x(:,nj) = s';
y(:,nj) = (1-3.*s+3.*s.*s)';

s=linspace(0,1,nj);
x(1,:) = zeros(size(1:nj));
y(1,:) = s;

x(ni,:) = (1+2.*s-2.*s.*s);
y(ni,:) = s;


