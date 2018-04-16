function [] = saveMatrix( fname, matrix )
%SAVEFILE 此处显示有关此函数的摘要
%   此处显示详细说明
fid = fopen(fname, 'wt');
[m, n] = size(matrix);
for i=1:1:m
   for j=1:1:n
       if j==n
           fprintf(fid, '%f\n', matrix(i,j));
       else 
           fprintf(fid, '%f\t', matrix(i,j));
       end
   end
end
fclose(fid);

end

