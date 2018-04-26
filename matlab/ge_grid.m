function [ X, Y ] = ge_grid( mx, my )
%GE_GRID 此处显示有关此函数的摘要
%   此处显示详细说明

    if (nargin<2), error('invalid parameter input'); end

    rmx = rot90(mx, -1);
    rmy = rot90(my, -1);
    plotgrid(rmx,rmy,'k','ro-'); axis equal;
    [ xg, yg ] = algebraic( rmx, rmy);
    plotgrid(xg,yg,'k','b-'); axis equal;
    tol=0.001;
    method=0;
    [X,Y,~]=elliptic(xg,yg,tol,method);
    % [X,Y]=transfinite('px','py',xi,eta);
    figure(2);
    plotgrid(X,Y,'k','ro-'); axis equal;
    
    X = rot90(X, 1);
    Y = rot90(Y, 1);
    saveMatrix('./mx_result.csv', X);
    saveMatrix('./my_result.csv', Y);
end

