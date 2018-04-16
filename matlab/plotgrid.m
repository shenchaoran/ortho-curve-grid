function plotgrid(X,Y,fmt,fmtb)

% PLOTGRID  Plot structured grid.
%
%    plotgrid(X,Y,fmt,fmtb)
%
%    INPUT:
%      X (matrix)    - matrix with x-coordinates of gridpoints
%      Y (matrix)    - matrix with y-coordinates of gridpoints
%      fmt (string)  - format string for plotting gridlines
%      fmtb (string) - format string for edges
%
%    See also ELLIPTIC, TRANSFINITE, and PLOT.
%
%    [ 2D1263 Scientific Computing              ]
%    [ Christer Andersson (christe@nada.kth.se) ]
%    [ 10 January 2001                          ]


% Check input arguments
if (nargin<3), fmt='b'; end
if (nargin<4), fmtb=fmt; end
if (~isstr(fmt)), error('fmt must be a valid matlab plot format string'); end
if (~isstr(fmtb)), error('fmt must be a valid matlab plot format string'); end


if any(size(X)~=size(Y))
   error('Dimensions of X and Y must agree.');
end

[m,n]=size(X);

% Plot boundaries
holdon=ishold;

plot(X(1,:),Y(1,:),fmtb); hold on
plot(X(m,:),Y(m,:),fmtb);
plot(X(:,1),Y(:,1),fmtb);
plot(X(:,n),Y(:,n),fmtb);

% Plot internal grid lines
for i=2:m-1, plot(X(i,:),Y(i,:),fmt); end
for j=2:n-1, plot(X(:,j),Y(:,j),fmt); end

if (~holdon), hold off, end
