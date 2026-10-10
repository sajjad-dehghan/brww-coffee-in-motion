import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const port=Number(process.env.PORT||5188);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.png':'image/png','.mp4':'video/mp4'};
createServer(async(req,res)=>{try{const url=new URL(req.url,'http://127.0.0.1');const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return;}const candidate=(await stat(file)).isDirectory()?path.join(file,'index.html'):file;const data=await readFile(candidate);res.writeHead(200,{'Content-Type':types[path.extname(candidate)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data);}catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
