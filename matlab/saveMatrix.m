function [] = saveMatrix( fname, matrix )
%SAVEFILE �˴���ʾ�йش˺�����ժҪ
%   �˴���ʾ��ϸ˵��
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

