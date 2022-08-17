import moduleAlias from 'module-alias'
import tsconfig from "../tsconfig.json";

const baseUrl = __dirname;
for (let p in (tsconfig.compilerOptions.paths || {})) {
  let item = tsconfig.compilerOptions.paths[p][0];
  p = p.split('/*')[0];
  if (item.endsWith('/*')) {
    item = item.slice(0, -2);
  } else if (item.endsWith('*')) {
    item = item.slice(0, -1);
  }
  if (item && !item.startsWith('/')) {
    item = '/' + item;
  }
  item = baseUrl + item;
  moduleAlias.addAlias(p, item);
}
